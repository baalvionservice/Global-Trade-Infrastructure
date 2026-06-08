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
import { getPersonaHome } from '@/core/personas';
import { clearSessionOrgCache } from '@/services/session-org';

// SECURITY (P0): the forgeable base64 `baalvion_trade_session` role cookie has been REMOVED.
// The session is the httpOnly `refresh_token` cookie (set by trade-service) + the in-memory access
// token; middleware gates on that cookie and the API is authoritative for roles. The frontend never
// writes a role cookie.

export type TourStep = 'welcome' | 'sourcing' | 'negotiation' | 'settlement' | 'logistics' | 'complete';
export type DemoScenario = 'dispute' | 'delay' | 'high_risk' | 'none';

// Maps a canonical auth-gateway role (owner/admin/operator/member/...) to the frontend's
// authority vocabulary (USER_ROLES) that drives navigation + permissions. Auth-service makes
// every registrant the `owner` of their org, so owner/admin map to the top platform authority.
function mapAuthorityRole(gatewayRole: string | undefined | null): UserRole {
  const r = (gatewayRole || '').toLowerCase();
  if (r === 'owner' || r === 'super_admin' || r === 'admin' || r === 'org_owner') return USER_ROLES.SUPER_ADMIN;
  if (r === 'operator') return USER_ROLES.SOVEREIGN_OPERATOR;
  if (r.includes('buyer')) return USER_ROLES.BUYER_NODE;
  if (r.includes('seller')) return USER_ROLES.SELLER_NODE;
  // Fuzzy match against the vocabulary; default privileged so the full console is reachable.
  return Object.values(USER_ROLES).find((x) => x.toLowerCase().includes(r) && r.length > 2) ?? USER_ROLES.SUPER_ADMIN;
}

interface AppState {
  role: UserRole;
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
  login: (email: string, password: string, mfaCode?: string) => Promise<UserRole>;
  logout: () => void;
  /** The landing route for the current persona — where this role belongs. */
  homePath: string;
}

const AppContext = createContext<AppState | undefined>(undefined);

const TOUR_STEPS: TourStep[] = ['welcome', 'sourcing', 'negotiation', 'settlement', 'logistics', 'complete'];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>(USER_ROLES.EXECUTIVE_DIRECTOR);
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
        if (cancelled || !me) return;
        const canonicalRole = (me.roles && me.roles[0]) || '';
        setUserId(String(me.userId ?? me.id ?? 'USR-101'));
        if (me.orgId) setTenantId(String(me.orgId));
        setRole(mapAuthorityRole(canonicalRole));
        setIsAuthenticated(true);
      } catch { /* anonymous — stay logged out */ }
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

  const login = async (email: string, password: string, mfaCode?: string): Promise<UserRole> => {
    const session = await authApi.login(email, password, mfaCode);
    // Invalidate any cached session org so service modules resolve THIS account's tenant.
    clearSessionOrgCache();
    setUserId(session.userId || email);
    setTenantId(session.orgId ? String(session.orgId) : 'T-DEMO');
    setIsAuthenticated(true);
    const resolvedRole = mapAuthorityRole(session.role);
    setRole(resolvedRole);
    // Return the resolved authority so the caller can route to the persona's own console.
    return resolvedRole;
  };

  const logout = (): void => {
    authApi.logout();
    clearToken();
    clearSessionOrgCache();
    setIsAuthenticated(false);
    setUserId('USR-101');
    setTenantId('T-101');
    setRole(USER_ROLES.EXECUTIVE_DIRECTOR);
  };

  const value = useMemo(() => ({
    role,
    userId,
    tenantId,
    isAuthenticated,
    setRole: (newRole: UserRole) => setRole(newRole),
    availableRoles: Object.values(USER_ROLES) as UserRole[],
    coherenceScore: 99.98,
    isDemoMode,
    setDemoMode: (val: boolean) => setIsDemoMode(val),
    activeScenario,
    triggerScenario: async (scenario: DemoScenario) => {
      setActiveScenario(scenario);
      await demoService.injectScenario(scenario);
    },
    homePath: getPersonaHome(role),
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
  }), [role, userId, tenantId, isAuthenticated, isDemoMode, activeScenario, isTourActive, currentTourStep]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}