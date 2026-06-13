/**
 * @file tenant.service.ts
 * @description Sovereign Tenant Isolation & Boundary Governance Service.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { TenantBoundary, TenantStatus } from '../types';
import { logger } from '@/services/observability-service';

class TenantService {
  private static instance: TenantService;

  private constructor() {}

  public static getInstance(): TenantService {
    if (!TenantService.instance) {
      TenantService.instance = new TenantService();
    }
    return TenantService.instance;
  }

  /**
   * Retrieves all provisioned institutional tenants in the sovereign cluster.
   */
  async getTenants(): Promise<TenantBoundary[]> {
    const res = await apiClient.get<any[]>('/organizations');
    return toList(res).map(o => ({
      id: o.id,
      institutionName: o.name,
      jurisdiction: o.country,
      clusterNode: 'ZURICH_NODE_A',
      status: (o.status || 'ACTIVE') as TenantStatus,
      riskScore: o.riskScore || 12,
      dataResidency: 'SOVEREIGN_SWISS',
      // Only surface a real session count if the backend provides one — never fabricate it.
      activeSessions: typeof o.activeSessions === 'number' ? o.activeSessions : undefined,
      updatedAt: o.updatedAt || new Date().toISOString()
    }));
  }

  /**
   * Formally isolates a tenant node in response to a systemic breach.
   */
  async isolateTenant(tenantId: string, reason: string) {
    logger.error('Tenant_Governance', `TENANT_ISOLATION_INITIATED: Node ${tenantId}`, { reason });

    await apiClient.patch(`/organizations/${tenantId}`, {
      status: 'ISOLATED',
      isolationReason: reason,
      updatedAt: new Date().toISOString()
    });

    // In a real system, this would drop all active OAuth sessions and rotate encryption keys
    return true;
  }
}

export const tenantService = TenantService.getInstance();
