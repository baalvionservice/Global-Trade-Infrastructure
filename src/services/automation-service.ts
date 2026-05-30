/**
 * @file automation-service.ts
 * @description Centralized process automation and trigger engine.
 */
import { eventBus } from '@/orchestration/event-bus';
import { workflowEngine } from '@/orchestration/workflow-engine';
import { logger, metricsService } from './observability-service';
import { USER_ROLES } from '@/core/roles';

class AutomationService {
  private static instance: AutomationService;

  private constructor() {
    this.initializeSentinels();
  }

  public static getInstance(): AutomationService {
    if (!AutomationService.instance) {
      AutomationService.instance = new AutomationService();
    }
    return AutomationService.instance;
  }

  private initializeSentinels() {
    logger.info('AutomationEngine', 'Activating Sovereign Workflow Sentinels...');

    // 1. AUTO-CLEARANCE: DOCUMENT_VERIFIED -> RELEASE_CARGO
    eventBus.subscribe('DOCUMENT_VERIFIED', async (event: any) => {
      if (event.payload.type === 'customs_release') {
        await workflowEngine.transition({
          domain: 'LOGISTICS',
          entityId: event.payload.referenceId,
          from: 'CUSTOMS_CLEARANCE' as any,
          to: 'RELEASED' as any,
          actorId: 'AUTO_ORACLE',
          actorRole: USER_ROLES.SUPER_ADMIN
        });
        metricsService.recordMetric('autonomous_clearances_total', 1);
      }
    });

    // 2. AUTO-SETTLEMENT: DELIVERY_CONFIRMED -> STAGE_PAYMENT
    eventBus.subscribe('DELIVERY_CONFIRMED', async (event: any) => {
      logger.info('AutomationEngine', `AUTO_TRIGGER: Delivery verified. Staging payment release for ${event.payload.id}`);
      // Find linked escrow and prepare for release
    });

    // 3. ANOMALY DETECTION: SIGNAL_ANOMALY -> TRIGGER_ESCALATION
    eventBus.subscribe('SIGNAL_ANOMALY_DETECTED', async (event: any) => {
       logger.error('AutomationEngine', `CRITICAL_ANOMALY: Escalating entity ${event.payload.entityId} to War Room.`);
       await eventBus.publish('POLICY_VIOLATION_DETECTED', {
         entityId: event.payload.entityId,
         severity: 'CRITICAL',
         reason: 'AI_ANOMALY_DETECTION'
       });
    });
  }
}

export const automationService = AutomationService.getInstance();
