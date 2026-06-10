/**
 * @file server/__tests__/concurrency.test.ts
 * @description Phase D (CR-5): the workflow state write is optimistically locked,
 * so concurrent money-moving transitions cannot both commit. Proves a double
 * settlement release and a double escrow funding each execute exactly once.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetDatabase, seedOrganization, disconnect } from '../test/db';
import { tradeService } from '../services/trade-service';
import { prisma } from '../db/prisma';
import { OptimisticLockError } from '../db/errors';
import { USER_ROLES, UserRole } from '@/core/roles';
import { TradeTerms } from '@/orchestration/ports';

const TERMS: TradeTerms = { buyerId: 'B', sellerId: 'S', commodity: 'GOLD', quantity: 5, unitPrice: 1000, currency: 'USD' };
const A = (role: UserRole) => ({ actorId: `u-${role}`, actorRole: role });
const BUYER = A(USER_ROLES.BUYER as UserRole);
const EXEC = A(USER_ROLES.EXECUTIVE_DIRECTOR as UserRole);
const TREASURY = A(USER_ROLES.FINANCE_DIRECTOR as UserRole);
const OPS = A(USER_ROLES.OPERATIONS_DIRECTOR as UserRole);
const BANK = A(USER_ROLES.BANK_ADMIN as UserRole);

function splitOutcomes(results: PromiseSettledResult<unknown>[]) {
  return {
    fulfilled: results.filter((r) => r.status === 'fulfilled').length,
    rejected: results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[],
  };
}

describe('optimistic locking under concurrency (CR-5)', () => {
  let orgId: string;
  beforeEach(async () => {
    await resetDatabase();
    orgId = await seedOrganization('Concurrency Org');
  });
  afterAll(async () => {
    await disconnect();
  });

  it('concurrent settlement releases cannot double-execute', async () => {
    const trade = await tradeService.createTrade({ organizationId: orgId, actor: BUYER, terms: TERMS });
    await tradeService.acceptRFQ(trade.id, BUYER);
    await tradeService.approveDeal(trade.id, EXEC);
    await tradeService.fundEscrow(trade.id, TREASURY);
    await tradeService.markDelivered(trade.id, OPS); // -> SETTLEMENT_PENDING

    const results = await Promise.allSettled([
      tradeService.releaseSettlement(trade.id, BANK),
      tradeService.releaseSettlement(trade.id, BANK),
    ]);
    const { fulfilled, rejected } = splitOutcomes(results);

    expect(fulfilled).toBe(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toBeInstanceOf(OptimisticLockError);

    const settlements = await prisma.settlement.count({ where: { tradeTransactionId: trade.id } });
    expect(settlements).toBe(1);
    const fresh = await prisma.tradeTransaction.findUnique({ where: { id: trade.id } });
    expect(fresh?.currentState).toBe('TRADE_COMPLETED');
  });

  it('concurrent escrow funding cannot double-execute (no double payment)', async () => {
    const trade = await tradeService.createTrade({ organizationId: orgId, actor: BUYER, terms: TERMS });
    await tradeService.acceptRFQ(trade.id, BUYER);
    await tradeService.approveDeal(trade.id, EXEC); // -> ESCROW_CREATED

    const results = await Promise.allSettled([
      tradeService.fundEscrow(trade.id, TREASURY),
      tradeService.fundEscrow(trade.id, TREASURY),
    ]);
    const { fulfilled, rejected } = splitOutcomes(results);

    expect(fulfilled).toBe(1);
    expect(rejected).toHaveLength(1);

    const payments = await prisma.payment.count({ where: { tradeTransactionId: trade.id } });
    expect(payments).toBe(1); // exactly one payment captured
  });
});
