/**
 * @file pam-service.ts
 * @description Privileged Access Management (PAM) for institutional trade infrastructure.
 * Handles emergency "Break-Glass" access and elevated governance sign-offs.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { logger, metricsService } from './observability-service';
import { eventBus } from '@/orchestration/event-bus';
import { PrivilegedSession } from '@/modules/security/types';

class PAMService {
  private static instance: PAMService;

  private constructor() {}

  public static getInstance(): PAMService {
    if (!PAMService.instance) {
      PAMService.instance = new PAMService();
    }
    return PAMService.instance;
  }

  /**
   * Initializes a time-bound privileged session for emergency governance actions.
   */
  async requestElevatedAccess(actorId: string, tenantId: string, scope: string, reason: string): Promise<PrivilegedSession> {
    logger.forensic('PAMService', 'PRIVILEGE_ESCALATION_REQUESTED', `Actor ${actorId} requested ${scope} for reason: ${reason}`, actorId, tenantId);

    const res = await apiClient.post<PrivilegedSession>('/pam_sessions', {
      actorId,
      tenantId,
      scope,
      reason,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour window
      status: 'active'
    });

    const session = res.data!;

    await eventBus.publish('PRIVILEGED_ACCESS_REQUESTED' as any, session);
    metricsService.recordMetric('pam_escalations_total', 1);

    return session;
  }

  /**
   * Validates if the current actor has an active privileged mandate.
   */
  async validateSession(actorId: string, scope: string): Promise<boolean> {
    const res = await apiClient.get<PrivilegedSession[]>('/pam_sessions', {
      actorId,
      status: 'active'
    });

    const session = toList<PrivilegedSession>(res).find(s => s.scope === scope || s.scope === 'global');
    if (!session) return false;

    if (new Date(session.expiresAt) < new Date()) {
      await apiClient.patch(`/pam_sessions/${session.id}`, { status: 'expired' });
      return false;
    }

    return true;
  }
}

export const pamService = PAMService.getInstance();
