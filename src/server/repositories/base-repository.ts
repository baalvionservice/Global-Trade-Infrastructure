/**
 * @file server/repositories/base-repository.ts
 * @description Generic Prisma-backed repository.
 *
 * Provides findById, paginated/filtered list, create, bulk create, update,
 * optimistic-locked update, soft delete and transaction-aware execution. All
 * concrete repositories extend this; nothing outside the repository layer
 * touches Prisma directly.
 */
import { prisma, PrismaTransaction } from '../db/prisma';
import { NotFoundError, OptimisticLockError } from '../db/errors';
import {
  ModelDelegate,
  PageRequest,
  Paginated,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from './types';

export abstract class BaseRepository<T extends { id: string; version?: number }> {
  protected abstract readonly entityName: string;
  /** Whether this model uses soft deletes (a `deletedAt` column). */
  protected readonly softDeletes: boolean = true;

  /** Resolve the model delegate, optionally bound to a transaction client. */
  protected abstract delegate(client?: PrismaTransaction): ModelDelegate<T>;

  protected liveWhere(where?: Record<string, unknown>): Record<string, unknown> {
    const base = where ?? {};
    return this.softDeletes ? { ...base, deletedAt: null } : base;
  }

  async findById(id: string, tx?: PrismaTransaction): Promise<T | null> {
    return this.delegate(tx).findFirst({ where: this.liveWhere({ id }) });
  }

  async findByIdOrThrow(id: string, tx?: PrismaTransaction): Promise<T> {
    const found = await this.findById(id, tx);
    if (!found) throw new NotFoundError(this.entityName, id);
    return found;
  }

  async findOne(where: Record<string, unknown>, tx?: PrismaTransaction): Promise<T | null> {
    return this.delegate(tx).findFirst({ where: this.liveWhere(where) });
  }

  async list(req: PageRequest = {}, tx?: PrismaTransaction): Promise<Paginated<T>> {
    const page = Math.max(1, req.page ?? 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, req.pageSize ?? DEFAULT_PAGE_SIZE));
    const where = this.liveWhere(req.where);
    const orderBy = req.orderBy ?? { createdAt: 'desc' };
    const d = this.delegate(tx);
    const [items, total] = await Promise.all([
      d.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
      d.count({ where }),
    ]);
    return { items, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
  }

  async count(where?: Record<string, unknown>, tx?: PrismaTransaction): Promise<number> {
    return this.delegate(tx).count({ where: this.liveWhere(where) });
  }

  async create(data: Record<string, unknown>, tx?: PrismaTransaction): Promise<T> {
    return this.delegate(tx).create({ data });
  }

  async bulkCreate(rows: Record<string, unknown>[], tx?: PrismaTransaction): Promise<number> {
    if (rows.length === 0) return 0;
    const res = await this.delegate(tx).createMany({ data: rows, skipDuplicates: true });
    return res.count;
  }

  async update(id: string, data: Record<string, unknown>, tx?: PrismaTransaction): Promise<T> {
    return this.delegate(tx).update({ where: { id }, data });
  }

  /**
   * Optimistic-locked update: succeeds only if the row is still at
   * `expectedVersion`, atomically bumping the version. Throws on a lost race.
   */
  async updateWithLock(
    id: string,
    expectedVersion: number,
    data: Record<string, unknown>,
    tx?: PrismaTransaction,
  ): Promise<T> {
    const res = await this.delegate(tx).updateMany({
      where: { id, version: expectedVersion },
      data: { ...data, version: { increment: 1 } },
    });
    if (res.count === 0) {
      throw new OptimisticLockError(this.entityName, id, expectedVersion);
    }
    return this.findByIdOrThrow(id, tx);
  }

  async softDelete(id: string, tx?: PrismaTransaction): Promise<void> {
    if (this.softDeletes) {
      await this.delegate(tx).update({ where: { id }, data: { deletedAt: new Date() } });
    } else {
      await this.delegate(tx).delete({ where: { id } });
    }
  }

  async hardDelete(id: string, tx?: PrismaTransaction): Promise<void> {
    await this.delegate(tx).delete({ where: { id } });
  }
}

/** Resolve the active Prisma client (transaction client when provided). */
export function client(tx?: PrismaTransaction) {
  return tx ?? prisma;
}
