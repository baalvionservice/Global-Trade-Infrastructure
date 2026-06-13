/**
 * @file workflow-engine.ts
 * @description The single global execution kernel.
 *
 * Two layers live here:
 *  1. Legacy GST domain transitions (`transition`) — preserved verbatim for the
 *     dozens of modules that already depend on it.
 *  2. The canonical trade-lifecycle engine (`createWorkflow` / `advance` /
 *     `cancel`) that enforces {@link lifecycle.TRANSITION_MAP}, persists every
 *     instance through an injected store, writes an append-only audit trail,
 *     retries durable side-effects, and emits a stage event on every move.
 *
 * The engine depends only on ports (store, audit, bus) so it is fully testable
 * in-memory and free of direct service coupling.
 */
import { GST_TRANSITION_MATRIX } from '@/core/gst';
import { eventBus, EventBus, PlatformEvent } from './event-bus';
import { logger, metricsService } from '@/services/observability-service';
import { apiClient } from '@/lib/api-client';
import { UserRole } from '@/core/roles';
import { LifecycleStatus } from '@/types/institutional';
import {
  TradeLifecycleState,
  TRADE_EVENTS,
  getStageSpec,
  isLegalTransition,
  isTerminal,
} from './lifecycle';
import {
  WorkflowRecord,
  WorkflowStorePort,
  AuditSinkPort,
  AuditEntry,
  TradeRefs,
  TradeTerms,
} from './ports';

const MAX_SIDE_EFFECT_ATTEMPTS = 3;
const SIDE_EFFECT_BACKOFF_MS = 20;

function nowIso(): string {
  return new Date().toISOString();
}

async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  attempts = MAX_SIDE_EFFECT_ATTEMPTS,
): Promise<T> {
  let lastErr: unknown;
  for (let i = 1; i <= attempts; i += 1) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastErr = err;
      const message = err instanceof Error ? err.message : String(err);
      logger.warn('WorkflowKernel', `RETRYING ${label} (attempt ${i}/${attempts}): ${message}`);
      if (i < attempts) {
        await new Promise((r) => setTimeout(r, SIDE_EFFECT_BACKOFF_MS * i));
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(`${label}_FAILED`);
}

/** Default in-process workflow store. Sufficient for the kernel's own state. */
export class InMemoryWorkflowStore implements WorkflowStorePort {
  private records: Map<string, WorkflowRecord> = new Map();

  async load(tradeId: string): Promise<WorkflowRecord | null> {
    const rec = this.records.get(tradeId);
    return rec ? structuredCloneSafe(rec) : null;
  }

  async save(record: WorkflowRecord): Promise<void> {
    this.records.set(record.tradeId, structuredCloneSafe(record));
  }
}

/** Default audit sink — forensic log + replayable audit event on the bus. */
export class EventBusAuditSink implements AuditSinkPort {
  constructor(private readonly bus: EventBus = eventBus) {}

  async record(entry: AuditEntry): Promise<void> {
    logger.forensic(
      'WorkflowAudit',
      `${entry.action}:${entry.from ?? 'GENESIS'}->${entry.to}`,
      `Trade ${entry.tradeId} transitioned by ${entry.actorRole}`,
      entry.actorId,
      String((entry.metadata?.tenantId as string) ?? 'PLATFORM'),
    );
    await this.bus.publish('AUDIT_LOG_APPENDED', entry as unknown as Record<string, unknown>);
  }
}

function structuredCloneSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export interface CreateWorkflowInput {
  tradeId: string;
  terms: TradeTerms;
  actorId: string;
  actorRole: UserRole;
  correlationId?: string;
  refs?: Partial<TradeRefs>;
  metadata?: Record<string, unknown>;
}

export interface AdvanceInput {
  tradeId: string;
  to: TradeLifecycleState;
  actorId: string;
  actorRole: UserRole;
  correlationId?: string;
  reason?: string;
  refs?: Partial<TradeRefs>;
  metadata?: Record<string, unknown>;
}

export class WorkflowEngine {
  private static instance: WorkflowEngine;
  private idempotencyLedger: Set<string> = new Set();

  private constructor(
    private readonly store: WorkflowStorePort = new InMemoryWorkflowStore(),
    private readonly audit: AuditSinkPort = new EventBusAuditSink(),
    private readonly bus: EventBus = eventBus,
  ) {}

  public static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  /** Construct an isolated engine with injected ports (tests / multi-tenant runners). */
  public static create(deps: {
    store?: WorkflowStorePort;
    audit?: AuditSinkPort;
    bus?: EventBus;
  } = {}): WorkflowEngine {
    return new WorkflowEngine(
      deps.store ?? new InMemoryWorkflowStore(),
      deps.audit ?? new EventBusAuditSink(deps.bus ?? eventBus),
      deps.bus ?? eventBus,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Canonical trade-lifecycle engine
  // ──────────────────────────────────────────────────────────────────────────

  /** Genesis: create a workflow at RFQ_CREATED and emit `rfq.created`. */
  async createWorkflow(input: CreateWorkflowInput): Promise<WorkflowRecord> {
    const existing = await this.store.load(input.tradeId);
    if (existing) {
      logger.warn('WorkflowKernel', `WORKFLOW_EXISTS: ${input.tradeId} (idempotent create)`);
      return existing;
    }

    const correlationId = input.correlationId ?? input.tradeId;
    const timestamp = nowIso();
    const record: WorkflowRecord = {
      tradeId: input.tradeId,
      state: 'RFQ_CREATED',
      version: 1,
      refs: { tradeId: input.tradeId, ...input.refs },
      terms: input.terms,
      history: [
        {
          from: null,
          to: 'RFQ_CREATED',
          actorId: input.actorId,
          actorRole: input.actorRole,
          timestamp,
        },
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await withRetry(() => this.store.save(record), 'persist_create');
    await this.writeAudit(record, null, 'RFQ_CREATED', input.actorId, input.actorRole, correlationId, input.metadata);
    await this.emitStageEvent(record, null, 'RFQ_CREATED', input.actorId, correlationId);
    await metricsService.recordMetric('workflow_created_total', 1);
    return record;
  }

  async getWorkflow(tradeId: string): Promise<WorkflowRecord | null> {
    return this.store.load(tradeId);
  }

  /**
   * Merge domain identifiers into a workflow without changing its state.
   * Used by the orchestrator to thread IDs minted by side-effects (rfqId,
   * orderId, escrowId, ...) back onto the running instance.
   */
  async updateRefs(tradeId: string, refs: Partial<TradeRefs>): Promise<WorkflowRecord> {
    const record = await this.store.load(tradeId);
    if (!record) throw new Error(`WORKFLOW_NOT_FOUND: ${tradeId}`);
    const next: WorkflowRecord = {
      ...record,
      refs: { ...record.refs, ...refs },
      updatedAt: nowIso(),
    };
    // Ref merges never advance state/version, so they bypass the optimistic
    // lock on save() (which is reserved for genuine transitions, CR-5).
    if (this.store.mergeRefs) {
      await withRetry(() => this.store.mergeRefs!(next.tradeId, next.refs), 'persist_refs');
    } else {
      await withRetry(() => this.store.save(next), 'persist_refs');
    }
    return next;
  }

  /**
   * Execute a validated lifecycle transition.
   * Validate -> Guard (illegal/terminal) -> Commit -> Audit -> Propagate.
   */
  async advance(input: AdvanceInput): Promise<WorkflowRecord> {
    const record = await this.store.load(input.tradeId);
    if (!record) {
      throw new Error(`WORKFLOW_NOT_FOUND: ${input.tradeId}`);
    }

    const from = record.state;
    const to = input.to;
    const correlationId = input.correlationId ?? record.tradeId;

    // Idempotent re-entry: already in the target state.
    if (from === to) {
      return record;
    }

    if (isTerminal(from)) {
      throw new Error(`TERMINAL_STATE: ${input.tradeId} is already ${from}; cannot advance to ${to}.`);
    }

    if (!isLegalTransition(from, to)) {
      await this.bus.publish(TRADE_EVENTS.WORKFLOW_BLOCKED, {
        tradeId: record.tradeId,
        from,
        to,
        actorId: input.actorId,
        correlationId,
        reason: 'ILLEGAL_TRANSITION',
      });
      logger.error('WorkflowKernel', `ILLEGAL_TRANSITION: ${from} -> ${to} [${record.tradeId}]`);
      throw new Error(`ILLEGAL_TRANSITION: ${from} -> ${to}`);
    }

    const timestamp = nowIso();
    const next: WorkflowRecord = {
      ...record,
      state: to,
      version: record.version + 1,
      refs: { ...record.refs, ...input.refs },
      updatedAt: timestamp,
      history: [
        ...record.history,
        {
          from,
          to,
          actorId: input.actorId,
          actorRole: input.actorRole,
          reason: input.reason,
          timestamp,
        },
      ],
    };

    await withRetry(() => this.store.save(next), `persist_${to}`);
    await this.writeAudit(next, from, to, input.actorId, input.actorRole, correlationId, input.metadata);
    await this.emitStageEvent(next, from, to, input.actorId, correlationId);
    await metricsService.recordMetric('workflow_transition_success', 1, { to });
    return next;
  }

  /** Drive an in-flight trade to TRADE_CANCELLED (compensation entry point). */
  async cancel(
    tradeId: string,
    opts: { actorId: string; actorRole: UserRole; reason: string; correlationId?: string },
  ): Promise<WorkflowRecord> {
    const record = await this.store.load(tradeId);
    if (!record) throw new Error(`WORKFLOW_NOT_FOUND: ${tradeId}`);
    if (isTerminal(record.state)) return record;
    return this.advance({
      tradeId,
      to: 'TRADE_CANCELLED',
      actorId: opts.actorId,
      actorRole: opts.actorRole,
      reason: opts.reason,
      correlationId: opts.correlationId,
    });
  }

  private async writeAudit(
    record: WorkflowRecord,
    from: TradeLifecycleState | null,
    to: TradeLifecycleState,
    actorId: string,
    actorRole: UserRole,
    correlationId: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const entry: AuditEntry = {
      tradeId: record.tradeId,
      action: 'WORKFLOW_TRANSITION',
      actorId,
      actorRole,
      from,
      to,
      correlationId,
      timestamp: record.updatedAt,
      metadata,
    };
    // Audit must never block the trade; failures are logged and swallowed.
    try {
      await withRetry(() => this.audit.record(entry), 'audit_record', 2);
    } catch (err: unknown) {
      logger.error('WorkflowKernel', `AUDIT_WRITE_FAILED: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private async emitStageEvent(
    record: WorkflowRecord,
    from: TradeLifecycleState | null,
    to: TradeLifecycleState,
    actorId: string,
    correlationId: string,
  ): Promise<void> {
    const spec = getStageSpec(to);
    const basePayload = {
      tradeId: record.tradeId,
      from,
      to,
      refs: record.refs,
      terms: record.terms,
      actorId,
      userId: actorId,
      correlationId,
      version: record.version,
    };
    await this.bus.publish(spec.event, basePayload);
    await this.bus.publish(TRADE_EVENTS.WORKFLOW_TRANSITIONED, basePayload);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Legacy GST domain transition (preserved for existing consumers)
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Executes a deterministic GST domain transition.
   * Logic: Validate -> Guard (GST) -> Commit -> Project -> Propagate
   */
  async transition(data: {
    domain: string;
    entityId: string;
    from: LifecycleStatus;
    to: LifecycleStatus;
    actorId: string;
    actorRole: UserRole;
    requestId?: string;
    payload?: unknown;
  }): Promise<boolean> {
    const { domain, entityId, from, to, actorId, actorRole, requestId } = data;

    if (requestId && this.idempotencyLedger.has(requestId)) {
      logger.warn('WorkflowKernel', `IDEMPOTENT_RETRY: Request ${requestId} already processed.`);
      return true;
    }

    const fromKey = `${domain.toUpperCase()}:${String(from).toUpperCase()}`;
    const toKey = String(to).toUpperCase();
    const transitionRule = GST_TRANSITION_MATRIX[fromKey]?.find(
      (r) => r.target === `${domain.toUpperCase()}:${toKey}`,
    );

    if (!transitionRule) {
      logger.error('WorkflowKernel', `ILLEGAL_TRANSITION: ${fromKey} -> ${toKey} denied by GST.`);
      throw new Error(`Execution policy violation: Transition not permitted.`);
    }

    try {
      logger.info('WorkflowKernel', `EXECUTING_TRANSITION: ${fromKey} -> ${toKey} [Entity: ${entityId}]`);

      const collectionMap: Record<string, string> = {
        SOURCING: 'rfqs',
        NEGOTIATION: 'deals',
        EXECUTION: 'orders',
        FINANCIAL: 'escrows',
        LOGISTICS: 'shipments',
      };

      const collection = collectionMap[domain.toUpperCase()];
      if (collection) {
        try {
          await apiClient.patch(`/${collection}/${entityId}`, { status: to });
        } catch {
          logger.warn('WorkflowKernel', `Projection update deferred for ${collection}/${entityId}`);
        }
      }

      if (requestId) this.idempotencyLedger.add(requestId);

      await this.bus.publish('WORKFLOW_STEP_COMPLETED', {
        domain,
        entityId,
        from,
        to,
        actorId,
        actorRole,
        timestamp: nowIso(),
      });

      await metricsService.recordMetric('workflow_transition_success', 1);
      return true;
    } catch (e: unknown) {
      logger.error('WorkflowKernel', `TRANSITION_FAILURE: ${e instanceof Error ? e.message : String(e)}`);
      return false;
    }
  }

  /** Replays a specific entity's workflow history for forensic reconstruction. */
  async getAuditTrail(entityId: string): Promise<PlatformEvent[]> {
    return this.bus
      .getHistory()
      .filter((e) => {
        const payload = e.payload as { entityId?: string; tradeId?: string } | undefined;
        return payload?.entityId === entityId || payload?.tradeId === entityId;
      });
  }
}

export const workflowEngine = WorkflowEngine.getInstance();
