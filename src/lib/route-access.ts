/**
 * @file route-access.ts
 * @description SINGLE SOURCE OF TRUTH for route-level access classification.
 *
 * Imported by BOTH the edge middleware (the cookie-presence authentication gate) and the client
 * `RouteGuard` (per-persona authorization). Keeping the prefix lists here means the two layers can
 * never drift — a route added to the authenticated surface is gated everywhere at once.
 *
 * Two tiers:
 *   • AUTH_REQUIRED_PREFIXES — needs a valid session (any authenticated authority).
 *   • ADMIN_PREFIXES         — governance / sovereign-command surfaces. The edge still only checks
 *                              that a session exists; the SPECIFIC authority is enforced by the
 *                              RouteGuard (persona allowlist) + the API (authoritative).
 */

export const AUTH_REQUIRED_PREFIXES: readonly string[] = [
  '/dashboard',
  '/buyer',
  '/seller',
  '/agent', // singular: /agent/dashboard, /agent/requests (was previously unguarded — only /agents existed)
  '/agents',
  '/marketplace',
  '/deals',
  '/orders',
  '/logistics-shipment',
  '/payments',
  '/finance-settlement',
  '/escrow',
  '/financials',
  '/compliance',
  '/compliance-regulatory', // distinct prefix — '/compliance' does NOT match '/compliance-regulatory'
  '/sanctions-screening',
  '/documents',
  '/messages',
  '/profile',
  '/insurance',
  '/intelligence-hub',
  '/negotiations',
  '/discovery',
  '/collaboration',
  '/executive',
  '/crisis-center',
  '/customs',
  '/sourcing',
  '/shipments',
  '/carriers',
  '/field',
  '/suppliers',
  '/trade-management',
  '/trade-ops', // Trade Operations control center (shipment-centric TradeOps Cloud surface)
  '/settings',
  '/platform/organizations', // platform console — requires auth
  '/organization',           // org self-administration (/organization/settings, /users, /audit)
];

export const ADMIN_PREFIXES: readonly string[] = [
  '/governance',
  '/oversight',
  // Sovereign "supreme command" surfaces — authenticated + persona-gated (only god-view '*'
  // personas are allowed by the RouteGuard). Left public previously.
  '/singularity-command',
  '/infinity-command',
  '/eternal-command',
  '/quantum-command',
  '/continuity-command',
  '/ascension-command',
  '/absolute-infinity-command',
  '/godsystem-command',
  '/eternal-absolute-command',
];

/** Exact-match public routes (marketing + auth entry). No session required. */
export const PUBLIC_EXACT: ReadonlySet<string> = new Set([
  '/',
  '/login',
  '/about',
  '/contact',
  '/pricing',
  '/privacy',
  '/terms',
  '/platform',
  '/banks',
  '/governments',
  '/enterprises',
  '/logistics',
  '/access/request',
  '/access/pending',
  '/onboard',
  '/onboard/buyer',
  '/onboard/seller',
  '/accept-invite',
  '/forgot-password',
  '/reset-password',
]);

const matchesPrefix = (prefixes: readonly string[], pathname: string): boolean =>
  prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

/** Governance / sovereign-command area. */
export function isAdminPath(pathname: string): boolean {
  return matchesPrefix(ADMIN_PREFIXES, pathname);
}

/** Authenticated (non-admin) operational area. */
export function needsAuth(pathname: string): boolean {
  return matchesPrefix(AUTH_REQUIRED_PREFIXES, pathname);
}

/** Any route requiring an authenticated, authorized session (auth OR admin). */
export function isProtectedPath(pathname: string): boolean {
  return isAdminPath(pathname) || needsAuth(pathname);
}
