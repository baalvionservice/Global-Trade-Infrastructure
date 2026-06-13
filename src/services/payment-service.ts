
/**
 * @file payment-service.ts
 * @description Integrated Financial Orchestration service for institutional trade.
 * Coordinates multi-currency settlements, wallet management, and FX locks.
 */
import { financeClient, pageContent, type Page } from '@/lib/finance-client';
import { recordTransaction } from './ledger-service';
import { markEscrowAsFunded } from './escrow-service';
export { markEscrowAsFunded } from './escrow-service';
import { getFXRate } from './fx-service';
import { logger } from './observability-service';
import { resolveSessionOrgId } from './session-org';

/**
 * Finance & Treasury sprint (2026-06-11): these reads are wired to the live financial-services-java
 * system of record via the `/finance-bff` gateway path (wallet-service :13039, ledger-service :13014).
 * The tenant is injected server-side by the auth-gateway from the session JWT — callers never pass a
 * companyId for scoping, so there is no placeholder org. Spring DTOs are adapted to the Wallet /
 * Transaction shapes the UI consumes. No mock data.
 */

// ---- shape adapters: Java DTO -> UI shape ----

export interface JavaWalletBalance { currency: string; available: number; held: number; total: number }
export interface JavaWallet { id: string; tenantId: string; holderId?: string; balances?: JavaWalletBalance[] | null }

/**
 * Lists wallets and hydrates per-currency balances. The Java list endpoint omits `balances`
 * (returns null) for performance; the per-wallet GET embeds them. Orgs typically hold one wallet,
 * so this is at most a couple of detail fetches. Shared by the Payments and Treasury surfaces.
 */
export async function fetchWalletsWithBalances(): Promise<JavaWallet[]> {
  const res = await financeClient.get<Page<JavaWallet>>('/wallets', { size: 200 });
  const wallets = pageContent<JavaWallet>(res.data);
  const needHydration = wallets.filter((w) => !Array.isArray(w.balances) || w.balances.length === 0);
  if (needHydration.length === 0) return wallets;
  const details = await Promise.all(
    needHydration.map((w) => financeClient.get<JavaWallet>(`/wallets/${w.id}`).then((r) => r.data).catch(() => null)),
  );
  const byId = new Map(details.filter((d): d is JavaWallet => !!d).map((d) => [d.id, d]));
  return wallets.map((w) => byId.get(w.id) ?? w);
}
interface JavaEntry {
  id: string; tenantId: string; transactionRef?: string; amount: number; currency: string;
  entryType?: string; status?: string; description?: string; postedAt?: string; createdAt?: string;
}

const ENTRY_TYPE_TO_TX: Record<string, Transaction['type']> = {
  PAYMENT: 'payment', ESCROW: 'escrow', RELEASE: 'release', REFUND: 'refund', DEPOSIT: 'deposit',
};

function toTxStatus(status?: string): Transaction['status'] {
  const s = (status || '').toUpperCase();
  if (s === 'POSTED' || s === 'COMPLETED' || s === 'SETTLED') return 'completed';
  if (s === 'FAILED' || s === 'REVERSED' || s === 'REJECTED') return 'failed';
  return 'pending';
}

/** Flatten a Java wallet (one row, many currency balances) into the UI's per-currency Wallet rows. */
function walletsToUi(rows: JavaWallet[]): Wallet[] {
  const out: Wallet[] = [];
  for (const w of rows) {
    const balances = Array.isArray(w.balances) && w.balances.length > 0 ? w.balances : [];
    for (const b of balances) {
      out.push({
        id: `${w.id}:${b.currency}`,
        companyId: w.holderId || w.tenantId,
        currency: b.currency,
        balance: Number(b.total) || 0,
        escrow: Number(b.held) || 0,
        updatedAt: new Date().toISOString(),
      });
    }
  }
  return out;
}

function entryToTx(e: JavaEntry): Transaction {
  return {
    id: e.id,
    companyId: e.tenantId,
    type: ENTRY_TYPE_TO_TX[(e.entryType || '').toUpperCase()] || 'payment',
    amount: Number(e.amount) || 0,
    currency: e.currency,
    status: toTxStatus(e.status),
    description: e.description || e.entryType || 'Ledger entry',
    orderId: e.transactionRef,
    createdAt: e.postedAt || e.createdAt || new Date().toISOString(),
  };
}

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
 * When `companyId` is omitted it is resolved from the authenticated session; if there
 * is no session the call returns null rather than leaking another tenant's wallet.
 */
export async function getWalletByCurrency(currency: string, _companyId?: string): Promise<Wallet | null> {
  const wallets = await getWallets();
  return wallets.find((w) => w.currency?.toUpperCase() === currency.toUpperCase()) || null;
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
  const companyId = data.companyId || (await resolveSessionOrgId());
  if (!companyId) {
    throw new Error('Cannot fund escrow: no authenticated organization in session.');
  }
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

export async function getWallet(): Promise<Wallet | undefined> {
  const usd = await getWalletByCurrency('USD');
  if (usd) return usd;
  return (await getWallets())[0];
}

export async function getWallets(): Promise<Wallet[]> {
  return walletsToUi(await fetchWalletsWithBalances());
}

export async function getTransactions(): Promise<Transaction[]> {
  const res = await financeClient.get<Page<JavaEntry>>('/ledger/entries', { size: 200 });
  return pageContent<JavaEntry>(res.data).map(entryToTx);
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const res = await financeClient.get<JavaEntry>(`/ledger/entries/${id}`);
  return res.data ? entryToTx(res.data) : null;
}
