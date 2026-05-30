/**
 * @file approval-service.ts
 * @description Manages platform-wide governance approvals and verify states.
 * Standardizes the 'Two-Key' authority principle for sensitive trade actions.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { UserRole, USER_ROLES } from '@/app/(dashboard)/_components/app-state';
import { logger } from './observability-service';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ApprovalReferenceType = 'kyc' | 'rfq' | 'deal' | 'payment';

export interface ApprovalRequest {
  id: string;
  referenceType: ApprovalReferenceType;
  referenceId: string;
  status: ApprovalStatus;
  requestedBy: string;
  requiredRole: UserRole;
  reason: string;
  metadata?: any;
  createdAt: string;
  decidedBy?: string;
  decidedAt?: string;
}

export const approvalService = {
  /**
   * Initializes a formal governance request.
   */
  async createRequest(data: {
    referenceType: ApprovalReferenceType;
    referenceId: string;
    requestedBy: string;
    requiredRole: UserRole;
    reason: string;
    metadata?: any;
  }): Promise<ApprovalRequest> {
    const res = await apiClient.post<ApprovalRequest>('/approvals', {
      ...data,
      status: 'pending'
    });
    
    logger.info('ApprovalService', `GOVERNANCE_REQUEST: ${data.referenceType} ${data.referenceId} requires ${data.requiredRole} authorization.`);
    return res.data!;
  },

  /**
   * Retrieves active or historical approval requests.
   */
  async getRequests(params?: any): Promise<ApprovalRequest[]> {
    const res = await apiClient.get<ApprovalRequest[]>('/approvals', {
      sortBy: 'createdAt',
      order: 'desc',
      ...params
    });
    return toList(res);
  },

  /**
   * Executes a formal governance decision.
   * Automatically synchronizes the target entity's state on approval.
   */
  async decide(id: string, status: 'approved' | 'rejected', adminId: string, reason?: string): Promise<ApprovalRequest> {
    const res = await apiClient.patch<ApprovalRequest>(`/approvals/${id}`, {
      status,
      decidedBy: adminId,
      decidedAt: new Date().toISOString(),
      metadata: { decisionReason: reason }
    });
    
    const request = res.data!;
    logger.warn('ApprovalService', `GOVERNANCE_DECISION: Approval ${id} ${status} by ${adminId}`);

    // 1. Post-Decision Hook: Synchronize Target Entity
    await this.syncTargetEntity(request);

    return request;
  },

  /**
   * Handles entity-specific state transitions post-approval.
   */
  async syncTargetEntity(request: ApprovalRequest) {
    if (request.status !== 'approved') return;

    switch (request.referenceType) {
      case 'rfq':
        await apiClient.patch(`/rfqs/${request.referenceId}`, { status: 'OPEN' });
        break;
      case 'kyc':
        await apiClient.patch(`/companies/${request.referenceId}`, { 
          verificationStatus: 'verified',
          status: 'verified',
          trustScore: 75 
        });
        break;
      case 'deal':
        await apiClient.patch(`/deals/${request.referenceId}`, { status: 'finalized' });
        break;
    }
  },

  /**
   * Non-blocking check for UI-level permission gating.
   */
  async checkStatus(type: ApprovalReferenceType, refId: string): Promise<ApprovalStatus> {
    const res = await apiClient.get<ApprovalRequest[]>('/approvals', { referenceType: type, referenceId: refId });
    if (res.data && res.data.length > 0) {
      return res.data[0].status;
    }
    return 'approved'; // Default to permitted if no explicit record exists
  }
};
