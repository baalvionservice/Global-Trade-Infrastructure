/**
 * @file server/repositories/audit-repository.ts
 * @description Enterprise audit trail persistence (`audit_logs`). Every mutation
 * routed through the orchestration layer produces one immutable record capturing
 * who / what / when / where / before / after.
 */
import { AuditLog, Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { PrismaTransaction } from './types';
import { Paginated, PageRequest, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from './types';

function db(tx?: PrismaTransaction) {
  return tx ?? prisma;
}

export type AuditInput = Omit<Prisma.AuditLogUncheckedCreateInput, 'id' | 'createdAt'>;

export class AuditRepository {
  async record(input: AuditInput, tx?: PrismaTransaction): Promise<AuditLog> {
    return db(tx).auditLog.create({ data: input });
  }

  async listByTrade(tradeId: string, req: PageRequest = {}): Promise<Paginated<AuditLog>> {
    const page = Math.max(1, req.page ?? 1);
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, req.pageSize ?? DEFAULT_PAGE_SIZE));
    const where = { tradeId };
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.auditLog.count({ where }),
    ]);
    return { items, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
  }

  async listByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({ where: { entityType, entityId }, orderBy: { createdAt: 'desc' } });
  }
}

export const auditRepository = new AuditRepository();
