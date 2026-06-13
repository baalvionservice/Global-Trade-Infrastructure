/**
 * @file route-guard.tsx
 * @description Client-side per-persona AUTHORIZATION guard (defense-in-depth over the API).
 *
 * The edge middleware only proves a SESSION exists (it cannot see the in-memory access token or
 * the role). This guard closes that gap on the client: for every protected route it confirms the
 * resolved persona is actually allowed to view that path (the same `personaAllowsPath` allowlist
 * that filters the sidebar), and otherwise bounces the user back to their own console — instead of
 * letting a privileged screen render just because the URL was typed.
 *
 * Render contract:
 *   • public route            → render children untouched
 *   • protected, not resolved → curtain (prevents privileged content flashing pre-rehydration)
 *   • protected, no session   → redirect to /login?redirect=...
 *   • protected, wrong persona→ redirect to the persona's home
 *   • protected, allowed      → render children
 *
 * NOTE: this is a UX/leak guard, NOT the security boundary. The API remains authoritative for every
 * data access; a tampered client role cannot grant data it isn't entitled to server-side.
 */
'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppState } from './app-state';
import { getPersona, personaAllowsPath } from '@/core/personas';
import { canAccessDashboard } from '@/core/authorization';
import { isProtectedPath } from '@/lib/route-access';
import { safeInternalPath } from '@/lib/safe-redirect';

type Decision = 'allow' | 'pending' | 'unauth' | 'deny';

export function RouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const { role, orgType, authz, homePath, isAuthenticated, authResolved } = useAppState();

  const guarded = isProtectedPath(pathname);
  // Authorization model: when the session carries an organization TYPE, access is decided by the
  // org-type nav allowlist (a member can never reach another org type's surface unless platform-level).
  // Legacy sessions with no org type fall back to the persona allowlist so existing accounts keep working.
  const persona = getPersona(role);
  const allowed = orgType
    ? canAccessDashboard(authz, pathname) || pathname === homePath
    : personaAllowsPath(persona, pathname) || pathname === persona.home;
  // The landing dashboard a denied user is bounced back to (org dashboard, or persona home in legacy mode).
  const redirectHome = homePath || persona.home;

  const decision: Decision = !guarded
    ? 'allow'
    : !authResolved
      ? 'pending'
      : !isAuthenticated
        ? 'unauth'
        : allowed
          ? 'allow'
          : 'deny';

  useEffect(() => {
    if (decision === 'unauth') {
      const back = safeInternalPath(pathname, '/dashboard');
      router.replace(`/login?redirect=${encodeURIComponent(back)}`);
    } else if (decision === 'deny') {
      router.replace(redirectHome);
    }
  }, [decision, pathname, redirectHome, router]);

  if (decision === 'allow') return <>{children}</>;
  return <GuardCurtain decision={decision} />;
}

function GuardCurtain({ decision }: { decision: Exclude<Decision, 'allow'> }) {
  const message =
    decision === 'pending'
      ? 'Verifying authority…'
      : decision === 'unauth'
        ? 'Session required — redirecting to sign in…'
        : 'Access restricted — returning you to your console…';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center px-6">
        <div className="h-10 w-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
