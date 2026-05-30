/**
 * @file civilization-orchestrator.ts
 * @description THE SUPREME NERVOUS SYSTEM.
 * Orchestrates cross-domain institutional mandates with absolute finality.
 */
import { sgek } from './single-kernel';
import { eventBus } from './event-bus';
import { logger, metricsService } from '@/services/observability-service';
import { UserRole, USER_ROLES } from '@/core/roles';
import { governanceService } from '@/services/governance-service';

export type MissionType = 'TRADE_EXECUTION' | 'SYSTEMIC_REBALANCE' | 'CRISIS_CONTAINMENT';

class CivilizationOrchestrator {
  private static instance: CivilizationOrchestrator;

  private constructor() {
    this.initializeSubscribers();
  }

  public static getInstance(): CivilizationOrchestrator {
    if (!CivilizationOrchestrator.instance) {
      CivilizationOrchestrator.instance = new CivilizationOrchestrator();
    }
    return CivilizationOrchestrator.instance;
  }

  private initializeSubscribers() {
    logger.info('CivilizationOrchestrator', 'Primary Nervous System Activated.');

    // 1. COMMERCE -> FINANCE HANDSHAKE
    eventBus.subscribe('NEGOTIATION_FINALIZED', async (event: any) => {
      await this.initiateTreasuryStaging(event.payload);
    });

    // 2. FINANCE -> LOGISTICS HANDSHAKE
    eventBus.subscribe('ESCROW_LOCKED', async (event: any) => {
      await this.activateLogisticsCorridor(event.payload);
    });

    // 3. LOGISTICS -> SETTLEMENT FINALITY
    eventBus.subscribe('DELIVERY_CONFIRMED', async (event: any) => {
      await this.executeFinalSettlement(event.payload);
    });
  }

  /**
   * Executes a high-authority Strategic Mission.
   */
  async dispatchMission(type: MissionType, payload: any, actorId: string, role: UserRole) {
    logger.warn('Civilization_Command', `DISPATCHING_STRATEGIC_MISSION: ${type}`, { actorId });

    // 1. Constitutional Gating
    const permit = await governanceService.evaluateAction(role, type, payload);
    if (!permit.allowed) {
      logger.error('Civilization_Command', `MISSION_DENIED_BY_CONSTITUTION: ${permit.reason}`);
      throw new Error(`GOVERNANCE_DENIAL: ${permit.reason}`);
    }

    // 2. Mission Orchestration
    const missionId = `MSN-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    await eventBus.publish({
      id: missionId,
      type: 'MISSION_INITIALIZED',
      severity: 'INFO',
      payload: { ...payload, missionId, missionType: type },
      source: 'ORCHESTRATOR',
      timestamp: new Date().toISOString(),
      correlationId: missionId
    });

    metricsService.recordMetric('strategic_missions_dispatched', 1);

    return { missionId, status: 'STAGED_FOR_EXECUTION' };
  }

  private async initiateTreasuryStaging(deal: any) {
    logger.info('CivilizationOrchestrator', `SAGA_STEP: Staging Treasury for Deal ${deal.id}`);
    await sgek.execute({
      domain: 'FINANCIAL',
      entityId: `ESC-${deal.id}`,
      action: 'PROVISION_VAULT',
      from: 'DRAFT',
      to: 'CREATED',
      actorToken: 'SYSTEM_AUTONOMY_TOKEN',
      payload: { amount: deal.totalValue, currency: deal.currency, orderId: deal.id }
    });
  }

  private async activateLogisticsCorridor(escrow: any) {
    logger.info('CivilizationOrchestrator', `SAGA_STEP: Activating Corridor for Order ${escrow.orderId}`);
    await sgek.execute({
      domain: 'LOGISTICS',
      entityId: `SHP-${escrow.orderId}`,
      action: 'BOOK_FREIGHT',
      from: 'DRAFT',
      to: 'BOOKED',
      actorToken: 'SYSTEM_AUTONOMY_TOKEN',
      payload: { orderId: escrow.orderId, carrier: 'CAR_MAERSK_001' }
    });
  }

  private async executeFinalSettlement(shipment: any) {
    logger.warn('CivilizationOrchestrator', `SAGA_FINALITY: Executing Settlement for Order ${shipment.orderId}`);
    await sgek.execute({
      domain: 'FINANCIAL',
      entityId: `ESC-${shipment.orderId}`,
      action: 'RELEASE_FINAL_SETTLEMENT',
      from: 'LOCKED',
      to: 'RELEASED',
      actorToken: 'SYSTEM_AUTONOMY_TOKEN',
      payload: { orderId: shipment.orderId }
    });
  }
}

export const civilizationOrchestrator = CivilizationOrchestrator.getInstance();
