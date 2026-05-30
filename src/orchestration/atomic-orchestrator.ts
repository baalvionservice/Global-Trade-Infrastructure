/**
 * @file atomic-orchestrator.ts
 * @description THE CROSS-DOMAIN ORCHESTRATION FABRIC.
 * Bridges Treasury, Logistics, Compliance, and Sourcing into atomic execution sagas.
 */
import { sgek } from './single-kernel';
import { eventBus } from './event-bus';
import { logger, metricsService } from '@/services/observability-service';
import { UserRole, USER_ROLES } from '@/core/roles';

class AtomicOrchestrator {
  private static instance: AtomicOrchestrator;

  private constructor() {
    this.initializeSubscribers();
  }

  public static getInstance(): AtomicOrchestrator {
    if (!AtomicOrchestrator.instance) {
      AtomicOrchestrator.instance = new AtomicOrchestrator();
    }
    return AtomicOrchestrator.instance;
  }

  private initializeSubscribers() {
    logger.info('AtomicOrchestrator', 'Primary Nervous System Activated.');

    // 1. SOURCING AWARDED -> AUTO_INITIATE_NEGOTIATION
    eventBus.subscribe('SOURCING_AWARDED', async (event: any) => {
      await this.initiateNegotiationHandshake(event.payload);
    });

    // 2. ESCROW_FUNDED -> AUTO_DISPATCH_LOGISTICS
    eventBus.subscribe('ESCROW_FUNDED', async (event: any) => {
      await this.initiateLogisticsProvisioning(event.payload);
    });

    // 3. DELIVERY_CONFIRMED -> AUTO_SETTLEMENT_RELEASE
    eventBus.subscribe('DELIVERY_CONFIRMED', async (event: any) => {
      await this.initiateCapitalRelease(event.payload);
    });
  }

  /**
   * Transition: Sourcing -> Negotiation
   */
  private async initiateNegotiationHandshake(rfq: any) {
    logger.info('AtomicOrchestrator', `SAGA_STEP: Sourcing -> Negotiation [RFQ: ${rfq.id}]`);
    
    await sgek.execute({
      domain: 'NEGOTIATION',
      entityId: `DEAL-${rfq.id.split('-')[1]}`,
      action: 'INITIALIZE',
      from: 'DRAFT',
      to: 'ACTIVE',
      actorToken: 'SYSTEM_AUTONOMY_TOKEN',
      payload: { rfqId: rfq.id, buyerId: rfq.orgId, sellerId: rfq.awardedSellerId }
    });
  }

  /**
   * Transition: Treasury -> Logistics
   */
  private async initiateLogisticsProvisioning(escrow: any) {
    logger.info('AtomicOrchestrator', `SAGA_STEP: Treasury -> Logistics [Order: ${escrow.orderId}]`);
    
    await sgek.execute({
      domain: 'LOGISTICS',
      entityId: `SHP-${escrow.orderId.split('-')[1]}`,
      action: 'PROVISION_CARGO_NODE',
      from: 'BOOKED',
      to: 'PICKED_UP',
      actorToken: 'SYSTEM_AUTONOMY_TOKEN',
      payload: { orderId: escrow.orderId, carrierId: 'MAERSK_A1' }
    });
  }

  /**
   * Transition: Logistics -> Settlement
   */
  private async initiateCapitalRelease(shipment: any) {
    logger.warn('AtomicOrchestrator', `SAGA_FINALITY: Logistics -> Settlement [Shipment: ${shipment.id}]`);
    
    await sgek.execute({
      domain: 'SETTLEMENT',
      entityId: `ESC-${shipment.orderId.split('-')[1]}`,
      action: 'RELEASE_FINAL_SETTLEMENT',
      from: 'LOCKED',
      to: 'RELEASED',
      actorToken: 'SYSTEM_AUTONOMY_TOKEN',
      payload: { orderId: shipment.orderId }
    });
  }
}

export const atomicOrchestrator = AtomicOrchestrator.getInstance();