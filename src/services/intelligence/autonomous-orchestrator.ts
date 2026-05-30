
/**
 * @file src/services/intelligence/autonomous-orchestrator.ts
 * @description Bridges Predictive AI signals with the Platform Workflow Engine.
 * Enables "Intelligent Interventions" and autonomous governance proposals.
 */
import { eventBus } from '../event-bus';
import { logger, metricsService } from '../observability-service';
import { WorkflowEngine } from '@/orchestration/workflow-engine';
import { apiClient } from '@/lib/api-client';
import { USER_ROLES } from '@/core/roles';
import { notificationDispatcher } from '../notification-dispatcher';

class AutonomousOrchestrator {
  private static instance: AutonomousOrchestrator;

  private constructor() {}

  public static getInstance(): AutonomousOrchestrator {
    if (!AutonomousOrchestrator.instance) {
      AutonomousOrchestrator.instance = new AutonomousOrchestrator();
    }
    return AutonomousOrchestrator.instance;
  }

  /**
   * Initializes the AI-to-Workflow integration logic.
   */
  async initialize() {
    logger.info('AI_Orchestrator', 'Initializing Predictive Autonomy Nodes...');

    // 1. SIGNAL: ANOMALY_PATTERN_DETECTED -> PROPOSE_GOVERNANCE_HOLD
    eventBus.subscribe('ANOMALY_PATTERN_DETECTED' as any, async (payload) => {
      await this.handleAnomalyIntervention(payload);
    });

    // 2. SIGNAL: PREDICTIVE_DELAY_ALERT -> PROPOSE_REROUTING
    eventBus.subscribe('PREDICTIVE_DELAY_ALERT_GENERATED' as any, async (payload) => {
      await this.handleDelayRemediation(payload);
    });
  }

  /**
   * Handles high-risk anomalies by proposing a systemic hold.
   */
  private async handleAnomalyIntervention(payload: any) {
    logger.warn('AI_Orchestrator', `ANOMALY_INTERVENTION: Ref ${payload.entityId}`);
    
    // Propose state change via Governance Approval service
    await apiClient.post('/approvals', {
      referenceType: payload.entityType,
      referenceId: payload.entityId,
      status: 'pending',
      requestedBy: 'AI_SENTINEL_V4',
      requiredRole: USER_ROLES.COMPLIANCE_ADMIN,
      reason: `AI_INTERVENTION: ${payload.message}. Pattern matches suspicious trade behavior. Proposing operational hold.`,
      metadata: { aiConfidence: payload.confidenceScore }
    });

    metricsService.recordMetric('ai_interventions_proposed', 1);
  }

  /**
   * Handles predicted delays by suggesting optimized logistics or treasury paths.
   */
  private async handleDelayRemediation(payload: any) {
    if (payload.probability > 0.8 && payload.severity === 'high') {
       await notificationDispatcher.dispatch({
         companyId: 'EXECUTIVE_COMMAND',
         title: 'CRITICAL DELAY FORECASTED',
         message: `AI Forecast: ${payload.message}. Estimated impact: +${payload.estimatedDelayHours}h. Suggest rerouting to alternate hub.`,
         priority: 'high',
         type: 'compliance'
       });
       
       eventBus.publish('AI_ESCALATION_RECOMMENDED' as any, payload);
    }
  }
}

export const autonomousOrchestrator = AutonomousOrchestrator.getInstance();
