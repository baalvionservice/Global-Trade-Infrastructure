/**
 * @file workflow-engine.test.ts
 * @description Unit coverage for the canonical lifecycle engine: creation,
 * legal transitions, illegal-state prevention, terminal guards, idempotency,
 * ref threading and cancellation.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '../event-bus';
import { WorkflowEngine, InMemoryWorkflowStore } from '../workflow-engine';
import { TRADE_EVENTS } from '../lifecycle';
import { AuditEntry, AuditSinkPort, TradeTerms } from '../ports';
import { USER_ROLES } from '@/core/roles';

const TERMS: TradeTerms = {
  buyerId: 'B',
  sellerId: 'S',
  commodity: 'WIDGETS',
  quantity: 10,
  unitPrice: 5,
  currency: 'USD',
};

function makeEngine() {
  const bus = EventBus.create();
  const audited: AuditEntry[] = [];
  const audit: AuditSinkPort = {
    async record(entry) {
      audited.push(entry);
    },
  };
  const engine = WorkflowEngine.create({ store: new InMemoryWorkflowStore(), audit, bus });
  return { bus, engine, audited };
}

const ACTOR = { actorId: 'u1', actorRole: USER_ROLES.BUYER };

describe('WorkflowEngine — lifecycle', () => {
  let ctx: ReturnType<typeof makeEngine>;

  beforeEach(() => {
    ctx = makeEngine();
  });

  it('creates a workflow at RFQ_CREATED and emits rfq.created', async () => {
    const events: string[] = [];
    ctx.bus.subscribe('*', (e) => {
      events.push(e.type);
    });

    const rec = await ctx.engine.createWorkflow({
      tradeId: 'T1',
      terms: TERMS,
      actorId: ACTOR.actorId,
      actorRole: ACTOR.actorRole,
    });

    expect(rec.state).toBe('RFQ_CREATED');
    expect(rec.version).toBe(1);
    expect(rec.history).toHaveLength(1);
    expect(events).toContain(TRADE_EVENTS.RFQ_CREATED);
    expect(ctx.audited[0].to).toBe('RFQ_CREATED');
  });

  it('is idempotent on re-create', async () => {
    await ctx.engine.createWorkflow({ tradeId: 'T1', terms: TERMS, actorId: 'u1', actorRole: ACTOR.actorRole });
    const again = await ctx.engine.createWorkflow({ tradeId: 'T1', terms: TERMS, actorId: 'u1', actorRole: ACTOR.actorRole });
    expect(again.version).toBe(1);
  });

  it('advances through a legal transition and chains history', async () => {
    await ctx.engine.createWorkflow({ tradeId: 'T1', terms: TERMS, actorId: 'u1', actorRole: ACTOR.actorRole });
    const rec = await ctx.engine.advance({ tradeId: 'T1', to: 'RFQ_SUBMITTED', actorId: 'u1', actorRole: ACTOR.actorRole });
    expect(rec.state).toBe('RFQ_SUBMITTED');
    expect(rec.version).toBe(2);
    expect(rec.history).toHaveLength(2);
    expect(rec.history[1].from).toBe('RFQ_CREATED');
  });

  it('rejects an illegal transition and emits workflow.blocked', async () => {
    await ctx.engine.createWorkflow({ tradeId: 'T1', terms: TERMS, actorId: 'u1', actorRole: ACTOR.actorRole });
    const events: string[] = [];
    ctx.bus.subscribe('*', (e) => {
      events.push(e.type);
    });

    await expect(
      ctx.engine.advance({ tradeId: 'T1', to: 'ESCROW_FUNDED', actorId: 'u1', actorRole: ACTOR.actorRole }),
    ).rejects.toThrow(/ILLEGAL_TRANSITION/);
    expect(events).toContain(TRADE_EVENTS.WORKFLOW_BLOCKED);

    // State is unchanged after a rejected transition.
    expect((await ctx.engine.getWorkflow('T1'))?.state).toBe('RFQ_CREATED');
  });

  it('treats a same-state advance as an idempotent no-op', async () => {
    await ctx.engine.createWorkflow({ tradeId: 'T1', terms: TERMS, actorId: 'u1', actorRole: ACTOR.actorRole });
    const rec = await ctx.engine.advance({ tradeId: 'T1', to: 'RFQ_CREATED', actorId: 'u1', actorRole: ACTOR.actorRole });
    expect(rec.version).toBe(1);
  });

  it('forbids advancing out of a terminal state', async () => {
    await ctx.engine.createWorkflow({ tradeId: 'T1', terms: TERMS, actorId: 'u1', actorRole: ACTOR.actorRole });
    await ctx.engine.cancel('T1', { actorId: 'u1', actorRole: ACTOR.actorRole, reason: 'test' });
    expect((await ctx.engine.getWorkflow('T1'))?.state).toBe('TRADE_CANCELLED');

    await expect(
      ctx.engine.advance({ tradeId: 'T1', to: 'RFQ_SUBMITTED', actorId: 'u1', actorRole: ACTOR.actorRole }),
    ).rejects.toThrow(/TERMINAL_STATE/);
  });

  it('threads domain refs onto the running instance without a state change', async () => {
    await ctx.engine.createWorkflow({ tradeId: 'T1', terms: TERMS, actorId: 'u1', actorRole: ACTOR.actorRole });
    const rec = await ctx.engine.updateRefs('T1', { rfqId: 'rfq-1' });
    expect(rec.state).toBe('RFQ_CREATED');
    expect(rec.refs.rfqId).toBe('rfq-1');
  });

  it('throws when advancing an unknown workflow', async () => {
    await expect(
      ctx.engine.advance({ tradeId: 'NOPE', to: 'RFQ_SUBMITTED', actorId: 'u1', actorRole: ACTOR.actorRole }),
    ).rejects.toThrow(/WORKFLOW_NOT_FOUND/);
  });
});
