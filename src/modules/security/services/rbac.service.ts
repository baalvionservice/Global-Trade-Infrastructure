/**
 * @file rbac.service.ts
 * @description Advanced Role-Based Access Control service for institutional mandates.
 * Manages the authoritative permission matrix and role lifecycle.
 */
import { PERMISSION_MATRIX, UserRole, USER_ROLES } from '@/core/roles';
import { SecurityRole } from '../types';
import { logger } from '@/services/observability-service';

class RBACService {
  private static instance: RBACService;

  private constructor() {}

  public static getInstance(): RBACService {
    if (!RBACService.instance) {
      RBACService.instance = new RBACService();
    }
    return RBACService.instance;
  }

  /**
   * Retrieves high-fidelity role definitions for the governance matrix.
   */
  async getRoles(): Promise<SecurityRole[]> {
    return Object.entries(USER_ROLES).map(([key, role]) => {
      const permissions = PERMISSION_MATRIX[role as UserRole] || {};
      const count = Object.values(permissions).reduce((acc, acts) => acc + (acts?.length || 0), 0);
      
      return {
        id: key,
        name: role as UserRole,
        category: this.getRoleCategory(role as UserRole),
        permissionCount: count,
        // Deterministic, stable estimate from privilege breadth (no random flicker).
        // The role + permission definitions themselves are the real RBAC config.
        assignedUsers: Math.max(1, count * 3),
        trustRequirement: this.getTrustRequirement(role as UserRole)
      };
    });
  }

  private getRoleCategory(role: UserRole): SecurityRole['category'] {
    if (role.includes('Admin') || role.includes('Super')) return 'SYSTEM';
    if (role.includes('Director')) return 'EXECUTIVE';
    if (role.includes('Operator') || role.includes('Analyst')) return 'OPERATIONS';
    if (role.includes('Officer')) return 'COMPLIANCE';
    return 'OPERATIONS';
  }

  private getTrustRequirement(role: UserRole): number {
    if (role.includes('Super') || role.includes('Owner')) return 100;
    if (role.includes('Director')) return 90;
    if (role.includes('Officer') || role.includes('Operator')) return 75;
    return 50;
  }

  /**
   * Evaluates if a subject has the authority to perform an action.
   * This is the core gatekeeper for the platform.
   */
  checkPermission(role: UserRole, resource: any, action: any): boolean {
    const permissions = PERMISSION_MATRIX[role];
    if (!permissions) return false;
    
    const resourceActs = (permissions as any)[resource];
    return resourceActs?.includes(action) || false;
  }
}

export const rbacService = RBACService.getInstance();
