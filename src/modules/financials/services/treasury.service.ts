/**
 * @file treasury.service.ts
 * @description High-scale Treasury Service for Cash Positioning, FX Orchestration, and Liquidity Calibration.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { WalletNode, TreasuryKPI, FinancialLog } from '../types/financial.types';
import { logger, metricsService } from '@/services/observability-service';
import { eventBus } from '@/orchestration/event-bus';

class TreasuryService {
  private static instance: TreasuryService;

  private constructor() {}

  public static getInstance(): TreasuryService {
    if (!TreasuryService.instance) {
      TreasuryService.instance = new TreasuryService();
    }
    return TreasuryService.instance;
  }

  /**
   * Retrieves aggregated cash positioning across currency nodes for a specific institution.
   */
  async getCashPosition(companyId: string = 'COMP-101'): Promise<WalletNode[]> {
    const res = await apiClient.get<any[]>('/wallets', { companyId });
    return toList(res).map(w => ({
      id: w.id,
      currency: w.currency as any,
      balance: w.balance,
      escrowLocked: w.escrow || 0,
      availableLiquidity: w.balance - (w.escrow || 0),
      jurisdiction: w.country || 'Global Node',
      lastSync: w.updatedAt || new Date().toISOString(),
      trustScore: w.nodeTrust || 98
    }));
  }

  /**
   * Real treasury intelligence pulse, computed from live wallets, settlements, the invoice-financing
   * book, and measured platform telemetry (/system/pulse) — no hardcoded figures.
   */
  async getTreasuryKPIs(): Promise<TreasuryKPI[]> {
    const num = (v: any) => Number(v) || 0;
    const [walletsRes, settlementsRes, finRes, pulseRes] = await Promise.all([
      apiClient.get<any[]>('/wallets').catch(() => null),
      apiClient.get<any[]>('/settlements').catch(() => null),
      apiClient.get<any[]>('/invoice_financing').catch(() => null),
      apiClient.get<any>('/system/pulse').catch(() => null),
    ]);
    const wallets = toList<any>(walletsRes);
    const settlements = toList<any>(settlementsRes);
    const financing = toList<any>(finRes);
    const pulse = (pulseRes as any)?.data ?? pulseRes ?? null;

    const compact = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(n);
    const totalLiquidity = wallets.reduce((s, w) => s + num(w.balance), 0);
    const fxExposure = wallets.filter((w) => String(w.currency || 'USD').toUpperCase() !== 'USD').reduce((s, w) => s + num(w.balance), 0);
    const settledOk = settlements.filter((x) => ['settled', 'completed', 'released'].includes(String(x.status || '').toLowerCase())).length;
    const finalityLatency = pulse ? `${num(pulse.finalityDelay)}ms` : '—';
    const rates = financing.map((f) => num(f.feeRate)).filter((r) => r > 0);
    const avgYield = rates.length ? Math.round((rates.reduce((s, r) => s + r, 0) / rates.length) * 1000) / 10 : 0;

    return [
      { label: 'Network Depth', value: compact(totalLiquidity), delta: `${wallets.length} nodes`, status: 'optimal', category: 'LIQUIDITY' },
      { label: 'Settlement Velocity', value: finalityLatency, delta: `${settledOk} settled`, status: 'optimal', category: 'SETTLEMENT' },
      { label: 'FX Exposure', value: compact(fxExposure), delta: `${wallets.filter((w) => String(w.currency || 'USD').toUpperCase() !== 'USD').length} corridors`, status: fxExposure > totalLiquidity * 0.5 ? 'warning' : 'optimal', category: 'EXPOSURE' },
      { label: 'Avg Finance Yield', value: `${avgYield}%`, delta: `${financing.length} facilities`, status: 'optimal', category: 'YIELD' },
    ];
  }

  /**
   * Orchestrates an autonomous liquidity rebalancing directive.
   */
  async rebalanceLiquidity(sourceNodeId: string, targetNodeId: string, amount: number, currency: string) {
    logger.warn('Treasury_Command', `INITIATING_REBALANCE: From ${sourceNodeId} to ${targetNodeId}`, { amount, currency });
    
    // In production, this triggers a sovereign bank-to-bank settlement saga via Temporal
    await apiClient.post('/ledger_entries', {
      type: 'TRANSFER',
      amount,
      currency,
      referenceType: 'treasury',
      referenceId: `REB-${Date.now()}`,
      description: 'Autonomous Liquidity Rebalancing: Corridor Optimization'
    });

    metricsService.recordMetric('treasury_rebalances_total', 1);
    eventBus.publish('TREASURY_OPTIMIZATION_EXECUTED' as any, { sourceNodeId, targetNodeId, amount });
  }

  async getLedger(companyId: string = 'COMP-101', limit = 20): Promise<FinancialLog[]> {
    const res = await apiClient.get<any[]>('/ledger_entries', { 
      companyId, 
      limit, 
      sortBy: 'createdAt', 
      order: 'desc' 
    });
    return toList(res).map(l => ({
      id: l.id,
      type: l.type.toUpperCase() as any,
      amount: l.amount,
      currency: l.currency as any,
      referenceId: l.referenceId,
      actor: l.companyId,
      timestamp: l.createdAt
    }));
  }
}

export const treasuryService = TreasuryService.getInstance();
