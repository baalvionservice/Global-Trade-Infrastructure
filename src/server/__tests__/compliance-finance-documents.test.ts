/**
 * @file server/__tests__/compliance-finance-documents.test.ts
 * @description Agent 7/8/12 tests: persisted risk & compliance screening with
 * blocking, trade-finance request/approval lifecycle, and versioned documents.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { FinanceInstrumentType } from '@prisma/client';
import { resetDatabase, seedOrganization, disconnect } from '../test/db';
import { tradeService } from '../services/trade-service';
import { tradeFinanceService } from '../finance/trade-finance-service';
import { documentService } from '../documents/document-service';
import {
  complianceCheckRepository,
  riskAssessmentRepository,
  tradeFinanceInstrumentRepository,
} from '../repositories';
import { USER_ROLES, UserRole } from '@/core/roles';
import { TradeTerms } from '@/orchestration/ports';

const CLEAN_TERMS: TradeTerms = {
  buyerId: 'ORG-BUYER',
  sellerId: 'ORG-SELLER',
  commodity: 'COFFEE',
  quantity: 100,
  unitPrice: 12.5,
  currency: 'USD',
  originCountry: 'BR',
  destinationCountry: 'US',
};

const SANCTIONED_TERMS: TradeTerms = { ...CLEAN_TERMS, destinationCountry: 'RU' };

const BUYER = { actorId: 'u-buyer', actorRole: USER_ROLES.BUYER as UserRole };
const EXEC = { actorId: 'u-exec', actorRole: USER_ROLES.EXECUTIVE_DIRECTOR as UserRole };
const FIN = { actorId: 'u-fin', actorRole: USER_ROLES.FINANCE_DIRECTOR as UserRole };

describe('risk & compliance, trade finance, documents', () => {
  let orgId: string;

  beforeEach(async () => {
    await resetDatabase();
    orgId = await seedOrganization();
  });

  afterAll(async () => {
    await disconnect();
  });

  it('persists a full compliance check set and clears a clean trade', async () => {
    const created = await tradeService.createTrade({ organizationId: orgId, actor: BUYER, terms: CLEAN_TERMS });
    await tradeService.acceptRFQ(created.id, BUYER);
    const afterDeal = await tradeService.approveDeal(created.id, EXEC);

    expect(afterDeal.currentState).toBe('ESCROW_CREATED');
    expect(afterDeal.complianceStatus).toBe('PASSED');

    const checks = await complianceCheckRepository.listByTrade(created.id);
    expect(checks).toHaveLength(8); // KYC,KYB,AML,PEP,SANCTIONS,COUNTRY_RISK,DOC,TRADE_RISK
    expect(checks.every((c) => c.outcome === 'PASS')).toBe(true);

    const risk = await riskAssessmentRepository.listByTrade(created.id);
    expect(risk.length).toBeGreaterThanOrEqual(1);
    expect(['LOW', 'MEDIUM']).toContain(risk[0].level);
  });

  it('blocks a sanctioned trade at deal approval and records the SANCTIONS hit', async () => {
    const created = await tradeService.createTrade({ organizationId: orgId, actor: BUYER, terms: SANCTIONED_TERMS });
    await tradeService.acceptRFQ(created.id, BUYER);
    const blocked = await tradeService.approveDeal(created.id, EXEC);

    expect(blocked.currentState).toBe('TRADE_CANCELLED');
    const checks = await complianceCheckRepository.listByTrade(created.id);
    const sanctions = checks.find((c) => c.type === 'SANCTIONS');
    expect(sanctions?.outcome).toBe('BLOCKED');
  });

  it('runs the trade-finance request → approval → instrument lifecycle', async () => {
    const trade = await tradeService.createTrade({ organizationId: orgId, actor: BUYER, terms: CLEAN_TERMS });

    const request = await tradeFinanceService.requestFinancing({
      tradeId: trade.id,
      type: FinanceInstrumentType.LETTER_OF_CREDIT,
      amount: 50_000,
      requestedBy: BUYER.actorId,
      requestedRole: BUYER.actorRole,
    });
    expect(request.status).toBe('REQUESTED');

    const decided = await tradeFinanceService.decideFinancing({
      requestId: request.id,
      decision: 'approved',
      actorId: FIN.actorId,
      actorRole: FIN.actorRole,
      provider: 'Baalvion Bank',
    });
    expect(decided.request.status).toBe('APPROVED');
    expect(decided.instrument?.status).toBe('ACTIVE');

    const settled = await tradeFinanceService.settleInstrument(decided.instrument!.id, FIN.actorId, FIN.actorRole);
    expect(settled.status).toBe('SETTLED');

    const list = await tradeFinanceService.listForTrade(trade.id);
    expect(list.instruments).toHaveLength(1);
    expect(list.requests).toHaveLength(1);
    expect(await tradeFinanceInstrumentRepository.listByTrade(trade.id)).toHaveLength(1);
  });

  it('rejects a financing request without minting an instrument', async () => {
    const trade = await tradeService.createTrade({ organizationId: orgId, actor: BUYER, terms: CLEAN_TERMS });
    const request = await tradeFinanceService.requestFinancing({
      tradeId: trade.id,
      type: FinanceInstrumentType.INVOICE_FINANCING,
      amount: 9_999_999,
      requestedBy: BUYER.actorId,
      requestedRole: BUYER.actorRole,
    });
    const decided = await tradeFinanceService.decideFinancing({
      requestId: request.id,
      decision: 'rejected',
      reason: 'exposure_limit',
      actorId: FIN.actorId,
      actorRole: FIN.actorRole,
    });
    expect(decided.request.status).toBe('REJECTED');
    expect(decided.instrument).toBeNull();
    const list = await tradeFinanceService.listForTrade(trade.id);
    expect(list.instruments).toHaveLength(0);
  });

  it('versions trade documents and supersedes prior active versions', async () => {
    const trade = await tradeService.createTrade({ organizationId: orgId, actor: BUYER, terms: CLEAN_TERMS });
    const v1 = await documentService.addDocument({
      tradeId: trade.id,
      kind: 'INVOICE',
      url: 'https://docs.example.com/inv-1.pdf',
      actorId: BUYER.actorId,
      actorRole: BUYER.actorRole,
    });
    expect(v1.version).toBe(1);

    const v2 = await documentService.addDocument({
      tradeId: trade.id,
      kind: 'INVOICE',
      url: 'https://docs.example.com/inv-2.pdf',
      actorId: BUYER.actorId,
      actorRole: BUYER.actorRole,
    });
    expect(v2.version).toBe(2);

    const docs = await documentService.listForTrade(trade.id);
    expect(docs).toHaveLength(2);
    const active = docs.filter((d) => d.status === 'active');
    expect(active).toHaveLength(1);
    expect(active[0].version).toBe(2);
  });
});
