
/**
 * @file incident-service.ts
 * @description Institutional Critical Incident & War Room Service.
 * Manages high-priority disruptions and executive escalations.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { logger, metricsService } from './observability-service';
import { eventBus } from './event-bus';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'detected' | 'mitigating' | 'resolved' | 'postmortem';

export interface TradeIncident {
  id: string;
  type: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  message: string;
  impactedNodes: string[];
  ownerId?: string;
  createdAt: string;
  resolvedAt?: string;
}

export const incidentService = {
  /**
   * Dispatches a critical systemic incident to the executive observatory.
   */
  async triggerIncident(data: Omit<TradeIncident, 'id' | 'createdAt' | 'status'>): Promise<TradeIncident> {
    logger.error('IncidentService', `SYSTEMIC_DISRUPTION: ${data.type}`, { severity: data.severity });

    const res = await apiClient.post<TradeIncident>('/alerts', {
      ...data,
      status: 'detected',
      createdAt: new Date().toISOString()
    });

    const incident = res.data!;

    // Global Executive Broadcast
    await eventBus.publish('COMPLIANCE_FAILED', {
      entityId: incident.id,
      entityType: 'incident',
      reason: incident.type,
      description: incident.message
    });

    metricsService.recordMetric('critical_incidents_total', 1);

    return incident;
  },

  /**
   * Retrieves active incidents requiring executive oversight.
   */
  async getActiveIncidents(): Promise<TradeIncident[]> {
    const res = await apiClient.get<TradeIncident[]>('/alerts', { status: 'active', limit: 10 });
    return toList(res);
  },

  async updateStatus(id: string, status: IncidentStatus) {
    await apiClient.patch(`/alerts/${id}`, { status });
    if (status === 'resolved') {
      await apiClient.patch(`/alerts/${id}`, { resolvedAt: new Date().toISOString() });
    }
  }
};
