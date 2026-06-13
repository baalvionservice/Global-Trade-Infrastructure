/**
 * @file server/finance/trade-finance-service.ts
 * @description Trade finance (Agent 8). Letter of credit, bank guarantee,
 * invoice financing, factoring, supply-chain finance and PO finance — modelled
 * as financing requests that, on approval, mint a finance instrument bound to
 * the trade. Every mutation is audited and emits a domain event.
 */
import { FinanceInstrumentType, FinanceStatus, TradeFinanceInstrument, FinancingRequest, Prisma } from '@prisma/client';
import { UserRole } from '@/core/roles';
import { eventBus } from '@/orchestration/event-bus';
import { withTransaction } from '../db/prisma';
import {
  tradeRepository,
  financingRequestRepository,
  tradeFinanceInstrumentRepository,
  auditRepository,
} from '../repositories';
import { NotFoundError, ValidationError } from '../db/errors';
import { ensureEventStore } from '../orchestration/event-store';

export interface RequestFinancingInput {
  tradeId: string;
  type: FinanceInstrumentType;
  amount: number;
  currency?: string;
  requestedBy: string;
  requestedRole: UserRole;
  terms?: Record<string, unknown>;
}

export interface DecisionInput {
  requestId: string;
  decision: 'approved' | 'rejected';
  actorId: string;
  actorRole: UserRole;
  reason?: string;
  provider?: string;
}

function asJson(v: unknown): Prisma.InputJsonValue {
  return v as Prisma.InputJsonValue;
}

export const tradeFinanceService = {
  async requestFinancing(input: RequestFinancingInput): Promise<FinancingRequest> {
    ensureEventStore();
    if (input.amount <= 0) throw new ValidationError('Financing amount must be positive');
    const trade = await tradeRepository.findById(input.tradeId);
    if (!trade) throw new NotFoundError('TradeTransaction', input.tradeId);

    const request = await withTransaction(async (tx) => {
      const created = await financingRequestRepository.create(
        {
          organizationId: trade.organizationId,
          tradeTransactionId: trade.id,
          type: input.type,
          amount: input.amount,
          currency: input.currency ?? 'USD',
          status: FinanceStatus.REQUESTED,
          requestedBy: input.requestedBy,
        },
        tx,
      );
      await auditRepository.record(
        {
          organizationId: trade.organizationId,
          tradeId: trade.id,
          entityType: 'FinancingRequest',
          entityId: created.id,
          action: 'REQUEST_FINANCING',
          actorId: input.requestedBy,
          actorRole: String(input.requestedRole),
          source: 'trade-finance',
          afterState: asJson({ type: input.type, amount: input.amount, status: FinanceStatus.REQUESTED }),
          correlationId: trade.correlationId,
        },
        tx,
      );
      return created;
    });

    await eventBus.publish('finance.requested', {
      tradeId: trade.id,
      requestId: request.id,
      type: input.type,
      amount: input.amount,
      actorId: input.requestedBy,
      correlationId: trade.correlationId,
    });
    return request;
  },

  async decideFinancing(
    input: DecisionInput,
  ): Promise<{ request: FinancingRequest; instrument: TradeFinanceInstrument | null }> {
    ensureEventStore();
    const request = await financingRequestRepository.findById(input.requestId);
    if (!request) throw new NotFoundError('FinancingRequest', input.requestId);
    if (request.status !== FinanceStatus.REQUESTED && request.status !== FinanceStatus.UNDER_REVIEW) {
      throw new ValidationError(`Financing request ${request.id} is already ${request.status}`);
    }
    const trade = await tradeRepository.findByIdOrThrow(request.tradeTransactionId);

    const result = await withTransaction(async (tx) => {
      let instrument: TradeFinanceInstrument | null = null;
      const nextStatus = input.decision === 'approved' ? FinanceStatus.APPROVED : FinanceStatus.REJECTED;

      if (input.decision === 'approved') {
        instrument = await tradeFinanceInstrumentRepository.create(
          {
            organizationId: trade.organizationId,
            tradeTransactionId: trade.id,
            type: request.type,
            status: FinanceStatus.ACTIVE,
            amount: request.amount,
            currency: request.currency,
            provider: input.provider ?? null,
          },
          tx,
        );
      }

      const updated = await financingRequestRepository.updateWithLock(
        request.id,
        request.version ?? 1,
        {
          status: nextStatus,
          decidedBy: input.actorId,
          reason: input.reason ?? null,
          instrumentId: instrument?.id ?? null,
        },
        tx,
      );

      await auditRepository.record(
        {
          organizationId: trade.organizationId,
          tradeId: trade.id,
          entityType: 'FinancingRequest',
          entityId: request.id,
          action: input.decision === 'approved' ? 'APPROVE_FINANCING' : 'REJECT_FINANCING',
          actorId: input.actorId,
          actorRole: String(input.actorRole),
          source: 'trade-finance',
          beforeState: asJson({ status: request.status }),
          afterState: asJson({ status: nextStatus, instrumentId: instrument?.id ?? null }),
          correlationId: trade.correlationId,
        },
        tx,
      );
      return { request: updated, instrument };
    });

    await eventBus.publish(input.decision === 'approved' ? 'finance.approved' : 'finance.rejected', {
      tradeId: trade.id,
      requestId: request.id,
      instrumentId: result.instrument?.id,
      actorId: input.actorId,
      correlationId: trade.correlationId,
    });
    return result;
  },

  async settleInstrument(instrumentId: string, actorId: string, actorRole: UserRole): Promise<TradeFinanceInstrument> {
    ensureEventStore();
    const instrument = await tradeFinanceInstrumentRepository.findById(instrumentId);
    if (!instrument) throw new NotFoundError('TradeFinanceInstrument', instrumentId);
    const trade = await tradeRepository.findByIdOrThrow(instrument.tradeTransactionId);

    const settled = await withTransaction(async (tx) => {
      const updated = await tradeFinanceInstrumentRepository.updateWithLock(
        instrument.id,
        instrument.version ?? 1,
        { status: FinanceStatus.SETTLED },
        tx,
      );
      await auditRepository.record(
        {
          organizationId: trade.organizationId,
          tradeId: trade.id,
          entityType: 'TradeFinanceInstrument',
          entityId: instrument.id,
          action: 'SETTLE_FINANCING',
          actorId,
          actorRole: String(actorRole),
          source: 'trade-finance',
          beforeState: asJson({ status: instrument.status }),
          afterState: asJson({ status: FinanceStatus.SETTLED }),
          correlationId: trade.correlationId,
        },
        tx,
      );
      return updated;
    });

    await eventBus.publish('finance.settled', {
      tradeId: trade.id,
      instrumentId: instrument.id,
      actorId,
      correlationId: trade.correlationId,
    });
    return settled;
  },

  async listForTrade(tradeId: string): Promise<{ instruments: TradeFinanceInstrument[]; requests: FinancingRequest[] }> {
    const [instruments, requests] = await Promise.all([
      tradeFinanceInstrumentRepository.listByTrade(tradeId),
      financingRequestRepository.listByTrade(tradeId),
    ]);
    return { instruments, requests };
  },
};
