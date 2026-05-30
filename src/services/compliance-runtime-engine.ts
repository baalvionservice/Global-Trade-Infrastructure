/**
 * @file compliance-runtime-engine.ts
 * @description THE BAALVION LEGAL RUNTIME. 
 * Active execution engine that enforces jurisdictional law in real-time.
 */
import { apiClient } from '@/lib/api-client';
import { logger, metricsService, loggingService } from './observability-service';
import { governanceService, PolicyEvaluationResult } from './governance-service';
import { UserRole } from '@/core/roles';
import { eventBus } from '@/orchestration/event-bus';

class ComplianceRuntimeEngine {
  private static instance: ComplianceRuntimeEngine;

  private constructor() {}

  public static getInstance(): ComplianceRuntimeEngine {
    if (!ComplianceRuntimeEngine.instance) {
      ComplianceRuntimeEngine.instance = new ComplianceRuntimeEngine();
    }
    return ComplianceRuntimeEngine.instance;
  }

  /**
   * Executes a real-time legal validation check before any state transition.
   * This is the "Perimeter Guard" of the Global Trade OS.
   */
  async validateExecution(data: {
    domain: string;
    entityId: string;
    action: string;
    actorRole: UserRole;
    context: any;
  }): Promise<PolicyEvaluationResult> {
    logger.info('ComplianceRuntime', `LEGAL_PRE_CHECK: ${data.action} on ${data.entityId}`);

    // 1. Evaluate against the Global Policy Rulebase
    const evaluation = await governanceService.evaluateAction(data.actorRole, data.action, data.context);

    // 2. Log Decision for Forensic Audit
    await this.logLegalDecision(data, evaluation);

    if (!evaluation.allowed) {
      logger.error('ComplianceRuntime', `EXECUTION_BLOCKED_BY_LAW: ${data.action} denied for ${data.entityId}`, { reason: evaluation.reason });
      metricsService.recordMetric('compliance_blocks_total', 1);
      
      // Raise System Alert if severity is critical
      if (evaluation.severity === 'critical') {
        await eventBus.publish('COMPLIANCE_FAILED' as any, { 
          entityId: data.entityId, 
          reason: evaluation.reason 
        });
      }
    } else {
      metricsService.recordMetric('compliance_approvals_total', 1);
    }

    return evaluation;
  }

  /**
   * Records the legal decision reasoning in the immutable forensic log.
   */
  private async logLegalDecision(data: any, result: PolicyEvaluationResult) {
    await loggingService.forensicLog(
      'ComplianceRuntime',
      'LEGAL_DECISION_RECORDED',
      `Decision for ${data.action}: ${result.allowed ? 'APPROVED' : 'BLOCKED'}. Reasoning: ${result.reason || 'Sovereign Match'}`,
      data.actorId || 'SYSTEM_ORACLE',
      data.context.tenantId || 'GLOBAL',
      {
        result,
        lawVersion: '4.2.0-STABLE',
        jurisdiction: data.context.jurisdiction || 'GLOBAL'
      }
    );
  }
}

export const complianceRuntimeEngine = ComplianceRuntimeEngine.getInstance();
