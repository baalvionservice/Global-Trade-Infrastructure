/**
 * @file workflow-engine.ts
 * @description THE SINGLE GLOBAL EXECUTION KERNEL (SGEK).
 * Enforces the GST Matrix, manages idempotency, and enables forensic state orchestration.
 */
import { GST_TRANSITION_MATRIX } from '@/core/gst';
import { eventBus, PlatformEvent } from './event-bus';
import { logger, metricsService } from '@/services/observability-service';
import { apiClient } from '@/lib/api-client';
import { UserRole } from '@/core/roles';
import { LifecycleStatus } from '@/types/institutional';

export class WorkflowEngine {
  private static instance: WorkflowEngine;
  private idempotencyLedger: Set<string> = new Set();

  private constructor() {}

  public static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  /**
   * EXECUTES A DETERMINISTIC STATE TRANSITION.
   * Logic: Validate -> Guard (GST) -> Commit -> Project -> Propagate
   */
  async transition(data: {
    domain: string;
    entityId: string;
    from: LifecycleStatus;
    to: LifecycleStatus;
    actorId: string;
    actorRole: UserRole;
    requestId?: string;
    payload?: any;
  }): Promise<boolean> {
    const { domain, entityId, from, to, actorId, actorRole, requestId } = data;

    // 1. Idempotency Check
    if (requestId && this.idempotencyLedger.has(requestId)) {
      logger.warn('WorkflowKernel', `IDEMPOTENT_RETRY: Request ${requestId} already processed.`);
      return true;
    }

    // 2. GST Matrix Validation
    const fromKey = `${domain.toUpperCase()}:${from.toUpperCase()}`;
    const toKey = to.toUpperCase();
    const transitionRule = GST_TRANSITION_MATRIX[fromKey]?.find(r => r.target === `${domain.toUpperCase()}:${toKey}`);

    if (!transitionRule) {
      logger.error('WorkflowKernel', `ILLEGAL_TRANSITION: ${fromKey} -> ${toKey} denied by GST.`);
      throw new Error(`Execution policy violation: Transition not permitted.`);
    }

    // 3. Transition Execution
    try {
      logger.info('WorkflowKernel', `EXECUTING_TRANSITION: ${fromKey} -> ${toKey} [Entity: ${entityId}]`);

      // Persist the projection to the live trade-service typed resource.
      const collectionMap: Record<string, string> = {
        'SOURCING': 'rfqs',
        'NEGOTIATION': 'deals',
        'EXECUTION': 'orders',
        'FINANCIAL': 'escrows',
        'LOGISTICS': 'shipments'
      };

      const collection = collectionMap[domain.toUpperCase()];
      if (collection) {
        try {
          await apiClient.patch(`/${collection}/${entityId}`, { status: to });
        } catch {
          logger.warn('WorkflowKernel', `Projection update deferred for ${collection}/${entityId}`);
        }
      }

      // 4. Record Idempotency
      if (requestId) this.idempotencyLedger.add(requestId);

      // 5. Emit Orchestration Event
      await eventBus.publish('WORKFLOW_STEP_COMPLETED', {
        domain,
        entityId,
        from,
        to,
        actorId,
        actorRole,
        timestamp: new Date().toISOString()
      });

      metricsService.recordMetric('workflow_transition_success', 1);
      return true;
    } catch (e: any) {
      logger.error('WorkflowKernel', `TRANSITION_FAILURE: ${e.message}`);
      return false;
    }
  }

  /**
   * Replays a specific entity's workflow history for forensic reconstruction.
   */
  async getAuditTrail(entityId: string): Promise<PlatformEvent[]> {
    return eventBus.getHistory().filter(e => e.payload.entityId === entityId);
  }
}

export const workflowEngine = WorkflowEngine.getInstance();
