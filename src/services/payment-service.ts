
/**
 * @file payment-service.ts
 * @description Integrated Financial Orchestration service for institutional trade.
 * Coordinates multi-currency settlements, wallet management, and FX locks.
 */
import { apiClient } from '@/lib/api-client';
import { recordTransaction } from './ledger-service';
import { markEscrowAsFunded } from './escrow-service';
export { markEscrowAsFunded } from './escrow-service';
import { getFXRate } from './fx-service';
import { logger } from './observability-service';

export type PaymentMethod = 'wallet' | 'bank' | 'card';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'reversed' | 'held';

export interface Wallet {
  id: string;
  companyId: string;
  currency: string;
  balance: number;
  escrow: number; // Locked funds
  updatedAt: string;
}

export interface Transaction {
  id: string;
  companyId: string;
  type: 'payment' | 'escrow' | 'release' | 'refund' | 'deposit';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  orderId?: string;
  createdAt: string;
}

/**
 * Retrieves the institutional wallet for a specific company and currency.
 */
export async function getWalletByCurrency(currency: string, companyId: string = 'COMP-101'): Promise<Wallet | null> {
  const res = await apiClient.get<Wallet[]>('/wallets', { companyId, currency });
  return res.data?.[0] || null;
}

/**
 * Orchestrates the secure funding of a trade escrow.
 * Handles FX conversion if the payment currency differs from the order currency.
 */
export async function fundEscrow(data: {
  escrowId: string;
  orderId: string;
  amount: number;
  orderCurrency: string;
  paymentCurrency: string;
  method: PaymentMethod;
  companyId?: string;
}): Promise<boolean> {
  const companyId = data.companyId || 'COMP-101';
  logger.info('PaymentService', `FUNDING_ESCROW: Ref ${data.escrowId} for amount ${data.amount} ${data.orderCurrency}`);

  // 1. Calculate Settlement Amount (FX Simulation)
  const rateUsed = await getFXRate(data.orderCurrency, data.paymentCurrency);
  const settlementAmount = data.amount * rateUsed;

  // 2. Atomic Ledger Debit
  await recordTransaction({
    companyId,
    type: 'debit',
    amount: settlementAmount,
    currency: data.paymentCurrency,
    referenceType: 'escrow',
    referenceId: data.escrowId,
    description: `Escrow Funding for Order ${data.orderId} (Rate: ${rateUsed.toFixed(4)})`
  });

  // 3. Update Escrow State
  await markEscrowAsFunded(data.escrowId, rateUsed, data.paymentCurrency);

  return true;
}

export async function getWallet(): Promise<Wallet> {
  const res = await apiClient.get<Wallet[]>('/wallets', { companyId: 'COMP-101', currency: 'USD' });
  return res.data![0];
}

export async function getWallets(): Promise<Wallet[]> {
  const res = await apiClient.get<Wallet[]>('/wallets', { companyId: 'COMP-101' });
  return res.data || [];
}

export async function getTransactions(): Promise<Transaction[]> {
  const res = await apiClient.get<Transaction[]>('/ledger_entries', { companyId: 'COMP-101' });
  return res.data || [];
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const res = await apiClient.getDoc<Transaction>('/ledger_entries', id);
  return res.data;
}
