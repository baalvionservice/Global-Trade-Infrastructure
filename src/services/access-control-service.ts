
/**
 * @file access-control-service.ts
 * @description Centralized Role-Based Access Control (RBAC) Enforcement.
 * Standardizes permissions for commercial, financial, and sovereign operations.
 */
import { UserRole, USER_ROLES } from '@/app/(dashboard)/_components/app-state';

export type Resource = 
  | 'sourcing'    // RFQs, Quotes
  | 'negotiation' // Deals, Chat
  | 'settlement'  // Escrows, Payments
  | 'logistics'   // Shipments, Carriers
  | 'compliance'  // KYC, Customs, Sanctions
  | 'governance'  // Policies, Approvals
  | 'system_infra' // System Logs, Cluster Health

export type Permission = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'approve' 
  | 'audit' 
  | 'finalize' 
  | 'risk_manage';

/**
 * Authoritative Map of Institutional Roles to Granular Permissions.
 */
const PERMISSION_MAP: Partial<Record<UserRole, Partial<Record<Resource, Permission[]>>>> = {
  [USER_ROLES.SUPER_ADMIN]: {
    system_infra: ['read', 'update', 'audit'],
    governance: ['create', 'read', 'update', 'delete', 'approve', 'risk_manage', 'audit'],
    sourcing: ['read', 'audit'],
    settlement: ['read', 'audit'],
    compliance: ['read', 'audit', 'risk_manage'],
    logistics: ['read', 'audit']
  },
  [USER_ROLES.SOVEREIGN_ADMIN]: {
    compliance: ['read', 'update', 'approve', 'audit'],
    logistics: ['read', 'audit'],
    governance: ['read', 'audit'],
    system_infra: ['read']
  },
  [USER_ROLES.BANK_ADMIN]: {
    settlement: ['read', 'update', 'approve', 'finalize', 'audit'],
    governance: ['read'],
    compliance: ['read']
  },
  [USER_ROLES.COMPLIANCE_ADMIN]: {
    compliance: ['read', 'update', 'approve', 'audit', 'risk_manage'],
    governance: ['read', 'audit'],
    sourcing: ['read', 'audit']
  },
  [USER_ROLES.BUYER]: {
    sourcing: ['create', 'read', 'update', 'delete'],
    negotiation: ['create', 'read', 'update'],
    settlement: ['read', 'update'],
    logistics: ['read']
  },
  [USER_ROLES.SELLER]: {
    sourcing: ['read'],
    negotiation: ['create', 'read', 'update'],
    settlement: ['read'],
    logistics: ['read', 'update']
  },
  [USER_ROLES.AGENT]: {
    logistics: ['read', 'update', 'audit'],
    compliance: ['read', 'update'],
    sourcing: ['read']
  },
  [USER_ROLES.INSURANCE_ADMIN]: {
    compliance: ['read', 'audit'],
    logistics: ['read', 'audit'],
    governance: ['read']
  }
};

export const accessControlService = {
  /**
   * Non-throwing check for UI-level permission gating.
   */
  hasPermission(role: UserRole, resource: Resource, permission: Permission): boolean {
    const rolePermissions = PERMISSION_MAP[role];
    if (!rolePermissions) return false;
    
    const resourcePermissions = rolePermissions[resource];
    return resourcePermissions?.includes(permission) || false;
  },

  /**
   * Formal enforcement for Service Layer logic.
   */
  enforce(role: UserRole, resource: Resource, permission: Permission): boolean {
    const authorized = this.hasPermission(role, resource, permission);
    if (!authorized) {
      console.warn(`[AccessControl] UNAUTHORIZED_ATTEMPT: Authority ${role} lacks ${permission} rights on ${resource}.`);
    }
    return authorized;
  }
};
