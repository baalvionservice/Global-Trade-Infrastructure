/**
 * @file server/repositories/trade-repository.ts
 * @description Repository for the TradeTransaction aggregate root.
 */
import { Prisma, TradeTransaction } from '@prisma/client';
import { BaseRepository, client } from './base-repository';
import { ModelDelegate, PrismaTransaction } from './types';

/** The TradeTransaction with every linked sub-entity, workflow history and documents. */
const TRADE_FULL_INCLUDE = {
  buyer: true,
  supplier: true,
  rfq: true,
  deal: true,
  order: true,
  escrow: true,
  payment: true,
  shipment: true,
  customs: true,
  settlement: true,
  documents: true,
  workflowEvents: { orderBy: { sequence: 'asc' } },
} satisfies Prisma.TradeTransactionInclude;

export type TradeWithGraph = Prisma.TradeTransactionGetPayload<{ include: typeof TRADE_FULL_INCLUDE }>;

export class TradeRepository extends BaseRepository<TradeTransaction> {
  protected readonly entityName = 'TradeTransaction';

  protected delegate(tx?: PrismaTransaction): ModelDelegate<TradeTransaction> {
    return client(tx).tradeTransaction as unknown as ModelDelegate<TradeTransaction>;
  }

  async findByReference(reference: string, tx?: PrismaTransaction): Promise<TradeTransaction | null> {
    return this.findOne({ reference }, tx);
  }

  /** Retrieve the complete trade graph — the single-tradeId success criterion. */
  async findFullGraph(id: string, tx?: PrismaTransaction): Promise<TradeWithGraph | null> {
    return client(tx).tradeTransaction.findFirst({
      where: { id, deletedAt: null },
      include: TRADE_FULL_INCLUDE,
    });
  }

  async findFullGraphByReference(reference: string, tx?: PrismaTransaction): Promise<TradeWithGraph | null> {
    return client(tx).tradeTransaction.findFirst({
      where: { reference, deletedAt: null },
      include: TRADE_FULL_INCLUDE,
    });
  }
}

export const tradeRepository = new TradeRepository();
