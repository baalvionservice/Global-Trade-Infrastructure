/**
 * @file event-bus.ts
 * @description THE AUTHORITATIVE PLANETARY EVENT MESH (UI SIDE).
 * Synchronizes real-time signals from the Kafka gateway with the operational UI.
 */

export type EventSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type EventType = string;

export interface PlatformEvent {
  id: string;
  type: string;
  severity: EventSeverity;
  payload: any;
  source: string;
  timestamp: string;
  correlationId: string;
  [key: string]: any;
}

type Handler = (event: PlatformEvent) => void;

class EventBus {
  private static instance: EventBus;
  private subscribers: Map<string, Handler[]> = new Map();
  private history: PlatformEvent[] = [];

  private constructor() {
    // Real events flow through publish() from live data/actions. The synthetic 5s telemetry
    // simulator is disabled — it only added fake events + needless global re-renders.
    // (Re-enable simulateStream() only for offline demos.)
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  subscribe(type: string | '*', handler: Handler) {
    const handlers = this.subscribers.get(type) || [];
    handlers.push(handler);
    this.subscribers.set(type, handlers);
    return () => {
      const h = this.subscribers.get(type) || [];
      this.subscribers.set(type, h.filter(x => x !== handler));
    };
  }

  publish(event: PlatformEvent | string, payload?: any) {
    const evt: PlatformEvent = typeof event === 'string'
      ? {
          id: `EVT-${Math.random().toString(36).substr(2, 9)}`,
          type: event,
          severity: 'INFO',
          payload: payload ?? {},
          source: 'CORE',
          timestamp: new Date().toISOString(),
          correlationId: 'GLOBAL',
        }
      : event;
    this.history.unshift(evt);
    if (this.history.length > 500) this.history.pop();
    const handlers = [
      ...(this.subscribers.get(evt.type) || []),
      ...(this.subscribers.get('*') || [])
    ];
    handlers.forEach(h => h(evt));
  }

  /** Alias for publish; accepts (type, payload) or legacy (domain, entityId, type, payload). */
  emit(...args: any[]) {
    const type = args[0];
    const payload = args.length > 1 ? args[args.length - 1] : undefined;
    return this.publish(type, payload);
  }

  /** Returns the most recent events from the in-memory stream. */
  getHistory(limit = 100): PlatformEvent[] {
    return this.history.slice(0, limit);
  }

  private simulateStream() {
    setInterval(() => {
       if (Math.random() > 0.8) {
          this.publish({
            id: `EVT-${Math.random().toString(36).substr(2, 9)}`,
            type: 'TELEMETRY_SYNC',
            severity: 'INFO',
            payload: { latency: '142ms' },
            source: 'KERNEL',
            timestamp: new Date().toISOString(),
            correlationId: 'GLOBAL'
          });
       }
    }, 5000);
  }
}

export const eventBus = EventBus.getInstance();