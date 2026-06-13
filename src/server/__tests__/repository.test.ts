/**
 * @file server/__tests__/repository.test.ts
 * @description Repository-layer database tests: CRUD, pagination/filtering,
 * optimistic locking, soft delete and bulk operations against real PostgreSQL.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetDatabase, seedOrganization, disconnect } from '../test/db';
import { tradeRepository, rfqRepository } from '../repositories';
import { OptimisticLockError, NotFoundError } from '../db/errors';

describe('repository layer (PostgreSQL)', () => {
  let orgId: string;

  beforeEach(async () => {
    await resetDatabase();
    orgId = await seedOrganization();
  });

  afterAll(async () => {
    await disconnect();
  });

  function tradeData(reference: string) {
    return { organizationId: orgId, reference, correlationId: reference, currentState: 'RFQ_CREATED', terms: {} };
  }

  it('creates a row and finds it by id', async () => {
    const created = await tradeRepository.create(tradeData('R-1'));
    const found = await tradeRepository.findById(created.id);
    expect(found?.reference).toBe('R-1');
    expect(found?.version).toBe(1);
  });

  it('paginates and filters', async () => {
    for (let i = 0; i < 5; i += 1) await tradeRepository.create(tradeData(`R-${i}`));
    const page1 = await tradeRepository.list({ page: 1, pageSize: 2, where: { organizationId: orgId } });
    expect(page1.total).toBe(5);
    expect(page1.items).toHaveLength(2);
    expect(page1.pages).toBe(3);
  });

  it('enforces optimistic locking', async () => {
    const t = await tradeRepository.create(tradeData('R-lock'));
    await tradeRepository.updateWithLock(t.id, t.version, { reference: 'R-lock-2' });
    // Re-using the stale version must fail.
    await expect(tradeRepository.updateWithLock(t.id, t.version, { reference: 'R-lock-3' })).rejects.toBeInstanceOf(
      OptimisticLockError,
    );
  });

  it('soft-deletes (hidden from reads, throws on findByIdOrThrow)', async () => {
    const t = await tradeRepository.create(tradeData('R-del'));
    await tradeRepository.softDelete(t.id);
    expect(await tradeRepository.findById(t.id)).toBeNull();
    await expect(tradeRepository.findByIdOrThrow(t.id)).rejects.toBeInstanceOf(NotFoundError);
  });

  it('bulk-creates rows', async () => {
    const n = await rfqRepository.bulkCreate([
      { organizationId: orgId, commodity: 'COFFEE', quantity: 10, unitPrice: 5, currency: 'USD' },
      { organizationId: orgId, commodity: 'COCOA', quantity: 20, unitPrice: 7, currency: 'USD' },
    ]);
    expect(n).toBe(2);
    const list = await rfqRepository.list({ where: { organizationId: orgId } });
    expect(list.total).toBe(2);
  });
});
