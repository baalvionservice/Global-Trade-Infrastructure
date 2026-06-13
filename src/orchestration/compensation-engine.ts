/**
 * @file compensation-engine.ts
 * @description Institutional-grade failure recovery and rollback orchestrator.
 */
import { logger, metricsService } from '@/services/observability-service';
import { eventBus } from './event-bus';
import { apiClient } from '@/lib/api-client';

class CompensationEngine {
  private static instance: CompensationEngine;

  private constructor() {}

  public static getInstance(): CompensationEngine {
    if (!CompensationEngine.instance) {
      CompensationEngine.instance = new CompensationEngine();
    }
    return CompensationEngine.instance;
  }

  /**
   * Executes compensation logic for a failed workflow transaction.
   */
  async compensate(domain: string, entityId: string, reason: string) {
    logger.error('CompensationEngine', `RECOVERY_PROTOCOL_INITIATED: ${domain} failure for ${entityId}. Reason: ${reason}`);

    // Map domain failures to specific recovery actions
    switch (domain) {
      case 'FINANCIAL':
        await this.rollbackTreasuryLock(entityId);
        break;
      case 'LOGISTICS':
        await this.handleTransitFailure(entityId);
        break;
      case 'EXECUTION':
        await this.revertOrderState(entityId);
        break;
    }

    await eventBus.publish('COMPENSATION_TRIGGERED', { domain, entityId, reason });
    metricsService.recordMetric('system_compensations_total', 1);
  }

  private async rollbackTreasuryLock(escrowId: string) {
    logger.warn('CompensationEngine', `TREASURY_REVERSAL: Ref ${escrowId}`);
    // Logic to release blocked liquidity nodes
    await apiClient.patch(`/escrows/${escrowId}`, { status: 'refunded' });
  }

  private async handleTransitFailure(shipmentId: string) {
    logger.warn('CompensationEngine', `LOGISTICS_CONTAINMENT: Isolating node ${shipmentId}`);
    await apiClient.patch(`/shipments/${shipmentId}`, { status: 'customs_hold' });
  }

  private async revertOrderState(orderId: string) {
    // Order lifecycle moved to the GTOS order-execution-service: it is a forward-only saga with
    // NO client status PATCH (the legacy PATCH /orders/:id now 410s). Order cancellation is
    // driven by compensation events the saga consumes, not a direct mutation. Best-effort log so
    // a missing cancel path never rejects the compensation chain.
    logger.warn('CompensationEngine', `ORDER_REVERSAL (saga-driven): ${orderId} — emitting compensation signal`);
    try {
      eventBus.publish('ORDER_COMPENSATION_REQUESTED', { orderId });
    } catch (e) {
      logger.warn('CompensationEngine', `Order reversal signal failed: ${(e as Error).message}`);
    }
  }
}

export const compensationEngine = CompensationEngine.getInstance();
