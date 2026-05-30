/**
 * @file reconciliation-service.ts
 * @description Integrity engine for cross-referencing ledger entries with account balances.
 * Hardened for global trade data fabric reconciliation and self-healing.
 */
import { apiClient } from '@/lib/api-client';
import { logger, metricsService } from './observability-service';

export interface ReconciliationRecord {
  id: string;
  referenceType: 'wallet' | 'escrow' | 'ledger' | 'fabric';
  referenceId: string;
  expectedAmount: number;
  actualAmount: number;
  status: 'matched' | 'mismatch';
  createdAt: string;
}

/**
 * Runs a platform-wide reconciliation job for an institution.
 * Checks if (Sum of Ledger Credits - Sum of Ledger Debits) matches Current Balance.
 */
export async function runReconciliation(companyId: string): Promise<ReconciliationRecord[]> {
  logger.info('ReconciliationService', `Starting systemic audit for institution: ${companyId}`);

  const [ledgerRes, walletRes] = await Promise.all([
    apiClient.get<any[]>('/ledger_entries', { companyId }),
    apiClient.get<any[]>('/wallets', { companyId })
  ]);

  const ledgers = ledgerRes.data || [];
  const wallets = walletRes.data || [];
  const reports: ReconciliationRecord[] = [];

  for (const wallet of wallets) {
    const walletLedgers = ledgers.filter(l => l.currency === wallet.currency);

    const expectedBalance = walletLedgers.reduce((acc, entry) => {
      return entry.type === 'credit' ? acc + entry.amount : acc - entry.amount;
    }, 0);

    const status = Math.abs(expectedBalance - wallet.balance) < 0.01 ? 'matched' : 'mismatch';
    
    const recordRes = await apiClient.post<ReconciliationRecord>('/reconciliation_records', {
      referenceType: 'wallet',
      referenceId: wallet.id,
      expectedAmount: expectedBalance,
      actualAmount: wallet.balance,
      status
    });
    
    if (recordRes.data) reports.push(recordRes.data);
  }

  logger.info('ReconciliationService', `Audit complete for ${companyId}. Result: ${reports.filter(r => r.status === 'mismatch').length} anomalies detected.`);

  return reports;
}
