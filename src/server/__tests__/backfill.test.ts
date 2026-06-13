/**
 * @file server/__tests__/backfill.test.ts
 * @description Data-migration tests (Agent 9): backfilling legacy domain
 * records into TradeTransaction aggregates is idempotent and lossless.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetDatabase, seedOrganization, disconnect } from '../test/db';
import { backfillTrades, BackfillTrade } from '../migration/backfill';
import { tradeRepository } from '../repositories';

describe('trade backfill (PostgreSQL)', () => {
  let orgId: string;

  beforeEach(async () => {
    await resetDatabase();
    orgId = await seedOrganization();
  });

  afterAll(async () => {
    await disconnect();
  });

  function record(reference: string): BackfillTrade {
    return {
      organizationId: orgId,
      reference,
      currentState: 'ESCROW_FUNDED',
      terms: { buyerId: 'B', sellerId: 'S', commodity: 'STEEL', quantity: 50, unitPrice: 200, currency: 'USD' },
      buyer: { name: 'Legacy Buyer', externalRef: 'LB-1' },
      supplier: { name: 'Legacy Supplier', externalRef: 'LS-1' },
      rfq: { commodity: 'STEEL', quantity: 50, unitPrice: 200, externalRef: 'RFQ-LEG-1' },
      order: { totalAmount: 10000, externalRef: 'ORD-LEG-1' },
      escrow: { amount: 10000, externalRef: 'ESC-LEG-1' },
    };
  }

  it('backfills legacy records into linked trade aggregates', async () => {
    const result = await backfillTrades([record('LEG-1'), record('LEG-2')]);
    expect(result.created).toBe(2);
    expect(result.skipped).toBe(0);

    const trade = await tradeRepository.findFullGraphByReference('LEG-1');
    expect(trade?.currentState).toBe('ESCROW_FUNDED');
    expect(trade?.rfq?.externalRef).toBe('RFQ-LEG-1');
    expect(trade?.order?.externalRef).toBe('ORD-LEG-1');
    expect(trade?.escrow?.externalRef).toBe('ESC-LEG-1');
    expect(trade?.rfqId).toBe(trade?.rfq?.id);
  });

  it('is idempotent — re-running skips existing references with no duplicates', async () => {
    await backfillTrades([record('LEG-1')]);
    const second = await backfillTrades([record('LEG-1'), record('LEG-2')]);
    expect(second.created).toBe(1);
    expect(second.skipped).toBe(1);

    const all = await tradeRepository.list({ where: { organizationId: orgId } });
    expect(all.total).toBe(2);
  });
});
