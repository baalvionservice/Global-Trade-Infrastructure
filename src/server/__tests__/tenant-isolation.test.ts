/**
 * @file server/__tests__/tenant-isolation.test.ts
 * @description Phase B (CR-2/CR-3/CR-7): the organization is derived only from
 * the verified principal, every route enforces it, and PostgreSQL RLS forces
 * isolation at the database layer. Proves Org A cannot read Org B.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetDatabase, seedOrganization, disconnect } from '../test/db';
import { tradeService } from '../services/trade-service';
import { withTenant } from '../db/prisma';
import { signIdentity } from '../http/identity';
import { GET as getTrade } from '@/app/api/trades/[id]/route';
import { GET as listTrades } from '@/app/api/trades/route';
import { USER_ROLES, UserRole } from '@/core/roles';
import { TradeTerms } from '@/orchestration/ports';

const TERMS: TradeTerms = { buyerId: 'B', sellerId: 'S', commodity: 'STEEL', quantity: 10, unitPrice: 100, currency: 'USD' };
const ROLE = USER_ROLES.BUYER as UserRole;

function signedReq(orgId: string, url = 'http://localhost/api/trades'): Request {
  const headers = signIdentity({ actorId: 'u-1', actorRole: ROLE, organizationId: orgId });
  return new Request(url, { headers });
}
const params = (id: string) => ({ params: Promise.resolve({ id }) });

describe('multi-tenant isolation (CR-2/CR-3/CR-7)', () => {
  let orgA: string;
  let orgB: string;

  beforeEach(async () => {
    await resetDatabase();
    orgA = await seedOrganization('Org A');
    orgB = await seedOrganization('Org B');
  });
  afterAll(async () => {
    await disconnect();
  });

  it('app layer: Org B cannot read Org A\'s trade by id (mandatory tenant guard)', async () => {
    const trade = await tradeService.createTrade({ organizationId: orgA, actor: { actorId: 'u', actorRole: ROLE }, terms: TERMS });

    const crossOrg = await getTrade(signedReq(orgB), params(trade.id));
    expect(crossOrg.status).toBe(404); // existence never leaked across tenants

    const sameOrg = await getTrade(signedReq(orgA), params(trade.id));
    expect(sameOrg.status).toBe(200);
  });

  it('app layer: an unauthenticated (unsigned) request is rejected', async () => {
    const trade = await tradeService.createTrade({ organizationId: orgA, actor: { actorId: 'u', actorRole: ROLE }, terms: TERMS });
    const anon = new Request('http://localhost/api/trades');
    const res = await getTrade(anon, params(trade.id));
    expect(res.status).toBe(401);
  });

  it('app layer: the trade list is forced to the principal\'s organization', async () => {
    await tradeService.createTrade({ organizationId: orgA, actor: { actorId: 'u', actorRole: ROLE }, terms: TERMS });
    await tradeService.createTrade({ organizationId: orgB, actor: { actorId: 'u', actorRole: ROLE }, terms: TERMS });

    const res = await listTrades(signedReq(orgA, 'http://localhost/api/trades'));
    const body = await res.json();
    expect(body.data.total).toBe(1);
    expect(body.data.items.every((t: { organizationId: string }) => t.organizationId === orgA)).toBe(true);
  });

  it('db layer: RLS forces tenant isolation under the least-privilege app role', async () => {
    const tradeA = await tradeService.createTrade({ organizationId: orgA, actor: { actorId: 'u', actorRole: ROLE }, terms: TERMS });
    const tradeB = await tradeService.createTrade({ organizationId: orgB, actor: { actorId: 'u', actorRole: ROLE }, terms: TERMS });

    const aRows = await withTenant(orgA, (tx) => tx.tradeTransaction.findMany());
    expect(aRows.length).toBeGreaterThan(0);
    expect(aRows.every((r) => r.organizationId === orgA)).toBe(true);
    expect(aRows.find((r) => r.id === tradeB.id)).toBeUndefined();

    // Org B's tenant context cannot fetch Org A's trade even by exact id.
    const leaked = await withTenant(orgB, (tx) => tx.tradeTransaction.findFirst({ where: { id: tradeA.id } }));
    expect(leaked).toBeNull();

    // And RLS also blocks a cross-tenant write attempt.
    await expect(
      withTenant(orgB, (tx) =>
        tx.tradeTransaction.updateMany({ where: { id: tradeA.id }, data: { reference: 'HIJACKED' } }),
      ),
    ).resolves.toMatchObject({ count: 0 });
  });
});
