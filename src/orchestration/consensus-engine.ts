/**
 * @file consensus-engine.ts
 * @description Multi-party agreement coordinator. Ensures state transitions only occur
 * once all required institutional signatures are captured.
 */
import { apiClient } from '@/lib/api-client';
import { logger } from '@/services/observability-service';
import { eventBus } from '@/services/event-bus';
import { UserRole } from '@/core/roles';

export interface PendingTransition {
  id: string;
  entityId: string;
  domain: string;
  from: string;
  to: string;
  requiredRoles: UserRole[];
  capturedSignatures: { role: UserRole; actorId: string; timestamp: string }[];
  status: 'PENDING' | 'REACHED' | 'EXPIRED';
}

class ConsensusEngine {
  private static instance: ConsensusEngine;

  private constructor() {}

  public static getInstance(): ConsensusEngine {
    if (!ConsensusEngine.instance) {
      ConsensusEngine.instance = new ConsensusEngine();
    }
    return ConsensusEngine.instance;
  }

  /**
   * Initializes a transition that requires consensus.
   */
  async initializeTransition(data: {
    entityId: string;
    domain: string;
    from: string;
    to: string;
    requiredRoles: UserRole[];
  }): Promise<PendingTransition> {
    const res = await apiClient.post<PendingTransition>('/consensus_pending', {
      ...data,
      capturedSignatures: [],
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });

    logger.info('ConsensusEngine', `TRANSITION_STAGED: ${data.domain} ${data.entityId} [${data.from} -> ${data.to}]`);
    return res.data!;
  }

  /**
   * Records a signature from an authorized role.
   */
  async sign(transitionId: string, role: UserRole, actorId: string): Promise<boolean> {
    const res = await apiClient.getDoc<PendingTransition>('consensus_pending', transitionId);
    const transition = res.data;

    if (!transition || transition.status !== 'PENDING') return false;

    if (!transition.requiredRoles.includes(role)) {
      logger.warn('ConsensusEngine', `UNAUTHORIZED_SIGNATURE_ATTEMPT: Role ${role} for transition ${transitionId}`);
      return false;
    }

    if (transition.capturedSignatures.find(s => s.role === role)) return true;

    const newSignature = { role, actorId, timestamp: new Date().toISOString() };
    const updatedSignatures = [...transition.capturedSignatures, newSignature];

    const isComplete = updatedSignatures.length >= transition.requiredRoles.length;

    await apiClient.patch(`/consensus_pending/${transitionId}`, {
      capturedSignatures: updatedSignatures,
      status: isComplete ? 'REACHED' : 'PENDING'
    });

    if (isComplete) {
      logger.info('ConsensusEngine', `CONSENSUS_REACHED: Transition ${transitionId} is authorized.`);
      await eventBus.publish(`${transition.domain.toUpperCase()}_CONSENSUS_REACHED` as any, transition);
    }

    return true;
  }
}

export const consensusEngine = ConsensusEngine.getInstance();
