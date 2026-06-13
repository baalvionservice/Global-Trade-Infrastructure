/**
 * @file server/__tests__/authorization.test.ts
 * @description Phase F/G (CR-11, authz C-4/C-5): function-level and object-level
 * authorization is enforced server-side. Financing decisions require an approver
 * role AND tenant ownership; the formerly-open endpoints reject anonymous callers.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetDatabase, seedOrganization, disconnect } from '../test/db';
import { tradeService } from '../services/trade-service';
import { tradeFinanceService } from '../finance/trade-finance-service';
import { signIdentity } from '../http/identity';
import { POST as decideFinancing } from '@/app/api/finance/[requestId]/decision/route';
import { POST as screenSanctions } from '@/app/api/sanctions/screen/route';
import { GET as proxyEntity } from '@/app/api/[entity]/route';
import { USER_ROLES, UserRole } from '@/core/roles';
import { TradeTerms } from '@/orchestration/ports';

const TERMS: TradeTerms = { buyerId: 'B', sellerId: 'S', commodity: 'STEEL', quantity: 10, unitPrice: 100, currency: 'USD' };

function signed(orgId: string, role: UserRole, url: string, body?: unknown): Request {
  const headers = signIdentity({ actorId: 'u-1', actorRole: role, organizationId: orgId });
  return new Request(url, {
    method: body ? 'POST' : 'GET',
    headers: { ...headers, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}
const dparams = (requestId: string) => ({ params: Promise.resolve({ requestId }) });

describe('authorization — finance decisions & secured endpoints', () => {
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

  async function newFinancingRequest(orgId: string): Promise<string> {
    const trade = await tradeService.createTrade({
      organizationId: orgId,
      actor: { actorId: 'u', actorRole: USER_ROLES.BUYER as UserRole },
      terms: TERMS,
    });
    const created = await tradeFinanceService.requestFinancing({
      tradeId: trade.id,
      type: 'LETTER_OF_CREDIT',
      amount: 1000,
      currency: 'USD',
      requestedBy: 'u',
      requestedRole: USER_ROLES.BUYER as UserRole,
    });
    return created.id;
  }

  const url = 'http://localhost/api/finance/x/decision';
  const decision = { decision: 'approved' as const, reason: 'ok' };

  it('rejects an anonymous financing decision (401)', async () => {
    const requestId = await newFinancingRequest(orgA);
    const res = await decideFinancing(
      new Request(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(decision) }),
      dparams(requestId),
    );
    expect(res.status).toBe(401);
  });

  it('rejects a non-approver role (403)', async () => {
    const requestId = await newFinancingRequest(orgA);
    const res = await decideFinancing(signed(orgA, USER_ROLES.BUYER as UserRole, url, decision), dparams(requestId));
    expect(res.status).toBe(403);
  });

  it('rejects a cross-tenant financing decision (404, no existence leak)', async () => {
    const requestId = await newFinancingRequest(orgA);
    const res = await decideFinancing(signed(orgB, USER_ROLES.FINANCE_DIRECTOR as UserRole, url, decision), dparams(requestId));
    expect(res.status).toBe(404);
  });

  it('allows an approver role within the owning tenant', async () => {
    const requestId = await newFinancingRequest(orgA);
    const res = await decideFinancing(signed(orgA, USER_ROLES.FINANCE_DIRECTOR as UserRole, url, decision), dparams(requestId));
    expect(res.status).toBe(200);
  });

  it('rejects anonymous sanctions screening (401)', async () => {
    const res = await screenSanctions(
      new Request('http://localhost/api/sanctions/screen', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'ACME' }),
      }),
    );
    expect(res.status).toBe(401);
  });

  it('rejects anonymous backend proxy access (401)', async () => {
    const res = await proxyEntity(new Request('http://localhost/api/orders'), { params: Promise.resolve({ entity: 'orders' }) });
    expect(res.status).toBe(401);
  });
});
