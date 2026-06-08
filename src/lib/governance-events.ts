/**
 * Governance event client — replaces the in-app mock event-store.
 * The audit/event source now lives in the backend (Baalvion OS /system-logs).
 * Kept synchronous + empty-by-default so existing pages render unchanged; wire
 * `getAllEvents` to the backend audit feed when needed.
 */
export interface InstitutionalEvent {
  eventId: string;
  /** Canonical domain event type, e.g. `governance.policy.updated`. */
  type: string;
  /** Alias surfaced by the backend audit feed; mirrors `type`. */
  eventType?: string;
  /** Aggregate the event was emitted against (order, tenant, policy …). */
  aggregateType?: string;
  aggregateId?: string;
  timestamp: string;
  version?: number;
  payload?: unknown;
  metadata?: Record<string, unknown>;
}

export const eventStore = {
  getAllEvents(): InstitutionalEvent[] {
    return [];
  },
  getStream(_aggregateId: string): InstitutionalEvent[] {
    return [];
  },
};
