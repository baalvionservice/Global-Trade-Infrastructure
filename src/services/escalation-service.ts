/**
 * @file escalation-service.ts
 * @description Master service for Operational Escalations and SLA Resolution.
 * Orchestrates high-priority interventions across commercial and jurisdictional boundaries.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { logger, metricsService } from './observability-service';
import { communicationService } from './communication-service';
import { eventBus } from '@/orchestration/event-bus';

export type EscalationCategory = 'FINANCIAL' | 'LOGISTICS' | 'REGULATORY' | 'IDENTITY' | 'SYSTEMIC';
export type EscalationStatus = 'PENDING' | 'TRIAGE' | 'ACTIVE_WAR_ROOM' | 'RESOLVED' | 'ARCHIVED';

export interface EscalationCase {
  id: string;
  category: EscalationCategory;
  title: string;
  description: string;
  severity: 'high' | 'critical';
  status: EscalationStatus;
  referenceId: string; // Linked Order/Shipment ID
  slaDeadline: string;
  ownerId?: string;
  createdAt: string;
}

class EscalationService {
  private static instance: EscalationService;

  private constructor() {}

  public static getInstance(): EscalationService {
    if (!EscalationService.instance) {
      EscalationService.instance = new EscalationService();
    }
    return EscalationService.instance;
  }

  /**
   * Initializes a formal systemic escalation and provisions a War Room.
   */
  async raiseEscalation(data: Omit<EscalationCase, 'id' | 'status' | 'createdAt'>): Promise<EscalationCase> {
    logger.error('EscalationService', `RAISING_ESCALATION: ${data.category} - ${data.title}`);

    const res = await apiClient.post<EscalationCase>('/escalation_cases', {
      ...data,
      status: 'ACTIVE_WAR_ROOM',
      createdAt: new Date().toISOString()
    });

    const escalation = res.data!;

    // Provision the dialogue node for coordination
    await communicationService.provisionWarRoom({
      contextId: escalation.id,
      contextType: 'incident',
      title: `Escalation: ${escalation.title}`,
      participants: ['Sovereign_Arbiter', 'Tenant_Treasury', 'Logistics_Commander']
    });

    await eventBus.emit('Escalation', escalation.id, 'ESCALATION_WAR_ROOM_ACTIVATED', escalation);
    metricsService.recordMetric('systemic_escalations_total', 1);

    return escalation;
  }

  /**
   * Retrieves active escalations requiring governance oversight.
   */
  async getActiveEscalations(): Promise<EscalationCase[]> {
    const res = await apiClient.get<EscalationCase[]>('/escalation_cases', {
      status: 'ACTIVE_WAR_ROOM',
      sortBy: 'createdAt',
      order: 'desc'
    });
    return toList(res);
  }

  /**
   * Resolves an escalation case and releases the associated operational holds.
   */
  async resolveEscalation(id: string, outcome: string, authorizedBy: string) {
    logger.warn('EscalationService', `RESOLVING_ESCALATION: ${id} by ${authorizedBy}`);

    await apiClient.patch(`/escalation_cases/${id}`, {
      status: 'RESOLVED',
      resolutionOutcome: outcome,
      resolvedAt: new Date().toISOString(),
      authorizedBy
    });

    await eventBus.emit('Escalation', id, 'ESCALATION_RESOLVED', { outcome, authorizedBy });
  }
}

export const escalationService = EscalationService.getInstance();
