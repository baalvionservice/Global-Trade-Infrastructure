/**
 * @file server/repositories/outbox-repository.ts
 * @description Transactional outbox persistence (`outbox_events`).
 *
 * A transition's domain event is enqueued here in the SAME transaction as the
 * state change and audit row (CR-6). A relay later publishes PENDING rows to the
 * bus and marks them PUBLISHED, giving at-least-once delivery that survives a
 * crash between the state commit and event delivery.
 */
import { OutboxEvent, Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { PrismaTransaction } from './types';

function db(tx?: PrismaTransaction) {
  return tx ?? prisma;
}

export interface OutboxInput {
  organizationId: string;
  tradeId?: string | null;
  eventType: string;
  payload: Prisma.InputJsonValue;
  correlationId: string;
  sequence: number;
}

export class OutboxRepository {
  /** Enqueue an event in the caller's transaction (atomic with state + audit). */
  async enqueue(input: OutboxInput, tx?: PrismaTransaction): Promise<OutboxEvent> {
    return db(tx).outboxEvent.create({ data: { ...input, status: 'PENDING' } });
  }

  /** Pending (undelivered) outbox rows, oldest first. */
  async listPending(filter: { tradeId?: string } = {}): Promise<OutboxEvent[]> {
    return prisma.outboxEvent.findMany({
      where: { status: 'PENDING', ...(filter.tradeId ? { tradeId: filter.tradeId } : {}) },
      orderBy: { createdAt: 'asc' },
    });
  }

  async markPublished(id: string): Promise<void> {
    await prisma.outboxEvent.update({ where: { id }, data: { status: 'PUBLISHED', publishedAt: new Date() } });
  }

  async countPending(tradeId?: string): Promise<number> {
    return prisma.outboxEvent.count({
      where: { status: 'PENDING', ...(tradeId ? { tradeId } : {}) },
    });
  }
}

export const outboxRepository = new OutboxRepository();
