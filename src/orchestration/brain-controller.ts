/**
 * @file brain-controller.ts
 * @description The central command layer of the trade operating system.
 *
 * The brain controller is the single coordination point that binds the
 * Workflow Engine, Event Bus, Risk / Compliance / Pricing / Notification
 * engines and the Trade execution domain. It exposes the high-level verbs the
 * platform drives a trade with (`startTrade`, `evaluateTrade`, `approveTrade`,
 * `blockTrade`, `routeWorkflow`, plus the lifecycle gate commands) and owns the
 * auto-progression driver that carries a trade from one human/external gate to
 * the next purely through orchestration and events — never by callers poking
 * downstream modules directly.
 *
 * Backward compatibility: the legacy `initialize()` /
 * `processHighAuthorityMission()` AI-fabric methods are preserved.
 */
import { logger, metricsService } from '@/services/observability-service';
import { unificationService } from '@/services/unification-service';
import { eventBus, EventBus } from './event-bus';
import { workflowEngine, WorkflowEngine } from './workflow-engine';
import {
  TradeLifecycleState,
  TRADE_EVENTS,
  getStageSpec,
  isTerminal,
} from './lifecycle';
import {
  OrchestrationPorts,
  TradeContext,
  TradeTerms,
  RiskAssessment,
  ComplianceResult,
  PriceQuote,
  NotificationMessage,
} from './ports';
import { UserRole } from '@/core/roles';

export interface ActorRef {
  actorId: string;
  actorRole: UserRole;
}

export interface StartTradeInput {
  tradeId: string;
  terms: TradeTerms;
  actorId: string;
  actorRole: UserRole;
  correlationId?: string;
  metadata?: Record<string, unknown>;
}

export interface TradeDecision {
  tradeId: string;
  approved: boolean;
  risk: RiskAssessment;
  compliance: ComplianceResult;
  price: PriceQuote;
  reasons: string[];
  evaluatedAt: string;
}

class BrainController {
  private static instance: BrainController;

  private ports: OrchestrationPorts | null;
  private installed = false;

  private constructor(
    private readonly engine: WorkflowEngine = workflowEngine,
    private readonly bus: EventBus = eventBus,
    ports: OrchestrationPorts | null = null,
  ) {
    this.ports = ports;
  }

  public static getInstance(): BrainController {
    if (!BrainController.instance) {
      BrainController.instance = new BrainController();
    }
    return BrainController.instance;
  }

  /** Build an isolated controller with injected ports (tests / runners). */
  public static create(deps: {
    ports: OrchestrationPorts;
    engine?: WorkflowEngine;
    bus?: EventBus;
  }): BrainController {
    const bus = deps.bus ?? eventBus;
    const engine = deps.engine ?? WorkflowEngine.create({ bus });
    return new BrainController(engine, bus, deps.ports);
  }

  /**
   * Resolve the port set lazily. The authoritative server lifecycle runs through
   * `buildBrain()` → Prisma ports injected via {@link BrainController.create}
   * (so `this.ports` is set). To eliminate the lifecycle fork (CR-4), the global
   * singleton may NOT lazily bind the in-memory/remote `createProductionPorts`
   * store on the server — that would persist a divergent copy of trade state.
   * It remains available only in the browser for non-authoritative display.
   */
  private async resolvePorts(): Promise<OrchestrationPorts> {
    if (this.ports) return this.ports;
    if (typeof window === 'undefined') {
      throw new Error(
        'AUTHORITATIVE_PATH_VIOLATION: the global brainController singleton is not the server store of record. ' +
          'Drive the lifecycle through buildBrain()/tradeService (Prisma), or inject ports via BrainController.create().',
      );
    }
    const { createProductionPorts } = await import('./adapters');
    this.ports = createProductionPorts();
    return this.ports;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Trade command layer
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Genesis command. Creates the workflow, materialises the RFQ and auto-drives
   * to the first external gate (RFQ acceptance). A single call therefore takes
   * the trade from nothing to "awaiting buyer acceptance" through orchestration.
   */
  async startTrade(input: StartTradeInput): Promise<TradeContext> {
    const ctx: TradeContext = {
      refs: { tradeId: input.tradeId },
      terms: input.terms,
      actorId: input.actorId,
      actorRole: input.actorRole,
      correlationId: input.correlationId ?? input.tradeId,
      metadata: input.metadata ?? {},
    };

    await this.engine.createWorkflow({
      tradeId: input.tradeId,
      terms: input.terms,
      actorId: input.actorId,
      actorRole: input.actorRole,
      correlationId: ctx.correlationId,
      metadata: ctx.metadata,
    });

    await this.runEntry(ctx, 'RFQ_CREATED');
    await this.triggerNotifications(ctx, {
      title: 'Trade initiated',
      message: `Trade ${input.tradeId} opened for ${input.terms.commodity}.`,
      priority: 'medium',
      channel: 'inApp',
    });
    await this.drive(ctx);
    return ctx;
  }

  /** Run risk + compliance + pricing for a trade and return a combined verdict. */
  async evaluateTrade(tradeId: string, actor?: ActorRef): Promise<TradeDecision> {
    const ctx = await this.contextFor(tradeId, actor);
    const ports = await this.resolvePorts();
    const [risk, compliance, price] = await Promise.all([
      ports.risk.assess(ctx),
      ports.compliance.screen(ctx),
      ports.pricing.quote(ctx),
    ]);
    const reasons: string[] = [...compliance.reasons];
    if (risk.level === 'critical') reasons.push('risk_critical');
    const approved = compliance.passed && risk.level !== 'critical';
    const decision: TradeDecision = {
      tradeId,
      approved,
      risk,
      compliance,
      price,
      reasons,
      evaluatedAt: new Date().toISOString(),
    };
    await this.bus.publish('TRADE_EVALUATED', { ...decision, correlationId: ctx.correlationId });
    await metricsService.recordMetric('trade_evaluations_total', 1, { approved: String(approved) });
    return decision;
  }

  /** Generic approval: push the trade past its current external gate, then auto-drive. */
  async approveTrade(tradeId: string, actor: ActorRef): Promise<TradeContext> {
    const ctx = await this.contextFor(tradeId, actor);
    const record = await this.engine.getWorkflow(tradeId);
    if (!record) throw new Error(`WORKFLOW_NOT_FOUND: ${tradeId}`);
    const spec = getStageSpec(record.state);
    if (!spec.next) throw new Error(`NO_PENDING_GATE: ${tradeId} is at terminal/leaf state ${record.state}.`);
    await this.transitionTo(ctx, spec.next, `approved_by:${actor.actorId}`);
    await this.drive(ctx);
    return ctx;
  }

  /** Hard stop: cancel the trade and compensate every committed side-effect. */
  async blockTrade(tradeId: string, actor: ActorRef, reason: string): Promise<TradeContext> {
    const ctx = await this.contextFor(tradeId, actor);
    const fromState = (await this.engine.getWorkflow(tradeId))?.state ?? null;
    await this.transitionTo(ctx, 'TRADE_CANCELLED', reason, { emitEntry: false });
    const ports = await this.resolvePorts();
    if (fromState) {
      await ports.execution.compensate(fromState, ctx, reason);
    }
    await this.bus.publish(TRADE_EVENTS.COMPENSATION_TRIGGERED, {
      tradeId,
      reason,
      from: fromState,
      correlationId: ctx.correlationId,
    });
    await this.triggerNotifications(ctx, {
      title: 'Trade blocked',
      message: `Trade ${tradeId} was blocked: ${reason}.`,
      priority: 'high',
      channel: 'inApp',
    });
    return ctx;
  }

  /** Resume auto-progression from wherever the trade currently rests (event-driven re-entry). */
  async routeWorkflow(tradeId: string, actor?: ActorRef): Promise<TradeContext> {
    const ctx = await this.contextFor(tradeId, actor);
    await this.drive(ctx);
    return ctx;
  }

  // --- Explicit lifecycle gate commands (the external triggers) ---------------

  async acceptRFQ(tradeId: string, actor: ActorRef): Promise<TradeContext> {
    return this.gate(tradeId, actor, 'RFQ_ACCEPTED');
  }

  async rejectRFQ(tradeId: string, actor: ActorRef, reason: string): Promise<TradeContext> {
    const ctx = await this.contextFor(tradeId, actor);
    await this.transitionTo(ctx, 'RFQ_REJECTED', reason);
    await this.transitionTo(ctx, 'TRADE_CANCELLED', reason, { emitEntry: false });
    return ctx;
  }

  async approveDeal(tradeId: string, actor: ActorRef): Promise<TradeContext> {
    const decision = await this.evaluateTrade(tradeId, actor);
    if (!decision.approved) {
      return this.blockTrade(tradeId, actor, `evaluation_failed:${decision.reasons.join(',')}`);
    }
    return this.gate(tradeId, actor, 'DEAL_APPROVED');
  }

  async fundEscrow(tradeId: string, actor: ActorRef): Promise<TradeContext> {
    return this.gate(tradeId, actor, 'ESCROW_FUNDED');
  }

  async markDelivered(tradeId: string, actor: ActorRef): Promise<TradeContext> {
    return this.gate(tradeId, actor, 'SHIPMENT_DELIVERED');
  }

  async releaseSettlement(tradeId: string, actor: ActorRef): Promise<TradeContext> {
    return this.gate(tradeId, actor, 'SETTLEMENT_COMPLETED');
  }

  async cancelTrade(tradeId: string, actor: ActorRef, reason: string): Promise<TradeContext> {
    return this.blockTrade(tradeId, actor, reason);
  }

  // --- Cross-cutting triggers (spec-mandated) --------------------------------

  async triggerRiskChecks(tradeId: string, actor?: ActorRef): Promise<RiskAssessment> {
    const ctx = await this.contextFor(tradeId, actor);
    const ports = await this.resolvePorts();
    return ports.risk.assess(ctx);
  }

  async triggerCompliance(tradeId: string, actor?: ActorRef): Promise<ComplianceResult> {
    const ctx = await this.contextFor(tradeId, actor);
    const ports = await this.resolvePorts();
    return ports.compliance.screen(ctx);
  }

  async triggerNotifications(ctx: TradeContext, message: NotificationMessage): Promise<void> {
    const ports = await this.resolvePorts();
    await ports.notification.notify(ctx, message);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Internal driver
  // ──────────────────────────────────────────────────────────────────────────

  /** Force an external-gate transition, run its side-effect, then auto-drive forward. */
  private async gate(tradeId: string, actor: ActorRef, to: TradeLifecycleState): Promise<TradeContext> {
    const ctx = await this.contextFor(tradeId, actor);
    await this.transitionTo(ctx, to, `gate:${actor.actorId}`);
    await this.drive(ctx);
    return ctx;
  }

  /** Advance one state, then realise that state's domain side-effect. */
  private async transitionTo(
    ctx: TradeContext,
    to: TradeLifecycleState,
    reason?: string,
    opts: { emitEntry?: boolean } = {},
  ): Promise<void> {
    const record = await this.engine.advance({
      tradeId: ctx.refs.tradeId,
      to,
      actorId: ctx.actorId,
      actorRole: ctx.actorRole,
      correlationId: ctx.correlationId,
      reason,
    });
    ctx.refs = { ...record.refs };
    if (opts.emitEntry !== false) {
      await this.runEntry(ctx, to);
    }
  }

  /** Execute the domain side-effect bound to a state and thread back any new refs. */
  private async runEntry(ctx: TradeContext, state: TradeLifecycleState): Promise<void> {
    const ports = await this.resolvePorts();
    try {
      const result = await ports.execution.execute(state, ctx);
      if (result.refs) {
        const updated = await this.engine.updateRefs(ctx.refs.tradeId, result.refs);
        ctx.refs = { ...updated.refs };
      }
      if (result.metadata) {
        ctx.metadata = { ...ctx.metadata, ...result.metadata };
      }
    } catch (err: unknown) {
      // A side-effect failure does not corrupt the workflow state; it is logged
      // and surfaced as a blocked-workflow event for operators / compensation.
      const message = err instanceof Error ? err.message : String(err);
      logger.error('BrainController', `ENTRY_SIDE_EFFECT_FAILED ${state}: ${message}`);
      await this.bus.publish(TRADE_EVENTS.WORKFLOW_BLOCKED, {
        tradeId: ctx.refs.tradeId,
        state,
        reason: message,
        correlationId: ctx.correlationId,
      });
    }
  }

  /** Auto-advance while the next state is AUTO-triggered; stop at gates/terminals. */
  private async drive(ctx: TradeContext): Promise<void> {
    for (;;) {
      const record = await this.engine.getWorkflow(ctx.refs.tradeId);
      if (!record || isTerminal(record.state)) return;
      const spec = getStageSpec(record.state);
      if (!spec.next) return;
      if (getStageSpec(spec.next).trigger !== 'AUTO') return; // gated — await external command
      await this.transitionTo(ctx, spec.next);
    }
  }

  /** Reconstruct a transition context from the persisted workflow record. */
  private async contextFor(tradeId: string, actor?: ActorRef): Promise<TradeContext> {
    const record = await this.engine.getWorkflow(tradeId);
    if (!record) throw new Error(`WORKFLOW_NOT_FOUND: ${tradeId}`);
    return {
      refs: { ...record.refs },
      terms: record.terms,
      actorId: actor?.actorId ?? record.history[record.history.length - 1]?.actorId ?? 'SYSTEM',
      actorRole: actor?.actorRole ?? record.history[record.history.length - 1]?.actorRole ?? ('Trade Participant' as UserRole),
      correlationId: tradeId,
      metadata: {},
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Legacy AI-fabric initialization (preserved)
  // ──────────────────────────────────────────────────────────────────────────

  /** Initializes the autonomous reasoning fabric and binds the event mesh. */
  async initialize(): Promise<void> {
    await unificationService.synchronizeContext({
      strategicContext: 'governance',
      coherenceStatus: 'ALIGNED',
      threatLevel: 'STABLE',
    });

    if (typeof window !== 'undefined') {
      logger.info('Singularity_Brain', 'Client-side awareness node synchronized.');
      return;
    }

    logger.info('Singularity_Brain', 'Initializing Server-side Autonomous Reasoning Fabric...');

    try {
      const { aiOrchestration } = await import('@/modules/ai/services/orchestration.service');
      const { cognitionFabric } = await import('@/modules/ai/services/cognition-fabric.service');

      await aiOrchestration.initialize();

      this.bus.subscribe('*', async (event) => {
        const reasoningNodes = await cognitionFabric.correlateSignals([event]);
        if (reasoningNodes.length > 0) {
          await metricsService.recordMetric('cognitive_inferences_total', reasoningNodes.length);
        }
      });

      logger.info('Singularity_Brain', 'Baalvion OS AI Civilization Active.');
    } catch (e: unknown) {
      logger.error('Singularity_Brain', `INIT_FAILURE: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  /** Dispatches a strategic mission to the AI civilization (server-side only). */
  async processHighAuthorityMission(mandate: unknown): Promise<unknown> {
    if (typeof window !== 'undefined') {
      throw new Error('AUTHORITY_ERROR: Strategic missions must be processed in a server environment.');
    }
    const { aiOrchestration } = await import('@/modules/ai/services/orchestration.service');
    return aiOrchestration.dispatchAutonomousMission('STRATEGIC_INTERVENTION', mandate);
  }
}

export { BrainController };
export const brainController = BrainController.getInstance();
