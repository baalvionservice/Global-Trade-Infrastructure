/**
 * @file server/services/trade-service.ts
 * @description Application service for the TradeTransaction lifecycle.
 *
 * The single entry point the API and tests use to create and drive trades. It
 * builds a Prisma-backed brain controller per request, persists everything, and
 * returns the full aggregate graph. No Prisma access happens here directly —
 * only through repositories and the orchestration ports.
 */
import { randomUUID } from 'node:crypto';
import { UserRole } from '@/core/roles';
import { TradeTerms } from '@/orchestration/ports';
import {
  tradeRepository,
  buyerRepository,
  supplierRepository,
  workflowRepository,
  eventRepository,
  auditRepository,
  organizationRepository,
  TradeWithGraph,
  PageRequest,
} from '../repositories';
import { buildBrain } from '../orchestration/wiring';
import { flushOutbox } from '../orchestration/event-store';
import { PortOverrides, OrgContext } from '../orchestration/prisma-ports';
import { NotFoundError } from '../db/errors';

export interface ActorRef {
  actorId: string;
  actorRole: UserRole;
}

export interface CreateTradeInput {
  organizationId: string;
  actor: ActorRef;
  terms: TradeTerms;
  buyer?: { name: string; externalRef?: string };
  supplier?: { name: string; externalRef?: string };
  reference?: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
  overrides?: PortOverrides;
}

async function ensureBuyer(organizationId: string, buyer: { name: string; externalRef?: string }): Promise<string> {
  if (buyer.externalRef) {
    const found = await buyerRepository.findByExternalRef(organizationId, buyer.externalRef);
    if (found) return found.id;
  }
  const created = await buyerRepository.create({ organizationId, name: buyer.name, externalRef: buyer.externalRef ?? null });
  return created.id;
}

async function ensureSupplier(organizationId: string, supplier: { name: string; externalRef?: string }): Promise<string> {
  if (supplier.externalRef) {
    const found = await supplierRepository.findByExternalRef(organizationId, supplier.externalRef);
    if (found) return found.id;
  }
  const created = await supplierRepository.create({ organizationId, name: supplier.name, externalRef: supplier.externalRef ?? null });
  return created.id;
}

async function orgContextFor(tradeId: string): Promise<OrgContext> {
  const t = await tradeRepository.findById(tradeId);
  if (!t) throw new NotFoundError('TradeTransaction', tradeId);
  return {
    organizationId: t.organizationId,
    reference: t.reference,
    correlationId: t.correlationId,
    buyerId: t.buyerId,
    supplierId: t.supplierId,
  };
}

async function loadGraph(tradeId: string): Promise<TradeWithGraph> {
  const graph = await tradeRepository.findFullGraph(tradeId);
  if (!graph) throw new NotFoundError('TradeTransaction', tradeId);
  return graph;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const tradeService = {
  /**
   * Resolve (find-or-create) the orchestration-side organization for a tenant.
   * Tolerant of non-UUID external tenant ids: falls back to a stable slug so the
   * dashboard create flow always lands on a valid Organization FK.
   */
  async ensureOrganization(input: { id?: string; name: string; slug: string }): Promise<string> {
    if (input.id && UUID_RE.test(input.id)) {
      const existing = await organizationRepository.findById(input.id);
      if (existing) return existing.id;
      const created = await organizationRepository.create({ id: input.id, name: input.name, slug: input.slug, type: 'GENERIC' });
      return created.id;
    }
    const bySlug = await organizationRepository.findBySlug(input.slug);
    if (bySlug) return bySlug.id;
    const created = await organizationRepository.create({ name: input.name, slug: input.slug, type: 'GENERIC' });
    return created.id;
  },

  async createTrade(input: CreateTradeInput): Promise<TradeWithGraph> {
    const tradeId = randomUUID();
    const reference = input.reference ?? `TRD-${tradeId.slice(0, 8).toUpperCase()}`;
    const correlationId = input.correlationId ?? tradeId;
    const buyerId = input.buyer ? await ensureBuyer(input.organizationId, input.buyer) : null;
    const supplierId = input.supplier ? await ensureSupplier(input.organizationId, input.supplier) : null;

    const ctx: OrgContext = {
      organizationId: input.organizationId,
      reference,
      correlationId,
      buyerId,
      supplierId,
      metadata: input.metadata,
    };
    const { brain } = buildBrain(ctx, input.overrides);
    await brain.startTrade({
      tradeId,
      terms: input.terms,
      actorId: input.actor.actorId,
      actorRole: input.actor.actorRole,
      correlationId,
      metadata: input.metadata,
    });
    await flushOutbox(undefined, { tradeId });
    return loadGraph(tradeId);
  },

  getTrade(tradeId: string): Promise<TradeWithGraph | null> {
    return tradeRepository.findFullGraph(tradeId);
  },

  /**
   * Tenant-isolation guard. Throws NotFound (not Forbidden) on a cross-tenant
   * id so trade existence is never leaked across organizations.
   */
  async assertTenant(tradeId: string, organizationId: string): Promise<void> {
    const t = await tradeRepository.findById(tradeId);
    if (!t || t.organizationId !== organizationId) {
      throw new NotFoundError('TradeTransaction', tradeId);
    }
  },

  listTrades(req: PageRequest = {}) {
    return tradeRepository.list(req);
  },

  async acceptRFQ(tradeId: string, actor: ActorRef, overrides?: PortOverrides): Promise<TradeWithGraph> {
    const { brain } = buildBrain(await orgContextFor(tradeId), overrides);
    await brain.acceptRFQ(tradeId, actor);
    await flushOutbox(undefined, { tradeId });
    return loadGraph(tradeId);
  },

  async rejectRFQ(tradeId: string, actor: ActorRef, reason: string, overrides?: PortOverrides): Promise<TradeWithGraph> {
    const { brain } = buildBrain(await orgContextFor(tradeId), overrides);
    await brain.rejectRFQ(tradeId, actor, reason);
    await flushOutbox(undefined, { tradeId });
    return loadGraph(tradeId);
  },

  async approveDeal(tradeId: string, actor: ActorRef, overrides?: PortOverrides): Promise<TradeWithGraph> {
    const { brain } = buildBrain(await orgContextFor(tradeId), overrides);
    await brain.approveDeal(tradeId, actor);
    await flushOutbox(undefined, { tradeId });
    return loadGraph(tradeId);
  },

  async fundEscrow(tradeId: string, actor: ActorRef, overrides?: PortOverrides): Promise<TradeWithGraph> {
    const { brain } = buildBrain(await orgContextFor(tradeId), overrides);
    await brain.fundEscrow(tradeId, actor);
    await flushOutbox(undefined, { tradeId });
    return loadGraph(tradeId);
  },

  async markDelivered(tradeId: string, actor: ActorRef, overrides?: PortOverrides): Promise<TradeWithGraph> {
    const { brain } = buildBrain(await orgContextFor(tradeId), overrides);
    await brain.markDelivered(tradeId, actor);
    await flushOutbox(undefined, { tradeId });
    return loadGraph(tradeId);
  },

  async releaseSettlement(tradeId: string, actor: ActorRef, overrides?: PortOverrides): Promise<TradeWithGraph> {
    const { brain } = buildBrain(await orgContextFor(tradeId), overrides);
    await brain.releaseSettlement(tradeId, actor);
    await flushOutbox(undefined, { tradeId });
    return loadGraph(tradeId);
  },

  /** Final settlement release that drives the trade to TRADE_COMPLETED. */
  completeTrade(tradeId: string, actor: ActorRef, overrides?: PortOverrides): Promise<TradeWithGraph> {
    return this.releaseSettlement(tradeId, actor, overrides);
  },

  async cancelTrade(tradeId: string, actor: ActorRef, reason: string, overrides?: PortOverrides): Promise<TradeWithGraph> {
    const { brain } = buildBrain(await orgContextFor(tradeId), overrides);
    await brain.cancelTrade(tradeId, actor, reason);
    await flushOutbox(undefined, { tradeId });
    return loadGraph(tradeId);
  },

  getAudit(tradeId: string, req: PageRequest = {}) {
    return auditRepository.listByTrade(tradeId, req);
  },

  getEvents(tradeId: string) {
    return eventRepository.listByTrade(tradeId);
  },

  async getWorkflow(tradeId: string) {
    const trade = await tradeRepository.findById(tradeId);
    if (!trade) throw new NotFoundError('TradeTransaction', tradeId);
    const history = await workflowRepository.listByTrade(tradeId);
    return {
      tradeId: trade.id,
      currentState: trade.currentState,
      version: trade.version,
      riskStatus: trade.riskStatus,
      complianceStatus: trade.complianceStatus,
      history,
    };
  },
};
