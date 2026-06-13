
/**
 * @file contract-governance.service.ts
 * @description The Legal Execution Runtime. Manages clause intelligence and signature finality.
 */
import { apiClient } from '@/lib/api-client';
import { logger, metricsService } from '@/services/observability-service';
import { SovereignContract, ContractClause, ClauseRisk } from '../types';
import { analyzeContractRisk } from '@/ai/flows/contract-risk-analysis-flow';
import { eventBus } from '@/orchestration/event-bus';

class ContractGovernanceService {
  private static instance: ContractGovernanceService;

  private constructor() {}

  public static getInstance(): ContractGovernanceService {
    if (!ContractGovernanceService.instance) {
      ContractGovernanceService.instance = new ContractGovernanceService();
    }
    return ContractGovernanceService.instance;
  }

  /**
   * Performs an AI-assisted forensic audit of a contract.
   */
  async runForensicAudit(contractId: string): Promise<any> {
    logger.info('LegalOracle', `INITIATING_FORENSIC_AUDIT: ${contractId}`);

    const res = await apiClient.getDoc<SovereignContract>('contracts', contractId);
    const contract = res.data;
    if (!contract) throw new Error('Contract node not found.');

    const audit = await analyzeContractRisk({
      contractId: contract.id,
      title: contract.title,
      clauses: contract.clauses.map(c => ({ id: c.id, category: c.category, content: c.content })),
      jurisdiction: 'International Trade Law (UN)'
    });

    // Update read-model with AI insights
    await apiClient.patch(`/contracts/${contractId}`, {
      status: 'LEGAL_REVIEW',
      metadata: { 
        auditScore: audit.overallRiskScore,
        aiSummary: audit.summary
      }
    });

    return audit;
  }

  /**
   * Finalizes an institutional signature.
   * Gated by the identity fabric.
   */
  async signContract(contractId: string, partyId: string, actorId: string) {
    logger.warn('LegalOracle', `AUTHORIZING_SIGNATURE: Party ${partyId} on ${contractId}`);

    // The signature hash is a cryptographic proof of execution and must be
    // produced by the signing/identity backend, not fabricated on the client.
    const signature = {
      partyId,
      actorId,
      timestamp: new Date().toISOString(),
    };

    const res = await apiClient.getDoc<SovereignContract>('contracts', contractId);
    const contract = res.data;
    if (!contract) return;

    const updatedSignatures = [...contract.signatures, signature];
    const isFullySigned = updatedSignatures.length >= contract.parties.length;

    const updated = await apiClient.patch<SovereignContract>(`/contracts/${contractId}`, {
      signatures: updatedSignatures,
      status: isFullySigned ? 'SIGNED' : 'LEGAL_REVIEW',
      signedAt: isFullySigned ? new Date().toISOString() : undefined
    });

    if (isFullySigned) {
      await eventBus.publish('DOCUMENT_VERIFIED' as any, { 
        referenceId: contractId, 
        type: 'sales_contract' 
      });
      metricsService.recordMetric('contracts_executed_total', 1);
    }

    return updated.data;
  }
}

export const contractGovernanceService = ContractGovernanceService.getInstance();
