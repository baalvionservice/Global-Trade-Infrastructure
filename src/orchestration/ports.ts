/**
 * @file orchestration/ports.ts
 * @description Dependency-injection contracts for the orchestration kernel.
 *
 * The kernel (workflow engine + brain controller) depends ONLY on these
 * interfaces, never on concrete domain services. Production wiring binds them
 * to the live trade/risk/compliance/pricing/notification services
 * (see adapters.ts); tests bind in-memory fakes. This is what keeps the
 * lifecycle event-driven and free of direct module coupling.
 */

import type { TradeLifecycleState } from './lifecycle';
import type { UserRole } from '@/core/roles';

/** Identifiers minted by the domain as a trade materialises through its phases. */
export interface TradeRefs {
  tradeId: string;
  rfqId?: string;
  dealId?: string;
  orderId?: string;
  escrowId?: string;
  shipmentId?: string;
  settlementId?: string;
}

/** Commercial parameters that travel with the trade through orchestration. */
export interface TradeTerms {
  buyerId: string;
  sellerId?: string;
  commodity: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  incoterm?: string;
  originCountry?: string;
  destinationCountry?: string;
}

/** Immutable-by-convention context threaded through every transition. */
export interface TradeContext {
  refs: TradeRefs;
  terms: TradeTerms;
  actorId: string;
  actorRole: UserRole;
  correlationId: string;
  metadata: Record<string, unknown>;
}

/** Result of a single domain side-effect; merged into the trade refs. */
export interface ExecutionResult {
  refs?: Partial<TradeRefs>;
  metadata?: Record<string, unknown>;
}

/**
 * Realises the domain side-effect for a target state (e.g. create the deal,
 * fund the escrow, dispatch the shipment). One method keyed by target state so
 * the orchestrator stays decoupled from individual services.
 */
export interface TradeExecutionPort {
  execute(state: TradeLifecycleState, ctx: TradeContext): Promise<ExecutionResult>;
  /** Best-effort reversal of a previously realised state during compensation. */
  compensate(state: TradeLifecycleState, ctx: TradeContext, reason: string): Promise<void>;
}

export interface RiskAssessment {
  score: number; // 0-100, higher = riskier
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
}

export interface RiskEnginePort {
  assess(ctx: TradeContext): Promise<RiskAssessment>;
}

export interface ComplianceResult {
  passed: boolean;
  sanctions: boolean;
  kycVerified: boolean;
  reasons: string[];
}

export interface CompliancePort {
  screen(ctx: TradeContext): Promise<ComplianceResult>;
}

export interface PriceQuote {
  unitPrice: number;
  totalPrice: number;
  currency: string;
  fxRate: number;
}

export interface PricingPort {
  quote(ctx: TradeContext): Promise<PriceQuote>;
}

export interface NotificationMessage {
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  channel: 'email' | 'sms' | 'inApp';
}

export interface NotificationPort {
  notify(ctx: TradeContext, message: NotificationMessage): Promise<void>;
}

/** Persisted shape of a running workflow instance. */
export interface WorkflowRecord {
  tradeId: string;
  state: TradeLifecycleState;
  version: number;
  refs: TradeRefs;
  terms: TradeTerms;
  history: WorkflowHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowHistoryEntry {
  from: TradeLifecycleState | null;
  to: TradeLifecycleState;
  actorId: string;
  actorRole: UserRole;
  reason?: string;
  timestamp: string;
}

/** Persistence hook — defaults to in-memory; production mirrors to the API. */
export interface WorkflowStorePort {
  load(tradeId: string): Promise<WorkflowRecord | null>;
  /**
   * Persist a genesis or a state transition. Implementations that support
   * concurrency MUST optimistically lock on the record's prior version so two
   * concurrent transitions cannot both commit (CR-5).
   */
  save(record: WorkflowRecord): Promise<void>;
  /**
   * Merge minted sub-entity identifiers without advancing state or version.
   * Kept separate from {@link save} so the transition write can be
   * unconditionally version-locked. Optional: stores that don't implement it
   * fall back to {@link save}.
   */
  mergeRefs?(tradeId: string, refs: TradeRefs): Promise<void>;
}

export interface AuditEntry {
  tradeId: string;
  action: string;
  actorId: string;
  actorRole: UserRole;
  from: TradeLifecycleState | null;
  to: TradeLifecycleState;
  correlationId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/** Audit hook — append-only forensic trail of every transition. */
export interface AuditSinkPort {
  record(entry: AuditEntry): Promise<void>;
}

/** Full set of ports the brain controller coordinates. */
export interface OrchestrationPorts {
  execution: TradeExecutionPort;
  risk: RiskEnginePort;
  compliance: CompliancePort;
  pricing: PricingPort;
  notification: NotificationPort;
  store: WorkflowStorePort;
  audit: AuditSinkPort;
}
