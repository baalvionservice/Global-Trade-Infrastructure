/**
 * @file resilience-service.ts
 * @description High-availability view over the LIVE platform stack. Reads real service
 * health from trade-service GET /v1/system/services (DB, Redis, queue, providers, process)
 * and exposes load-balancing helpers over that live inventory.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { logger, alertService } from './observability-service';

export type ServiceStatus = 'active' | 'down' | 'degraded' | 'standby';

export interface ServiceInstance {
  id: string;
  serviceName: string;
  region: string;
  status: ServiceStatus;
  load: number; // 0-100%
  lastHeartbeat: string;
  isPrimary: boolean;
}

class ResilienceService {
  private static instance: ResilienceService;
  private instances: ServiceInstance[] = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      void this.refresh();
      setInterval(() => { void this.refresh(); }, 8000);
    }
  }

  public static getInstance(): ResilienceService {
    if (!ResilienceService.instance) {
      ResilienceService.instance = new ResilienceService();
    }
    return ResilienceService.instance;
  }

  /** Pull the live service inventory from the backend system telemetry endpoint. */
  private async refresh(): Promise<void> {
    try {
      const res = await apiClient.get<ServiceInstance[]>('/system/services');
      const list = toList<ServiceInstance>(res);
      if (list.length) {
        const prevDown = new Set(this.instances.filter((i) => i.status === 'down').map((i) => i.id));
        this.instances = list;
        // Surface newly-down nodes as operator alerts (real state transition).
        for (const inst of list) {
          if (inst.status === 'down' && !prevDown.has(inst.id)) {
            logger.error('ResilienceService', `INSTANCE_DOWN: ${inst.id} (${inst.serviceName}) in ${inst.region}.`);
            alertService.triggerAlert('Infrastructure Failure', `Node ${inst.id} offline.`, 'high');
          }
        }
      }
    } catch {
      /* keep last-known inventory on transient failure */
    }
  }

  /**
   * Routes an institutional request to the least-loaded healthy node for a service,
   * with standby failover — computed over the live inventory.
   */
  async routeRequest(serviceName: string): Promise<ServiceInstance> {
    if (!this.instances.length) await this.refresh();
    const healthyNodes = this.instances.filter((i) => i.serviceName === serviceName && i.status === 'active');

    if (healthyNodes.length === 0) {
      const standbyNodes = this.instances.filter((i) => i.serviceName === serviceName && i.status === 'standby');
      if (standbyNodes.length > 0) {
        logger.warn('ResilienceService', `FAILOVER_INITIATED: Activating standby node for ${serviceName}`);
        const standby = standbyNodes[0];
        standby.status = 'active';
        standby.isPrimary = true;
        return standby;
      }
      logger.error('LoadBalancer', `FAILOVER_CRITICAL: All nodes in cluster ${serviceName} are offline.`);
      throw new Error(`503 Service Unavailable: No healthy nodes in ${serviceName} cluster.`);
    }

    return healthyNodes.sort((a, b) => a.load - b.load)[0];
  }

  /** Operator action: mark a region's nodes as evacuated in the local view + raise a DR alert. */
  triggerRegionalFailover(region: string) {
    logger.error('ResilienceService', `REGIONAL_FAILOVER_COMMAND: Evacuating region ${region}`);
    this.instances.filter((i) => i.region === region).forEach((inst) => { inst.status = 'down'; });
    alertService.triggerAlert('Disaster Recovery', `Regional failover executed for ${region}.`, 'critical');
  }

  getInstances() { return [...this.instances]; }
}

export const resilienceService = ResilienceService.getInstance();
