/**
 * @file server/__tests__/lifecycle-contract.test.ts
 * @description Phase C (CR-4): there is ONE authoritative lifecycle. A trade
 * created through the API is observed with identical state by the API read path,
 * the application service, the workflow engine and the raw aggregate — and the
 * divergent in-memory/remote singleton can no longer persist on the server.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import { resetDatabase, seedOrganization, disconnect } from '../test/db';
import { tradeService } from '../services/trade-service';
import { tradeRepository } from '../repositories';
import { buildBrain } from '../orchestration/wiring';
import { signIdentity } from '../http/identity';
import { POST as createTradeRoute } from '@/app/api/trades/route';
import { GET as getTrade } from '@/app/api/trades/[id]/route';
import { brainController } from '@/orchestration/brain-controller';
import { USER_ROLES, UserRole } from '@/core/roles';
import { TradeTerms } from '@/orchestration/ports';

const TERMS: TradeTerms = { buyerId: 'B', sellerId: 'S', commodity: 'COFFEE', quantity: 50, unitPrice: 12, currency: 'USD' };
const ROLE = USER_ROLES.BUYER as UserRole;

function signedPost(orgId: string, body: unknown): Request {
  const headers = signIdentity({ actorId: 'u-1', actorRole: ROLE, organizationId: orgId });
  return new Request('http://localhost/api/trades', {
    method: 'POST',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}
function signedGet(orgId: string): Request {
  return new Request('http://localhost/api/trades', { headers: signIdentity({ actorId: 'u-1', actorRole: ROLE, organizationId: orgId }) });
}

describe('authoritative lifecycle contract (CR-4)', () => {
  let orgId: string;

  beforeEach(async () => {
    await resetDatabase();
    orgId = await seedOrganization('Contract Org');
  });
  afterAll(async () => {
    await disconnect();
  });

  it('API, service, workflow engine and aggregate all observe identical state', async () => {
    const created = await createTradeRoute(signedPost(orgId, { terms: TERMS }));
    expect(created.status).toBe(201);
    const apiCreate = (await created.json()).data;
    const id = apiCreate.id as string;

    // 1) API read path
    const apiRead = (await (await getTrade(signedGet(orgId), { params: Promise.resolve({ id }) })).json()).data;

    // 2) application service
    const workflow = await tradeService.getWorkflow(id);

    // 3) workflow engine (Prisma-backed, freshly wired)
    const row = await tradeRepository.findById(id);
    const { engine } = buildBrain({
      organizationId: orgId,
      reference: row!.reference,
      correlationId: row!.correlationId,
    });
    const engineRecord = await engine.getWorkflow(id);

    // 4) raw aggregate
    const aggregate = await tradeRepository.findById(id);

    const states = [apiCreate.currentState, apiRead.currentState, workflow.currentState, engineRecord!.state, aggregate!.currentState];
    expect(new Set(states).size).toBe(1); // all identical, no divergence
    expect(states[0]).toBe('RFQ_SUBMITTED');

    const versions = [apiRead.version, workflow.version, engineRecord!.version, aggregate!.version];
    expect(new Set(versions).size).toBe(1);
  });

  it('the global singleton can no longer persist a divergent lifecycle on the server', async () => {
    await expect(
      brainController.startTrade({ tradeId: randomUUID(), terms: TERMS, actorId: 'x', actorRole: ROLE }),
    ).rejects.toThrow(/AUTHORITATIVE_PATH_VIOLATION/);
  });
});
