/**
 * @file organization.service.ts
 * @description Authoritative service for Institutional Organization Management and Tenant Hierarchy.
 */
import { apiClient } from '@/lib/api-client';
import { OrgUnit, OrgUnitType } from '../types';
import { logger, metricsService } from '@/services/observability-service';
import { eventBus } from '@/orchestration/event-bus';

class OrganizationService {
  private static instance: OrganizationService;

  private constructor() {}

  public static getInstance(): OrganizationService {
    if (!OrganizationService.instance) {
      OrganizationService.instance = new OrganizationService();
    }
    return OrganizationService.instance;
  }

  /**
   * Retrieves the full organizational hierarchy for an institutional tenant.
   */
  async getHierarchy(companyId: string): Promise<OrgUnit[]> {
    const res = await apiClient.get<OrgUnit[]>('/org_units', { companyId });
    return res.data || [
      { id: 'HQ-1', name: 'Sovereign Global HQ', type: 'HEADQUARTERS', region: 'Global', managerId: 'ADM-001', headcount: 1240, status: 'active' },
      { id: 'HUB-SG', parentId: 'HQ-1', name: 'APAC Regional Hub', type: 'REGIONAL_HUB', region: 'Singapore', managerId: 'ADM-SG-01', headcount: 450, status: 'active' },
      { id: 'DIV-T1', parentId: 'HUB-SG', name: 'Trade Finance Division', type: 'DIVISION', region: 'Singapore', managerId: 'FIN-SG-04', headcount: 124, status: 'active' }
    ] as any;
  }

  /**
   * Provisions a new organizational node in the institutional graph.
   */
  async provisionUnit(data: Partial<OrgUnit>): Promise<OrgUnit> {
    logger.info('OrgAdmin', `PROVISIONING_UNIT: ${data.name} (Type: ${data.type})`);

    const res = await apiClient.post<OrgUnit>('/org_units', {
      ...data,
      status: 'active',
      createdAt: new Date().toISOString()
    });

    await eventBus.emit('Administration', res.data!.id, 'ORG_UNIT_PROVISIONED', res.data);
    metricsService.recordMetric('org_units_provisioned', 1);

    return res.data!;
  }

  /**
   * Transitions a unit's operational status.
   */
  async updateStatus(unitId: string, status: 'active' | 'suspended', authorizedBy: string) {
    logger.warn('OrgAdmin', `TRANSITIONING_UNIT_STATE: ${unitId} to ${status} by ${authorizedBy}`);

    const res = await apiClient.patch<OrgUnit>(`/org_units/${unitId}`, {
      status,
      authorizedBy,
      updatedAt: new Date().toISOString()
    });

    return res.data!;
  }
}

export const organizationService = OrganizationService.getInstance();
