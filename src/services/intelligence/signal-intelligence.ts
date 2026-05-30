
/**
 * @file signal-intelligence.ts
 * @description Sovereign SIGINT engine for global trade signal processing.
 * Correlates geopolitical events with institutional operational health.
 */
import { apiClient } from '@/lib/api-client';
import { logger } from '../observability-service';
import { TradeSignal } from '@/types/institutional';
import { eventBus } from '@/orchestration/event-bus';

class SignalIntelligenceService {
  private static instance: SignalIntelligenceService;

  private constructor() {}

  public static getInstance(): SignalIntelligenceService {
    if (!SignalIntelligenceService.instance) {
      SignalIntelligenceService.instance = new SignalIntelligenceService();
    }
    return SignalIntelligenceService.instance;
  }

  /**
   * Retrieves active geopolitical and operational signals affecting the network.
   */
  async getActiveSignals(): Promise<TradeSignal[]> {
    const res = await apiClient.get<TradeSignal[]>('/trade_signals', { limit: 10 });
    
    // Simulate high-fidelity signals for the strategic observatory
    return res.data || [
      {
        id: 'SIG-8821',
        type: 'GEOPOLITICAL',
        severity: 'high',
        source: 'Sovereign Oracle Alpha',
        message: 'Sudden congestion surge in Shanghai corridor predicted to impact electronics throughput by 14.2%.',
        timestamp: new Date().toISOString(),
        impactScore: 82,
        tags: ['APAC', 'Supply Chain', 'Electronics']
      },
      {
        id: 'SIG-8822',
        type: 'TREASURY',
        severity: 'medium',
        source: 'Treasury Sync Node',
        message: 'USD/INR volatility exceeding institutional baseline. Recommend rate locking for active LCs.',
        timestamp: new Date().toISOString(),
        impactScore: 45,
        tags: ['FX', 'Treasury', 'Liquidity']
      }
    ];
  }

  /**
   * Propagates a strategic signal through the network via the Unified Event Bus.
   */
  async propagateSignal(signal: TradeSignal) {
    logger.warn('SIGINT', `PROPAGATING_SIGNAL: ${signal.type} - Impact: ${signal.impactScore}`);
    
    await eventBus.emit('SIGINT', signal.id, 'GEOPOLITICAL_SIGNAL_PROPAGATED', signal);

    if (signal.severity === 'critical') {
      await apiClient.post('/alerts', {
        type: 'SYSTEMIC_RISK',
        message: `Strategic Signal Alarm: ${signal.message}`,
        severity: 'critical',
        status: 'active'
      });
    }
  }
}

export const sigIntService = SignalIntelligenceService.getInstance();
