/**
 * @file orchestration/adapters.ts
 * @description Production port implementations.
 *
 * Binds the orchestration ports to the live domain services. Every domain
 * side-effect is best-effort: when the backing service/route is available the
 * real mutation runs; when it is not (offline, saga-driven 410, etc.) the step
 * defers gracefully so the workflow + event stream still advance — the same
 * resilience contract the existing compensation engine uses.
 *
 * This module is loaded lazily by the brain controller's production default;
 * tests inject in-memory fakes and never touch it.
 */
import { logger } from '@/services/observability-service';
import { apiClient } from '@/lib/api-client';
import { createRfq, closeRfq } from '@/services/rfq-service';
import { orderService } from '@/services/order-service';
import {
  createEscrowAccount,
  markEscrowAsFunded,
  releaseEscrow,
} from '@/services/escrow-service';
import { logisticsService } from '@/services/logistics-service';
import { customsService } from '@/services/customs-service';
import { triggerSettlement } from '@/services/settlement-service';
import { riskService } from '@/services/risk-service';
import { complianceService } from '@/services/compliance-service';
import { notificationDispatcher } from '@/services/notification-dispatcher';
import { getFXRate } from '@/services/fx-service';
import { compensationEngine } from './compensation-engine';
import { TradeLifecycleState } from './lifecycle';
import {
  TradeExecutionPort,
  TradeContext,
  ExecutionResult,
  RiskEnginePort,
  RiskAssessment,
  CompliancePort,
  ComplianceResult,
  PricingPort,
  PriceQuote,
  NotificationPort,
  NotificationMessage,
  WorkflowStorePort,
  WorkflowRecord,
  AuditSinkPort,
  AuditEntry,
} from './ports';

const SANCTION_RISK_THRESHOLD = 75;

/** Run a domain mutation, never letting backend unavailability break the spine. */
async function bestEffort<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err: unknown) {
    logger.warn('TradeExecution', `DEFERRED ${label}: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

export class ProductionTradeExecution implements TradeExecutionPort {
  async execute(state: TradeLifecycleState, ctx: TradeContext): Promise<ExecutionResult> {
    const { terms, refs } = ctx;
    const amount = terms.quantity * terms.unitPrice;

    switch (state) {
      case 'RFQ_CREATED': {
        const rfq = await bestEffort('createRfq', () =>
          createRfq({
            commodity: terms.commodity,
            quantity: terms.quantity,
            targetPrice: terms.unitPrice,
            currency: terms.currency,
            destinationCountry: terms.destinationCountry,
          }),
        );
        return rfq ? { refs: { rfqId: rfq.id } } : {};
      }
      case 'RFQ_SUBMITTED':
        await bestEffort('submitRfq', () => apiClient.patch(`/rfqs/${refs.rfqId}`, { status: 'OPEN' }));
        return {};
      case 'RFQ_ACCEPTED':
        await bestEffort('acceptRfq', () => apiClient.patch(`/rfqs/${refs.rfqId}`, { status: 'AWARDED' }));
        return {};
      case 'RFQ_REJECTED':
        if (refs.rfqId) await bestEffort('rejectRfq', () => closeRfq(refs.rfqId as string));
        return {};
      case 'DEAL_CREATED': {
        const res = await bestEffort('createDeal', () =>
          apiClient.post<{ id: string }>('/deals', {
            rfq_id: refs.rfqId,
            buyer_org_id: terms.buyerId,
            seller_org_id: terms.sellerId,
            commodity: terms.commodity,
            quantity: terms.quantity,
            unit_price: terms.unitPrice,
            currency: terms.currency,
          }),
        );
        const dealId = res?.data?.id;
        return dealId ? { refs: { dealId } } : {};
      }
      case 'DEAL_NEGOTIATION':
        await bestEffort('openNegotiation', () => apiClient.patch(`/deals/${refs.dealId}`, { status: 'NEGOTIATION' }));
        return {};
      case 'DEAL_APPROVED':
        await bestEffort('approveDeal', () => apiClient.patch(`/deals/${refs.dealId}`, { status: 'FINALIZED' }));
        return {};
      case 'ORDER_CREATED': {
        const order = await bestEffort('createOrder', () =>
          orderService.createOrder({
            deal_id: refs.dealId,
            buyer_org_id: terms.buyerId,
            seller_org_id: terms.sellerId,
            currency: terms.currency,
            destination_country: terms.destinationCountry,
            lines: [
              {
                product_id: terms.commodity,
                quantity: terms.quantity,
                unit_price: terms.unitPrice,
              },
            ],
          }),
        );
        return order ? { refs: { orderId: order.id } } : {};
      }
      case 'ORDER_CONFIRMED':
        if (refs.orderId) {
          await bestEffort('confirmOrder', () => orderService.updateOrderStatus(refs.orderId as string, 'confirmed' as never));
        }
        return {};
      case 'ORDER_EXECUTING':
        await bestEffort('executeOrder', () => apiClient.patch(`/orders/${refs.orderId}/execute`, {}));
        return {};
      case 'ESCROW_CREATED': {
        const escrow = await bestEffort('createEscrow', () =>
          createEscrowAccount({
            orderId: refs.orderId ?? ctx.refs.tradeId,
            buyerId: terms.buyerId,
            sellerId: terms.sellerId ?? '',
            buyerName: String(ctx.metadata.buyerName ?? terms.buyerId),
            sellerName: String(ctx.metadata.sellerName ?? terms.sellerId ?? 'COUNTERPARTY'),
            amount,
            currency: terms.currency,
          }),
        );
        return escrow ? { refs: { escrowId: escrow.id } } : {};
      }
      case 'ESCROW_FUNDED':
        if (refs.escrowId) {
          await bestEffort('fundEscrow', () => markEscrowAsFunded(refs.escrowId as string, 1, terms.currency));
        }
        return {};
      case 'SHIPMENT_CREATED': {
        const shipment = await bestEffort('createShipment', () =>
          logisticsService.createShipment({
            orderId: refs.orderId ?? ctx.refs.tradeId,
            origin: terms.originCountry ?? 'ORIGIN',
            destination: terms.destinationCountry ?? 'DESTINATION',
          }),
        );
        return shipment ? { refs: { shipmentId: shipment.id } } : {};
      }
      case 'SHIPMENT_PICKED_UP':
        if (refs.shipmentId) {
          await bestEffort('pickup', () =>
            logisticsService.recordMilestone(refs.shipmentId as string, { status: 'PICKED_UP', location: terms.originCountry ?? 'ORIGIN' }),
          );
        }
        return {};
      case 'SHIPMENT_IN_TRANSIT':
        if (refs.shipmentId) {
          await bestEffort('transit', () =>
            logisticsService.recordMilestone(refs.shipmentId as string, { status: 'IN_TRANSIT', location: 'IN_TRANSIT' }),
          );
        }
        return {};
      case 'SHIPMENT_CUSTOMS':
        await bestEffort('customs', () =>
          customsService.submitDeclaration({ shipmentId: refs.shipmentId, country: terms.destinationCountry } as never),
        );
        return {};
      case 'SHIPMENT_DELIVERED':
        if (refs.shipmentId) {
          await bestEffort('deliver', () =>
            logisticsService.recordMilestone(refs.shipmentId as string, { status: 'DELIVERED', location: terms.destinationCountry ?? 'DESTINATION' }),
          );
        }
        return {};
      case 'SETTLEMENT_PENDING':
        return {};
      case 'SETTLEMENT_COMPLETED': {
        if (refs.escrowId) {
          await bestEffort('triggerSettlement', () => triggerSettlement(refs.escrowId as string, ctx.actorId));
          await bestEffort('releaseEscrow', () => releaseEscrow(refs.escrowId as string));
        }
        return { refs: { settlementId: refs.escrowId } };
      }
      case 'TRADE_COMPLETED':
      case 'TRADE_CANCELLED':
        return {};
      default:
        return {};
    }
  }

  async compensate(state: TradeLifecycleState, ctx: TradeContext, reason: string): Promise<void> {
    const { refs } = ctx;
    // Reverse the highest-value committed effect first.
    if (refs.escrowId) {
      await compensationEngine.compensate('FINANCIAL', refs.escrowId, reason);
    }
    if (refs.shipmentId) {
      await compensationEngine.compensate('LOGISTICS', refs.shipmentId, reason);
    }
    if (refs.orderId) {
      await compensationEngine.compensate('EXECUTION', refs.orderId, reason);
    }
    logger.warn('TradeExecution', `COMPENSATED ${state} for trade ${ctx.refs.tradeId}: ${reason}`);
  }
}

export class ProductionRiskEngine implements RiskEnginePort {
  async assess(ctx: TradeContext): Promise<RiskAssessment> {
    const profile = await bestEffort('calculateRiskScore', () =>
      riskService.calculateRiskScore(ctx.terms.buyerId),
    );
    if (!profile) {
      return { score: 50, level: 'medium', factors: ['risk_engine_unavailable'] };
    }
    const level: RiskAssessment['level'] =
      profile.riskLevel === 'emergency' ? 'critical' : profile.riskLevel;
    return { score: profile.riskScore, level, factors: profile.factors };
  }
}

export class ProductionComplianceEngine implements CompliancePort {
  async screen(ctx: TradeContext): Promise<ComplianceResult> {
    const companyId = ctx.terms.buyerId;
    const riskNum = (await bestEffort('complianceRisk', () => complianceService.calculateRisk(companyId))) ?? 50;
    const kyc = (await bestEffort('kycStatus', () => complianceService.getKYCStatus(companyId))) ?? 'pending';
    const kycVerified = kyc === 'verified';
    const sanctions = riskNum >= SANCTION_RISK_THRESHOLD;
    const reasons: string[] = [];
    if (!kycVerified) reasons.push(`kyc_${kyc}`);
    if (sanctions) reasons.push('sanctions_risk_threshold');
    return { passed: kycVerified && !sanctions, sanctions, kycVerified, reasons };
  }
}

export class ProductionPricingEngine implements PricingPort {
  async quote(ctx: TradeContext): Promise<PriceQuote> {
    const { terms } = ctx;
    const fxRate = (await bestEffort('getFXRate', () => getFXRate(terms.currency, 'USD'))) ?? 1;
    const totalPrice = terms.quantity * terms.unitPrice;
    return { unitPrice: terms.unitPrice, totalPrice, currency: terms.currency, fxRate };
  }
}

export class ProductionNotificationEngine implements NotificationPort {
  async notify(ctx: TradeContext, message: NotificationMessage): Promise<void> {
    await bestEffort('dispatchNotification', () =>
      notificationDispatcher.dispatch({
        companyId: ctx.terms.buyerId,
        userId: ctx.actorId,
        title: message.title,
        message: message.message,
        priority: message.priority,
        type: 'trade',
        metadata: { tradeId: ctx.refs.tradeId, correlationId: ctx.correlationId },
      }),
    );
  }
}

/**
 * NON-AUTHORITATIVE, client-only display store (CR-4). The server store of
 * record is the Prisma-backed `PrismaWorkflowStore` reached via `buildBrain()`.
 * This in-process cache must never be used as a second persistence authority on
 * the server — `BrainController.resolvePorts` enforces that.
 */
export class ApiMirrorWorkflowStore implements WorkflowStorePort {
  private cache: Map<string, WorkflowRecord> = new Map();

  async load(tradeId: string): Promise<WorkflowRecord | null> {
    return this.cache.get(tradeId) ?? null;
  }

  async save(record: WorkflowRecord): Promise<void> {
    this.cache.set(record.tradeId, record);
    await bestEffort('mirrorWorkflow', () => apiClient.post('/trade_workflows', record));
  }
}

/** Event-bus audit plus a durable API-side append. */
export class ApiAuditSink implements AuditSinkPort {
  async record(entry: AuditEntry): Promise<void> {
    logger.forensic(
      'WorkflowAudit',
      `${entry.action}:${entry.from ?? 'GENESIS'}->${entry.to}`,
      `Trade ${entry.tradeId}`,
      entry.actorId,
      'PLATFORM',
    );
    await bestEffort('persistAudit', () => apiClient.post('/audit_logs', entry));
  }
}

/** Assemble the full production port set. */
export function createProductionPorts() {
  return {
    execution: new ProductionTradeExecution(),
    risk: new ProductionRiskEngine(),
    compliance: new ProductionComplianceEngine(),
    pricing: new ProductionPricingEngine(),
    notification: new ProductionNotificationEngine(),
    store: new ApiMirrorWorkflowStore(),
    audit: new ApiAuditSink(),
  };
}
