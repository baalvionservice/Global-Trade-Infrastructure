/**
 * @file security.store.ts
 * @description Centralized state management for Institutional Security Operations.
 */
import { create } from 'zustand';
import { SecurityAuditEntry, TenantBoundary, IdentityStatus } from '../types';

interface SecurityState {
  activeSessions: number;
  threatLevel: 'STABLE' | 'ELEVATED' | 'CRITICAL';
  auditLog: SecurityAuditEntry[];
  tenants: TenantBoundary[];
  isSyncing: boolean;
  
  // Actions
  setAuditLog: (logs: SecurityAuditEntry[]) => void;
  setTenants: (tenants: TenantBoundary[]) => void;
  setSyncing: (val: boolean) => void;
  updateThreatLevel: (level: SecurityState['threatLevel']) => void;
}

export const useSecurityStore = create<SecurityState>((set) => ({
  activeSessions: 1240,
  threatLevel: 'STABLE',
  auditLog: [],
  tenants: [],
  isSyncing: false,

  setAuditLog: (auditLog) => set({ auditLog }),
  setTenants: (tenants) => set({ tenants }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  updateThreatLevel: (threatLevel) => set({ threatLevel }),
}));
