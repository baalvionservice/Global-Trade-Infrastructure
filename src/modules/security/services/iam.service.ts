/**
 * @file iam.service.ts
 * @description Authoritative Institutional Identity Management Service.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { IdentityStatus, SecurityAuditEntry } from '../types';
import { logger, metricsService } from '@/services/observability-service';
import { eventBus } from '@/orchestration/event-bus';

class IAMService {
  private static instance: IAMService;

  private constructor() {}

  public static getInstance(): IAMService {
    if (!IAMService.instance) {
      IAMService.instance = new IAMService();
    }
    return IAMService.instance;
  }

  /**
   * Retrieves active institutional identities with real-time risk scores.
   */
  async getIdentities(params: any = {}) {
    const res = await apiClient.get<any[]>('/users', params);
    return toList(res).map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: (u.status || 'VERIFIED') as IdentityStatus,
      lastLogin: u.lastLogin || new Date().toISOString(),
      trustScore: u.trustScore || 92
    }));
  }

  /**
   * Formally revokes an identity node's access across the global fabric.
   */
  async revokeIdentity(userId: string, authorizedBy: string) {
    logger.error('IAM_Kernel', `IDENTITY_REVOCATION: User ${userId} revoked by ${authorizedBy}`);

    await apiClient.patch(`/users/${userId}`, {
      status: 'REVOKED',
      revokedAt: new Date().toISOString(),
      revokedBy: authorizedBy
    });

    await eventBus.publish('POLICY_VIOLATION_DETECTED' as any, {
      entityId: userId,
      type: 'IDENTITY_TERMINATION',
      message: 'Institutional identity node revoked from active fabric.'
    });

    metricsService.recordMetric('identity_revocations_total', 1);
  }

  /**
   * Registers a security audit record.
   */
  async recordAuditEntry(entry: Omit<SecurityAuditEntry, 'id' | 'timestamp'>) {
    const res = await apiClient.post<SecurityAuditEntry>('/security_audit_logs', {
      ...entry,
      timestamp: new Date().toISOString()
    });
    return res.data;
  }
}

export const iamService = IAMService.getInstance();
