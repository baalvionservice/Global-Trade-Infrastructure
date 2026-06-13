/**
 * @file payout-service.ts
 * @description Manages institutional fund withdrawals to external bank accounts.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { recordTransaction } from './ledger-service';
import { validateInstitution } from './sanctions-service';
import { getWalletByCurrency } from './payment-service';

export type PayoutStatus = 'requested' | 'processing' | 'completed' | 'failed';

export interface Payout {
  id: string;
  companyId: string;
  amount: number;
  currency: string;
  destination: string;
  status: PayoutStatus;
  createdAt: string;
}

/**
 * Requests an external payout of institutional funds.
 */
export async function requestPayout(data: {
  companyId: string;
  amount: number;
  currency: string;
  destination: string;
}): Promise<Payout> {
  // 1. Regulatory & Identity Check
  await validateInstitution(data.companyId);

  // 2. Balance Verification — scope the wallet lookup to the same institution being debited.
  const wallet = await getWalletByCurrency(data.currency, data.companyId);
  if (!wallet || wallet.balance < data.amount) {
    throw new Error(`Insufficient ${data.currency} balance for payout.`);
  }

  // 3. Create Payout Record
  const payoutRes = await apiClient.post<Payout>('/payouts', {
    ...data,
    status: 'requested'
  });
  const payout = payoutRes.data!;

  // 4. Ledger the Debit (Locking funds for withdrawal)
  await recordTransaction({
    companyId: data.companyId,
    type: 'debit',
    amount: data.amount,
    currency: data.currency,
    referenceType: 'refund', // Closest match for withdrawal
    referenceId: payout.id,
    description: `Institutional Payout to ${data.destination}`
  });

  // 5. Simulate External Gateway Processing
  setTimeout(async () => {
    await apiClient.patch(`/payouts/${payout.id}`, { status: 'completed' });
  }, 2000);

  return payout;
}

export async function getPayouts(companyId?: string): Promise<Payout[]> {
  const params = companyId ? { companyId } : {};
  const res = await apiClient.get<Payout[]>('/payouts', params);
  return toList(res);
}
