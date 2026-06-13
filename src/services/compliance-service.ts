
/**
 * @file compliance-service.ts
 * @description Institutional Compliance Engine with tiered verification and governance-gated KYC.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { logger } from './observability-service';
import { approvalService } from './approval-service';
import { USER_ROLES } from '@/app/(dashboard)/_components/app-state';
import { resolveSessionOrgId, requireSessionOrgId } from './session-org';

export type KYCStatus = 'not_started' | 'pending' | 'verified' | 'rejected';
export type { RiskLevel } from '@/types/institutional';

export interface KYCApplication {
  id: string;
  institutionName: string;
  status: KYCStatus;
  riskLevel: 'low' | 'medium' | 'high';
  submittedAt: string;
  reviewedAt?: string;
  documents: string[];
}

export const complianceService = {
  /**
   * Submits institutional documentation and initializes a governance approval request.
   */
  async submitKYC(data: { companyId: string; documentType: string; fileName: string }): Promise<void> {
    logger.info('ComplianceService', `Initializing KYC audit for ${data.companyId}`);

    // 1. Record the verification attempt
    const res = await apiClient.post<any>('/verification_requests', {
      ...data,
      status: 'pending',
      uploadedAt: new Date().toISOString()
    });

    const application = res.data!;

    // 2. Gate via Governance Approval Service
    await approvalService.createRequest({
      referenceType: 'kyc',
      referenceId: data.companyId,
      requestedBy: 'SYSTEM_IDENTITY',
      requiredRole: USER_ROLES.COMPLIANCE_ADMIN,
      reason: `Institutional KYC verification for node ${data.companyId}. Document: ${data.documentType}`,
      metadata: { applicationRef: application.id }
    });

    // 3. Update company record to show pending status
    await apiClient.patch(`/organizations/${data.companyId}`, { 
      verificationStatus: 'pending',
      status: 'pending' 
    });
  },

  async getKYCStatus(companyId: string): Promise<KYCStatus> {
    const res = await apiClient.get<any>(`/organizations/${companyId}`);
    return res.data?.verificationStatus || 'not_started';
  },

  /**
   * Calculates a real-time AML risk score (0-100).
   */
  async calculateRisk(companyId: string): Promise<number> {
    const companyRes = await apiClient.get<any>(`/organizations/${companyId}`);
    const company = companyRes.data;
    if (!company) return 50;

    let score = 10; // Baseline trust
    if (company.verificationStatus === 'verified') score += 50;
    if (company.sanctionsFlag) score = 100; // Critical risk
    
    return Math.min(100, score);
  }
};

/**
 * Legacy support for older components
 */
export async function getKYCStatus() {
  const orgId = await resolveSessionOrgId();
  if (!orgId) return 'not_started';
  const res = await apiClient.get<any>(`/organizations/${orgId}`);
  return res.data?.verificationStatus || 'not_started';
}

export async function submitKYC(payload: any) {
  // KYC mutates the org record — must target the authenticated org, never a fixed demo tenant.
  const companyId = await requireSessionOrgId();
  return complianceService.submitKYC({
    companyId,
    documentType: payload.type || 'Identity Proof',
    fileName: payload.fileName || 'institutional_identity.pdf'
  });
}

export async function getKYCApplications(): Promise<KYCApplication[]> {
  const res = await apiClient.get<any[]>('/verification_requests', { status: 'pending' });
  return toList(res).map(a => ({
    id: a.id,
    institutionName: a.companyId, // Mock mapping
    status: a.status,
    riskLevel: 'medium',
    submittedAt: a.uploadedAt,
    documents: [a.fileName]
  }));
}

export async function updateKYCStatus(id: string, status: KYCStatus) {
  return apiClient.patch(`/verification_requests/${id}`, { status });
}
