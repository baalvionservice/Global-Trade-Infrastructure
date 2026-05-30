/**
 * @file onboarding-service.ts
 * @description GLOBAL INSTITUTIONAL ONBOARDING ENGINE. 
 * Orchestrates the phased adoption of global enterprise tenants from Lead to Live Node.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { eventBus } from '@/orchestration/event-bus';

export type OnboardingPhase = 
  | 'LEAD_ACQUISITION' 
  | 'DISCOVERY'
  | 'LEGAL_ALIGNMENT'
  | 'TECHNICAL_ASSESSMENT'
  | 'SANDBOX_INTEGRATION' 
  | 'PILOT_EXECUTION' 
  | 'GOVERNANCE_REVIEW' 
  | 'PRODUCTION_ROLLOUT' 
  | 'LIVE_ACTIVATION';

export interface OnboardingStatus {
  companyId: string;
  institutionName: string;
  phase: OnboardingPhase;
  progress: number; // 0-100
  requirementsMet: string[];
  pendingActions: string[];
  lastUpdate: string;
  tenantType: 'bank' | 'enterprise' | 'government' | 'logistics';
}

class OnboardingEngine {
  private static instance: OnboardingEngine;

  private constructor() {}

  public static getInstance(): OnboardingEngine {
    if (!OnboardingEngine.instance) {
      OnboardingEngine.instance = new OnboardingEngine();
    }
    return OnboardingEngine.instance;
  }

  /**
   * Advances an institution through the global onboarding pipeline.
   */
  async advancePhase(companyId: string, targetPhase: OnboardingPhase): Promise<OnboardingStatus> {
    const res = await apiClient.patch<OnboardingStatus>(`/organizations/${companyId}`, {
      onboardingPhase: targetPhase,
      onboardingProgress: this.calculateProgress(targetPhase),
      updatedAt: new Date().toISOString()
    });

    const status = res.data!;
    await eventBus.publish('IDENTITY_VERIFICATION_UPGRADED' as any, { orgId: companyId, targetLevel: 1 });

    return status;
  }

  private calculateProgress(phase: OnboardingPhase): number {
    const phases: OnboardingPhase[] = [
      'LEAD_ACQUISITION', 
      'DISCOVERY',
      'LEGAL_ALIGNMENT',
      'TECHNICAL_ASSESSMENT',
      'SANDBOX_INTEGRATION', 
      'PILOT_EXECUTION', 
      'GOVERNANCE_REVIEW', 
      'PRODUCTION_ROLLOUT', 
      'LIVE_ACTIVATION'
    ];
    return Math.round(((phases.indexOf(phase) + 1) / phases.length) * 100);
  }

  async getOnboardingQueue(): Promise<OnboardingStatus[]> {
    const res = await apiClient.get<any[]>('/organizations', { status: 'pending' });
    return toList(res).map(org => ({
      companyId: org.id,
      institutionName: org.name,
      phase: org.onboardingPhase || 'LEAD_ACQUISITION',
      progress: org.onboardingProgress || 20,
      requirementsMet: org.requirementsMet || ['Initial Inquiry'],
      pendingActions: org.pendingActions || ['Legal KYC Review'],
      lastUpdate: org.updatedAt || new Date().toISOString(),
      tenantType: org.type || 'enterprise'
    }));
  }
}

export const onboardingService = OnboardingEngine.getInstance();
