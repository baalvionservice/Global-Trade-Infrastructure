'use client';
/**
 * Global-Trade-Infrastructure → auth-gateway (BFF) unified session, via @baalvion/auth-sdk.
 *
 * ADDITIVE + gated by NEXT_PUBLIC_BFF_MODE (default off). This is the real replacement for the
 * fail-closed services/identity/auth-gateway.ts stub (the Keycloak/OIDC placeholder that threw on
 * every call — see its `TODO(phase7): replace with @baalvion/auth-sdk`). The stub is left in place
 * until cutover so nothing changes behaviour while BFF mode is off.
 *
 * No token in JS — identity comes from /auth/me; data calls go through authFetch (cookie + CSRF +
 * single-flight refresh). Canonical roles[] are returned as-is; mapping them to GTI's core/roles.ts
 * authority vocabulary (USER_ROLES / PERMISSION_MATRIX) is RBAC-phase work, not done here.
 */
import { createGatewaySession } from '@baalvion/auth-sdk';

export const BFF_ENABLED = process.env.NEXT_PUBLIC_BFF_MODE === 'on';

const session = createGatewaySession({
  gatewayUrl: process.env.NEXT_PUBLIC_GATEWAY_URL ?? '/auth-bff',
});

export interface GTIIdentity {
  id:          string;
  email:       string;
  roles:       string[];
  permissions: string[];
  orgId:       string | null;
}

const toIdentity = (s: {
  userId: string | null; email?: string | null; roles: string[]; permissions: string[]; orgId: string | null;
}): GTIIdentity | null =>
  s.userId ? { id: s.userId, email: s.email ?? '', roles: s.roles, permissions: s.permissions, orgId: s.orgId } : null;

export const gtiGatewayAuth = {
  async login(email: string, password: string): Promise<GTIIdentity | null> {
    await session.login(email, password);
    return toIdentity(await session.getSession(true));
  },
  logout:          () => session.logout(),
  getCurrentUser:  async () => toIdentity(await session.getSession()),
  isAuthenticated: async () => (await session.getSession()).authenticated,
  /** Data client — cookie + CSRF + single-flight 401→refresh→retry. No Bearer, no localStorage. */
  api:             session.authFetch,
};

export default gtiGatewayAuth;
