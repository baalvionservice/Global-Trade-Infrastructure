/**
 * @file server/__tests__/event-store.test.ts
 * @description Event persistence tests (Agent 5): replay, recovery and the
 * dead-letter queue against real PostgreSQL.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetDatabase, seedOrganization, disconnect } from '../test/db';
import { tradeService } from '../services/trade-service';
import {
  installEventStore,
  replayEvents,
  recoverEvents,
  syncDeadLetters,
  recoverDeadLetters,
} from '../orchestration/event-store';
import { eventRepository } from '../repositories';
import { EventBus } from '@/orchestration/event-bus';
import { TRADE_EVENTS } from '@/orchestration/lifecycle';
import { USER_ROLES, UserRole } from '@/core/roles';
import { TradeTerms } from '@/orchestration/ports';

const TERMS: TradeTerms = {
  buyerId: 'B',
  sellerId: 'S',
  commodity: 'WIDGETS',
  quantity: 10,
  unitPrice: 5,
  currency: 'USD',
};
const ACTOR = { actorId: 'u1', actorRole: USER_ROLES.BUYER as UserRole };

describe('event store (PostgreSQL)', () => {
  let orgId: string;

  beforeEach(async () => {
    await resetDatabase();
    orgId = await seedOrganization();
  });

  afterAll(async () => {
    await disconnect();
  });

  it('persists and replays domain events in chronological order', async () => {
    const trade = await tradeService.createTrade({ organizationId: orgId, actor: ACTOR, terms: TERMS });
    const replayed = await replayEvents({ tradeId: trade.id });
    expect(replayed.length).toBeGreaterThan(0);
    expect(replayed[0].type).toBe(TRADE_EVENTS.RFQ_CREATED);
    // strictly non-decreasing occurredAt
    for (let i = 1; i < replayed.length; i += 1) {
      expect(replayed[i].occurredAt.getTime()).toBeGreaterThanOrEqual(replayed[i - 1].occurredAt.getTime());
    }
  });

  it('recovers (re-publishes) persisted events onto a bus', async () => {
    const trade = await tradeService.createTrade({ organizationId: orgId, actor: ACTOR, terms: TERMS });
    const bus = EventBus.create();
    const seen: string[] = [];
    bus.subscribe('*', (e) => {
      seen.push(e.type);
    });
    const count = await recoverEvents({ tradeId: trade.id }, bus);
    expect(count).toBeGreaterThan(0);
    expect(seen).toContain(TRADE_EVENTS.RFQ_CREATED);
  });

  it('captures failing handlers in the dead-letter queue and recovers them', async () => {
    const bus = EventBus.create();
    bus.setMaxRetries(0);
    // durable store persists the event; a separate handler always fails.
    installEventStore(bus);
    bus.subscribe('custom.signal', () => {
      throw new Error('handler_down');
    });
    await bus.publish('custom.signal', { tradeId: null, correlationId: 'X', foo: 1 });

    const synced = await syncDeadLetters(bus);
    expect(synced).toBe(1);
    const dead = await eventRepository.listDeadLetters(false);
    expect(dead).toHaveLength(1);
    expect(dead[0].error).toContain('handler_down');

    // Recovery re-publishes and marks the dead letter resolved.
    const recovered = await recoverDeadLetters(bus);
    expect(recovered).toBe(1);
    expect(await eventRepository.listDeadLetters(false)).toHaveLength(0);
  });
});
