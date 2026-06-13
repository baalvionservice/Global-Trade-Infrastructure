/**
 * @file event-bus.ts
 * @description The platform event mesh.
 *
 * Production in-process pub/sub used as the propagation backbone of the
 * orchestration kernel. Handlers are isolated (one failing subscriber never
 * breaks the others), retried with backoff, and parked on a dead-letter queue
 * after exhausting retries. Every event carries correlation / trade / user
 * identity and a timestamp so the full lifecycle is forensically replayable.
 *
 * Backward compatibility: `publish` / `subscribe` / `emit` / `getHistory`
 * retain their original signatures (dozens of modules depend on them). New
 * capabilities — `once`, `unsubscribe`, `replay`, `deadLetterQueue` — are
 * additive.
 */

export type EventSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type EventType = string;

export interface PlatformEvent {
  id: string;
  type: string;
  severity: EventSeverity;
  // `any` is retained here for backward compatibility: existing subscribers
  // across the platform read `event.payload.<field>` directly. The kernel's own
  // producers always attach structured payloads.
  payload: any;
  source: string;
  timestamp: string;
  correlationId: string;
  /** Trade aggregate this event belongs to, when applicable. */
  tradeId?: string;
  /** Actor that caused the event, when applicable. */
  userId?: string;
  [key: string]: any;
}

export type Handler = (event: PlatformEvent) => void | Promise<void>;

export interface DeadLetter {
  event: PlatformEvent;
  error: string;
  attempts: number;
  failedAt: string;
}

interface Subscription {
  handler: Handler;
  once: boolean;
}

const MAX_HISTORY = 500;
const MAX_DLQ = 200;
const DEFAULT_MAX_RETRIES = 2;
const RETRY_BACKOFF_MS = 25;

function newEventId(): string {
  return `EVT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class EventBus {
  private static instance: EventBus;
  private subscribers: Map<string, Subscription[]> = new Map();
  private history: PlatformEvent[] = [];
  private dlq: DeadLetter[] = [];
  private maxRetries: number = DEFAULT_MAX_RETRIES;

  // Private to enforce the singleton; tests use `EventBus.create()`.
  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /** Fresh, isolated bus — used by tests so they never share global state. */
  public static create(): EventBus {
    return new EventBus();
  }

  /** Subscribe to an event type, or `'*'` for all events. Returns a disposer. */
  subscribe(type: string | '*', handler: Handler): () => void {
    return this.register(type, handler, false);
  }

  /** Subscribe for a single delivery; auto-unsubscribes after the first event. */
  once(type: string | '*', handler: Handler): () => void {
    return this.register(type, handler, true);
  }

  private register(type: string, handler: Handler, once: boolean): () => void {
    const subs = this.subscribers.get(type) ?? [];
    const sub: Subscription = { handler, once };
    subs.push(sub);
    this.subscribers.set(type, subs);
    return () => {
      const current = this.subscribers.get(type) ?? [];
      this.subscribers.set(
        type,
        current.filter((s) => s !== sub),
      );
    };
  }

  /** Explicitly remove a handler from a type (all matching registrations). */
  unsubscribe(type: string | '*', handler: Handler): void {
    const current = this.subscribers.get(type) ?? [];
    this.subscribers.set(
      type,
      current.filter((s) => s.handler !== handler),
    );
  }

  /**
   * Publish an event. Accepts a fully-formed {@link PlatformEvent} or a
   * `(type, payload)` pair. Returns a promise that settles once every
   * subscriber has been dispatched (failures isolated to the DLQ).
   */
  publish(event: PlatformEvent | string, payload?: unknown): Promise<void> {
    const evt = this.normalize(event, payload);
    this.history.unshift(evt);
    if (this.history.length > MAX_HISTORY) this.history.pop();

    const subs: Subscription[] = [
      ...(this.subscribers.get(evt.type) ?? []),
      ...(this.subscribers.get('*') ?? []),
    ];

    // Drop one-shot subscribers before dispatch so re-entrant publishes are safe.
    for (const sub of subs) {
      if (sub.once) this.unsubscribeSubscription(evt.type, sub);
    }

    return Promise.all(subs.map((sub) => this.dispatch(sub, evt))).then(() => undefined);
  }

  private unsubscribeSubscription(type: string, sub: Subscription): void {
    for (const key of [type, '*']) {
      const current = this.subscribers.get(key);
      if (current) {
        this.subscribers.set(
          key,
          current.filter((s) => s !== sub),
        );
      }
    }
  }

  private normalize(event: PlatformEvent | string, payload?: unknown): PlatformEvent {
    if (typeof event !== 'string') {
      return {
        ...event,
        id: event.id || newEventId(),
        timestamp: event.timestamp || new Date().toISOString(),
        correlationId: event.correlationId || 'GLOBAL',
      };
    }
    const data = (payload ?? {}) as Record<string, unknown>;
    const correlationId =
      (typeof data.correlationId === 'string' && data.correlationId) || 'GLOBAL';
    const tradeId = typeof data.tradeId === 'string' ? data.tradeId : undefined;
    const userId =
      (typeof data.userId === 'string' && data.userId) ||
      (typeof data.actorId === 'string' && data.actorId) ||
      undefined;
    return {
      id: newEventId(),
      type: event,
      severity: 'INFO',
      payload: data,
      source: 'CORE',
      timestamp: new Date().toISOString(),
      correlationId,
      tradeId,
      userId,
    };
  }

  /** Invoke a single subscriber with retry + isolation; park on the DLQ if it keeps failing. */
  private async dispatch(sub: Subscription, evt: PlatformEvent): Promise<void> {
    let attempt = 0;
    // total attempts = 1 + maxRetries
    for (;;) {
      try {
        await sub.handler(evt);
        return;
      } catch (err: unknown) {
        attempt += 1;
        const message = err instanceof Error ? err.message : String(err);
        if (attempt > this.maxRetries) {
          this.deadLetter(evt, message, attempt);
          return;
        }
        await sleep(RETRY_BACKOFF_MS * attempt);
      }
    }
  }

  private deadLetter(event: PlatformEvent, error: string, attempts: number): void {
    this.dlq.unshift({ event, error, attempts, failedAt: new Date().toISOString() });
    if (this.dlq.length > MAX_DLQ) this.dlq.pop();
  }

  /**
   * Alias for {@link publish}. Accepts `(type, payload)` or the legacy
   * `(domain, entityId, type, payload)` positional form.
   */
  emit(...args: unknown[]): Promise<void> {
    const type = String(args[0]);
    const payload = args.length > 1 ? args[args.length - 1] : undefined;
    return this.publish(type, payload);
  }

  /** Most recent events (newest first). */
  getHistory(limit = 100): PlatformEvent[] {
    return this.history.slice(0, limit);
  }

  /**
   * Return historical events (oldest first) matching an optional type or
   * predicate. The replay backbone for projections and forensic reconstruction.
   */
  replay(filter?: string | ((event: PlatformEvent) => boolean)): PlatformEvent[] {
    const chronological = [...this.history].reverse();
    if (!filter) return chronological;
    const predicate =
      typeof filter === 'string' ? (e: PlatformEvent) => e.type === filter : filter;
    return chronological.filter(predicate);
  }

  /** Re-deliver matching historical events to a handler, oldest first. */
  async replayTo(
    handler: Handler,
    filter?: string | ((event: PlatformEvent) => boolean),
  ): Promise<void> {
    for (const evt of this.replay(filter)) {
      await handler(evt);
    }
  }

  /** Snapshot of events that exhausted retries across all subscribers. */
  deadLetterQueue(): DeadLetter[] {
    return [...this.dlq];
  }

  /** Drain (and return) the dead-letter queue — e.g. after a remediation. */
  drainDeadLetters(): DeadLetter[] {
    const drained = [...this.dlq];
    this.dlq = [];
    return drained;
  }

  /** Tune the per-handler retry budget (0 = no retries). */
  setMaxRetries(retries: number): void {
    this.maxRetries = Math.max(0, Math.floor(retries));
  }
}

export { EventBus };
export const eventBus = EventBus.getInstance();
