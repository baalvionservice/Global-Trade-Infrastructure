/**
 * @file server/repositories/finance-repository.ts
 * @description Repositories for trade-finance instruments and financing
 * requests (Agent 8). Both are trade-scoped.
 */
import { TradeFinanceInstrument, FinancingRequest } from '@prisma/client';
import { BaseRepository, client } from './base-repository';
import { ModelDelegate, PrismaTransaction } from './types';

export class TradeFinanceInstrumentRepository extends BaseRepository<TradeFinanceInstrument> {
  protected readonly entityName = 'TradeFinanceInstrument';
  protected delegate(tx?: PrismaTransaction): ModelDelegate<TradeFinanceInstrument> {
    return client(tx).tradeFinanceInstrument as unknown as ModelDelegate<TradeFinanceInstrument>;
  }
  async listByTrade(tradeTransactionId: string, tx?: PrismaTransaction): Promise<TradeFinanceInstrument[]> {
    return client(tx).tradeFinanceInstrument.findMany({
      where: { tradeTransactionId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export class FinancingRequestRepository extends BaseRepository<FinancingRequest> {
  protected readonly entityName = 'FinancingRequest';
  protected delegate(tx?: PrismaTransaction): ModelDelegate<FinancingRequest> {
    return client(tx).financingRequest as unknown as ModelDelegate<FinancingRequest>;
  }
  async listByTrade(tradeTransactionId: string, tx?: PrismaTransaction): Promise<FinancingRequest[]> {
    return client(tx).financingRequest.findMany({
      where: { tradeTransactionId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const tradeFinanceInstrumentRepository = new TradeFinanceInstrumentRepository();
export const financingRequestRepository = new FinancingRequestRepository();
