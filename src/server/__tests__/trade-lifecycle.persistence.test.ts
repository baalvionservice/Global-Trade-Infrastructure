/**
 * @file server/__tests__/trade-lifecycle.persistence.test.ts
 * @description End-to-end persisted lifecycle (Agent 10). Drives a trade from
 * RFQ to Settlement through the orchestration kernel and verifies that the
 * aggregate, sub-entities, workflow history, domain events and audit trail are
 * all persisted, retrievable by a single tradeId, and survive a "restart"
 * (a fresh read of the database).
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetDatabase, seedOrganization, disconnect } from '../test/db';
import { tradeService } from '../services/trade-service';
import { tradeRepository } from '../repositories';
import { TRADE_EVENTS } from '@/orchestration/lifecycle';
import { USER_ROLES, UserRole } from '@/core/roles';
import { TradeTerms } from '@/orchestration/ports';

const TERMS: TradeTerms = {
  buyerId: 'ORG-BUYER',
  sellerId: 'ORG-SELLER',
  commodity: 'ARABICA_COFFEE',
  quantity: 100,
  unitPrice: 12.5,
  currency: 'USD',
  incoterm: 'FOB',
  originCountry: 'BR',
  destinationCountry: 'US',
};

const BUYER = { actorId: 'u-buyer', actorRole: USER_ROLES.BUYER as UserRole };
const EXEC = { actorId: 'u-exec', actorRole: USER_ROLES.EXECUTIVE_DIRECTOR as UserRole };
const TREASURY = { actorId: 'u-treasury', actorRole: USER_ROLES.FINANCE_DIRECTOR as UserRole };
const OPS = { actorId: 'u-ops', actorRole: USER_ROLES.OPERATIONS_DIRECTOR as UserRole };
const BANK = { actorId: 'u-bank', actorRole: USER_ROLES.BANK_ADMIN as UserRole };

describe('persisted trade lifecycle (RFQ → Settlement)', () => {
  let orgId: string;

  beforeEach(async () => {
    await resetDatabase();
    orgId = await seedOrganization();
  });

  afterAll(async () => {
    await disconnect();
  });

  it('drives, persists and survives restart for a full lifecycle', async () => {
    const created = await tradeService.createTrade({
      organizationId: orgId,
      actor: BUYER,
      terms: TERMS,
      buyer: { name: 'Acme Importers', externalRef: 'BUY-1' },
      supplier: { name: 'Fazenda Verde', externalRef: 'SUP-1' },
    });
    const id = created.id;
    expect(created.currentState).toBe('RFQ_SUBMITTED');
    expect(created.rfq).not.toBeNull();
    expect(created.buyer?.name).toBe('Acme Importers');
    expect(created.supplier?.name).toBe('Fazenda Verde');

    const afterAccept = await tradeService.acceptRFQ(id, BUYER);
    expect(afterAccept.currentState).toBe('DEAL_NEGOTIATION');
    expect(afterAccept.deal).not.toBeNull();

    const afterDeal = await tradeService.approveDeal(id, EXEC);
    expect(afterDeal.currentState).toBe('ESCROW_CREATED');
    expect(afterDeal.order).not.toBeNull();
    expect(afterDeal.escrow).not.toBeNull();
    expect(afterDeal.riskStatus).not.toBe('PENDING');
    expect(afterDeal.complianceStatus).toBe('PASSED');

    const afterFund = await tradeService.fundEscrow(id, TREASURY);
    expect(afterFund.currentState).toBe('SHIPMENT_CUSTOMS');
    expect(afterFund.payment).not.toBeNull();
    expect(afterFund.shipment).not.toBeNull();
    expect(afterFund.customs).not.toBeNull();

    const afterDeliver = await tradeService.markDelivered(id, OPS);
    expect(afterDeliver.currentState).toBe('SETTLEMENT_PENDING');
    expect(afterDeliver.settlement).not.toBeNull();

    const completed = await tradeService.releaseSettlement(id, BANK);
    expect(completed.currentState).toBe('TRADE_COMPLETED');

    // ── Restart survival: a fresh read of the DB returns the full graph ──────
    const fresh = await tradeRepository.findFullGraph(id);
    expect(fresh).not.toBeNull();
    expect(fresh?.currentState).toBe('TRADE_COMPLETED');
    expect(fresh?.rfq).not.toBeNull();
    expect(fresh?.deal).not.toBeNull();
    expect(fresh?.order).not.toBeNull();
    expect(fresh?.escrow).not.toBeNull();
    expect(fresh?.payment).not.toBeNull();
    expect(fresh?.shipment).not.toBeNull();
    expect(fresh?.customs).not.toBeNull();
    expect(fresh?.settlement).not.toBeNull();
    // Pointers on the aggregate match the linked rows.
    expect(fresh?.rfqId).toBe(fresh?.rfq?.id);
    expect(fresh?.settlementId).toBe(fresh?.settlement?.id);

    // ── Persisted workflow history (19 states: genesis + 18 transitions) ────
    const workflow = await tradeService.getWorkflow(id);
    expect(workflow.history).toHaveLength(19);
    expect(workflow.history[0].toState).toBe('RFQ_CREATED');
    expect(workflow.history[workflow.history.length - 1].toState).toBe('TRADE_COMPLETED');

    // ── Persisted domain events (replayable) ────────────────────────────────
    const events = await tradeService.getEvents(id);
    const types = new Set(events.map((e) => e.type));
    for (const name of [
      TRADE_EVENTS.RFQ_CREATED,
      TRADE_EVENTS.DEAL_CREATED,
      TRADE_EVENTS.ORDER_CREATED,
      TRADE_EVENTS.ESCROW_CREATED,
      TRADE_EVENTS.ESCROW_FUNDED,
      TRADE_EVENTS.SHIPMENT_CREATED,
      TRADE_EVENTS.SHIPMENT_DELIVERED,
      TRADE_EVENTS.SETTLEMENT_COMPLETED,
      TRADE_EVENTS.TRADE_COMPLETED,
    ]) {
      expect(types.has(name), `missing persisted event ${name}`).toBe(true);
    }

    // ── Persisted audit trail ───────────────────────────────────────────────
    const audit = await tradeService.getAudit(id);
    expect(audit.total).toBeGreaterThan(0);
  });

  it('cancels a trade and compensates, persisting the terminal state', async () => {
    const created = await tradeService.createTrade({ organizationId: orgId, actor: BUYER, terms: TERMS });
    await tradeService.acceptRFQ(created.id, BUYER);
    await tradeService.approveDeal(created.id, EXEC);
    await tradeService.fundEscrow(created.id, TREASURY);

    const cancelled = await tradeService.cancelTrade(created.id, EXEC, 'fraud_signal');
    expect(cancelled.currentState).toBe('TRADE_CANCELLED');

    const fresh = await tradeRepository.findFullGraph(created.id);
    expect(fresh?.escrow?.status).toBe('refunded');
  });
});
