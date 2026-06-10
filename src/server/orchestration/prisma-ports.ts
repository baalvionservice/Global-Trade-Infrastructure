/**
 * @file server/orchestration/prisma-ports.ts
 * @description Prisma-backed implementations of the Phase-1 orchestration ports.
 *
 * This is the integration seam (Agents 4/5/6/7): it connects the locked
 * workflow-engine, event-bus, brain-controller and approval-orchestrator to
 * PostgreSQL without modifying them. Wiring the brain controller with these
 * ports makes the entire trade lifecycle restart-, crash-, replay- and
 * audit-safe, and ensures every sub-entity belongs to exactly one trade.
 */
import { Prisma, TradeState, RiskStatus, ComplianceStatus } from '@prisma/client';
import { withTransaction, PrismaTransaction } from '../db/prisma';
import {
  tradeRepository,
  rfqRepository,
  dealRepository,
  orderRepository,
  escrowRepository,
  paymentRepository,
  shipmentRepository,
  customsRepository,
  settlementRepository,
  notificationRepository,
  auditRepository,
  workflowRepository,
  outboxRepository,
} from '../repositories';
import { getStageSpec } from '@/orchestration/lifecycle';
import {
  WorkflowStorePort,
  WorkflowRecord,
  WorkflowHistoryEntry,
  AuditSinkPort,
  AuditEntry,
  TradeExecutionPort,
  ExecutionResult,
  TradeContext,
  RiskEnginePort,
  RiskAssessment,
  CompliancePort,
  ComplianceResult,
  PricingPort,
  NotificationPort,
  NotificationMessage,
  OrchestrationPorts,
} from '@/orchestration/ports';
import { TradeLifecycleState } from '@/orchestration/lifecycle';
import { DefaultPricingEngine } from './default-engines';
import { RiskEngine, ComplianceEngine } from '../compliance/compliance-engine';

export interface OrgContext {
  organizationId: string;
  reference?: string;
  correlationId?: string;
  buyerId?: string | null;
  supplierId?: string | null;
  metadata?: Record<string, unknown>;
}

const asState = (s: TradeLifecycleState): TradeState => s as unknown as TradeState;
const asJson = (v: unknown): Prisma.InputJsonValue => v as Prisma.InputJsonValue;

function workflowEventType(entry: WorkflowHistoryEntry): 'GENESIS' | 'COMPENSATION' | 'TRANSITION' {
  if (entry.from === null) return 'GENESIS';
  if (entry.to === 'TRADE_CANCELLED') return 'COMPENSATION';
  return 'TRANSITION';
}

// ──────────────────────────────────────────────────────────────────────────
// Workflow persistence (Agent 4)
// ──────────────────────────────────────────────────────────────────────────

export class PrismaWorkflowStore implements WorkflowStorePort {
  constructor(private readonly ctx: OrgContext) {}

  async load(tradeId: string): Promise<WorkflowRecord | null> {
    const row = await tradeRepository.findById(tradeId);
    if (!row) return null;
    const history = await workflowRepository.listByTrade(tradeId);
    return {
      tradeId: row.id,
      state: row.currentState as unknown as TradeLifecycleState,
      version: row.version,
      refs: {
        tradeId: row.id,
        rfqId: row.rfqId ?? undefined,
        dealId: row.dealId ?? undefined,
        orderId: row.orderId ?? undefined,
        escrowId: row.escrowId ?? undefined,
        shipmentId: row.shipmentId ?? undefined,
        settlementId: row.settlementId ?? undefined,
      },
      terms: row.terms as unknown as WorkflowRecord['terms'],
      history: history.map((h) => ({
        from: (h.fromState as unknown as TradeLifecycleState) ?? null,
        to: h.toState as unknown as TradeLifecycleState,
        actorId: h.actorId,
        actorRole: h.actorRole as WorkflowHistoryEntry['actorRole'],
        reason: h.reason ?? undefined,
        timestamp: h.createdAt.toISOString(),
      })),
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  /**
   * Persist the workflow atomically (CR-5/CR-6): the trade state, the appended
   * workflow history, the transition audit row and the transactional outbox
   * event are all written inside ONE database transaction. State changes are
   * guarded by an optimistic lock on the aggregate version, so two concurrent
   * transitions can never both commit — the loser throws OptimisticLockError.
   */
  async save(record: WorkflowRecord): Promise<void> {
    const correlationId = this.ctx.correlationId ?? record.tradeId;
    await withTransaction(async (tx) => {
      const existing = await tradeRepository.findById(record.tradeId, tx);
      const pointers: Record<string, unknown> = {};
      if (record.refs.rfqId) pointers.rfqId = record.refs.rfqId;
      if (record.refs.dealId) pointers.dealId = record.refs.dealId;
      if (record.refs.orderId) pointers.orderId = record.refs.orderId;
      if (record.refs.escrowId) pointers.escrowId = record.refs.escrowId;
      if (record.refs.shipmentId) pointers.shipmentId = record.refs.shipmentId;
      if (record.refs.settlementId) pointers.settlementId = record.refs.settlementId;

      if (!existing) {
        await tradeRepository.create(
          {
            id: record.tradeId,
            organizationId: this.ctx.organizationId,
            reference: this.ctx.reference ?? record.tradeId,
            correlationId,
            buyerId: this.ctx.buyerId ?? null,
            supplierId: this.ctx.supplierId ?? null,
            currentState: asState(record.state),
            terms: asJson(record.terms),
            metadata: this.ctx.metadata ? asJson(this.ctx.metadata) : undefined,
            version: record.version,
            ...pointers,
          },
          tx,
        );
      } else {
        // State transition — unconditionally guarded by an optimistic lock on
        // the version the engine transitioned FROM (record.version was bumped to
        // loadedVersion + 1). Ref merges go through mergeRefs(), never here, so a
        // concurrent transition that already advanced the row matches zero rows
        // and throws OptimisticLockError (CR-5).
        await tradeRepository.updateWithLock(
          record.tradeId,
          record.version - 1,
          { currentState: asState(record.state), ...pointers },
          tx,
        );
      }

      // Append only the not-yet-persisted history entries (idempotent replay),
      // writing the audit row and the outbox event in the SAME transaction.
      const persisted = await workflowRepository.nextSequence(record.tradeId, tx);
      const toAppend = record.history.slice(persisted);
      for (let i = 0; i < toAppend.length; i += 1) {
        const entry = toAppend[i];
        const sequence = persisted + i;
        await workflowRepository.append(
          {
            organizationId: this.ctx.organizationId,
            tradeTransactionId: record.tradeId,
            type: workflowEventType(entry),
            fromState: entry.from ? asState(entry.from) : null,
            toState: asState(entry.to),
            actorId: entry.actorId,
            actorRole: entry.actorRole,
            reason: entry.reason ?? null,
            correlationId,
          },
          tx,
        );
        await auditRepository.record(
          {
            organizationId: this.ctx.organizationId,
            tradeId: record.tradeId,
            entityType: 'TradeTransaction',
            entityId: record.tradeId,
            action: 'WORKFLOW_TRANSITION',
            actorId: entry.actorId,
            actorRole: entry.actorRole,
            source: 'workflow',
            beforeState: entry.from ? asJson({ state: entry.from }) : undefined,
            afterState: asJson({ state: entry.to }),
            correlationId,
          },
          tx,
        );
        await outboxRepository.enqueue(
          {
            organizationId: this.ctx.organizationId,
            tradeId: record.tradeId,
            eventType: getStageSpec(entry.to).event,
            payload: asJson({
              tradeId: record.tradeId,
              from: entry.from,
              to: entry.to,
              actorId: entry.actorId,
              correlationId,
              version: record.version,
            }),
            correlationId,
            sequence,
          },
          tx,
        );
      }
    });
  }

  /** Merge minted sub-entity pointers without touching state or version (CR-5). */
  async mergeRefs(tradeId: string, refs: WorkflowRecord['refs']): Promise<void> {
    const pointers: Record<string, unknown> = {};
    if (refs.rfqId) pointers.rfqId = refs.rfqId;
    if (refs.dealId) pointers.dealId = refs.dealId;
    if (refs.orderId) pointers.orderId = refs.orderId;
    if (refs.escrowId) pointers.escrowId = refs.escrowId;
    if (refs.shipmentId) pointers.shipmentId = refs.shipmentId;
    if (refs.settlementId) pointers.settlementId = refs.settlementId;
    if (Object.keys(pointers).length === 0) return;
    await tradeRepository.update(tradeId, pointers);
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Audit persistence (Agent 6)
// ──────────────────────────────────────────────────────────────────────────

export class PrismaAuditSink implements AuditSinkPort {
  constructor(private readonly ctx: OrgContext) {}

  /**
   * No-op (CR-6). The transition audit row is now written by PrismaWorkflowStore
   * INSIDE the same transaction as the state change and outbox event, so it can
   * never diverge from the persisted state. This sink is retained only to
   * satisfy the engine's AuditSinkPort contract; writing here would duplicate
   * the audit outside the transactional boundary.
   */
  async record(_entry: AuditEntry): Promise<void> {
    void this.ctx;
    void _entry;
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Trade execution (Agent 7) — persists each sub-entity bound to its trade
// ──────────────────────────────────────────────────────────────────────────

export class PrismaTradeExecution implements TradeExecutionPort {
  constructor(private readonly ctx: OrgContext) {}

  private base(tradeId: string) {
    return { organizationId: this.ctx.organizationId, tradeTransactionId: tradeId };
  }

  private async attach(
    tx: PrismaTransaction,
    tradeId: string,
    pointer: string,
    rowId: string,
    entityType: string,
    actorId: string,
    actorRole: string,
  ): Promise<void> {
    await tradeRepository.update(tradeId, { [pointer]: rowId }, tx);
    await auditRepository.record(
      {
        organizationId: this.ctx.organizationId,
        tradeId,
        entityType,
        entityId: rowId,
        action: 'ATTACH',
        actorId,
        actorRole,
        source: 'execution',
        afterState: asJson({ pointer, rowId }),
        correlationId: this.ctx.correlationId ?? tradeId,
      },
      tx,
    );
  }

  private async setStatus(
    repo: { findByTrade(id: string, tx?: PrismaTransaction): Promise<{ id: string } | null>; update(id: string, data: Record<string, unknown>, tx?: PrismaTransaction): Promise<unknown> },
    tradeId: string,
    status: string,
  ): Promise<void> {
    const row = await repo.findByTrade(tradeId);
    if (row) await repo.update(row.id, { status });
  }

  async execute(state: TradeLifecycleState, context: TradeContext): Promise<ExecutionResult> {
    const tradeId = context.refs.tradeId;
    const t = context.terms;
    const amount = t.quantity * t.unitPrice;
    const actor = { actorId: context.actorId, actorRole: String(context.actorRole) };

    switch (state) {
      case 'RFQ_CREATED':
        return withTransaction(async (tx) => {
          const rfq = await rfqRepository.create(
            { ...this.base(tradeId), commodity: t.commodity, quantity: t.quantity, unitPrice: t.unitPrice, currency: t.currency, status: state },
            tx,
          );
          await this.attach(tx, tradeId, 'rfqId', rfq.id, 'Rfq', actor.actorId, actor.actorRole);
          return { refs: { rfqId: rfq.id } };
        });
      case 'RFQ_SUBMITTED':
      case 'RFQ_ACCEPTED':
      case 'RFQ_REJECTED':
        await this.setStatus(rfqRepository, tradeId, state);
        return {};
      case 'DEAL_CREATED':
        return withTransaction(async (tx) => {
          const deal = await dealRepository.create(
            { ...this.base(tradeId), unitPrice: t.unitPrice, quantity: t.quantity, currency: t.currency, status: state },
            tx,
          );
          await this.attach(tx, tradeId, 'dealId', deal.id, 'Deal', actor.actorId, actor.actorRole);
          return { refs: { dealId: deal.id } };
        });
      case 'DEAL_NEGOTIATION':
      case 'DEAL_APPROVED':
        await this.setStatus(dealRepository, tradeId, state);
        return {};
      case 'ORDER_CREATED':
        return withTransaction(async (tx) => {
          const order = await orderRepository.create(
            { ...this.base(tradeId), totalAmount: amount, currency: t.currency, destinationCountry: t.destinationCountry ?? null, status: state },
            tx,
          );
          await this.attach(tx, tradeId, 'orderId', order.id, 'Order', actor.actorId, actor.actorRole);
          return { refs: { orderId: order.id } };
        });
      case 'ORDER_CONFIRMED':
      case 'ORDER_EXECUTING':
        await this.setStatus(orderRepository, tradeId, state);
        return {};
      case 'ESCROW_CREATED':
        return withTransaction(async (tx) => {
          const escrow = await escrowRepository.create(
            { ...this.base(tradeId), amount, currency: t.currency, status: state },
            tx,
          );
          await this.attach(tx, tradeId, 'escrowId', escrow.id, 'Escrow', actor.actorId, actor.actorRole);
          return { refs: { escrowId: escrow.id } };
        });
      case 'ESCROW_FUNDED':
        return withTransaction(async (tx) => {
          await this.setStatusTx(escrowRepository, tradeId, state, tx);
          const payment = await paymentRepository.create(
            { ...this.base(tradeId), amount, currency: t.currency, status: 'paid', provider: 'orchestrator' },
            tx,
          );
          await this.attach(tx, tradeId, 'paymentId', payment.id, 'Payment', actor.actorId, actor.actorRole);
          return {};
        });
      case 'SHIPMENT_CREATED':
        return withTransaction(async (tx) => {
          const shipment = await shipmentRepository.create(
            { ...this.base(tradeId), origin: t.originCountry ?? null, destination: t.destinationCountry ?? null, status: state },
            tx,
          );
          await this.attach(tx, tradeId, 'shipmentId', shipment.id, 'Shipment', actor.actorId, actor.actorRole);
          return { refs: { shipmentId: shipment.id } };
        });
      case 'SHIPMENT_PICKED_UP':
      case 'SHIPMENT_IN_TRANSIT':
      case 'SHIPMENT_DELIVERED':
        await this.setStatus(shipmentRepository, tradeId, state);
        return {};
      case 'SHIPMENT_CUSTOMS':
        return withTransaction(async (tx) => {
          const customs = await customsRepository.create(
            { ...this.base(tradeId), country: t.destinationCountry ?? null, status: state },
            tx,
          );
          await this.attach(tx, tradeId, 'customsId', customs.id, 'CustomsDeclaration', actor.actorId, actor.actorRole);
          return {};
        });
      case 'SETTLEMENT_PENDING':
        return withTransaction(async (tx) => {
          const settlement = await settlementRepository.create(
            { ...this.base(tradeId), amount, currency: t.currency, status: state },
            tx,
          );
          await this.attach(tx, tradeId, 'settlementId', settlement.id, 'Settlement', actor.actorId, actor.actorRole);
          return { refs: { settlementId: settlement.id } };
        });
      case 'SETTLEMENT_COMPLETED':
        await this.setStatus(settlementRepository, tradeId, state);
        return {};
      default:
        return {};
    }
  }

  private async setStatusTx(
    repo: { findByTrade(id: string, tx?: PrismaTransaction): Promise<{ id: string } | null>; update(id: string, data: Record<string, unknown>, tx?: PrismaTransaction): Promise<unknown> },
    tradeId: string,
    status: string,
    tx: PrismaTransaction,
  ): Promise<void> {
    const row = await repo.findByTrade(tradeId, tx);
    if (row) await repo.update(row.id, { status }, tx);
  }

  async compensate(state: TradeLifecycleState, context: TradeContext, reason: string): Promise<void> {
    const tradeId = context.refs.tradeId;
    await withTransaction(async (tx) => {
      const escrow = await escrowRepository.findByTrade(tradeId, tx);
      if (escrow) await escrowRepository.update(escrow.id, { status: 'refunded' }, tx);
      const shipment = await shipmentRepository.findByTrade(tradeId, tx);
      if (shipment) await shipmentRepository.update(shipment.id, { status: 'cancelled' }, tx);
      const order = await orderRepository.findByTrade(tradeId, tx);
      if (order) await orderRepository.update(order.id, { status: 'cancelled' }, tx);
      const settlement = await settlementRepository.findByTrade(tradeId, tx);
      if (settlement) await settlementRepository.update(settlement.id, { status: 'cancelled' }, tx);
      await auditRepository.record(
        {
          organizationId: this.ctx.organizationId,
          tradeId,
          entityType: 'TradeTransaction',
          entityId: tradeId,
          action: 'COMPENSATE',
          actorId: context.actorId,
          actorRole: String(context.actorRole),
          source: 'execution',
          beforeState: asJson({ state }),
          afterState: asJson({ reason }),
          correlationId: this.ctx.correlationId ?? tradeId,
        },
        tx,
      );
    });
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Risk / Compliance wrappers — persist status onto the aggregate
// ──────────────────────────────────────────────────────────────────────────

const RISK_LEVEL_TO_STATUS: Record<RiskAssessment['level'], RiskStatus> = {
  low: RiskStatus.LOW,
  medium: RiskStatus.MEDIUM,
  high: RiskStatus.HIGH,
  critical: RiskStatus.CRITICAL,
};

export class PersistingRiskEngine implements RiskEnginePort {
  constructor(private readonly base: RiskEnginePort) {}
  async assess(ctx: TradeContext): Promise<RiskAssessment> {
    const result = await this.base.assess(ctx);
    const trade = await tradeRepository.findById(ctx.refs.tradeId);
    if (trade) {
      await tradeRepository.update(ctx.refs.tradeId, { riskStatus: RISK_LEVEL_TO_STATUS[result.level] });
    }
    return result;
  }
}

export class PersistingComplianceEngine implements CompliancePort {
  constructor(private readonly base: CompliancePort) {}
  async screen(ctx: TradeContext): Promise<ComplianceResult> {
    const result = await this.base.screen(ctx);
    const trade = await tradeRepository.findById(ctx.refs.tradeId);
    if (trade) {
      await tradeRepository.update(ctx.refs.tradeId, {
        complianceStatus: result.passed ? ComplianceStatus.PASSED : ComplianceStatus.FAILED,
      });
    }
    return result;
  }
}

export class PrismaNotificationEngine implements NotificationPort {
  constructor(private readonly ctx: OrgContext) {}
  async notify(context: TradeContext, message: NotificationMessage): Promise<void> {
    await notificationRepository.create({
      organizationId: this.ctx.organizationId,
      tradeId: context.refs.tradeId,
      title: message.title,
      message: message.message,
      channel: message.channel,
      priority: message.priority,
      type: 'trade',
      status: 'QUEUED',
    });
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Port assembly
// ──────────────────────────────────────────────────────────────────────────

export interface PortOverrides {
  risk?: RiskEnginePort;
  compliance?: CompliancePort;
  pricing?: PricingPort;
  notification?: NotificationPort;
}

/** Assemble a fully Prisma-backed orchestration port set for one org/request. */
export function buildPrismaPorts(ctx: OrgContext, overrides: PortOverrides = {}): OrchestrationPorts {
  return {
    store: new PrismaWorkflowStore(ctx),
    audit: new PrismaAuditSink(ctx),
    execution: new PrismaTradeExecution(ctx),
    risk: overrides.risk ?? new RiskEngine(ctx),
    compliance: overrides.compliance ?? new ComplianceEngine(ctx),
    pricing: overrides.pricing ?? new DefaultPricingEngine(),
    notification: overrides.notification ?? new PrismaNotificationEngine(ctx),
  };
}
