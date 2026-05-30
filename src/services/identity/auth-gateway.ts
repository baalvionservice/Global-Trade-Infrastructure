/**
 * @file auth-gateway.ts
 * @description Institutional Identity Gateway (Keycloak / OIDC).
 *
 * DISABLED — Phase 1 security triage.
 * The previous implementation was a STUB that always returned a hardcoded
 * EXECUTIVE_COMMANDER session and whose validateIdentity() always returned
 * `true` — a production-severity authentication bypass. It is now FAIL-CLOSED:
 * every entrypoint throws so the app fails visibly instead of silently granting
 * privileged access.
 *
 * TODO(phase7): replace with @baalvion/auth-sdk
 */
import { logger } from '@/services/observability-service';

export interface AuthSession {
  actorId: string;
  tenantId: string;
  role: string;
  token: string;
  expiresAt: string;
  authLevel: number;
}

const DISABLED_MESSAGE =
  'Global Trade auth-gateway disabled pending Baalvion ID integration.';

class AuthGateway {
  private static instance: AuthGateway;

  private constructor() {}

  public static getInstance(): AuthGateway {
    if (!AuthGateway.instance) {
      AuthGateway.instance = new AuthGateway();
    }
    return AuthGateway.instance;
  }

  /**
   * DISABLED. Fails closed.
   * TODO(phase7): replace with @baalvion/auth-sdk
   */
  async authorizeSession(_code: string): Promise<AuthSession> {
    logger.error('AuthGateway', 'AUTH_GATEWAY_DISABLED: refusing to authorize a session');
    throw new Error(DISABLED_MESSAGE);
  }

  /**
   * DISABLED. Fails closed — never returns a positive validation.
   * TODO(phase7): replace with @baalvion/auth-sdk
   */
  async validateIdentity(_token: string): Promise<boolean> {
    logger.error('AuthGateway', 'AUTH_GATEWAY_DISABLED: refusing to validate identity');
    throw new Error(DISABLED_MESSAGE);
  }
}

export const authGateway = AuthGateway.getInstance();
