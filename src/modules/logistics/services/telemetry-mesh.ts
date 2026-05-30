/**
 * @file telemetry-mesh.ts
 * @description Operational Telemetry Service for high-frequency IoT sensor ingestion.
 */
import { apiClient } from '@/lib/api-client';
import { logger, metricsService } from '@/services/observability-service';
import { eventBus } from '@/orchestration/event-bus';
import { LogisticsTelemetryBurst } from '../types';

class TelemetryMeshService {
  private static instance: TelemetryMeshService;

  private constructor() {}

  public static getInstance(): TelemetryMeshService {
    if (!TelemetryMeshService.instance) {
      TelemetryMeshService.instance = new TelemetryMeshService();
    }
    return TelemetryMeshService.instance;
  }

  /**
   * Ingests a raw sensor burst from a freight node.
   */
  async ingestBurst(burst: LogisticsTelemetryBurst) {
    logger.info('TelemetryMesh', `INGESTING_BURST: Node ${burst.nodeId}`);

    // Check for systemic anomalies (e.g., seal compromise)
    if (burst.sealState === 'COMPROMISED') {
      await this.handleCriticalAnomaly(burst);
    }

    metricsService.recordMetric('iot_signals_ingested_total', 1);
    
    // Update local digital twin state
    await eventBus.publish('SHIPMENT_UPDATED', {
      id: burst.nodeId,
      lastTelemetry: burst,
      updatedAt: new Date().toISOString()
    });
  }

  private async handleCriticalAnomaly(burst: LogisticsTelemetryBurst) {
    logger.error('TelemetryMesh', `CRITICAL_SECURITY_BREACH: Node ${burst.nodeId} Seal Compromised.`);
    
    await eventBus.publish('SIGNAL_ANOMALY_DETECTED', {
      entityId: burst.nodeId,
      type: 'SECURITY_BREACH',
      severity: 'critical',
      message: 'Container seal integrity compromised in high-risk corridor.'
    });

    metricsService.recordMetric('security_breaches_detected', 1);
  }
}

export const telemetryMesh = TelemetryMeshService.getInstance();
