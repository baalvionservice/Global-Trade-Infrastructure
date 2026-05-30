
/**
 * @file treasury-service.ts
 * @description Manages institutional liquidity, cash positioning, and FX exposure across the Baalvion network.
 */
import { apiClient } from '@/lib/api-client';
import { TreasuryPosition } from '@/types/institutional';

export const treasuryService = {
  /**
   * Retrieves aggregated cash positioning across currency nodes.
   */
  async getLiquidityPositions(): Promise<TreasuryPosition[]> {
    const res = await apiClient.get<any[]>('/wallets');
    const wallets = res.data || [];

    const positions: Record<string, TreasuryPosition> = {};

    wallets.forEach(w => {
      if (!positions[w.currency]) {
        positions[w.currency] = {
          currency: w.currency,
          totalBalance: 0,
          escrowLocked: 0,
          availableLiquidity: 0,
          forecastedInflow: 0
        } as any;
      }
      positions[w.currency].totalBalance += w.balance;
      positions[w.currency].escrowLocked += w.escrow;
      positions[w.currency].availableLiquidity = positions[w.currency].totalBalance - positions[w.currency].escrowLocked;
    });

    return Object.values(positions);
  },

  /**
   * Calculates corridor-specific FX exposure.
   */
  async getFXExposure() {
    return [
      { corridor: 'USD/INR', exposure: 12400000, risk: 'medium' },
      { corridor: 'EUR/USD', exposure: 8500000, risk: 'low' },
      { corridor: 'USD/CNY', exposure: 4200000, risk: 'high' }
    ];
  }
};
