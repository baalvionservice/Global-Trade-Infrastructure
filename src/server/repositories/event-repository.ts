/**
 * @file server/repositories/event-repository.ts
 * @description Persistence for the event store (`domain_events`) and the
 * dead-letter queue (`dead_letter_events`). Supports event replay, recovery,
 * tracing by correlation id and DLQ management.
 */
import { DomainEvent, DeadLetterEvent, Prisma, EventSeverity } from '@prisma/client';
import { prisma } from '../db/prisma';
import { PrismaTransaction } from './types';

function db(tx?: PrismaTransaction) {
  return tx ?? prisma;
}

export interface DomainEventInput {
  eventId: string;
  type: string;
  organizationId?: string | null;
  tradeId?: string | null;
  correlationId: string;
  userId?: string | null;
  source: string;
  severity: EventSeverity;
  payload: Prisma.InputJsonValue;
  occurredAt: Date;
}

export interface DeadLetterInput {
  eventId: string;
  type: string;
  payload: Prisma.InputJsonValue;
  error: string;
  attempts: number;
  failedAt: Date;
}

export class EventRepository {
  /**
   * Idempotently persist a domain event (unique by eventId). Uses insert-only
   * semantics (create + swallow the duplicate) so the append-only trigger on
   * `domain_events` is never tripped — the store is genuinely immutable (CR-14).
   */
  async record(input: DomainEventInput, tx?: PrismaTransaction): Promise<DomainEvent> {
    try {
      return await db(tx).domainEvent.create({ data: input });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const existing = await db(tx).domainEvent.findUnique({ where: { eventId: input.eventId } });
        if (existing) return existing;
      }
      throw err;
    }
  }

  async findByEventId(eventId: string): Promise<DomainEvent | null> {
    return prisma.domainEvent.findUnique({ where: { eventId } });
  }

  /** Replay the event log (oldest first), optionally filtered by type/trade/correlation. */
  async replay(filter: { type?: string; tradeId?: string; correlationId?: string } = {}): Promise<DomainEvent[]> {
    return prisma.domainEvent.findMany({
      where: {
        ...(filter.type ? { type: filter.type } : {}),
        ...(filter.tradeId ? { tradeId: filter.tradeId } : {}),
        ...(filter.correlationId ? { correlationId: filter.correlationId } : {}),
      },
      orderBy: { occurredAt: 'asc' },
    });
  }

  async listByTrade(tradeId: string): Promise<DomainEvent[]> {
    return prisma.domainEvent.findMany({ where: { tradeId }, orderBy: { occurredAt: 'asc' } });
  }

  // --- Dead-letter queue ----------------------------------------------------

  async recordDeadLetter(input: DeadLetterInput, tx?: PrismaTransaction): Promise<DeadLetterEvent> {
    return db(tx).deadLetterEvent.create({ data: input });
  }

  async listDeadLetters(includeRecovered = false): Promise<DeadLetterEvent[]> {
    return prisma.deadLetterEvent.findMany({
      where: includeRecovered ? {} : { recovered: false },
      orderBy: { failedAt: 'desc' },
    });
  }

  async markRecovered(id: string): Promise<DeadLetterEvent> {
    return prisma.deadLetterEvent.update({ where: { id }, data: { recovered: true } });
  }
}

export const eventRepository = new EventRepository();
