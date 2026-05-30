
/**
 * @file command-center-service.ts
 * @description Master Operational Command & Global Oversight Service.
 * Centralizes the telemetry required for global institutional synchronization.
 */
import { apiClient } from '@/lib/api-client';
import { logger, metricsService } from './observability-service';
import { eventBus } from '@/orchestration/event-bus';

class OperationalCommandService {
  private static instance: OperationalCommandService;

  private constructor() {}

  public static getInstance(): OperationalCommandService {
    if (!OperationalCommandService.instance) {
      OperationalCommandService.instance = new OperationalCommandService();
    }
    return OperationalCommandService.instance;
  }

  /**
   * Retrieves high-density operational telemetry for the Global Control Tower.
   */
  async getControlTowerData() {
    const [statsRes, heatmapRes, alertsRes, interventionsRes] = await Promise.all([
      apiClient.get<any>('/platform_stats'),
      apiClient.get<any[]>('/trade_heatmaps'),
      apiClient.get<any[]>('/alerts', { status: 'active', limit: 10 }),
      apiClient.get<any[]>('/interventions', { limit: 10 })
    ]);

    // Adoption Analytics
    const adoptionRes = await apiClient.get<any>('/metrics', { name: 'active_tenants' });

    return {
      stats: statsRes.data || {
        totalVolume: '$1.84T',
        activeTenants: 1240,
        finality: '12.4s',
        load: 42
      },
      heatmap: heatmapRes.data || [],
      activeAlerts: alertsRes.data || [],
      recentInterventions: interventionsRes.data || [],
      adoption: adoptionRes.data || { onboarded: 84, active: 74, growth: '+12%' }
    };
  }

  /**
   * Broadcasts an operational directive to all nodes in a cluster.
   */
  async broadcastDirective(clusterId: string, action: string, authorizedBy: string) {
    logger.warn('CommandCenter', `BROADCASTING_DIRECTIVE: Cluster ${clusterId} -> ${action}`);

    const res = await apiClient.post('/directives', {
      clusterId,
      action,
      status: 'active',
      authorizedBy,
      createdAt: new Date().toISOString()
    });

    await eventBus.emit('Infrastructure', clusterId, 'GLOBAL_OPERATIONAL_DIRECTIVE_ISSUED', {
      entityId: clusterId,
      entityType: 'infrastructure',
      actorId: authorizedBy,
      payload: res.data
    });

    metricsService.recordMetric('global_directives_issued', 1);
  }
}

export const commandCenterService = OperationalCommandService.getInstance();
