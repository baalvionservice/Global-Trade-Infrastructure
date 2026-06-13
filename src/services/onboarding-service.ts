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

/** Payload submitted by a completed public department-onboarding wizard. */
export interface OnboardingApplicationInput {
  department: string;
  organizationName: string;
  legalName?: string;
  contactEmail: string;
  contactName?: string;
  contactPhone?: string;
  jurisdiction?: string;
}

export interface OnboardingApplicationResult {
  applicationId: string;
  reference: string;
  status: string;
  department: string;
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

  /**
   * Public onboarding intake. Submits a completed department-wizard application to
   * the gateway, which creates a `pending` organization for review. No session is
   * required — the applicant has none yet — and access is never granted here.
   */
  async submitApplication(input: OnboardingApplicationInput): Promise<OnboardingApplicationResult> {
    const res = await fetch('/trade-bff/auth/onboarding-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      throw new Error(json?.error?.message || 'Onboarding submission failed');
    }
    return json.data as OnboardingApplicationResult;
  }

  /** Approves a pending application — activates the organization. */
  async approve(companyId: string): Promise<void> {
    await apiClient.post(`/auth/svc/platform/organizations/${companyId}/status`, { status: 'active' });
    await eventBus.publish('IDENTITY_VERIFICATION_UPGRADED' as any, { orgId: companyId, targetLevel: 1 });
  }

  /** Rejects a pending application. Access is never granted. */
  async reject(companyId: string): Promise<void> {
    await apiClient.post(`/auth/svc/platform/organizations/${companyId}/status`, { status: 'rejected' });
  }

  /** Maps an auth-schema org type to a review-queue tenant category. */
  private mapType(type?: string): OnboardingStatus['tenantType'] {
    switch (type) {
      case 'bank': return 'bank';
      case 'customs_authority':
      case 'regulator': return 'government';
      case 'logistics_provider': return 'logistics';
      default: return 'enterprise';
    }
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

  /**
   * Reads the pending-application queue from the authenticated platform admin
   * surface (auth-service /platform/organizations?status=pending, via the gateway
   * /auth/svc passthrough). Each pending org is a submitted onboarding application.
   */
  async getOnboardingQueue(): Promise<OnboardingStatus[]> {
    const res = await apiClient.get<any[]>('/auth/svc/platform/organizations', { status: 'pending', limit: 100 });
    return toList(res).map((org) => ({
      companyId: org.id,
      institutionName: org.legal_name || org.name,
      phase: 'GOVERNANCE_REVIEW',
      progress: 40,
      requirementsMet: ['Application submitted', org.contact_email ? 'Contact verified' : 'Contact pending'],
      pendingActions: ['Document review', 'Compliance screening', 'Final approval'],
      lastUpdate: org.updated_at || org.created_at || new Date().toISOString(),
      tenantType: this.mapType(org.type),
    }));
  }
}

export const onboardingService = OnboardingEngine.getInstance();
