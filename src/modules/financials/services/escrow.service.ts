/**
 * @file escrow.service.ts
 * @description Institutional Escrow Governance Service.
 * Implements strict state-gated capital management for global trade.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { EscrowMandate, SettlementStatus } from '../types/financial.types';
import { logger, metricsService } from '@/services/observability-service';
import { eventBus } from '@/orchestration/event-bus';

class EscrowService {
  private static instance: EscrowService;

  private constructor() {}

  public static getInstance(): EscrowService {
    if (!EscrowService.instance) {
      EscrowService.instance = new EscrowService();
    }
    return EscrowService.instance;
  }

  async getEscrows(): Promise<EscrowMandate[]> {
    const res = await apiClient.get<EscrowMandate[]>('/escrows', { sortBy: 'updatedAt', order: 'desc' });
    return toList<EscrowMandate>(res);
  }

  async getEscrowById(id: string): Promise<EscrowMandate | null> {
    const res = await apiClient.getDoc<EscrowMandate>('escrows', id);
    return res.data;
  }

  /**
   * Triggers a state transition for an escrow mandate.
   * Gated by the single global execution kernel.
   */
  async transitionState(id: string, targetStatus: SettlementStatus, authorizedBy: string) {
    logger.warn('EscrowGovernance', `INITIATING_TRANSITION: Mandate ${id} to ${targetStatus}`);

    const res = await apiClient.patch<EscrowMandate>(`/escrows/${id}`, {
      status: targetStatus,
      authorizedBy,
      updatedAt: new Date().toISOString()
    });

    await eventBus.publish('ESCROW_STATE_CHANGED' as any, res.data);
    metricsService.recordMetric('escrow_transitions_total', 1);

    return res.data!;
  }
}

export const escrowService = EscrowService.getInstance();
