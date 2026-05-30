/**
 * @file underwriting.service.ts
 * @description AI-Driven Institutional Underwriting and Credit Scoring Engine.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { logger } from '@/services/observability-service';
import { CreditProfile } from '../types/financial.types';

class UnderwritingService {
  private static instance: UnderwritingService;

  private constructor() {}

  public static getInstance(): UnderwritingService {
    if (!UnderwritingService.instance) {
      UnderwritingService.instance = new UnderwritingService();
    }
    return UnderwritingService.instance;
  }

  /**
   * Generates a dynamic credit profile for an institutional entity.
   * Model: Score = (0.4 * Trust) + (0.3 * Historical_Finality) + (0.3 * Liquidity_Depth)
   */
  async calculateCreditProfile(companyId: string): Promise<CreditProfile> {
    logger.info('UnderwritingOracle', `CALCULATING_CREDIT_SCORE: Node ${companyId}`);

    const num = (v: any) => Number(v) || 0;
    const norm = (v: any) => String(v ?? '').toLowerCase();
    // Real underwriting inputs from the live trade-service: liquidity (wallets), historical
    // finality (settlements), exposure (LC + invoice financing), and trade history (orders).
    const [walletsRes, settlementsRes, lcRes, finRes, ordersRes] = await Promise.all([
      apiClient.get<any[]>('/wallets', companyId ? { companyId } : {}).catch(() => null),
      apiClient.get<any[]>('/settlements').catch(() => null),
      apiClient.get<any[]>('/letters_of_credit').catch(() => null),
      apiClient.get<any[]>('/invoice_financing').catch(() => null),
      apiClient.get<any[]>('/orders').catch(() => null),
    ]);
    const wallets = toList<any>(walletsRes);
    const settlements = toList<any>(settlementsRes);
    const orders = toList<any>(ordersRes);

    const liquidity = wallets.reduce((s, w) => s + num(w.balance), 0);
    const settledOk = settlements.filter((x) => ['settled', 'completed', 'released'].includes(norm(x.status))).length;
    const finalityRatio = settlements.length ? settledOk / settlements.length : 1;
    const fulfilledOrders = orders.filter((o) => ['confirmed', 'delivered', 'completed', 'settled'].includes(norm(o.status))).length;
    const trustRatio = orders.length ? fulfilledOrders / orders.length : 0.7;

    const utilizedAmount = toList<any>(lcRes).reduce((s, l) => s + num(l.amount), 0)
      + toList<any>(finRes).reduce((s, f) => s + num(f.amount), 0);
    const totalLimit = Math.max(Math.ceil(utilizedAmount / 0.4 / 1_000_000) * 1_000_000, 5_000_000);

    // Score model (per the documented weights): 0.4 trust + 0.3 finality + 0.3 liquidity-depth.
    const liquidityDepth = Math.min(liquidity / 5_000_000, 1);
    const composite = 0.4 * trustRatio + 0.3 * finalityRatio + 0.3 * liquidityDepth; // 0..1
    const score = Math.round(550 + composite * 300); // ~550..850
    const rating = score >= 820 ? 'AAA' : score >= 780 ? 'AA' : score >= 740 ? 'A' : score >= 700 ? 'BBB' : score >= 650 ? 'BB' : 'B';
    const delinquencyProb = Math.max(0.001, Math.round((1 - finalityRatio) * 0.05 * 1000) / 1000);

    return {
      companyId,
      rating,
      score,
      totalLimit,
      utilizedAmount,
      availableCredit: totalLimit - utilizedAmount,
      delinquencyProb,
      lastReviewDate: new Date().toISOString(),
    };
  }
}

export const underwritingService = UnderwritingService.getInstance();
