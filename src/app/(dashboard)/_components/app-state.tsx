'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { USER_ROLES, UserRole } from '@/core/roles';
export { USER_ROLES } from '@/core/roles';
export type { UserRole } from '@/core/roles';
import { brainController } from '@/orchestration/brain-controller';
import { unificationService } from '@/services/unification-service';
import { demoService } from '@/services/demo-service';
import { notificationService } from '@/modules/events/services/notification.service';
import { presenceService } from '@/modules/collaboration/services/presence.service';
import { edgeSync } from '@/modules/mobility/services/edge-sync.service';
import { mobilityGovernance } from '@/modules/mobility/services/mobility-governance.service';
import { authApi, clearToken } from '@/lib/api-client';
import { MfaRequiredError } from '@/app/login/_components/mfa-login';
import { resolveAuthority } from '@/core/authority-mapping';
import { getPersona, getPersonaHome } from '@/core/personas';
import {
  OrgType,
  MembershipRole,
  resolveOrgType,
  resolveMembershipRole,
  getDashboardForOrgType,
  isPlatformOrgType,
  MEMBERSHIP_ROLES,
} from '@/core/organizations';
import { AuthzContext } from '@/core/authorization';
import { clearSessionOrgCache } from '@/services/session-org';

// SECURITY (P0): the forgeable base64 `baalvion_trade_session` role cookie has been REMOVED.
// The session is the httpOnly `refresh_token` cookie (set by trade-service) + the in-memory access
// token; middleware gates on that cookie and the API is authoritative for roles. The frontend never
// writes a role cookie.

export type TourStep = 'welcome' | 'sourcing' | 'negotiation' | 'settlement' | 'logistics' | 'complete';
export type DemoScenario = 'dispute' | 'delay' | 'high_risk' | 'none';

// Role resolution is FAIL-CLOSED and lives in the pure, unit-tested `@/core/authority-mapping`
// module (C-1/C-2 remediation): explicit allowlist, no fuzzy matching, unknown → least-privilege
// MEMBER, org-ownership ≠ platform sovereignty, and multi-role principals resolve to their
// highest-ranked authority deterministically.

interface AppState {
  /** Effective (viewing) authority — drives nav + the route guard. Equals authorityRole unless a
   *  god-view tier has switched personas. */
  role: UserRole;
  /** The REAL, server-confirmed authority. Immutable from the client; the basis for whether
   *  persona switching (impersonation) is permitted. */
  authorityRole: UserRole;
  /** Server-confirmed organization TYPE — the primary driver of dashboard access. Null for
   *  legacy sessions that predate the multi-tenant model. */
  orgType: OrgType | null;
  /** Server-confirmed membership ROLE within the organization — the capability tier. */
  membershipRole: MembershipRole;
  /** True for platform-level (cross-tenant) authorities: a platform_owner org OR a super_admin. */
  isPlatformAdmin: boolean;
  /** Resolved authorization context for the canView/canEdit/... helpers and the route guard. */
  authz: AuthzContext;
  /** True once the initial session rehydration (authApi.me) has completed, success or not. The
   *  route guard waits on this to avoid flashing privileged content or wrongly redirecting. */
  authResolved: boolean;
  userId: string;
  tenantId: string;
  isAuthenticated: boolean;
  setRole: (role: UserRole) => void;
  availableRoles: UserRole[];
  coherenceScore: number;
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;
  activeScenario: DemoScenario;
  triggerScenario: (scenario: DemoScenario) => Promise<void>;
  isTourActive: boolean;
  currentTourStep: TourStep;
  startTour: () => void;
  nextTourStep: () => void;
  endTour: () => void;
  /** Authenticates and returns the landing dashboard route the caller should be sent to. */
  login: (email: string, password: string, mfaCode?: string) => Promise<string>;
  logout: () => Promise<void>;
  /** The landing route for the current session — org-type dashboard, or persona home (legacy). */
  homePath: string;
}

const AppContext = createContext<AppState | undefined>(undefined);

const TOUR_STEPS: TourStep[] = ['welcome', 'sourcing', 'negotiation', 'settlement', 'logistics', 'complete'];

export function AppProvider({ children }: { children: React.ReactNode }) {
  // SECURITY (M-5): default to the LEAST-privilege authority while unauthenticated — never a
  // privileged executive persona. `authorityRole` is the server-confirmed truth; `role` is the
  // effective view (only god-view tiers may diverge it via persona switching).
  const [authorityRole, setAuthorityRole] = useState<UserRole>(USER_ROLES.MEMBER);
  const [role, setEffectiveRole] = useState<UserRole>(USER_ROLES.MEMBER);
  // Multi-tenant identity: org type drives dashboard access, membership role drives capabilities.
  const [orgType, setOrgType] = useState<OrgType | null>(null);
  const [membershipRole, setMembershipRole] = useState<MembershipRole>(MEMBERSHIP_ROLES.VIEWER);
  const [authResolved, setAuthResolved] = useState(false);
  const [userId, setUserId] = useState('USR-101');
  const [tenantId, setTenantId] = useState('T-101');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeScenario, setActiveScenario] = useState<DemoScenario>('none');
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState<TourStep>('welcome');

  useEffect(() => {
    const init = async () => {
       try {
         await brainController.initialize();
         notificationService.initialize();
         await unificationService.synchronizeContext({ coherenceStatus: 'ALIGNED' });
         
         if (typeof window !== 'undefined') {
            await presenceService.broadcastSignal(userId, 'AVAILABLE');
            if (window.innerWidth < 1024) {
               await mobilityGovernance.authorizeDevice(userId);
               await edgeSync.synchronizeQueue();
            }
         }
       } catch (e) {
         console.error('[AppState] Initialization Error:', e);
       }
    };
    init();
  }, [userId]);

  // Session rehydration: on mount, ask the gateway who we are (httpOnly cookie). This keeps a
  // full page reload signed-in without any JS-readable token — the cookie is the source of truth.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await authApi.me();
        if (cancelled) return;
        if (me) {
          // Resolve from the FULL role set (highest-ranked wins) — not just roles[0].
          const resolved = resolveAuthority(me.roles);
          setUserId(String(me.userId ?? me.id ?? 'USR-101'));
          if (me.orgId) setTenantId(String(me.orgId));
          setAuthorityRole(resolved);
          setEffectiveRole(resolved);
          // Multi-tenant resolution: org type (dashboard surface) + membership role (capability).
          setOrgType(resolveOrgType(me.orgType));
          setMembershipRole(resolveMembershipRole((me.roles && me.roles[0]) ?? null));
          setIsAuthenticated(true);
        }
      } catch { /* anonymous — stay logged out */ }
      finally { if (!cancelled) setAuthResolved(true); }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      demoService.startSimulation();
    } else {
      demoService.stopSimulation();
    }
  }, [isDemoMode]);

  const login = async (email: string, password: string, _mfaCode?: string): Promise<string> => {
    // The gateway returns MFA continuation paths as HTTP 200 success (NOT errors), so we read the
    // raw login response here to branch BEFORE establishing any client identity. A second factor is
    // completed by the login page via the dedicated MFA challenge / enrolment endpoints.
    const res = await fetch('/trade-bff/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json().catch(() => null) as
      | { user?: { id?: string; userId?: string; roles?: string[]; orgId?: string | null; orgType?: string | null }; csrfToken?: string;
          mfaRequired?: boolean; mfaEnrollmentRequired?: boolean; challengeToken?: string; error?: { code?: string; message?: string } }
      | null;
    if (!res.ok || !json) {
      const err = new Error(json?.error?.message || 'Invalid credentials.') as Error & { code?: string };
      err.code = json?.error?.code;
      throw err;
    }
    // Force-MFA enrolment (no session yet) — the login page drives QR + code collection.
    if (json.mfaEnrollmentRequired && json.challengeToken) {
      throw new MfaRequiredError('enrollment', json.challengeToken);
    }
    // Already-enrolled second factor — the login page collects the 6-digit code.
    if (json.mfaRequired && json.challengeToken) {
      throw new MfaRequiredError('challenge', json.challengeToken);
    }
    const session = {
      userId: String(json.user?.id ?? json.user?.userId ?? email),
      role: (json.user?.roles && json.user.roles[0]) || 'client',
      orgId: json.user?.orgId ?? null,
      orgType: json.user?.orgType ?? null,
      user: json.user,
    };
    // Invalidate any cached session org so service modules resolve THIS account's tenant.
    clearSessionOrgCache();
    setUserId(session.userId || email);
    setTenantId(session.orgId ? String(session.orgId) : 'T-DEMO');
    // Resolve from the full role set when the gateway returns one; fall back to the primary role.
    const resolvedRole = resolveAuthority(session.user?.roles ?? [session.role]);
    const nextOrgType = resolveOrgType(session.orgType);
    const nextMembershipRole = resolveMembershipRole((session.user?.roles && session.user.roles[0]) ?? session.role);
    // Establish identity directly (NOT via the gated public setRole): both the immutable authority
    // and the effective view are the server-confirmed role.
    setAuthorityRole(resolvedRole);
    setEffectiveRole(resolvedRole);
    setOrgType(nextOrgType);
    setMembershipRole(nextMembershipRole);
    setIsAuthenticated(true);
    setAuthResolved(true);
    // Route by ORGANIZATION TYPE (the dashboard surface). Legacy sessions with no org type fall
    // back to the persona home so existing accounts keep working.
    return nextOrgType ? getDashboardForOrgType(nextOrgType) : getPersonaHome(resolvedRole);
  };

  const logout = async (): Promise<void> => {
    // Await the server-side revocation so the httpOnly session cookies are actually cleared before
    // we navigate — otherwise the edge would just bounce the user straight back in.
    try { await authApi.logout(); } catch { /* best-effort server revoke */ }
    clearToken();
    clearSessionOrgCache();
    setIsAuthenticated(false);
    setUserId('USR-101');
    setTenantId('T-101');
    // Reset to the least-privilege baseline — never leave a privileged role in memory after logout.
    setAuthorityRole(USER_ROLES.MEMBER);
    setEffectiveRole(USER_ROLES.MEMBER);
    setOrgType(null);
    setMembershipRole(MEMBERSHIP_ROLES.VIEWER);
  };

  // Persona switching ("impersonation") is a god-view privilege of the REAL authority only. A
  // non-god authority cannot change its effective role from the client — this closes the
  // client-side escalation surface so the route guard can't be tricked into rendering privileged
  // screens. (The API remains the authoritative gate regardless.)
  const setRole = (nextRole: UserRole): void => {
    // Cross-console switching is a PLATFORM-administration privilege only: a super_admin god-view
    // authority OR a platform_owner organization. Every other authority is locked to its own console.
    if (!getPersona(authorityRole).godView && !isPlatformOrgType(orgType)) return;
    setEffectiveRole(nextRole);
  };

  // Platform-level (cross-tenant) authority: a super_admin god-view persona OR a platform_owner org.
  const isPlatformAdmin = getPersona(authorityRole).godView === true || isPlatformOrgType(orgType);
  const authz: AuthzContext = { orgType, role: membershipRole, isPlatformAdmin };
  // Dashboard landing: organization type first (the new model), persona home as the legacy fallback.
  const homePath = orgType ? getDashboardForOrgType(orgType) : getPersonaHome(role);

  const value = useMemo(() => ({
    role,
    authorityRole,
    orgType,
    membershipRole,
    isPlatformAdmin,
    authz,
    authResolved,
    userId,
    tenantId,
    isAuthenticated,
    setRole,
    availableRoles: Object.values(USER_ROLES) as UserRole[],
    coherenceScore: 99.98,
    isDemoMode,
    setDemoMode: (val: boolean) => setIsDemoMode(val),
    activeScenario,
    triggerScenario: async (scenario: DemoScenario) => {
      setActiveScenario(scenario);
      await demoService.injectScenario(scenario);
    },
    homePath,
    isTourActive,
    currentTourStep,
    startTour: () => {
      setIsTourActive(true);
      setCurrentTourStep('welcome');
    },
    nextTourStep: () => {
      const currentIndex = TOUR_STEPS.indexOf(currentTourStep);
      if (currentIndex < TOUR_STEPS.length - 1) {
        setCurrentTourStep(TOUR_STEPS[currentIndex + 1]);
      } else {
        setIsTourActive(false);
      }
    },
    endTour: () => setIsTourActive(false),
    login,
    logout,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [role, authorityRole, orgType, membershipRole, isPlatformAdmin, authResolved, userId, tenantId, isAuthenticated, isDemoMode, activeScenario, isTourActive, currentTourStep]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}