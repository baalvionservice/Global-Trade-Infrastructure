/**
 * @file server/migration/backfill.ts
 * @description Data migration (Agent 9). Backfills existing domain records
 * (RFQs / Deals / Orders / Escrows / Shipments / …) into TradeTransaction
 * aggregates. Idempotent by trade `reference` — re-running never duplicates or
 * loses data. Callers map their source rows (from the legacy service DBs or an
 * export) into BackfillTrade[].
 */
import { TradeState } from '@prisma/client';
import { TradeTerms } from '@/orchestration/ports';
import { UserRole } from '@/core/roles';
import { withTransaction } from '../db/prisma';
import {
  tradeRepository,
  buyerRepository,
  supplierRepository,
  workflowRepository,
  auditRepository,
} from '../repositories';
import { TradeTransaction } from '../domain/trade-transaction';

export interface BackfillTrade {
  organizationId: string;
  reference: string;
  terms: TradeTerms;
  currentState?: TradeState;
  buyer?: { name: string; externalRef?: string };
  supplier?: { name: string; externalRef?: string };
  rfq?: { commodity: string; quantity: number; unitPrice: number; currency?: string; externalRef?: string };
  deal?: { unitPrice: number; quantity: number; currency?: string; externalRef?: string };
  order?: { totalAmount: number; currency?: string; destinationCountry?: string; externalRef?: string };
  escrow?: { amount: number; currency?: string; externalRef?: string };
  payment?: { amount: number; currency?: string; provider?: string; externalRef?: string };
  shipment?: { origin?: string; destination?: string; carrier?: string; externalRef?: string };
  customs?: { country?: string; hsCode?: string; externalRef?: string };
  settlement?: { amount: number; currency?: string; externalRef?: string };
  metadata?: Record<string, unknown>;
}

export interface BackfillResult {
  created: number;
  skipped: number;
  references: string[];
}

const SYSTEM_ACTOR = { actorId: 'system-backfill', actorRole: 'Sovereign Operator' as UserRole };

async function ensureBuyerId(orgId: string, buyer?: { name: string; externalRef?: string }): Promise<string | null> {
  if (!buyer) return null;
  if (buyer.externalRef) {
    const found = await buyerRepository.findByExternalRef(orgId, buyer.externalRef);
    if (found) return found.id;
  }
  return (await buyerRepository.create({ organizationId: orgId, name: buyer.name, externalRef: buyer.externalRef ?? null })).id;
}

async function ensureSupplierId(orgId: string, supplier?: { name: string; externalRef?: string }): Promise<string | null> {
  if (!supplier) return null;
  if (supplier.externalRef) {
    const found = await supplierRepository.findByExternalRef(orgId, supplier.externalRef);
    if (found) return found.id;
  }
  return (await supplierRepository.create({ organizationId: orgId, name: supplier.name, externalRef: supplier.externalRef ?? null })).id;
}

/** Backfill a batch of trades. Idempotent by reference. */
export async function backfillTrades(records: BackfillTrade[]): Promise<BackfillResult> {
  const result: BackfillResult = { created: 0, skipped: 0, references: [] };

  for (const rec of records) {
    const existing = await tradeRepository.findByReference(rec.reference);
    if (existing) {
      result.skipped += 1;
      continue;
    }

    const buyerId = await ensureBuyerId(rec.organizationId, rec.buyer);
    const supplierId = await ensureSupplierId(rec.organizationId, rec.supplier);
    const state = rec.currentState ?? TradeState.RFQ_CREATED;

    const trade = await withTransaction(async (tx) => {
      const row = await tradeRepository.create(
        {
          organizationId: rec.organizationId,
          reference: rec.reference,
          correlationId: rec.reference,
          buyerId,
          supplierId,
          currentState: state,
          terms: rec.terms as unknown as object,
          metadata: rec.metadata as unknown as object,
        },
        tx,
      );
      await workflowRepository.append(
        {
          organizationId: rec.organizationId,
          tradeTransactionId: row.id,
          type: 'GENESIS',
          fromState: null,
          toState: state,
          actorId: SYSTEM_ACTOR.actorId,
          actorRole: String(SYSTEM_ACTOR.actorRole),
          reason: 'backfill',
          correlationId: rec.reference,
        },
        tx,
      );
      await auditRepository.record(
        {
          organizationId: rec.organizationId,
          tradeId: row.id,
          entityType: 'TradeTransaction',
          entityId: row.id,
          action: 'BACKFILL',
          actorId: SYSTEM_ACTOR.actorId,
          actorRole: String(SYSTEM_ACTOR.actorRole),
          source: 'migration',
          afterState: { state, reference: rec.reference } as unknown as object,
          correlationId: rec.reference,
        },
        tx,
      );
      return row;
    });

    const aggregate = await TradeTransaction.load(trade.id);
    if (rec.rfq) await aggregate.attachRFQ(rec.rfq, SYSTEM_ACTOR);
    if (rec.deal) await aggregate.attachDeal(rec.deal, SYSTEM_ACTOR);
    if (rec.order) await aggregate.attachOrder(rec.order, SYSTEM_ACTOR);
    if (rec.escrow) await aggregate.attachEscrow(rec.escrow, SYSTEM_ACTOR);
    if (rec.payment) await aggregate.attachPayment(rec.payment, SYSTEM_ACTOR);
    if (rec.shipment) await aggregate.attachShipment(rec.shipment, SYSTEM_ACTOR);
    if (rec.customs) await aggregate.attachCustoms(rec.customs, SYSTEM_ACTOR);
    if (rec.settlement) await aggregate.attachSettlement(rec.settlement, SYSTEM_ACTOR);

    result.created += 1;
    result.references.push(rec.reference);
  }

  return result;
}
