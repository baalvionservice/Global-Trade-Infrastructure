/**
 * @file server/__tests__/outbox-consistency.test.ts
 * @description Phase E (CR-6/CR-14): state, audit and the domain event are
 * written in ONE transaction (the outbox); the event log replays in order; a
 * crash before delivery is recovered from the durable outbox; and the event &
 * audit stores are append-only (tamper-proof).
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetDatabase, seedOrganization, disconnect } from '../test/db';
import { tradeService } from '../services/trade-service';
import { prisma } from '../db/prisma';
import { eventRepository, outboxRepository } from '../repositories';
import { replayEvents, recoverOutbox } from '../orchestration/event-store';
import { EventBus } from '@/orchestration/event-bus';
import { TRADE_EVENTS } from '@/orchestration/lifecycle';
import { USER_ROLES, UserRole } from '@/core/roles';
import { TradeTerms } from '@/orchestration/ports';

const TERMS: TradeTerms = { buyerId: 'B', sellerId: 'S', commodity: 'COCOA', quantity: 8, unitPrice: 9, currency: 'USD' };
const ACTOR = { actorId: 'u1', actorRole: USER_ROLES.BUYER as UserRole };

describe('transactional outbox & append-only stores (CR-6/CR-14)', () => {
  let orgId: string;
  beforeEach(async () => {
    await resetDatabase();
    orgId = await seedOrganization('Outbox Org');
  });
  afterAll(async () => {
    await disconnect();
  });

  it('writes state, workflow history, audit and outbox event atomically (1:1:1)', async () => {
    const trade = await tradeService.createTrade({ organizationId: orgId, actor: ACTOR, terms: TERMS });

    const history = await prisma.workflowEvent.count({ where: { tradeTransactionId: trade.id } });
    const transitionAudits = await prisma.auditLog.count({
      where: { tradeId: trade.id, action: 'WORKFLOW_TRANSITION' },
    });
    const outbox = await prisma.outboxEvent.count({ where: { tradeId: trade.id } });

    // Every transition produced exactly one history row, one audit row and one
    // outbox event — they can never diverge because they share a transaction.
    expect(history).toBeGreaterThan(0);
    expect(transitionAudits).toBe(history);
    expect(outbox).toBe(history);

    // Every workflow_event carries the tenant.
    const orphanOrg = await prisma.workflowEvent.count({ where: { tradeTransactionId: trade.id, organizationId: orgId } });
    expect(orphanOrg).toBe(history);
  });

  it('replays the domain-event log in chronological order', async () => {
    const trade = await tradeService.createTrade({ organizationId: orgId, actor: ACTOR, terms: TERMS });
    const replayed = await replayEvents({ tradeId: trade.id });
    expect(replayed.length).toBeGreaterThan(0);
    expect(replayed[0].type).toBe(TRADE_EVENTS.RFQ_CREATED);
    expect(replayed.every((e) => e.organizationId === orgId)).toBe(true);
    for (let i = 1; i < replayed.length; i += 1) {
      expect(replayed[i].occurredAt.getTime()).toBeGreaterThanOrEqual(replayed[i - 1].occurredAt.getTime());
    }
  });

  it('recovers an undelivered (crash) outbox event from the durable log', async () => {
    // Simulate a state commit whose event delivery never happened: a PENDING
    // outbox row exists but it was never projected to domain_events.
    const row = await outboxRepository.enqueue({
      organizationId: orgId,
      tradeId: null,
      eventType: 'trade.recovered.signal',
      payload: { hello: 'world' },
      correlationId: 'CRASH-1',
      sequence: 0,
    });
    expect(await eventRepository.findByEventId(row.id)).toBeNull();
    expect(await outboxRepository.countPending()).toBe(1);

    const bus = EventBus.create();
    const seen: string[] = [];
    bus.subscribe('*', (e) => {
      seen.push(e.type);
    });

    const recovered = await recoverOutbox(bus);
    expect(recovered).toBe(1);
    expect(seen).toContain('trade.recovered.signal');
    expect(await eventRepository.findByEventId(row.id)).not.toBeNull();
    expect(await outboxRepository.countPending()).toBe(0);
  });

  it('audit log is append-only — UPDATE and DELETE are rejected (CR-14)', async () => {
    await tradeService.createTrade({ organizationId: orgId, actor: ACTOR, terms: TERMS });
    await expect(prisma.$executeRawUnsafe('UPDATE "audit_logs" SET "action" = \'TAMPER\'')).rejects.toThrow();
    await expect(prisma.$executeRawUnsafe('DELETE FROM "audit_logs"')).rejects.toThrow();
  });

  it('domain-event log is append-only — UPDATE and DELETE are rejected (CR-14)', async () => {
    await tradeService.createTrade({ organizationId: orgId, actor: ACTOR, terms: TERMS });
    await expect(prisma.$executeRawUnsafe('UPDATE "domain_events" SET "type" = \'TAMPER\'')).rejects.toThrow();
    await expect(prisma.$executeRawUnsafe('DELETE FROM "domain_events"')).rejects.toThrow();
    await expect(prisma.$executeRawUnsafe('UPDATE "workflow_events" SET "reason" = \'TAMPER\'')).rejects.toThrow();
  });
});
