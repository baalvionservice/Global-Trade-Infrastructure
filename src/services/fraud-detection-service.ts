/**
 * @file fraud-detection-service.ts
 * @description Autonomous risk intelligence engine that monitors institutional activity for suspicious behavioral patterns.
 */
import { apiClient } from '@/lib/api-client';
import { logger, metricsService } from './observability-service';
import { blacklistEntity } from './sanctions-service';
import { eventBus } from '@/orchestration/event-bus';

export type SignalType = 
  | 'VELOCITY_SPIKE' 
  | 'SETTLEMENT_ANOMALY' 
  | 'CORRIDOR_MISMATCH' 
  | 'IDENTITY_DRIFT';

export const fraudDetectionService = {
  /**
   * Evaluates institutional actions against risk-aware heuristics.
   */
  async analyzeActivity(companyId: string, type: SignalType, metadata: any) {
    logger.info('FraudEngine', `Analyzing signal: ${type} for ${companyId}`);

    // 1. PERSIST THE SIGNAL
    const res = await apiClient.post<any>('/risk_signals', {
      orgId: companyId,
      referenceId: companyId,
      type,
      severity: this.getSeverity(type),
      description: this.getDescription(type, metadata),
      isResolved: false
    });

    // 2. CRITICAL ESCALATION
    if (this.getSeverity(type) === 'critical') {
      logger.error('FraudEngine', `AUTONOMOUS_LOCKDOWN_TRIGGERED: ${companyId}`);
      await blacklistEntity(companyId, `Systemic restriction triggered by autonomous signal: ${type}`);
    }

    metricsService.recordMetric('fraud_signals_generated', 1);
  },

  getSeverity(type: SignalType): 'low' | 'medium' | 'high' | 'critical' {
    switch (type) {
      case 'IDENTITY_DRIFT': return 'critical';
      case 'VELOCITY_SPIKE': return 'high';
      case 'SETTLEMENT_ANOMALY': return 'high';
      case 'CORRIDOR_MISMATCH': return 'medium';
      default: return 'low';
    }
  },

  getDescription(type: SignalType, meta: any): string {
    switch (type) {
      case 'VELOCITY_SPIKE': return `Node exceeded sourcing threshold (Count: ${meta.count} in 1h).`;
      case 'IDENTITY_DRIFT': return `Cryptographic identity mismatch detected during handshake.`;
      case 'CORRIDOR_MISMATCH': return `Trade attempt in restricted jurisdictional corridor.`;
      case 'SETTLEMENT_ANOMALY': return `Recurring escrow funding timeout (Attempts: ${meta.attempts}).`;
      default: return 'Unknown anomaly.';
    }
  }
};

/**
 * Initialize listeners on the global event bus to drive autonomous monitoring.
 */
export function initializeFraudDetection() {
  eventBus.subscribe('RFQ_CREATED', async (event) => {
    // Velocity Check Logic
    const companyId = event.actorId;
    // Mock check: if count > 5, spike
    await fraudDetectionService.analyzeActivity(companyId, 'VELOCITY_SPIKE', { count: 6 });
  });

  eventBus.subscribe('COMPLIANCE_FAILED', async (event) => {
     if (event.payload.code === 'IDENTITY_MISMATCH') {
        await fraudDetectionService.analyzeActivity(event.entityId, 'IDENTITY_DRIFT', {});
     }
  });
}
