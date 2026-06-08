/**
 * @file auth-service.ts
 * @description Institutional Authentication Service.
 *
 * DEPRECATED shim: authentication now flows through the canonical auth-gateway via
 * `authApi` in `@/lib/api-client` (RS256 cookie session). This module delegates to the
 * real gateway so no mock-credential path can ever be reached.
 */
import { authApi } from '@/lib/api-client';
import { apiClient } from '@/lib/api-client';
import { logger } from './observability-service';
import { clearSessionOrgCache } from './session-org';

export const authService = {
  /**
   * Authenticates against the real auth-gateway (RS256). Returns the canonical identity.
   */
  async login(email: string, password: string, mfaCode?: string) {
    logger.info('AuthService', `Login attempt: ${email}`);
    // A new identity invalidates any cached session org so service modules re-resolve it.
    clearSessionOrgCache();
    const session = await authApi.login(email, password, mfaCode);
    return session.user ?? { id: session.userId, role: session.role, orgId: session.orgId };
  },

  /**
   * Retrieves organization details for the current session from the live registry.
   */
  async getOrganization(orgId: string) {
    const res = await apiClient.getDoc('organizations', orgId);
    return res.success ? res.data : null;
  }
};
