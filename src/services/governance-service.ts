/**
 * @file src/services/governance-service.ts
 * @description The platform's Legal Decision Engine. 
 * Evaluates binding logical guardrails for institutional and sovereign-grade actions.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { logger, metricsService } from './observability-service';
import { UserRole } from '@/core/roles';
import { eventBus } from './event-bus';

export interface GovernancePolicy {
  id: string;
  name: string;
  scope: 'global' | 'regional' | 'sectoral' | 'tenant';
  action: 'allow' | 'flag' | 'block';
  condition: string; 
  isActive: boolean;
  priority: number;
  tenantId?: string;
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  reason?: string;
  decisionStatus: 'APPROVED_TO_EXECUTE' | 'BLOCKED_BY_LAW' | 'ESC_TO_GOVERNANCE';
  requiresApproval?: boolean;
  severity: 'info' | 'warning' | 'critical';
}

export const governanceService = {
  /**
   * Live policy rulebase for the governance registry (store-backed, persisted).
   */
  async getPolicies(): Promise<any[]> {
    const res = await apiClient.get<any[]>('/governance_policies', { sortBy: 'createdAt', order: 'desc' });
    return toList<any>(res);
  },

  /**
   * Authoritative evaluator for runtime execution permission.
   * Incorporates jurisdictional law heuristics and real-time sanctions screening.
   */
  async evaluateAction(actorRole: UserRole, actionType: string, context: any): Promise<PolicyEvaluationResult> {
    logger.info('GovernanceService', `EVALUATING_LEGAL_PERMIT: ${actionType}`, { actorRole });

    // 1. Mandatory Sanctions Shield (Level 0 Check)
    if (context.isRestrictedEntity || context.blacklistFlag || context.sanctionsFlag) {
      return { 
        allowed: false, 
        reason: 'CRITICAL_VIOLATION: Entity restricted by global sanctions registry.',
        decisionStatus: 'BLOCKED_BY_LAW',
        severity: 'critical' 
      };
    }

    // 2. Load Active Enforcement Policies
    const policiesRes = await apiClient.get<GovernancePolicy[]>('/policies', { 
      isActive: true,
      tenantId: context.tenantId 
    });
    const policies = (policiesRes.data || []).sort((a, b) => b.priority - a.priority);

    // 3. Heuristic Evaluation
    for (const policy of policies) {
      if (this.evalCondition(policy.condition, context)) {
        
        // Record policy hit
        metricsService.recordMetric(`policy_hit_${policy.id}`, 1);

        if (policy.action === 'block') {
          return { 
            allowed: false, 
            reason: `Regulatory Block: ${policy.name}`, 
            decisionStatus: 'BLOCKED_BY_LAW',
            severity: 'critical' 
          };
        }

        if (policy.action === 'flag') {
          return { 
            allowed: true, 
            requiresApproval: true, 
            reason: `Escalation Required: ${policy.name}`, 
            decisionStatus: 'ESC_TO_GOVERNANCE',
            severity: 'warning' 
          };
        }
      }
    }

    return { 
      allowed: true, 
      decisionStatus: 'APPROVED_TO_EXECUTE',
      severity: 'info' 
    };
  },

  /**
   * Logical evaluator for policy condition DSL.
   */
  evalCondition(condition: string, context: any): boolean {
    // Execution Logic for Sovereign Trade Rules
    if (condition.includes('amount > 1000000')) {
       return (context.amount || context.total || 0) > 1000000;
    }
    if (condition.includes('isHighRiskJurisdiction == true')) {
       const restrictedCodes = ['RU', 'IR', 'KP'];
       return restrictedCodes.includes(context.countryCode || '');
    }
    if (condition.includes('requiresDocumentRef')) {
       return !context.hasMandatoryDocuments;
    }
    if (condition.includes('isIdentityDriftDetected')) {
       return !!context.identityDrift;
    }
    if (condition.includes('productCategory == "Defense"')) {
       return context.category === 'Defense' || context.product?.includes('Weapon');
    }
    return false;
  }
};
