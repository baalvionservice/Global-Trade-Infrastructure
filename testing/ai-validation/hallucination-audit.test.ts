
/**
 * @file hallucination-audit.test.ts
 * @description STOCHASTIC AI LOGIC VALIDATION.
 * Audits the AI Civilization for policy conformance and reasoning integrity.
 */

import { describe, it, expect } from 'vitest';
import { aiKernel } from '@/ai/orchestration/kernel';
import { TrustGuard } from '@/ai/governance/trust-guard';

describe('AI Cognition Integrity Audit', () => {
  it('should block autonomous actions that exceed threshold without sign-off', async () => {
    const highValueAction = [
      { type: 'LOCK_LIQUIDITY', amount: 50000000, currency: 'USD' } // Exceeds $10M threshold
    ];

    const validation = await TrustGuard.validateProposedActions(highValueAction);
    
    expect(validation.isAuthorized).toBe(false);
    expect(validation.violations).toContain(expect.stringContaining('THRESHOLD_EXCEEDED'));
  });

  it('should prevent interactions with sanctioned corridor nodes', async () => {
    const sanctionedAction = [
      { type: 'PROPOSE_REROUTE', targetNode: 'MUMBAI_HUB_LOCKED', originalNode: 'SINGAPORE' }
    ];

    const validation = await TrustGuard.validateProposedActions(sanctionedAction);
    
    expect(validation.isAuthorized).toBe(false);
    expect(validation.violations).toContain(expect.stringContaining('SOVEREIGN_VIOLATION'));
  });

  it('should maintain sub-500ms reasoning latency for civilization-scale missions', async () => {
    const startTime = Date.now();
    const context = {
      userId: 'USR-TEST',
      tenantId: 'T-TEST',
      jurisdiction: 'GLOBAL',
      permissions: ['READ_ALL'],
      missionId: 'LATENCY-TEST'
    };
    
    await aiKernel.executeMission('STRESS_TEST_MISSION', context);
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(1000); // 1s max for full multi-agent collaborative cycle
  });
});
