/**
 * @file services/approval-orchestrator.ts
 * @description Manages the "Two-Key" authority principle and governance approval chains.
 */
import { apiClient } from '@/lib/api-client';
import { UserRole } from '@/core/roles';
import { eventBus } from '@/orchestration/event-bus';
import { WorkflowEngine } from '@/orchestration/workflow-engine';
import { logger } from './observability-service';

export interface ApprovalMandate {
  id: string;
  referenceId: string;
  referenceType: string;
  targetStatus: string;
  requiredRole: UserRole;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export const approvalOrchestrator = {
  /**
   * Stages a workflow action in the governance queue.
   */
  async requestApproval(data: Omit<ApprovalMandate, 'id' | 'status' | 'createdAt'>) {
    const res = await apiClient.post<ApprovalMandate>('/approvals', {
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    const mandate = res.data as ApprovalMandate;

    logger.warn('ApprovalOrchestrator', `GOVERNANCE_GATE_ACTIVE: ${data.referenceType} ${data.referenceId} requires ${data.requiredRole} sign-off.`);
    
    eventBus.emit('APPROVAL_REQUESTED', {
      entityId: mandate.id,
      entityType: 'approval',
      actorId: data.requestedBy,
      payload: mandate
    });

    return mandate;
  },

  /**
   * Finalizes an approval and triggers the actual workflow transition.
   */
  async decide(mandateId: string, decision: 'approved' | 'rejected', actorId: string) {
    const getRes = await apiClient.getDoc<ApprovalMandate>('approvals', mandateId);
    const mandate = getRes.data as ApprovalMandate;
    if (!mandate) throw new Error('MANDATE_NOT_FOUND');

    await apiClient.patch(`/approvals/${mandateId}`, {
      status: decision,
      decidedBy: actorId,
      decidedAt: new Date().toISOString()
    });

    if (decision === 'approved') {
      logger.info('ApprovalOrchestrator', `MANDATE_AUTHORIZED: Transitioning ${mandate.referenceType} ${mandate.referenceId} to ${mandate.targetStatus}`);
      await (WorkflowEngine as any).execute(
        mandate.referenceType,
        mandate.referenceId,
        mandate.targetStatus as any,
        actorId
      );
    } else {
      logger.error('ApprovalOrchestrator', `MANDATE_DENIED: Governance override for ${mandate.referenceId}`);
    }

    eventBus.emit('APPROVAL_DECIDED', {
      entityId: mandate.id,
      entityType: 'approval',
      actorId,
      payload: { decision, referenceId: mandate.referenceId }
    });
  }
};
