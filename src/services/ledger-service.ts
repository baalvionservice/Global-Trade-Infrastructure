/**
 * @file ledger-service.ts
 * @description The authoritative, immutable source of truth for all institutional financial movements.
 */
import { apiClient } from '@/lib/api-client';
import { logger, metricsService } from './observability-service';

export type LedgerTransactionType = 'debit' | 'credit';
export type LedgerReferenceType = 'order' | 'escrow' | 'refund' | 'deposit' | 'withdrawal';

export interface LedgerEntry {
  id: string;
  companyId: string;
  type: LedgerTransactionType;
  amount: number;
  currency: string;
  referenceType: LedgerReferenceType;
  referenceId: string;
  description: string;
  hash?: string; // Cryptographic proof placeholder
  createdAt: string;
}

/**
 * Records a financial movement in the immutable platform ledger.
 * This is the only system-sanctioned method to mutate institutional balances.
 */
export async function recordTransaction(entry: Omit<LedgerEntry, 'id' | 'createdAt'>): Promise<LedgerEntry> {
  logger.info('LedgerService', `Executing ${entry.type} for ${entry.companyId}`, { amount: entry.amount, ref: entry.referenceId });

  // 1. Persist the ledger entry (Immutable Record). The cryptographic hash is
  // the ledger backend's responsibility — a client-generated value would be a
  // fake integrity proof, so it is not sent.
  const res = await apiClient.post<LedgerEntry>('/ledger_entries', {
    ...entry,
  });
  
  if (!res.success || !res.data) {
    logger.error('LedgerService', `LEDGER_COMMIT_FAILED: Ref ${entry.referenceId}`);
    throw new Error('Ledger recording critical failure.');
  }

  const ledgerRecord = res.data;

  // 2. Synchronize Wallet Balance (Consistency Logic)
  await syncWalletBalance(entry.companyId, entry.type, entry.amount, entry.currency);

  // 3. Record Operational Metrics
  metricsService.recordMetric('ledger_transaction_volume', entry.amount);
  
  return ledgerRecord;
}

/**
 * Ensures the institutional wallet matches the sum of ledger entries.
 */
async function syncWalletBalance(companyId: string, type: LedgerTransactionType, amount: number, currency: string) {
  const walletRes = await apiClient.get<any[]>('/wallets', { companyId, currency });
  const wallet = walletRes.data?.[0];

  if (!wallet) {
    logger.error('LedgerService', `SYNC_FAILURE: Wallet not found for company ${companyId}`);
    throw new Error('Institutional wallet out of sync with ledger.');
  }

  const newBalance = type === 'credit' 
    ? wallet.balance + amount 
    : wallet.balance - amount;

  if (newBalance < 0) {
    logger.warn('LedgerService', `INSUFFICIENT_FUNDS: Company ${companyId} attempt to debit ${amount}`);
    throw new Error('Transaction denied: Insufficient institutional liquidity.');
  }

  await apiClient.patch(`/wallets/${wallet.id}`, { 
    balance: newBalance,
    updatedAt: new Date().toISOString()
  });
}
