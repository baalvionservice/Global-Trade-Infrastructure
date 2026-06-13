/**
 * @file server/__tests__/security.test.ts
 * @description Security tests (Agent 15): cross-tenant access is denied (IDOR),
 * and the API rate limiter trips after the configured budget.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetDatabase, seedOrganization, disconnect } from '../test/db';
import { tradeService } from '../services/trade-service';
import { rateLimit, RateLimitError } from '../http/api';
import { NotFoundError } from '../db/errors';
import { USER_ROLES, UserRole } from '@/core/roles';
import { TradeTerms } from '@/orchestration/ports';

const TERMS: TradeTerms = { buyerId: 'B', sellerId: 'S', commodity: 'STEEL', quantity: 10, unitPrice: 100, currency: 'USD' };
const ACTOR = { actorId: 'u1', actorRole: USER_ROLES.BUYER as UserRole };

describe('security', () => {
  beforeEach(async () => {
    await resetDatabase();
  });
  afterAll(async () => {
    await disconnect();
  });

  it('denies cross-tenant trade access (IDOR)', async () => {
    const orgA = await seedOrganization('Org A');
    const orgB = await seedOrganization('Org B');
    const trade = await tradeService.createTrade({ organizationId: orgA, actor: ACTOR, terms: TERMS });

    await expect(tradeService.assertTenant(trade.id, orgB)).rejects.toBeInstanceOf(NotFoundError);
    await expect(tradeService.assertTenant(trade.id, orgA)).resolves.toBeUndefined();
  });

  it('enforces the rate limiter', () => {
    const key = `test:${Math.floor(Math.random() * 1e9)}`;
    for (let i = 0; i < 3; i += 1) rateLimit(key, 3, 60_000);
    expect(() => rateLimit(key, 3, 60_000)).toThrow(RateLimitError);
  });
});
