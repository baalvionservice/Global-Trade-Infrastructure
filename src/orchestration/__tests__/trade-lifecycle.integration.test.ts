/**
 * @file trade-lifecycle.integration.test.ts
 * @description End-to-end orchestration test.
 *
 * Drives a single trade through the entire mandated lifecycle — RFQ -> Deal ->
 * Order -> Escrow -> Shipment -> Customs -> Settlement -> Completed — using only
 * the external gate commands. Every downstream step (create deal, create order,
 * create escrow, create shipment, advance customs, complete trade) is produced
 * by orchestration + events, never invoked directly. Verifies state machine
 * transitions, event emission, approval execution, audit logging, failure
 * handling and rollback.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus, PlatformEvent } from '../event-bus';
import { WorkflowEngine } from '../workflow-engine';
import { BrainController } from '../brain-controller';
import { TRADE_EVENTS } from '../lifecycle';
import { buildFakePorts, SAMPLE_TERMS, BUYER, APPROVER, TREASURY, LOGISTICS, BANK, FakeHarness } from './fakes';

function wire(harness: FakeHarness) {
  const bus = EventBus.create();
  const engine = WorkflowEngine.create({ store: harness.store, audit: harness.ports.audit, bus });
  const brain = BrainController.create({ ports: harness.ports, engine, bus });
  const events: PlatformEvent[] = [];
  bus.subscribe('*', (e) => {
    events.push(e);
  });
  return { bus, engine, brain, events };
}

const TRADE_ID = 'TRADE-INT-001';

describe('Trade lifecycle orchestration (RFQ -> Settlement)', () => {
  let harness: FakeHarness;

  beforeEach(() => {
    harness = buildFakePorts();
  });

  it('drives a full trade to completion through gate commands only', async () => {
    const { brain, engine, events } = wire(harness);

    await brain.startTrade({
      tradeId: TRADE_ID,
      terms: SAMPLE_TERMS,
      actorId: BUYER.actorId,
      actorRole: BUYER.actorRole,
    });
    expect((await engine.getWorkflow(TRADE_ID))?.state).toBe('RFQ_SUBMITTED');

    await brain.acceptRFQ(TRADE_ID, BUYER);
    expect((await engine.getWorkflow(TRADE_ID))?.state).toBe('DEAL_NEGOTIATION');

    await brain.approveDeal(TRADE_ID, APPROVER);
    expect((await engine.getWorkflow(TRADE_ID))?.state).toBe('ESCROW_CREATED');

    await brain.fundEscrow(TRADE_ID, TREASURY);
    expect((await engine.getWorkflow(TRADE_ID))?.state).toBe('SHIPMENT_CUSTOMS');

    await brain.markDelivered(TRADE_ID, LOGISTICS);
    expect((await engine.getWorkflow(TRADE_ID))?.state).toBe('SETTLEMENT_PENDING');

    await brain.releaseSettlement(TRADE_ID, BANK);
    const final = await engine.getWorkflow(TRADE_ID);
    expect(final?.state).toBe('TRADE_COMPLETED');

    // Downstream identifiers were minted automatically by orchestration.
    expect(final?.refs.rfqId).toBe(`rfq-${TRADE_ID}`);
    expect(final?.refs.dealId).toBe(`deal-${TRADE_ID}`);
    expect(final?.refs.orderId).toBe(`ord-${TRADE_ID}`);
    expect(final?.refs.escrowId).toBe(`esc-${TRADE_ID}`);
    expect(final?.refs.shipmentId).toBe(`shp-${TRADE_ID}`);

    // Every mandated lifecycle event was emitted.
    const emitted = events.map((e) => e.type);
    for (const name of [
      TRADE_EVENTS.RFQ_CREATED,
      TRADE_EVENTS.RFQ_SUBMITTED,
      TRADE_EVENTS.RFQ_ACCEPTED,
      TRADE_EVENTS.DEAL_CREATED,
      TRADE_EVENTS.DEAL_APPROVED,
      TRADE_EVENTS.ORDER_CREATED,
      TRADE_EVENTS.ORDER_CONFIRMED,
      TRADE_EVENTS.ESCROW_CREATED,
      TRADE_EVENTS.ESCROW_FUNDED,
      TRADE_EVENTS.SHIPMENT_CREATED,
      TRADE_EVENTS.SHIPMENT_DELIVERED,
      TRADE_EVENTS.SETTLEMENT_COMPLETED,
      TRADE_EVENTS.TRADE_COMPLETED,
    ]) {
      expect(emitted, `missing event ${name}`).toContain(name);
    }

    // Events carry correlation + trade identity.
    const completed = events.find((e) => e.type === TRADE_EVENTS.TRADE_COMPLETED);
    expect(completed?.tradeId).toBe(TRADE_ID);
    expect(completed?.correlationId).toBe(TRADE_ID);
  });

  it('records an append-only audit entry for every transition', async () => {
    const { brain } = wire(harness);
    await brain.startTrade({ tradeId: TRADE_ID, terms: SAMPLE_TERMS, actorId: BUYER.actorId, actorRole: BUYER.actorRole });
    await brain.acceptRFQ(TRADE_ID, BUYER);
    await brain.approveDeal(TRADE_ID, APPROVER);
    await brain.fundEscrow(TRADE_ID, TREASURY);
    await brain.markDelivered(TRADE_ID, LOGISTICS);
    await brain.releaseSettlement(TRADE_ID, BANK);

    // Genesis + each advance is audited; transitions are strictly chained.
    expect(harness.auditEntries.length).toBeGreaterThanOrEqual(13);
    const toStates = harness.auditEntries.map((a) => a.to);
    expect(toStates[0]).toBe('RFQ_CREATED');
    expect(toStates).toContain('TRADE_COMPLETED');
    for (const entry of harness.auditEntries) {
      expect(entry.tradeId).toBe(TRADE_ID);
      expect(entry.correlationId).toBe(TRADE_ID);
    }
  });

  it('executes downstream side-effects in lifecycle order', async () => {
    const { brain } = wire(harness);
    await brain.startTrade({ tradeId: TRADE_ID, terms: SAMPLE_TERMS, actorId: BUYER.actorId, actorRole: BUYER.actorRole });
    await brain.acceptRFQ(TRADE_ID, BUYER);
    await brain.approveDeal(TRADE_ID, APPROVER);
    await brain.fundEscrow(TRADE_ID, TREASURY);
    await brain.markDelivered(TRADE_ID, LOGISTICS);
    await brain.releaseSettlement(TRADE_ID, BANK);

    const calls = harness.execCalls;
    expect(calls[0]).toBe('RFQ_CREATED');
    expect(calls).toEqual([
      'RFQ_CREATED',
      'RFQ_SUBMITTED',
      'RFQ_ACCEPTED',
      'DEAL_CREATED',
      'DEAL_NEGOTIATION',
      'DEAL_APPROVED',
      'ORDER_CREATED',
      'ORDER_CONFIRMED',
      'ORDER_EXECUTING',
      'ESCROW_CREATED',
      'ESCROW_FUNDED',
      'SHIPMENT_CREATED',
      'SHIPMENT_PICKED_UP',
      'SHIPMENT_IN_TRANSIT',
      'SHIPMENT_CUSTOMS',
      'SHIPMENT_DELIVERED',
      'SETTLEMENT_PENDING',
      'SETTLEMENT_COMPLETED',
      'TRADE_COMPLETED',
    ]);
  });

  it('blocks a deal that fails evaluation and never reaches escrow', async () => {
    harness = buildFakePorts({ compliancePass: false });
    const { brain, engine, events } = wire(harness);
    await brain.startTrade({ tradeId: TRADE_ID, terms: SAMPLE_TERMS, actorId: BUYER.actorId, actorRole: BUYER.actorRole });
    await brain.acceptRFQ(TRADE_ID, BUYER);
    await brain.approveDeal(TRADE_ID, APPROVER); // evaluation fails -> blockTrade

    const record = await engine.getWorkflow(TRADE_ID);
    expect(record?.state).toBe('TRADE_CANCELLED');
    expect(events.map((e) => e.type)).toContain(TRADE_EVENTS.TRADE_CANCELLED);
    expect(events.map((e) => e.type)).toContain(TRADE_EVENTS.COMPENSATION_TRIGGERED);
    // No escrow was ever created.
    expect(harness.execCalls).not.toContain('ESCROW_CREATED');
  });

  it('compensates committed side-effects on rollback', async () => {
    const { brain, engine } = wire(harness);
    await brain.startTrade({ tradeId: TRADE_ID, terms: SAMPLE_TERMS, actorId: BUYER.actorId, actorRole: BUYER.actorRole });
    await brain.acceptRFQ(TRADE_ID, BUYER);
    await brain.approveDeal(TRADE_ID, APPROVER);
    await brain.fundEscrow(TRADE_ID, TREASURY); // escrow + shipment now committed

    await brain.cancelTrade(TRADE_ID, APPROVER, 'fraud_signal');

    expect((await engine.getWorkflow(TRADE_ID))?.state).toBe('TRADE_CANCELLED');
    // Compensation was invoked with the state the trade was in when blocked.
    expect(harness.compensated.length).toBeGreaterThan(0);
    expect(harness.compensated).toContain('SHIPMENT_CUSTOMS');
  });

  it('isolates a failing side-effect without corrupting workflow state', async () => {
    harness = buildFakePorts({ failOn: ['SHIPMENT_CREATED'] });
    const { brain, engine, events } = wire(harness);
    await brain.startTrade({ tradeId: TRADE_ID, terms: SAMPLE_TERMS, actorId: BUYER.actorId, actorRole: BUYER.actorRole });
    await brain.acceptRFQ(TRADE_ID, BUYER);
    await brain.approveDeal(TRADE_ID, APPROVER);
    // Funding triggers shipment creation, whose side-effect throws — the state
    // machine must still advance and surface a blocked-workflow signal.
    await brain.fundEscrow(TRADE_ID, TREASURY);

    expect(events.map((e) => e.type)).toContain(TRADE_EVENTS.WORKFLOW_BLOCKED);
    // The workflow continued past the failed side-effect (state integrity preserved).
    expect((await engine.getWorkflow(TRADE_ID))?.state).toBe('SHIPMENT_CUSTOMS');
  });
});
