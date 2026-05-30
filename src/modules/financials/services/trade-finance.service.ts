/**
 * @file trade-finance.service.ts
 * @description Orchestrates the lifecycle of bank-grade trade finance instruments (LCs, SCF, Factoring).
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { logger, metricsService } from '@/services/observability-service';
import { eventBus } from '@/orchestration/event-bus';
import { TradeFinanceInstrument, InstrumentType } from '../types/financial.types';

class TradeFinanceService {
  private static instance: TradeFinanceService;

  private constructor() {}

  public static getInstance(): TradeFinanceService {
    if (!TradeFinanceService.instance) {
      TradeFinanceService.instance = new TradeFinanceService();
    }
    return TradeFinanceService.instance;
  }

  /**
   * Initializes a formal request for a Trade Finance instrument.
   */
  async requestInstrument(data: {
    type: InstrumentType;
    referenceId: string;
    amount: number;
    currency: string;
    beneficiaryId: string;
    buyerId: string;
  }): Promise<TradeFinanceInstrument> {
    logger.info('TradeFinance', `INITIATING_INSTRUMENT_REQUEST: ${data.type} for ${data.referenceId}`);

    const res = await apiClient.post<TradeFinanceInstrument>('/trade_finance_instruments', {
      ...data,
      status: 'PENDING_BANK_APPROVAL',
      expiryDate: new Date(Date.now() + 90 * 86400000).toISOString(), // 90-day validity
      createdAt: new Date().toISOString()
    });

    metricsService.recordMetric('finance_requests_total', 1);
    eventBus.publish('FINANCING_REQUEST_SUBMITTED' as any, res.data);

    return res.data!;
  }

  /**
   * Retrieves active instruments for an institutional entity.
   */
  async getActiveInstruments(companyId: string): Promise<TradeFinanceInstrument[]> {
    const res = await apiClient.get<TradeFinanceInstrument[]>('/trade_finance_instruments', {
      beneficiaryId: companyId,
      status: 'ISSUED'
    });
    return toList(res);
  }

  /**
   * Bank sign-off for a Letter of Credit using Two-Key authority.
   */
  async authorizeLC(id: string, bankId: string): Promise<TradeFinanceInstrument> {
    logger.warn('TradeFinance', `AUTHORIZING_LC: Instrument ${id} signed by bank ${bankId}`);
    
    const res = await apiClient.patch<TradeFinanceInstrument>(`/trade_finance_instruments/${id}`, {
      status: 'ISSUED',
      issuingInstitutionId: bankId,
      updatedAt: new Date().toISOString()
    });

    eventBus.publish('UNDERWRITING_COMPLETED' as any, res.data);
    metricsService.recordMetric('lc_issuance_success', 1);
    
    return res.data!;
  }
}

export const tradeFinanceService = TradeFinanceService.getInstance();
