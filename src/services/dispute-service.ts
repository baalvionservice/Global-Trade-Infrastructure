/**
 * @file dispute-service.ts
 * @description Authoritative service for institutional trade adjudication and arbitration.
 * Connects commercial disputes with sovereign legal finality.
 */
import { apiClient } from '@/lib/api-client';
import { logger } from './observability-service';
import { eventBus } from '@/orchestration/event-bus';
import { updateEscrowStatus } from './escrow-service';
import { DisputeCase } from '@/types/institutional';

/**
 * The trade-service Dispute model is flat snake_case with a lowercase status
 * enum. Map it onto the UI DisputeCase, surfacing status UPPERCASE (the registry
 * colour map + detail view expect OPEN/ARBITRATION/RESOLVED/...).
 */
function mapDisputeFromApi(raw: any): DisputeCase {
  const dtype = raw?.dispute_type || 'other';
  const orderId = String(raw?.order_id ?? '');
  return {
    id: String(raw?.id),
    tradeId: orderId,
    referenceType: 'order',
    referenceId: orderId,
    title: raw?.description || `${dtype.charAt(0).toUpperCase()}${dtype.slice(1)} dispute`,
    reason: raw?.description || '',
    raisedBy: String(raw?.claimant_org_id ?? ''),
    initiatorId: String(raw?.claimant_org_id ?? ''),
    respondentId: String(raw?.respondent_org_id ?? ''),
    disputeType: dtype,
    severity: raw?.severity || 'standard',
    status: String(raw?.status || 'open').toUpperCase(),
    arbitratorId: raw?.arbitrator_id || undefined,
    resolution: raw?.resolution || undefined,
    evidence: Array.isArray(raw?.evidence) ? raw.evidence : [],
    createdAt: raw?.created_at || new Date().toISOString(),
    updatedAt: raw?.updated_at || new Date().toISOString(),
  } as DisputeCase;
}

const DISPUTE_TYPES = ['quality', 'delivery', 'payment', 'documentation', 'other'];

export const disputeService = {
  /**
   * Initializes a formal trade dispute and applies a best-effort escrow hold.
   */
  async openDispute(data: Partial<DisputeCase>): Promise<DisputeCase> {
    const d = data as any;
    logger.warn('DisputeService', `OPENING_DISPUTE: Ref ${d.referenceId} initiated by ${d.initiatorId}`);

    const dtype = DISPUTE_TYPES.includes(d.disputeType) ? d.disputeType : 'other';
    const res = await apiClient.post<any>('/disputes', {
      order_id: d.referenceId,
      claimant_org_id: d.initiatorId,
      respondent_org_id: d.respondentId,
      dispute_type: dtype,
      description: d.title || d.reason,
      status: 'open',
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to open dispute.');
    }
    const dispute = mapDisputeFromApi(res.data);

    // Best-effort financial intervention: place the linked order's escrow on hold.
    if (d.referenceType === 'payment' || d.referenceType === 'order') {
      const escrowRes = await apiClient.get<any>('/escrows', { order_id: d.referenceId });
      const escrow = escrowRes.data?.items?.[0];
      if (escrow) {
        try {
          await updateEscrowStatus(String(escrow.id), 'disputed', { disputeId: dispute.id });
        } catch { /* hold is best-effort; the dispute itself is authoritative */ }
      }
    }

    await eventBus.emit('DISPUTE_CASE_OPENED', {
      entityId: dispute.id,
      entityType: 'dispute',
      actorId: (dispute as any).initiatorId,
      payload: dispute,
    });

    return dispute;
  },

  /**
   * Moves a case into arbitration (lowercase enum value the backend accepts).
   */
  async assignArbitrator(disputeId: string, arbitratorId: string): Promise<DisputeCase | null> {
    logger.info('DisputeService', `ASSIGNING_ARBITRATOR: Case ${disputeId} assigned to ${arbitratorId}`);
    const res = await apiClient.patch<any>(`/disputes/${disputeId}`, { status: 'arbitration' });
    return res.success && res.data ? mapDisputeFromApi(res.data) : null;
  },

  /**
   * Issues a binding resolution via the real PATCH /disputes/:id/resolve endpoint.
   */
  async resolveCase(disputeId: string, arbitratorId: string, outcome: string, logic: string): Promise<DisputeCase> {
    logger.forensic('DisputeService', 'DISPUTE_RESOLVED', `Case ${disputeId} resolved with outcome: ${outcome}`, arbitratorId, 'SYSTEM');

    const res = await apiClient.patch<any>(`/disputes/${disputeId}/resolve`, {
      resolution: `${outcome}: ${logic}`,
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to resolve dispute.');
    }
    const dispute = mapDisputeFromApi(res.data);

    await eventBus.emit('GOVERNANCE_DECISION_ISSUED', {
      entityId: disputeId,
      entityType: 'dispute',
      actorId: arbitratorId,
      payload: dispute,
    });

    return dispute;
  },

  async getDisputes(filters: any = {}): Promise<DisputeCase[]> {
    const res = await apiClient.get<any>('/disputes', filters);
    return (res.data?.items ?? []).map(mapDisputeFromApi);
  },

  async getDisputeById(id: string): Promise<DisputeCase | null> {
    const res = await apiClient.getDoc<any>('disputes', id);
    return res.success && res.data ? mapDisputeFromApi(res.data) : null;
  },
};
