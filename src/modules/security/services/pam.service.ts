/**
 * @file pam.service.ts
 * @description PRIVILEGED ACCESS MANAGEMENT & TWO-KEY AUTHORITY.
 * Manages JIT access, emergency overrides, and biometric governance sign-offs.
 */
import { apiClient } from '@/lib/api-client';
import { logger, metricsService } from '@/services/observability-service';
import { eventBus } from '@/orchestration/event-bus';

export interface PAMSession {
  id: string;
  actorId: string;
  reason: string;
  scope: 'SYSTEM_ROOT' | 'TREASURY_WRITE' | 'GOVERNANCE_OVERRIDE';
  expiresAt: string;
  biometricVerified: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

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
   * Requests a time-bound Just-In-Time (JIT) privileged session.
   */
  async requestJITAccess(data: { actorId: string, scope: PAMSession['scope'], reason: string }): Promise<PAMSession> {
    logger.warn('PAM_Kernel', `PRIVILEGE_ESCALATION_REQUESTED: ${data.actorId} for ${data.scope}`);

    const res = await apiClient.post<PAMSession>('/pam_sessions', {
      ...data,
      status: 'ACTIVE',
      biometricVerified: false,
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1h default
    });

    await eventBus.publish('PRIVILEGED_ACCESS_REQUESTED' as any, res.data);
    return res.data!;
  }

  /**
   * Finalizes a privileged session using biometric attestation.
   */
  async authorizeSession(sessionId: string, biometricAttestation: string) {
    logger.info('PAM_Kernel', `SESSION_AUTHORIZED: Node ${sessionId}`);

    // Forward the device attestation to the backend, which verifies it and owns
    // the authoritative governance signature. The client never fabricates a
    // `sha256_0x...` proof from arbitrary input.
    return apiClient.patch(`/pam_sessions/${sessionId}`, {
      biometricVerified: true,
      biometricAttestation,
    });
  }
}

export const pamService = PAMService.getInstance();
