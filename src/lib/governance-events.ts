/**
 * Governance event client — replaces the in-app mock event-store.
 * The audit/event source now lives in the backend (Baalvion OS /system-logs).
 * Kept synchronous + empty-by-default so existing pages render unchanged; wire
 * `getAllEvents` to the backend audit feed when needed.
 */
export interface InstitutionalEvent {
  eventId: string;
  type: string;
  aggregateId?: string;
  timestamp: string;
  version?: number;
  payload?: any;
  metadata?: Record<string, any>;
}

export const eventStore = {
  getAllEvents(): InstitutionalEvent[] {
    return [];
  },
  getStream(_aggregateId: string): InstitutionalEvent[] {
    return [];
  },
};
