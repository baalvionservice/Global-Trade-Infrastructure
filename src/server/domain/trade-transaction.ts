/**
 * @file server/domain/trade-transaction.ts
 * @description The TradeTransaction aggregate root (Agent 2).
 *
 * Single source of truth for a trade. Wraps the persistent row and exposes the
 * domain API (createTrade / attach* / advanceState / cancelTrade /
 * completeTrade). Lifecycle progression is delegated to the Phase-1 brain
 * controller (kept intact); structural attachment + linking is done through the
 * repository layer. Attach methods are idempotent so they are safe for backfill.
 */
import { TradeTransaction as TradeRow } from '@prisma/client';
import {
  tradeRepository,
  rfqRepository,
  dealRepository,
  orderRepository,
  escrowRepository,
  paymentRepository,
  shipmentRepository,
  customsRepository,
  settlementRepository,
  auditRepository,
  TradeWithGraph,
} from '../repositories';
import { withTransaction, PrismaTransaction } from '../db/prisma';
import { NotFoundError } from '../db/errors';
import { buildBrain } from '../orchestration/wiring';
import { tradeService, CreateTradeInput, ActorRef } from '../services/trade-service';

type Pointer =
  | 'rfqId'
  | 'dealId'
  | 'orderId'
  | 'escrowId'
  | 'paymentId'
  | 'shipmentId'
  | 'customsId'
  | 'settlementId';

export class TradeTransaction {
  private constructor(private record: TradeRow) {}

  static async createTrade(input: CreateTradeInput): Promise<TradeTransaction> {
    const graph = await tradeService.createTrade(input);
    return new TradeTransaction(graph);
  }

  static async load(tradeId: string): Promise<TradeTransaction> {
    const row = await tradeRepository.findById(tradeId);
    if (!row) throw new NotFoundError('TradeTransaction', tradeId);
    return new TradeTransaction(row);
  }

  get id(): string {
    return this.record.id;
  }
  get state(): TradeRow['currentState'] {
    return this.record.currentState;
  }
  get organizationId(): string {
    return this.record.organizationId;
  }
  get snapshot(): TradeRow {
    return this.record;
  }

  async reload(): Promise<this> {
    this.record = await tradeRepository.findByIdOrThrow(this.id);
    return this;
  }

  toGraph(): Promise<TradeWithGraph | null> {
    return tradeRepository.findFullGraph(this.id);
  }

  // --- Structural attachment (idempotent) -----------------------------------

  private async attach(
    pointer: Pointer,
    entityType: string,
    create: (tx: PrismaTransaction, base: { organizationId: string; tradeTransactionId: string }) => Promise<{ id: string }>,
    actor: ActorRef,
  ): Promise<this> {
    if (this.record[pointer]) return this; // already attached — idempotent
    await withTransaction(async (tx) => {
      const row = await create(tx, { organizationId: this.record.organizationId, tradeTransactionId: this.id });
      await tradeRepository.update(this.id, { [pointer]: row.id }, tx);
      await auditRepository.record(
        {
          organizationId: this.record.organizationId,
          tradeId: this.id,
          entityType,
          entityId: row.id,
          action: 'ATTACH',
          actorId: actor.actorId,
          actorRole: String(actor.actorRole),
          source: 'aggregate',
          afterState: { pointer, rowId: row.id },
          correlationId: this.record.correlationId,
        },
        tx,
      );
    });
    return this.reload();
  }

  attachRFQ(data: { commodity: string; quantity: number; unitPrice: number; currency?: string; externalRef?: string }, actor: ActorRef) {
    return this.attach('rfqId', 'Rfq', (tx, base) =>
      rfqRepository.create({ ...base, commodity: data.commodity, quantity: data.quantity, unitPrice: data.unitPrice, currency: data.currency ?? 'USD', externalRef: data.externalRef ?? null }, tx), actor);
  }

  attachDeal(data: { unitPrice: number; quantity: number; currency?: string; externalRef?: string }, actor: ActorRef) {
    return this.attach('dealId', 'Deal', (tx, base) =>
      dealRepository.create({ ...base, unitPrice: data.unitPrice, quantity: data.quantity, currency: data.currency ?? 'USD', externalRef: data.externalRef ?? null }, tx), actor);
  }

  attachOrder(data: { totalAmount: number; currency?: string; destinationCountry?: string; externalRef?: string }, actor: ActorRef) {
    return this.attach('orderId', 'Order', (tx, base) =>
      orderRepository.create({ ...base, totalAmount: data.totalAmount, currency: data.currency ?? 'USD', destinationCountry: data.destinationCountry ?? null, externalRef: data.externalRef ?? null }, tx), actor);
  }

  attachEscrow(data: { amount: number; currency?: string; externalRef?: string }, actor: ActorRef) {
    return this.attach('escrowId', 'Escrow', (tx, base) =>
      escrowRepository.create({ ...base, amount: data.amount, currency: data.currency ?? 'USD', externalRef: data.externalRef ?? null }, tx), actor);
  }

  attachPayment(data: { amount: number; currency?: string; provider?: string; externalRef?: string }, actor: ActorRef) {
    return this.attach('paymentId', 'Payment', (tx, base) =>
      paymentRepository.create({ ...base, amount: data.amount, currency: data.currency ?? 'USD', provider: data.provider ?? null, externalRef: data.externalRef ?? null }, tx), actor);
  }

  attachShipment(data: { origin?: string; destination?: string; carrier?: string; externalRef?: string }, actor: ActorRef) {
    return this.attach('shipmentId', 'Shipment', (tx, base) =>
      shipmentRepository.create({ ...base, origin: data.origin ?? null, destination: data.destination ?? null, carrier: data.carrier ?? null, externalRef: data.externalRef ?? null }, tx), actor);
  }

  attachCustoms(data: { country?: string; hsCode?: string; externalRef?: string }, actor: ActorRef) {
    return this.attach('customsId', 'CustomsDeclaration', (tx, base) =>
      customsRepository.create({ ...base, country: data.country ?? null, hsCode: data.hsCode ?? null, externalRef: data.externalRef ?? null }, tx), actor);
  }

  attachSettlement(data: { amount: number; currency?: string; externalRef?: string }, actor: ActorRef) {
    return this.attach('settlementId', 'Settlement', (tx, base) =>
      settlementRepository.create({ ...base, amount: data.amount, currency: data.currency ?? 'USD', externalRef: data.externalRef ?? null }, tx), actor);
  }

  // --- Lifecycle (delegated to the Phase-1 brain controller) ----------------

  /** Advance past the current external gate, then auto-drive to the next gate. */
  async advanceState(actor: ActorRef): Promise<this> {
    const { brain } = buildBrain({
      organizationId: this.record.organizationId,
      reference: this.record.reference,
      correlationId: this.record.correlationId,
      buyerId: this.record.buyerId,
      supplierId: this.record.supplierId,
    });
    await brain.approveTrade(this.id, actor);
    return this.reload();
  }

  async cancelTrade(actor: ActorRef, reason: string): Promise<this> {
    await tradeService.cancelTrade(this.id, actor, reason);
    return this.reload();
  }

  async completeTrade(actor: ActorRef): Promise<this> {
    await tradeService.completeTrade(this.id, actor);
    return this.reload();
  }
}
