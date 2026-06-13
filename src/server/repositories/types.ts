/**
 * @file server/repositories/types.ts
 * @description Shared repository contracts (pagination, filtering, the Prisma
 * delegate bridge). No Prisma access happens outside the repository layer.
 */
import type { PrismaTransaction } from '../db/prisma';

export interface PageRequest {
  page?: number;
  pageSize?: number;
  where?: Record<string, unknown>;
  orderBy?: Record<string, unknown> | Record<string, unknown>[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export interface FindArgs {
  where?: Record<string, unknown>;
  orderBy?: Record<string, unknown> | Record<string, unknown>[];
  skip?: number;
  take?: number;
  include?: Record<string, unknown>;
  select?: Record<string, unknown>;
}

/**
 * Minimal structural view of a Prisma model delegate. Each repository casts its
 * concrete Prisma delegate to this once — the single, contained bridge between
 * Prisma's deeply-generic types and the typed repository surface.
 */
export interface ModelDelegate<T> {
  findUnique(args: { where: Record<string, unknown>; include?: Record<string, unknown> }): Promise<T | null>;
  findFirst(args: FindArgs): Promise<T | null>;
  findMany(args: FindArgs): Promise<T[]>;
  create(args: { data: Record<string, unknown>; include?: Record<string, unknown> }): Promise<T>;
  createMany(args: { data: Record<string, unknown>[]; skipDuplicates?: boolean }): Promise<{ count: number }>;
  update(args: { where: Record<string, unknown>; data: Record<string, unknown> }): Promise<T>;
  updateMany(args: { where: Record<string, unknown>; data: Record<string, unknown> }): Promise<{ count: number }>;
  upsert(args: { where: Record<string, unknown>; create: Record<string, unknown>; update: Record<string, unknown> }): Promise<T>;
  delete(args: { where: Record<string, unknown> }): Promise<T>;
  count(args?: { where?: Record<string, unknown> }): Promise<number>;
}

export type { PrismaTransaction };

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 200;
