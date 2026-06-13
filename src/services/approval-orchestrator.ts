/**
 * @file services/approval-orchestrator.ts
 * @description Governance approval layer — the "two-key" authority principle.
 *
 * This is the governance front-end to the orchestration kernel: it records the
 * decision, writes the audit/approval event, and then drives the corresponding
 * execution through the Brain Controller. It never mutates downstream domains
 * directly — every effect flows through Brain Controller + Workflow Engine +
 * Event Bus, keeping the modules decoupled.
 */
import { apiClient } from '@/lib/api-client';
import { UserRole } from '@/core/roles';
import { eventBus } from '@/orchestration/event-bus';
import { brainController, ActorRef } from '@/orchestration/brain-controller';
import { TradeContext } from '@/orchestration/ports';
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

type ApprovalDomain = 'RFQ' | 'DEAL' | 'ORDER' | 'ESCROW' | 'SETTLEMENT';
type Decision = 'approved' | 'rejected';

/** Emit the governance audit/approval event and best-effort persist it. */
async function recordDecision(
  domain: ApprovalDomain,
  tradeId: string,
  decision: Decision,
  actor: ActorRef,
  reason?: string,
): Promise<void> {
  const event = {
    tradeId,
    entityId: tradeId,
    entityType: 'approval',
    domain,
    decision,
    reason,
    actorId: actor.actorId,
    userId: actor.actorId,
    correlationId: tradeId,
    decidedAt: new Date().toISOString(),
  };
  logger.info('ApprovalOrchestrator', `${domain}_${decision.toUpperCase()} for trade ${tradeId} by ${actor.actorRole}`);
  await eventBus.emit('APPROVAL_DECIDED', event);
  // Governance ledger is best-effort: a missing backend never blocks the gate.
  try {
    await apiClient.post('/approvals', { ...event, status: decision });
  } catch (err: unknown) {
    logger.warn('ApprovalOrchestrator', `Approval ledger deferred: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export const approvalOrchestrator = {
  /** Stages a workflow action in the governance queue (two-key request). */
  async requestApproval(data: Omit<ApprovalMandate, 'id' | 'status' | 'createdAt'>): Promise<ApprovalMandate> {
    const res = await apiClient.post<ApprovalMandate>('/approvals', {
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    const mandate = res.data as ApprovalMandate;

    logger.warn(
      'ApprovalOrchestrator',
      `GOVERNANCE_GATE_ACTIVE: ${data.referenceType} ${data.referenceId} requires ${data.requiredRole} sign-off.`,
    );

    await eventBus.emit('APPROVAL_REQUESTED', {
      entityId: mandate.id,
      entityType: 'approval',
      actorId: data.requestedBy,
      payload: mandate,
    });

    return mandate;
  },

  /** Finalizes a staged mandate and drives the trade past its current gate. */
  async decide(mandateId: string, decision: Decision, actorId: string, actorRole: UserRole): Promise<void> {
    const getRes = await apiClient.getDoc<ApprovalMandate>('approvals', mandateId);
    const mandate = getRes.data as ApprovalMandate;
    if (!mandate) throw new Error('MANDATE_NOT_FOUND');

    await apiClient.patch(`/approvals/${mandateId}`, {
      status: decision,
      decidedBy: actorId,
      decidedAt: new Date().toISOString(),
    });

    const actor: ActorRef = { actorId, actorRole };
    if (decision === 'approved') {
      logger.info('ApprovalOrchestrator', `MANDATE_AUTHORIZED: advancing trade ${mandate.referenceId}`);
      await brainController.approveTrade(mandate.referenceId, actor);
    } else {
      logger.error('ApprovalOrchestrator', `MANDATE_DENIED: ${mandate.referenceId}`);
      await brainController.blockTrade(mandate.referenceId, actor, `mandate_denied:${mandateId}`);
    }

    await eventBus.emit('APPROVAL_DECIDED', {
      entityId: mandate.id,
      entityType: 'approval',
      actorId,
      payload: { decision, referenceId: mandate.referenceId },
    });
  },

  // --- Lifecycle-specific approvals (spec-mandated) --------------------------

  async approveRFQ(tradeId: string, actor: ActorRef): Promise<TradeContext> {
    await recordDecision('RFQ', tradeId, 'approved', actor);
    return brainController.acceptRFQ(tradeId, actor);
  },

  async rejectRFQ(tradeId: string, actor: ActorRef, reason = 'rfq_rejected'): Promise<TradeContext> {
    await recordDecision('RFQ', tradeId, 'rejected', actor, reason);
    return brainController.rejectRFQ(tradeId, actor, reason);
  },

  async approveDeal(tradeId: string, actor: ActorRef): Promise<TradeContext> {
    await recordDecision('DEAL', tradeId, 'approved', actor);
    return brainController.approveDeal(tradeId, actor);
  },

  async rejectDeal(tradeId: string, actor: ActorRef, reason = 'deal_rejected'): Promise<TradeContext> {
    await recordDecision('DEAL', tradeId, 'rejected', actor, reason);
    return brainController.blockTrade(tradeId, actor, reason);
  },

  async approveOrder(tradeId: string, actor: ActorRef): Promise<TradeContext> {
    await recordDecision('ORDER', tradeId, 'approved', actor);
    // Order confirmation is auto-driven post deal-approval; ensure progression.
    return brainController.routeWorkflow(tradeId, actor);
  },

  async rejectOrder(tradeId: string, actor: ActorRef, reason = 'order_rejected'): Promise<TradeContext> {
    await recordDecision('ORDER', tradeId, 'rejected', actor, reason);
    return brainController.blockTrade(tradeId, actor, reason);
  },

  async approveEscrow(tradeId: string, actor: ActorRef): Promise<TradeContext> {
    await recordDecision('ESCROW', tradeId, 'approved', actor);
    return brainController.fundEscrow(tradeId, actor);
  },

  async rejectEscrow(tradeId: string, actor: ActorRef, reason = 'escrow_rejected'): Promise<TradeContext> {
    await recordDecision('ESCROW', tradeId, 'rejected', actor, reason);
    return brainController.blockTrade(tradeId, actor, reason);
  },

  async approveSettlement(tradeId: string, actor: ActorRef): Promise<TradeContext> {
    await recordDecision('SETTLEMENT', tradeId, 'approved', actor);
    return brainController.releaseSettlement(tradeId, actor);
  },

  async rejectSettlement(tradeId: string, actor: ActorRef, reason = 'settlement_rejected'): Promise<TradeContext> {
    await recordDecision('SETTLEMENT', tradeId, 'rejected', actor, reason);
    return brainController.blockTrade(tradeId, actor, reason);
  },
};
