/**
 * @file server/db/prisma.ts
 * @description PrismaClient singleton (server-only).
 *
 * A single client is reused across the process to avoid exhausting the
 * connection pool during Next.js dev hot-reloads. Repositories are the only
 * code permitted to touch this client directly.
 */
import { PrismaClient, Prisma } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __gtiPrisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__gtiPrisma ??
  new PrismaClient({
    log: process.env.PRISMA_LOG === '1' ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__gtiPrisma = prisma;
}

/** A Prisma transaction client (the `tx` handed to `$transaction(async tx => ...)`). */
export type PrismaTransaction = Prisma.TransactionClient;

/** Run work inside a database transaction. */
export function withTransaction<T>(fn: (tx: PrismaTransaction) => Promise<T>): Promise<T> {
  return prisma.$transaction(fn);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Run work inside a tenant-scoped transaction (CR-7). Drops to the
 * least-privilege `baalvion_app` role and sets the `app.current_tenant` GUC, so
 * PostgreSQL Row-Level Security forces every statement to the given tenant —
 * a database-level backstop independent of the application-layer checks.
 */
export async function withTenant<T>(
  organizationId: string,
  fn: (tx: PrismaTransaction) => Promise<T>,
): Promise<T> {
  if (!UUID_RE.test(organizationId)) {
    throw new Error('withTenant: organizationId must be a valid UUID');
  }
  return prisma.$transaction(async (tx) => {
    // SET LOCAL ROLE cannot be parameterised; the role name is a fixed literal.
    await tx.$executeRawUnsafe('SET LOCAL ROLE baalvion_app');
    await tx.$executeRawUnsafe("SELECT set_config('app.current_tenant', $1, true)", organizationId);
    return fn(tx);
  });
}
