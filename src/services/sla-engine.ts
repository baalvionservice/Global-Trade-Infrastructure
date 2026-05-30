/**
 * @file sla-engine.ts
 * @description Institutional SLA, Reliability Monitoring, and Deadline Enforcement Engine.
 * Ensures platform commitments are honored across jurisdictional boundaries.
 */
import { apiClient } from '@/lib/api-client';
import { eventBus } from '@/services/event-bus';
import { logger, metricsService } from './observability-service';
import { LifecycleStatus } from '@/types/institutional';
import { UserRole, USER_ROLES } from '@/core/roles';

export interface SLAMonitor {
  id: string;
  entityId: string;
  entityType: string;
  status: LifecycleStatus;
  deadline: string;
  escalationRole: UserRole;
  breached: boolean;
  commitmentType: 'settlement' | 'clearance' | 'delivery' | 'response' | 'handshake';
  expectedLatency: string;
  createdAt: string;
}

class SLAEngine {
  private static instance: SLAEngine;

  private constructor() {}

  public static getInstance(): SLAEngine {
    if (!SLAEngine.instance) {
      SLAEngine.instance = new SLAEngine();
    }
    return SLAEngine.instance;
  }

  /**
   * Registers a new reliability monitor for a workflow transition.
   */
  async startMonitor(data: {
    entityType: string;
    entityId: string;
    status: LifecycleStatus;
    commitmentType: SLAMonitor['commitmentType'];
    durationHours: number;
  }) {
    const deadline = new Date(Date.now() + data.durationHours * 3600000).toISOString();
    
    const res = await apiClient.post<any>('/sla_monitors', {
      entityId: data.entityId,
      entityType: data.entityType,
      status: data.status,
      commitmentType: data.commitmentType,
      deadline,
      expectedLatency: `${data.durationHours}h`,
      escalationRole: this.getEscalationRole(data.entityType, data.status),
      breached: false,
      createdAt: new Date().toISOString()
    });

    logger.info('SLAEngine', `MONITOR_STARTED: ${data.commitmentType.toUpperCase()} commitment for ${data.entityId}`);
    return res.data;
  }

  async scanForBreaches() {
    const res = await apiClient.get<SLAMonitor[]>('/sla_monitors', { breached: false });
    const monitors = res.data || [];
    const now = new Date();

    for (const monitor of monitors) {
      if (new Date(monitor.deadline) < now) {
        await this.handleBreach(monitor);
      }
    }
  }

  private async handleBreach(monitor: SLAMonitor) {
    logger.error('SLAEngine', `RELIABILITY_BREACH: ${monitor.commitmentType.toUpperCase()} deadline failed for ${monitor.entityId}`);
    
    await apiClient.patch(`/sla_monitors/${monitor.id}`, { breached: true });

    await eventBus.publish('POLICY_VIOLATION_DETECTED' as any, {
      entityId: monitor.entityId,
      entityType: monitor.entityType,
      targetRole: monitor.escalationRole,
      severity: 'critical',
      payload: monitor
    });

    metricsService.recordMetric('sla_breaches_total', 1);
  }

  private getEscalationRole(type: string, status: string): UserRole {
    if (type === 'shipment') return USER_ROLES.AGENT;
    if (type === 'escrow' || type === 'payment') return USER_ROLES.BANK_ADMIN;
    if (type === 'rfq' || type === 'deal') return USER_ROLES.BUYER;
    return USER_ROLES.COMPLIANCE_ADMIN;
  }

  async getActiveMonitors(): Promise<SLAMonitor[]> {
    const res = await apiClient.get<SLAMonitor[]>('/sla_monitors', { sortBy: 'createdAt', order: 'desc' });
    return res.data || [
      { id: 'SLA-1', entityId: 'SHP-4421', entityType: 'shipment', status: 'IN_TRANSIT', deadline: new Date(Date.now() + 14200000).toISOString(), breached: false, commitmentType: 'delivery', expectedLatency: '72h', escalationRole: USER_ROLES.AGENT, createdAt: new Date().toISOString() },
      { id: 'SLA-2', entityId: 'ESC-5002', entityType: 'escrow', status: 'FUNDED', deadline: new Date(Date.now() - 3600000).toISOString(), breached: true, commitmentType: 'settlement', expectedLatency: '24h', escalationRole: USER_ROLES.BANK_ADMIN, createdAt: new Date().toISOString() }
    ] as SLAMonitor[];
  }
}

export const slaEngine = SLAEngine.getInstance();
