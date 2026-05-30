/**
 * @file reputation-ledger-service.ts
 * @description THE GLOBAL REPUTATION HISTORY LEDGER.
 * Maintains an immutable record of every auditable action affecting an entity's trust score.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { logger } from './observability-service';
import { eventBus } from './event-bus';

export interface ReputationEntry {
  id: string;
  orgId: string;
  action: string;
  delta: number;
  reason: string;
  createdAt: string;
}

export const reputationLedger = {
  /**
   * Records a trust impact event in the immutable reputation ledger.
   */
  async recordImpact(orgId: string, action: string, delta: number, reason: string) {
    logger.info('ReputationLedger', `TRUST_IMPACT: Node ${orgId} [${delta}] Reason: ${reason}`);

    const res = await apiClient.post<ReputationEntry>('/reputation_ledger', {
      orgId,
      action,
      delta,
      reason,
      createdAt: new Date().toISOString()
    });

    // Synchronize trust score via Graph Engine
    // (In a real system, this would be an async consumer of this event)
    await eventBus.publish('REPUTATION_CHANGE_RECORDED' as any, {
      entityId: orgId,
      entityType: 'identity',
      actorId: 'REPUTATION_ORACLE',
      payload: res.data
    });

    return res.data!;
  },

  /**
   * Retrieves the full auditable reputation history for an entity.
   */
  async getEntityHistory(orgId: string): Promise<ReputationEntry[]> {
    const res = await apiClient.get<ReputationEntry[]>('/reputation_ledger', { 
      orgId,
      sortBy: 'createdAt',
      order: 'desc'
    });
    return toList(res);
  }
};
