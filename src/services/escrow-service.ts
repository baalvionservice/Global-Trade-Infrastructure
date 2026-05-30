
/**
 * @file escrow-service.ts
 * @description Governed management of institutional escrow accounts and multi-currency trade liquidity.
 * Implements a strict state machine for financial security.
 */
import { apiClient } from '@/lib/api-client';
import { recordTransaction } from './ledger-service';
import { logger } from './observability-service';

export type EscrowStatus = 'created' | 'funded' | 'in_transit' | 'delivered' | 'released' | 'refunded' | 'disputed';
export type Escrow = EscrowAccount;

const VALID_ESCROW_TRANSITIONS: Record<EscrowStatus, EscrowStatus[]> = {
  created: ['funded', 'refunded', 'disputed'],
  // 'released' is permitted directly from funded to match the backend money-state
  // machine (pending→funded→released), while keeping the richer intermediate states.
  funded: ['in_transit', 'delivered', 'released', 'refunded', 'disputed'],
  in_transit: ['delivered', 'released', 'disputed'],
  delivered: ['released', 'disputed'],
  released: [],
  refunded: [],
  disputed: ['funded', 'in_transit', 'delivered', 'released', 'refunded'] // Disputed is a "hold" state
};

/**
 * The trade-service Escrow model is flat snake_case with a leaner status enum
 * (pending/funded/released/refunded/disputed). Map it onto the UI shape, with
 * backend 'pending' surfaced as 'created'.
 */
function mapEscrowFromApi(raw: any): EscrowAccount {
  const statusMap: Record<string, EscrowStatus> = {
    pending: 'created', funded: 'funded', released: 'released',
    refunded: 'refunded', disputed: 'disputed',
  };
  return {
    id: String(raw?.id),
    orderId: String(raw?.order_id ?? ''),
    buyerId: String(raw?.buyer_org_id ?? ''),
    sellerId: String(raw?.seller_org_id ?? ''),
    buyerName: raw?.buyer_name || 'Buyer Institution',
    sellerName: raw?.seller_name || 'Seller Institution',
    amount: Number(raw?.amount) || 0,
    currency: raw?.currency || 'USD',
    status: statusMap[raw?.status] || 'created',
    createdAt: raw?.created_at || new Date().toISOString(),
    updatedAt: raw?.updated_at || new Date().toISOString(),
  } as EscrowAccount;
}

export interface EscrowAccount {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  buyerName: string;
  sellerName: string;
  amount: number;
  currency: string;
  status: EscrowStatus;
  fxRateUsed?: number;
  paymentCurrency?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

function validateEscrowTransition(current: EscrowStatus, next: EscrowStatus) {
  const allowed = VALID_ESCROW_TRANSITIONS[current];
  if (!allowed.includes(next)) {
    throw new Error(`Invalid Escrow transition: ${current} -> ${next}`);
  }
}

export async function createEscrowAccount(data: {
  orderId: string;
  buyerId: string;
  sellerId: string;
  buyerName: string;
  sellerName: string;
  amount: number;
  currency: string;
}): Promise<EscrowAccount> {
  const res = await apiClient.post<any>('/escrows', {
    order_id: data.orderId,
    buyer_org_id: data.buyerId,
    seller_org_id: data.sellerId,
    amount: data.amount,
    currency: data.currency,
  });
  if (!res.success || !res.data) {
    throw new Error(res.error?.message || 'Failed to provision escrow.');
  }
  logger.info('EscrowService', `ESCROW_PROVISIONED: Ref ${res.data.id} for Order ${data.orderId}`);
  return mapEscrowFromApi(res.data);
}

export async function markEscrowAsFunded(id: string, fxRateUsed: number, paymentCurrency: string): Promise<EscrowAccount> {
  return updateEscrowStatus(id, 'funded', { fxRateUsed, paymentCurrency });
}

export async function updateEscrowStatus(id: string, nextStatus: EscrowStatus, _metadata: any = {}): Promise<EscrowAccount> {
  const current = await getEscrowById(id);
  if (!current) throw new Error('Escrow account not found');

  validateEscrowTransition(current.status, nextStatus);

  // Route to the real money-state endpoint. in_transit/delivered have no backend
  // transition — treat them as logical checkpoints so the UI flow doesn't break.
  const action: Record<string, string> = { funded: 'fund', released: 'release', refunded: 'refund' };
  const endpoint = action[nextStatus];
  if (!endpoint) {
    logger.info('EscrowService', `ESCROW_CHECKPOINT: ${id} -> ${nextStatus} (no backend transition)`);
    return { ...current, status: nextStatus };
  }

  const res = await apiClient.patch<any>(`/escrows/${id}/${endpoint}`, {});
  if (!res.success || !res.data) {
    throw new Error(res.error?.message || `Failed to ${endpoint} escrow.`);
  }
  logger.info('EscrowService', `ESCROW_STATE_TRANSITION: ${id} moved to ${nextStatus}`);
  return mapEscrowFromApi(res.data);
}

export async function releaseEscrow(escrowId: string): Promise<EscrowAccount> {
  const escrow = await getEscrowById(escrowId);
  if (!escrow) throw new Error('Escrow account not found');
  
  await recordTransaction({
    companyId: escrow.sellerId,
    type: 'credit',
    amount: escrow.amount,
    currency: escrow.currency,
    referenceType: 'order',
    referenceId: escrow.orderId,
    description: `Trade Finality: Payment release for Order ${escrow.orderId}`
  });

  return updateEscrowStatus(escrow.id, 'released');
}

export async function refundEscrow(escrowId: string): Promise<EscrowAccount> {
  const escrow = await getEscrowById(escrowId);
  if (!escrow) throw new Error('Escrow account not found');
  
  const refundCurrency = escrow.paymentCurrency || escrow.currency;
  const refundAmount = escrow.fxRateUsed ? escrow.amount * escrow.fxRateUsed : escrow.amount;

  await recordTransaction({
    companyId: escrow.buyerId,
    type: 'credit',
    amount: refundAmount,
    currency: refundCurrency,
    referenceType: 'refund',
    referenceId: escrow.id,
    description: `Governance Refund: Reversal for Order ${escrow.orderId}`
  });

  return updateEscrowStatus(escrow.id, 'refunded');
}

export async function getEscrowById(id: string): Promise<EscrowAccount | null> {
  const res = await apiClient.getDoc<any>('escrows', id);
  return res.success && res.data ? mapEscrowFromApi(res.data) : null;
}

export async function getEscrows(): Promise<EscrowAccount[]> {
  const res = await apiClient.get<any>('/escrows');
  const items = res.data?.items ?? [];
  return items.map(mapEscrowFromApi);
}
