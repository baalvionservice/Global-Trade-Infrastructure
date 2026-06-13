/**
 * @file app/api/health/route.ts
 * @description Liveness/readiness probe (Agent 20). Verifies DB connectivity.
 */
import { prisma } from '@/server/db/prisma';
import { ok, fail } from '@/server/http/api';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return ok({ status: 'healthy', service: 'Baalvion API', database: 'up', timestamp: new Date().toISOString() });
  } catch (err) {
    return fail(503, `unhealthy: ${err instanceof Error ? err.message : 'database down'}`);
  }
}
