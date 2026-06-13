/**
 * @file server/orchestration/event-store.ts
 * @description Persistent event store (Agent 5). Subscribes to the Phase-1
 * event bus and durably records every domain event, mirrors the in-memory
 * dead-letter queue to PostgreSQL, and provides replay / recovery / tracing.
 */
import { eventBus, EventBus, PlatformEvent, DeadLetter } from '@/orchestration/event-bus';
import { EventSeverity, DomainEvent } from '@prisma/client';
import { eventRepository, outboxRepository, DomainEventInput } from '../repositories';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toUuidOrNull(value: unknown): string | null {
  return typeof value === 'string' && UUID_RE.test(value) ? value : null;
}

function toSeverity(value: PlatformEvent['severity']): EventSeverity {
  switch (value) {
    case 'CRITICAL':
      return EventSeverity.CRITICAL;
    case 'WARNING':
      return EventSeverity.WARNING;
    default:
      return EventSeverity.INFO;
  }
}

function orgFromPayload(evt: PlatformEvent): string | null {
  const payload = (evt.payload ?? {}) as Record<string, unknown>;
  return toUuidOrNull(payload.organizationId ?? (evt as { organizationId?: unknown }).organizationId);
}

function toInput(evt: PlatformEvent): DomainEventInput {
  return {
    eventId: evt.id,
    type: evt.type,
    organizationId: orgFromPayload(evt),
    tradeId: toUuidOrNull(evt.tradeId),
    correlationId: evt.correlationId ?? 'GLOBAL',
    userId: typeof evt.userId === 'string' ? evt.userId : null,
    source: evt.source ?? 'CORE',
    severity: toSeverity(evt.severity),
    payload: JSON.parse(JSON.stringify(evt.payload ?? {})),
    occurredAt: new Date(evt.timestamp),
  };
}

/**
 * Attach the durable event store to a bus. Every published event is persisted
 * (idempotently by eventId). Returns a disposer to detach.
 */
export function installEventStore(bus: EventBus = eventBus): () => void {
  return bus.subscribe('*', async (evt) => {
    await eventRepository.record(toInput(evt));
  });
}

let installed = false;

/** Install the durable event store on the global bus exactly once per process. */
export function ensureEventStore(): void {
  if (installed) return;
  installed = true;
  installEventStore(eventBus);
}

/** Persist the bus's in-memory dead-letter queue to PostgreSQL and drain it. */
export async function syncDeadLetters(bus: EventBus = eventBus): Promise<number> {
  const drained: DeadLetter[] = bus.drainDeadLetters();
  for (const dl of drained) {
    await eventRepository.recordDeadLetter({
      eventId: dl.event.id,
      type: dl.event.type,
      payload: JSON.parse(JSON.stringify(dl.event.payload ?? {})),
      error: dl.error,
      attempts: dl.attempts,
      failedAt: new Date(dl.failedAt),
    });
  }
  return drained.length;
}

/** Replay persisted events (oldest first), optionally filtered. */
export async function replayEvents(filter: {
  type?: string;
  tradeId?: string;
  correlationId?: string;
} = {}): Promise<DomainEvent[]> {
  return eventRepository.replay(filter);
}

/**
 * Re-publish persisted events to a bus (event recovery). Returns the count of
 * events re-emitted.
 */
export async function recoverEvents(
  filter: { type?: string; tradeId?: string; correlationId?: string },
  bus: EventBus = eventBus,
): Promise<number> {
  const events = await eventRepository.replay(filter);
  for (const e of events) {
    await bus.publish({
      id: e.eventId,
      type: e.type,
      severity: e.severity as PlatformEvent['severity'],
      payload: e.payload,
      source: e.source,
      timestamp: e.occurredAt.toISOString(),
      correlationId: e.correlationId,
      tradeId: e.tradeId ?? undefined,
      userId: e.userId ?? undefined,
    });
  }
  return events.length;
}

/** Re-drive unrecovered dead letters back onto the bus, marking them recovered. */
export async function recoverDeadLetters(bus: EventBus = eventBus): Promise<number> {
  const dead = await eventRepository.listDeadLetters(false);
  for (const dl of dead) {
    await bus.publish(dl.type, dl.payload);
    await eventRepository.markRecovered(dl.id);
  }
  return dead.length;
}

// ──────────────────────────────────────────────────────────────────────────
// Transactional outbox relay (CR-6/CR-14)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Flush the transactional outbox: each PENDING row (written atomically with its
 * state change) is durably projected into `domain_events`, published to the bus
 * for live delivery, then marked PUBLISHED. This is the single durable writer of
 * the event log, so a crash between the state commit and delivery is recovered
 * simply by re-running the relay — at-least-once with idempotent persistence.
 */
export async function flushOutbox(
  bus: EventBus = eventBus,
  filter: { tradeId?: string } = {},
): Promise<number> {
  const pending = await outboxRepository.listPending(filter);
  for (const row of pending) {
    const payload = (row.payload ?? {}) as Record<string, unknown>;
    await eventRepository.record({
      eventId: row.id,
      type: row.eventType,
      organizationId: row.organizationId,
      tradeId: row.tradeId,
      correlationId: row.correlationId,
      userId: typeof payload.actorId === 'string' ? payload.actorId : null,
      source: 'CORE',
      severity: EventSeverity.INFO,
      payload: JSON.parse(JSON.stringify(row.payload ?? {})),
      occurredAt: row.createdAt,
    });
    await bus.publish({
      id: row.id,
      type: row.eventType,
      severity: 'INFO',
      payload: row.payload,
      source: 'OUTBOX',
      timestamp: row.createdAt.toISOString(),
      correlationId: row.correlationId,
      tradeId: row.tradeId ?? undefined,
    });
    await outboxRepository.markPublished(row.id);
  }
  return pending.length;
}

/** Alias used by the crash-recovery path; identical to {@link flushOutbox}. */
export async function recoverOutbox(bus: EventBus = eventBus, tradeId?: string): Promise<number> {
  return flushOutbox(bus, tradeId ? { tradeId } : {});
}
