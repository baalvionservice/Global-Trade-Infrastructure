/**
 * @file session-org.ts
 * @description Resolves the authenticated session's real organization id for service
 * modules (which are NOT React components and cannot call `useAppState()`).
 *
 * Identity is owned by the auth-gateway httpOnly session cookie. We read it via
 * `authApi.me()` (gateway GET /auth/me → { user: { orgId } }) and cache the resolved
 * org id per session to avoid a /auth/me round-trip on every data call.
 *
 * SECURITY: there is NO hardcoded fallback tenant. When no session org is resolvable
 * (anonymous / expired session), callers receive `null` and MUST fail gracefully —
 * silently defaulting to a fixed demo tenant (e.g. COMP-101) would leak cross-tenant data.
 */
import { authApi } from '@/lib/api-client';

// Cached per page session. `undefined` = not yet resolved; `null` = resolved-but-anonymous.
let cachedOrgId: string | null | undefined;
let inFlight: Promise<string | null> | null = null;

/**
 * Returns the authenticated org id, or `null` when there is no session.
 * The result is cached for the lifetime of the page; concurrent callers share one
 * /auth/me request (single-flight).
 */
export async function resolveSessionOrgId(): Promise<string | null> {
  if (cachedOrgId !== undefined) return cachedOrgId;
  if (inFlight) return inFlight;

  inFlight = (async (): Promise<string | null> => {
    const me = await authApi.me();
    const orgId = me?.orgId ? String(me.orgId) : null;
    cachedOrgId = orgId;
    return orgId;
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
}

/**
 * Like {@link resolveSessionOrgId} but throws when there is no session, for callers
 * that cannot meaningfully proceed without a tenant. Prefer the nullable form where a
 * graceful empty/no-op path exists.
 */
export async function requireSessionOrgId(): Promise<string> {
  const orgId = await resolveSessionOrgId();
  if (!orgId) {
    throw new Error('No authenticated session: organization id is unavailable.');
  }
  return orgId;
}

/**
 * Clears the cached org id. Call on logout / session change so a subsequent caller
 * re-resolves the identity instead of serving a stale tenant.
 */
export function clearSessionOrgCache(): void {
  cachedOrgId = undefined;
  inFlight = null;
}
