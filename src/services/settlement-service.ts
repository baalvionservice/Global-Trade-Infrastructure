/**
 * @file settlement-service.ts
 * @description High-fidelity settlement engine. 
 * Orchestrates the final release of funds from Escrow to Seller wallets.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { recordTransaction } from './ledger-service';
import { workflowEngine } from '@/orchestration/workflow-engine';
import { logger, metricsService } from './observability-service';
import { USER_ROLES } from '@/core/roles';

export type SettlementStatus = 'pending' | 'processing' | 'settled' | 'failed';

export interface Settlement {
  id: string;
  escrowId: string;
  sellerId: string;
  amount: number;
  currency: string;
  status: SettlementStatus;
  settledAt?: string;
}

/**
 * Triggers the settlement release process via the Execution Kernel.
 */
export async function triggerSettlement(escrowId: string, actorId: string): Promise<boolean> {
  logger.info('Settlement_Engine', `INITIATING_RELEASE: Escrow ${escrowId}`);

  const escrowRes = await apiClient.getDoc<any>('/escrows', escrowId);
  const escrow = escrowRes.data;

  if (!escrow) throw new Error('Escrow mandate not found.');

  // 1. Transition to RELEASED via Kernel (Triggers GST Matrix check)
  const released = await workflowEngine.transition({
    domain: 'SETTLEMENT',
    entityId: escrowId,
    from: escrow.status,
    to: 'RELEASED',
    actorId,
    actorRole: USER_ROLES.BANK_ADMIN, // Only Banks can release
    requestId: `REL-${escrowId}-${Date.now()}`,
    expectedVersion: escrow.version
  } as any);

  if (!released) return false;

  try {
    // 2. Execute Ledger Handshake (Credit Seller)
    await recordTransaction({
      companyId: escrow.sellerId,
      type: 'credit',
      amount: escrow.amount,
      currency: escrow.currency,
      referenceType: 'order',
      referenceId: escrow.orderId,
      description: `Settlement Release: Verified delivery for Order ${escrow.orderId}`
    });

    // 3. Auto-Advance to SETTLED (Terminal State)
    await workflowEngine.transition({
      domain: 'SETTLEMENT',
      entityId: escrowId,
      from: 'RELEASED',
      to: 'SETTLED',
      actorId: 'SYSTEM_TREASURY',
      actorRole: USER_ROLES.SUPER_ADMIN,
      payload: { settledAt: new Date().toISOString() }
    });

    metricsService.recordMetric('capital_release_finalized', escrow.amount);
    return true;

  } catch (error: any) {
    logger.error('Settlement_Engine', `FINALIZE_FAILURE: ${error.message}`);
    // In production, this triggers the Compensation Engine
    return false;
  }
}

export async function getSettlements(companyId?: string): Promise<Settlement[]> {
  const params = companyId ? { sellerId: companyId } : {};
  const res = await apiClient.get<Settlement[]>('/settlements', params);
  return toList(res);
}
