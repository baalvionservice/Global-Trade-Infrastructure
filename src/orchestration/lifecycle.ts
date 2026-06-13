/**
 * @file orchestration/lifecycle.ts
 * @description Canonical Baalvion trade-lifecycle state machine.
 *
 * This module is the single source of truth for the end-to-end trade spine
 * (RFQ -> Deal -> Order -> Escrow -> Shipment -> Customs -> Settlement). It is
 * intentionally dependency-free so it can be reasoned about, unit-tested and
 * reused by the workflow engine, the brain controller and the approval layer
 * without pulling in network/runtime concerns.
 */

/** Every legal state in the trade lifecycle. */
export type TradeLifecycleState =
  | 'RFQ_CREATED'
  | 'RFQ_SUBMITTED'
  | 'RFQ_ACCEPTED'
  | 'RFQ_REJECTED'
  | 'DEAL_CREATED'
  | 'DEAL_NEGOTIATION'
  | 'DEAL_APPROVED'
  | 'ORDER_CREATED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_EXECUTING'
  | 'ESCROW_CREATED'
  | 'ESCROW_FUNDED'
  | 'SHIPMENT_CREATED'
  | 'SHIPMENT_PICKED_UP'
  | 'SHIPMENT_IN_TRANSIT'
  | 'SHIPMENT_CUSTOMS'
  | 'SHIPMENT_DELIVERED'
  | 'SETTLEMENT_PENDING'
  | 'SETTLEMENT_COMPLETED'
  | 'TRADE_COMPLETED'
  | 'TRADE_CANCELLED';

/**
 * How a state is entered:
 *  - START:    the genesis state of a workflow.
 *  - AUTO:     the orchestrator advances into it automatically once the
 *              predecessor is satisfied (no human / external trigger).
 *  - EXTERNAL: requires an explicit command (approval, funding confirmation,
 *              delivery scan, settlement release, cancellation).
 *  - TERMINAL: an absorbing state with no successor.
 */
export type StageTrigger = 'START' | 'AUTO' | 'EXTERNAL' | 'TERMINAL';

/** The domain-facing phase a state belongs to. */
export type TradePhase =
  | 'RFQ'
  | 'DEAL'
  | 'ORDER'
  | 'ESCROW'
  | 'SHIPMENT'
  | 'SETTLEMENT'
  | 'TERMINAL';

export interface StageSpec {
  readonly state: TradeLifecycleState;
  readonly phase: TradePhase;
  readonly trigger: StageTrigger;
  /** The platform event emitted when this state is entered. */
  readonly event: string;
  /** The happy-path successor the orchestrator drives toward, if any. */
  readonly next: TradeLifecycleState | null;
}

/**
 * Mandated platform event names. Subscribers (UI, notification mesh, brain
 * controller, audit sink) bind to these. They are stable wire identifiers.
 */
export const TRADE_EVENTS = {
  RFQ_CREATED: 'rfq.created',
  RFQ_SUBMITTED: 'rfq.submitted',
  RFQ_ACCEPTED: 'rfq.accepted',
  RFQ_REJECTED: 'rfq.rejected',
  DEAL_CREATED: 'deal.created',
  DEAL_NEGOTIATION: 'deal.negotiation',
  DEAL_APPROVED: 'deal.approved',
  ORDER_CREATED: 'order.created',
  ORDER_CONFIRMED: 'order.confirmed',
  ORDER_EXECUTING: 'order.executing',
  ESCROW_CREATED: 'escrow.created',
  ESCROW_FUNDED: 'escrow.funded',
  SHIPMENT_CREATED: 'shipment.created',
  SHIPMENT_DISPATCHED: 'shipment.dispatched',
  SHIPMENT_IN_TRANSIT: 'shipment.in_transit',
  SHIPMENT_CUSTOMS: 'shipment.customs',
  SHIPMENT_DELIVERED: 'shipment.delivered',
  SETTLEMENT_STARTED: 'settlement.started',
  SETTLEMENT_COMPLETED: 'settlement.completed',
  TRADE_COMPLETED: 'trade.completed',
  TRADE_CANCELLED: 'trade.cancelled',
  WORKFLOW_TRANSITIONED: 'workflow.transitioned',
  WORKFLOW_BLOCKED: 'workflow.blocked',
  COMPENSATION_TRIGGERED: 'compensation.triggered',
} as const;

export type TradeEventName = (typeof TRADE_EVENTS)[keyof typeof TRADE_EVENTS];

/**
 * Authoritative stage table. Order matters: it encodes the happy path. Every
 * non-terminal state can additionally transition to TRADE_CANCELLED (see
 * {@link CANCELLABLE_STATES}); those edges are folded into the transition map.
 */
export const LIFECYCLE_PLAN: readonly StageSpec[] = [
  { state: 'RFQ_CREATED', phase: 'RFQ', trigger: 'START', event: TRADE_EVENTS.RFQ_CREATED, next: 'RFQ_SUBMITTED' },
  { state: 'RFQ_SUBMITTED', phase: 'RFQ', trigger: 'AUTO', event: TRADE_EVENTS.RFQ_SUBMITTED, next: 'RFQ_ACCEPTED' },
  { state: 'RFQ_ACCEPTED', phase: 'RFQ', trigger: 'EXTERNAL', event: TRADE_EVENTS.RFQ_ACCEPTED, next: 'DEAL_CREATED' },
  { state: 'RFQ_REJECTED', phase: 'RFQ', trigger: 'EXTERNAL', event: TRADE_EVENTS.RFQ_REJECTED, next: 'TRADE_CANCELLED' },
  { state: 'DEAL_CREATED', phase: 'DEAL', trigger: 'AUTO', event: TRADE_EVENTS.DEAL_CREATED, next: 'DEAL_NEGOTIATION' },
  { state: 'DEAL_NEGOTIATION', phase: 'DEAL', trigger: 'AUTO', event: TRADE_EVENTS.DEAL_NEGOTIATION, next: 'DEAL_APPROVED' },
  { state: 'DEAL_APPROVED', phase: 'DEAL', trigger: 'EXTERNAL', event: TRADE_EVENTS.DEAL_APPROVED, next: 'ORDER_CREATED' },
  { state: 'ORDER_CREATED', phase: 'ORDER', trigger: 'AUTO', event: TRADE_EVENTS.ORDER_CREATED, next: 'ORDER_CONFIRMED' },
  { state: 'ORDER_CONFIRMED', phase: 'ORDER', trigger: 'AUTO', event: TRADE_EVENTS.ORDER_CONFIRMED, next: 'ORDER_EXECUTING' },
  { state: 'ORDER_EXECUTING', phase: 'ORDER', trigger: 'AUTO', event: TRADE_EVENTS.ORDER_EXECUTING, next: 'ESCROW_CREATED' },
  { state: 'ESCROW_CREATED', phase: 'ESCROW', trigger: 'AUTO', event: TRADE_EVENTS.ESCROW_CREATED, next: 'ESCROW_FUNDED' },
  { state: 'ESCROW_FUNDED', phase: 'ESCROW', trigger: 'EXTERNAL', event: TRADE_EVENTS.ESCROW_FUNDED, next: 'SHIPMENT_CREATED' },
  { state: 'SHIPMENT_CREATED', phase: 'SHIPMENT', trigger: 'AUTO', event: TRADE_EVENTS.SHIPMENT_CREATED, next: 'SHIPMENT_PICKED_UP' },
  { state: 'SHIPMENT_PICKED_UP', phase: 'SHIPMENT', trigger: 'AUTO', event: TRADE_EVENTS.SHIPMENT_DISPATCHED, next: 'SHIPMENT_IN_TRANSIT' },
  { state: 'SHIPMENT_IN_TRANSIT', phase: 'SHIPMENT', trigger: 'AUTO', event: TRADE_EVENTS.SHIPMENT_IN_TRANSIT, next: 'SHIPMENT_CUSTOMS' },
  { state: 'SHIPMENT_CUSTOMS', phase: 'SHIPMENT', trigger: 'AUTO', event: TRADE_EVENTS.SHIPMENT_CUSTOMS, next: 'SHIPMENT_DELIVERED' },
  { state: 'SHIPMENT_DELIVERED', phase: 'SHIPMENT', trigger: 'EXTERNAL', event: TRADE_EVENTS.SHIPMENT_DELIVERED, next: 'SETTLEMENT_PENDING' },
  { state: 'SETTLEMENT_PENDING', phase: 'SETTLEMENT', trigger: 'AUTO', event: TRADE_EVENTS.SETTLEMENT_STARTED, next: 'SETTLEMENT_COMPLETED' },
  { state: 'SETTLEMENT_COMPLETED', phase: 'SETTLEMENT', trigger: 'EXTERNAL', event: TRADE_EVENTS.SETTLEMENT_COMPLETED, next: 'TRADE_COMPLETED' },
  { state: 'TRADE_COMPLETED', phase: 'TERMINAL', trigger: 'AUTO', event: TRADE_EVENTS.TRADE_COMPLETED, next: null },
  { state: 'TRADE_CANCELLED', phase: 'TERMINAL', trigger: 'EXTERNAL', event: TRADE_EVENTS.TRADE_CANCELLED, next: null },
];

const STAGE_INDEX: Readonly<Record<TradeLifecycleState, StageSpec>> = LIFECYCLE_PLAN.reduce(
  (acc, spec) => {
    acc[spec.state] = spec;
    return acc;
  },
  {} as Record<TradeLifecycleState, StageSpec>,
);

/** States from which an in-flight trade may still be cancelled / compensated. */
export const CANCELLABLE_STATES: ReadonlySet<TradeLifecycleState> = new Set<TradeLifecycleState>([
  'RFQ_CREATED',
  'RFQ_SUBMITTED',
  'RFQ_ACCEPTED',
  'DEAL_CREATED',
  'DEAL_NEGOTIATION',
  'DEAL_APPROVED',
  'ORDER_CREATED',
  'ORDER_CONFIRMED',
  'ORDER_EXECUTING',
  'ESCROW_CREATED',
  'ESCROW_FUNDED',
  'SHIPMENT_CREATED',
  'SHIPMENT_PICKED_UP',
  'SHIPMENT_IN_TRANSIT',
  'SHIPMENT_CUSTOMS',
]);

export const TERMINAL_STATES: ReadonlySet<TradeLifecycleState> = new Set<TradeLifecycleState>([
  'TRADE_COMPLETED',
  'TRADE_CANCELLED',
]);

/**
 * Adjacency map of legal transitions. Built deterministically from the plan
 * (happy-path successor) plus the universal cancellation edges. This is what
 * the workflow engine consults to reject illegal transitions.
 */
export const TRANSITION_MAP: Readonly<Record<TradeLifecycleState, readonly TradeLifecycleState[]>> = (() => {
  const map = {} as Record<TradeLifecycleState, TradeLifecycleState[]>;
  for (const spec of LIFECYCLE_PLAN) {
    const targets: TradeLifecycleState[] = [];
    if (spec.next) targets.push(spec.next);
    if (CANCELLABLE_STATES.has(spec.state) && spec.next !== 'TRADE_CANCELLED') {
      targets.push('TRADE_CANCELLED');
    }
    // RFQ_SUBMITTED may also be rejected (branch off the happy path).
    if (spec.state === 'RFQ_SUBMITTED') targets.push('RFQ_REJECTED');
    map[spec.state] = targets;
  }
  return map;
})();

export function getStageSpec(state: TradeLifecycleState): StageSpec {
  const spec = STAGE_INDEX[state];
  if (!spec) {
    throw new Error(`UNKNOWN_LIFECYCLE_STATE: ${String(state)}`);
  }
  return spec;
}

export function isTerminal(state: TradeLifecycleState): boolean {
  return TERMINAL_STATES.has(state);
}

export function isLegalTransition(from: TradeLifecycleState, to: TradeLifecycleState): boolean {
  return (TRANSITION_MAP[from] ?? []).includes(to);
}

/**
 * Whether, upon entering `state`, the orchestrator should automatically drive
 * into its successor without waiting for an external command.
 */
export function shouldAutoAdvance(state: TradeLifecycleState): boolean {
  const spec = getStageSpec(state);
  if (!spec.next) return false;
  return getStageSpec(spec.next).trigger === 'AUTO';
}
