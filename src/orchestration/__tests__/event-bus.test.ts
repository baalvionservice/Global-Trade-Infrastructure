/**
 * @file event-bus.test.ts
 * @description Unit coverage for the event mesh: pub/sub, once, unsubscribe,
 * replay, async dispatch with error isolation, retry and dead-lettering.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus, PlatformEvent } from '../event-bus';

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = EventBus.create();
  });

  it('delivers published events to type subscribers and wildcards', async () => {
    const typed: PlatformEvent[] = [];
    const all: PlatformEvent[] = [];
    bus.subscribe('order.created', (e) => {
      typed.push(e);
    });
    bus.subscribe('*', (e) => {
      all.push(e);
    });

    await bus.publish('order.created', { tradeId: 'T1', actorId: 'u1' });

    expect(typed).toHaveLength(1);
    expect(all).toHaveLength(1);
    expect(typed[0].tradeId).toBe('T1');
    expect(typed[0].userId).toBe('u1');
    expect(typed[0].timestamp).toBeTruthy();
    expect(typed[0].id).toMatch(/^EVT-/);
  });

  it('stops delivering after the disposer or unsubscribe is called', async () => {
    let count = 0;
    const handler = () => {
      count += 1;
    };
    const dispose = bus.subscribe('x', handler);
    await bus.publish('x');
    dispose();
    await bus.publish('x');
    expect(count).toBe(1);

    bus.subscribe('y', handler);
    await bus.publish('y');
    bus.unsubscribe('y', handler);
    await bus.publish('y');
    expect(count).toBe(2);
  });

  it('once delivers exactly one event', async () => {
    let count = 0;
    bus.once('ping', () => {
      count += 1;
    });
    await bus.publish('ping');
    await bus.publish('ping');
    await bus.publish('ping');
    expect(count).toBe(1);
  });

  it('replays history chronologically and by filter', async () => {
    await bus.publish('a', { n: 1 });
    await bus.publish('b', { n: 2 });
    await bus.publish('a', { n: 3 });

    const all = bus.replay();
    expect(all.map((e) => e.type)).toEqual(['a', 'b', 'a']);

    const onlyA = bus.replay('a');
    expect(onlyA).toHaveLength(2);
    expect((onlyA[0].payload as { n: number }).n).toBe(1);
  });

  it('isolates a throwing subscriber from the others', async () => {
    const good: string[] = [];
    bus.subscribe('e', () => {
      throw new Error('boom');
    });
    bus.subscribe('e', () => {
      good.push('ok');
    });
    await bus.publish('e');
    expect(good).toEqual(['ok']);
  });

  it('parks permanently failing handlers on the dead-letter queue', async () => {
    bus.setMaxRetries(1);
    bus.subscribe('e', () => {
      throw new Error('always_fails');
    });
    await bus.publish('e', { tradeId: 'T9' });

    const dlq = bus.deadLetterQueue();
    expect(dlq).toHaveLength(1);
    expect(dlq[0].event.type).toBe('e');
    expect(dlq[0].error).toContain('always_fails');
    expect(dlq[0].attempts).toBe(2); // 1 initial + 1 retry
  });

  it('retries a transient failure and succeeds without dead-lettering', async () => {
    bus.setMaxRetries(2);
    let attempts = 0;
    bus.subscribe('e', () => {
      attempts += 1;
      if (attempts < 2) throw new Error('transient');
    });
    await bus.publish('e');
    expect(attempts).toBe(2);
    expect(bus.deadLetterQueue()).toHaveLength(0);
  });

  it('awaits async subscribers before resolving publish', async () => {
    const order: string[] = [];
    bus.subscribe('e', async () => {
      await new Promise((r) => setTimeout(r, 10));
      order.push('handler');
    });
    await bus.publish('e');
    order.push('after');
    expect(order).toEqual(['handler', 'after']);
  });
});
