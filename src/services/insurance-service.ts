/**
 * @file src/services/insurance-service.ts
 * @description Authoritative service for Institutional Insurance, Underwriting, and Claims.
 * Orchestrates cargo protection lifecycles and risk transfer finality.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { logger, metricsService } from './observability-service';
import { eventBus } from './event-bus';
import { notificationDispatcher } from './notification-dispatcher';

export type CoverageType = 'basic' | 'standard' | 'premium' | 'marine_cargo' | 'trade_credit';
export type PolicyStatus = 'draft' | 'underwriting' | 'active' | 'expired' | 'cancelled';
export type ClaimStatus = 'submitted' | 'under_review' | 'evidence_required' | 'approved' | 'rejected' | 'settled';

export interface InsurancePolicy {
  id: string;
  shipmentId?: string;
  orderId?: string;
  companyId: string;
  coverage: CoverageType;
  insuredAmount: number;
  premium: number;
  currency: string;
  status: PolicyStatus;
  underwriterId: string;
  validFrom: string;
  validUntil: string;
  createdAt: string;
  [key: string]: any;
}

export interface InsuranceClaim {
  id: string;
  policyId: string;
  shipmentId: string;
  reason: string;
  description: string;
  claimedAmount: number;
  currency: string;
  status: ClaimStatus;
  evidenceRefs: string[];
  arbitrationId?: string;
  createdAt: string;
  [key: string]: any;
}

export const insuranceService = {
  /**
   * Retrieves active policies for an institution.
   */
  async getPolicies(companyId?: string): Promise<InsurancePolicy[]> {
    const params = companyId ? { companyId } : {};
    const res = await apiClient.get<InsurancePolicy[]>('/policies', { ...params, sortBy: 'createdAt', order: 'desc' });
    return toList(res);
  },

  /**
   * Retrieves a single policy by ID.
   */
  async getPolicyById(id: string): Promise<InsurancePolicy | null> {
    const res = await apiClient.getDoc<InsurancePolicy>('/policies', id);
    return res.data;
  },

  /**
   * Initiates a new insurance underwriting workflow.
   */
  async requestPolicy(data: Partial<InsurancePolicy>): Promise<InsurancePolicy> {
    logger.info('InsuranceService', `INITIATING_UNDERWRITING: Shipment ${data.shipmentId || data.orderId}`);
    
    const res = await apiClient.post<InsurancePolicy>('/policies', {
      ...data,
      status: 'underwriting',
      premium: (data.insuredAmount || 0) * 0.005, // Mock baseline premium (0.5%)
      underwriterId: 'BAALVION_RE_01',
      createdAt: new Date().toISOString()
    });

    return res.data!;
  },

  /**
   * Formally authorizes and issues an insurance policy.
   */
  async issuePolicy(id: string): Promise<InsurancePolicy> {
    logger.warn('InsuranceService', `ISSUING_POLICY: Ref ${id} authorized.`);
    
    const res = await apiClient.patch<InsurancePolicy>(`/policies/${id}`, {
      status: 'active',
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 90 * 86400000).toISOString() // 90 day coverage
    });

    eventBus.publish('POLICY_ISSUED' as any, res.data);
    metricsService.recordMetric('insurance_premiums_volume', res.data!.premium);

    return res.data!;
  },

  /**
   * Registers a formal cargo claim against an active policy.
   */
  async fileClaim(data: Omit<InsuranceClaim, 'id' | 'createdAt' | 'status'>): Promise<InsuranceClaim> {
    logger.error('InsuranceService', `CLAIM_INITIATED: Policy ${data.policyId}`, { amount: data.claimedAmount });

    const res = await apiClient.post<InsuranceClaim>('/claims', {
      ...data,
      status: 'submitted',
      createdAt: new Date().toISOString()
    });

    const claim = res.data!;

    // Notify Compliance & Governance
    await notificationDispatcher.dispatch({
      companyId: 'GOV_NODE_MASTER',
      title: 'INSURANCE CLAIM FILED',
      message: `Critical claim of ${claim.currency} ${claim.claimedAmount} filed for Shipment ${claim.shipmentId}.`,
      priority: 'high',
      type: 'compliance'
    });

    eventBus.publish('CLAIM_INITIATED' as any, claim);
    return claim;
  },

  /**
   * Retrieves claims requiring adjudication.
   */
  async getClaims(params: any = {}): Promise<InsuranceClaim[]> {
    const res = await apiClient.get<InsuranceClaim[]>('/claims', { ...params, sortBy: 'createdAt', order: 'desc' });
    return toList(res);
  },

  /**
   * Updates a claim's adjudication status.
   */
  async adjudicateClaim(id: string, status: ClaimStatus, reason?: string): Promise<InsuranceClaim> {
    logger.info('InsuranceService', `CLAIM_ADJUDICATION: ${id} set to ${status}`);
    
    const res = await apiClient.patch<InsuranceClaim>(`/claims/${id}`, {
      status,
      adjudicationNote: reason,
      adjudicatedAt: new Date().toISOString()
    });

    if (status === 'approved') {
      eventBus.publish('CLAIM_APPROVED' as any, res.data);
    }

    return res.data!;
  }
};

export const getPolicyById = (id: string) => insuranceService.getPolicyById(id);
