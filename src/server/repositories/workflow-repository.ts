/**
 * @file server/repositories/workflow-repository.ts
 * @description Append-only persistence for workflow transition + compensation
 * history (the `workflow_events` table). Restart-/replay-/audit-safe.
 */
import { WorkflowEvent, Prisma } from '@prisma/client';
import { BaseRepository, client } from './base-repository';
import { ModelDelegate, PrismaTransaction } from './types';

export class WorkflowRepository extends BaseRepository<WorkflowEvent> {
  protected readonly entityName = 'WorkflowEvent';
  protected readonly softDeletes = false;

  protected delegate(tx?: PrismaTransaction): ModelDelegate<WorkflowEvent> {
    return client(tx).workflowEvent as unknown as ModelDelegate<WorkflowEvent>;
  }

  /** Next 0-based sequence number for a trade's workflow log. */
  async nextSequence(tradeTransactionId: string, tx?: PrismaTransaction): Promise<number> {
    return client(tx).workflowEvent.count({ where: { tradeTransactionId } });
  }

  async append(
    data: Omit<Prisma.WorkflowEventUncheckedCreateInput, 'id' | 'sequence' | 'createdAt'>,
    tx?: PrismaTransaction,
  ): Promise<WorkflowEvent> {
    const sequence = await this.nextSequence(data.tradeTransactionId, tx);
    return client(tx).workflowEvent.create({ data: { ...data, sequence } });
  }

  async listByTrade(tradeTransactionId: string, tx?: PrismaTransaction): Promise<WorkflowEvent[]> {
    return client(tx).workflowEvent.findMany({
      where: { tradeTransactionId },
      orderBy: { sequence: 'asc' },
    });
  }
}

export const workflowRepository = new WorkflowRepository();
