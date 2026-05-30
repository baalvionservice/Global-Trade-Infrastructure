/**
 * @file contract-service.ts
 * @description Institutional Contract Lifecycle Management (CLM) Service.
 * Manages the Sovereign Contract Vault, clause libraries, and version finality.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { logger, metricsService } from './observability-service';
import { eventBus } from './event-bus';

export type ContractStatus = 'DRAFT' | 'LEGAL_REVIEW' | 'SIGNED' | 'EXECUTED' | 'SUPERSEDED' | 'DISPUTED';

export interface Contract {
  id: string;
  title: string;
  buyerId: string;
  sellerId: string;
  parties: string;
  value: number;
  currency: string;
  status: ContractStatus;
  version: number;
  signedAt?: string;
  effectiveDate?: string;
  expiryDate?: string;
  clauses: ClauseReference[];
  createdAt: string;
  updatedAt: string;
}

export interface ClauseReference {
  id: string;
  category: 'PAYMENT' | 'DELIVERY' | 'ARBITRATION' | 'LIABILITY' | 'ESG';
  content: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  isStandard: boolean;
}

export const contractService = {
  /**
   * Retrieves all contracts for an institutional vault.
   */
  async getVault(companyId: string): Promise<Contract[]> {
    const res = await apiClient.get<Contract[]>('/contracts', { companyId, sortBy: 'updatedAt', order: 'desc' });
    return toList(res);
  },

  /**
   * Archives a new signed commercial mandate in the vault.
   */
  async archiveMandate(data: Partial<Contract>): Promise<Contract> {
    logger.info('ContractVault', `VAULTING_MANDATE: ${data.title}`);
    
    const res = await apiClient.post<Contract>('/contracts', {
      ...data,
      status: 'EXECUTED',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    metricsService.recordMetric('contracts_vaulted_total', 1);
    eventBus.publish('DOCUMENT_VERIFIED' as any, { 
      referenceId: res.data!.id, 
      type: 'sales_contract' 
    });

    return res.data!;
  },

  /**
   * Analyzes a contract for legal risk using clause intelligence.
   */
  async analyzeRisk(contractId: string) {
    const res = await apiClient.getDoc<Contract>('contracts', contractId);
    if (!res.data) throw new Error('Contract not found');

    const highRiskClauses = res.data.clauses.filter(c => c.riskLevel === 'HIGH');
    return {
      score: 100 - (highRiskClauses.length * 20),
      anomalies: highRiskClauses,
      recommendation: highRiskClauses.length > 0 ? 'LEGAL_RE-REVIEW_REQUIRED' : 'PROCEED_TO_SIGNATURE'
    };
  },

  async getClauses(): Promise<ClauseReference[]> {
    return [
      { id: 'C-1', category: 'ARBITRATION', content: 'Disputes shall be settled via the Baalvion Adjudication Hub.', riskLevel: 'LOW', isStandard: true },
      { id: 'C-2', category: 'LIABILITY', content: 'Liability capped at 110% of contract value.', riskLevel: 'MEDIUM', isStandard: false },
      { id: 'C-3', category: 'PAYMENT', content: 'Settlement triggered automatically upon port milestone verification.', riskLevel: 'LOW', isStandard: true }
    ];
  }
};
