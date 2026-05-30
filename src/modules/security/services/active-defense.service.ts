/**
 * @file active-defense.service.ts
 * @description THE ACTIVE DEFENSE RUNTIME.
 * Orchestrates eBPF-driven threat detection, Falco orchestration, and autonomous containment.
 */
import { apiClient } from '@/lib/api-client';
import { logger, metricsService } from '@/services/observability-service';
import { eventBus } from '@/orchestration/event-bus';

export interface RuntimeSignal {
  id: string;
  source: 'FALCO' | 'CILIUM' | 'TETRAGON';
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  containerId: string;
  nodeId: string;
  message: string;
  timestamp: string;
}

class ActiveDefenseService {
  private static instance: ActiveDefenseService;

  private constructor() {
    this.initializeSentinels();
  }

  public static getInstance(): ActiveDefenseService {
    if (!ActiveDefenseService.instance) {
      ActiveDefenseService.instance = new ActiveDefenseService();
    }
    return ActiveDefenseService.instance;
  }

  private initializeSentinels() {
    // 1. Listen for High-Intensity Runtime Signals
    eventBus.subscribe('RUNTIME_THREAT_DETECTED' as any, async (signal: any) => {
      if (signal.severity === 'critical') {
        await this.executeAutonomousContainment(signal);
      }
    });
  }

  /**
   * Executes a surgical isolation of a compromised node or container.
   */
  private async executeAutonomousContainment(signal: RuntimeSignal) {
    logger.error('ActiveDefense', `CRITICAL_CONTAINMENT_INITIATED: Node ${signal.nodeId}`);

    // 1. Stage isolation in the Execution Kernel
    await apiClient.post('/interventions', {
      type: 'ISOLATION',
      target: signal.nodeId,
      reasoning: `AUTONOMOUS_DEFENSE: Detected ${signal.type} behavioral pattern.`,
      status: 'ACTIVE',
      authorizedBy: 'SYSTEM_SENTINEL'
    });

    // 2. Propagate firewall rules via Cilium/NetworkPolicy
    await eventBus.publish('POLICY_VIOLATION_DETECTED' as any, {
      action: 'NETWORK_QUARANTINE',
      target: signal.nodeId,
      scope: 'CLUSTER_LOCAL'
    });

    metricsService.recordMetric('autonomous_containment_events', 1);
  }

  async getActiveSignals(): Promise<RuntimeSignal[]> {
    return [
      { id: 'S-1', source: 'FALCO', type: 'BINARY_DRIFT', severity: 'high', containerId: 'c-8821', nodeId: 'NODE-USA-01', message: 'Unauthorized shell execution detected in Treasury node.', timestamp: new Date().toISOString() },
      { id: 'S-2', source: 'TETRAGON', type: 'SENSITIVE_FILE_ACCESS', severity: 'critical', containerId: 'c-4421', nodeId: 'NODE-SG-04', message: 'Attempted read of /etc/vault/token by non-privileged process.', timestamp: new Date().toISOString() }
    ];
  }
}

export const activeDefense = ActiveDefenseService.getInstance();
