/**
 * @file freight-orchestrator.ts
 * @description Authoritative service for Multi-Modal Freight Execution and Carrier Handshakes.
 */
import { apiClient } from '@/lib/api-client';
import { logger, metricsService } from '@/services/observability-service';
import { eventBus } from '@/orchestration/event-bus';
import { FreightMandate, TransportMode } from '../types';

class FreightOrchestrator {
  private static instance: FreightOrchestrator;

  private constructor() {}

  public static getInstance(): FreightOrchestrator {
    if (!FreightOrchestrator.instance) {
      FreightOrchestrator.instance = new FreightOrchestrator();
    }
    return FreightOrchestrator.instance;
  }

  /**
   * Dispatches a new freight mandate to the global logistics mesh.
   */
  async dispatchMandate(data: Partial<FreightMandate>): Promise<FreightMandate> {
    logger.info('FreightOrchestrator', `INITIATING_MANDATE: Order ${data.orderId}`);

    const res = await apiClient.post<FreightMandate>('/logistics_mandates', {
      ...data,
      status: 'BOOKED',
      updatedAt: new Date().toISOString()
    });

    const mandate = res.data!;
    
    await eventBus.publish('SHIPMENT_CREATED', mandate);
    metricsService.recordMetric('freight_mandates_dispatched', 1);

    return mandate;
  }

  /**
   * Executes an intermodal handoff between two transport carriers.
   */
  async executeHandoff(mandateId: string, fromCarrier: string, toCarrier: string, location: string) {
    logger.warn('FreightOrchestrator', `INTERMODAL_HANDOFF: ${fromCarrier} -> ${toCarrier} at ${location}`);

    // The handoff signature is a cryptographic chain-of-custody proof owned by
    // the logistics backend. The client does not fabricate it.
    await apiClient.patch(`/logistics_mandates/${mandateId}`, {
      carrierId: toCarrier,
      lastLocation: location,
      updatedAt: new Date().toISOString()
    });

    await eventBus.publish('WORKFLOW_STEP_COMPLETED', {
      domain: 'LOGISTICS',
      entityId: mandateId,
      action: 'INTERMODAL_HANDOFF',
      payload: { fromCarrier, toCarrier }
    });
  }
}

export const freightOrchestrator = FreightOrchestrator.getInstance();
