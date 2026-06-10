/**
 * @file server/orchestration/wiring.ts
 * @description Per-request assembly of a Prisma-backed brain controller.
 *
 * Builds a fresh WorkflowEngine + BrainController (Phase-1, untouched) bound to
 * Prisma persistence ports for one org/trade context. The durable event store
 * is attached to the global bus on first use.
 */
import { eventBus } from '@/orchestration/event-bus';
import { WorkflowEngine } from '@/orchestration/workflow-engine';
import { BrainController } from '@/orchestration/brain-controller';
import { OrchestrationPorts } from '@/orchestration/ports';
import { buildPrismaPorts, OrgContext, PortOverrides } from './prisma-ports';

export interface Wired {
  brain: BrainController;
  engine: WorkflowEngine;
  ports: OrchestrationPorts;
}

/**
 * Build a Prisma-backed brain for one org/request. Durable event persistence is
 * NOT a fire-and-forget bus subscriber here (that allowed state↔event
 * divergence, CR-6). Events are written to the transactional outbox inside the
 * state transaction and projected to `domain_events` by `flushOutbox`, which the
 * trade service runs after each operation.
 */
export function buildBrain(ctx: OrgContext, overrides: PortOverrides = {}): Wired {
  const ports = buildPrismaPorts(ctx, overrides);
  const engine = WorkflowEngine.create({ store: ports.store, audit: ports.audit, bus: eventBus });
  const brain = BrainController.create({ ports, engine, bus: eventBus });
  return { brain, engine, ports };
}
