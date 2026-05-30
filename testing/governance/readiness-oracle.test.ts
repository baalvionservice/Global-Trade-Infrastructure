
/**
 * @file readiness-oracle.test.ts
 * @description THE SUPREME VALIDATION KERNEL.
 * Orchestrates cross-domain assertions to generate the Sovereign Readiness Score.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readinessEngine } from '@/services/readiness-engine';
import { auditOrchestrator } from '@/services/audit-orchestrator';

describe('Sovereign Readiness Oracle', () => {
  let report: any;

  beforeAll(async () => {
    // Generate the authoritative planetary readiness report
    report = await readinessEngine.getGlobalReadinessReport();
  });

  it('should verify total system coherence exceeds 95% threshold', () => {
    expect(report.overallScore).toBeGreaterThanOrEqual(95);
  });

  it('should confirm absolute finality in the Single Global Execution Kernel', async () => {
    const integrity = await auditOrchestrator.runGlobalIntegrityCheck();
    const kernelPass = integrity.find(c => c.system === 'GOVERNANCE')?.status === 'PASSED';
    expect(kernelPass).toBe(true);
  });

  it('should validate zero-trust identity depth for all authority nodes', () => {
    const securityScore = report.domains.security.score;
    expect(securityScore).toBe(100);
  });

  it('should verify multi-region resilience and failover standby readiness', () => {
    const resilienceStatus = report.domains.stability.status;
    expect(resilienceStatus).toBe('PASS');
  });

  it('should confirm financial ledger-to-wallet symmetry', () => {
    const financePass = report.domains.finance.status === 'PASS';
    expect(financePass).toBe(true);
  });
});
