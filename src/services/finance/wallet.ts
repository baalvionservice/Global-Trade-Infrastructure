/**
 * @file finance/wallet.ts
 * @description Wallet SDK — multi-currency balances, holds, transfers, conversions, statement.
 * Talks to wallet-service (:3039) via the auth-gateway (/finance-bff/wallets/*).
 */
import { financeClient, unwrap, unwrapList, type Page } from './http';
import type { Wallet, WalletBalance, WalletHold, WalletEntry } from './types';

const W = '/wallets';

export const wallet = {
  async open(input: { holderId: string; holderType?: string; defaultCurrency?: string; label?: string }): Promise<Wallet> {
    return unwrap(await financeClient.post<Wallet>(W, input));
  },
  async get(id: string): Promise<Wallet> {
    return unwrap(await financeClient.get<Wallet>(`${W}/${id}`));
  },
  async byHolder(holderId: string): Promise<Wallet> {
    return unwrap(await financeClient.get<Wallet>(`${W}/by-holder/${holderId}`));
  },
  async list(page = 0, size = 20): Promise<Wallet[]> {
    return unwrapList(await financeClient.get<Page<Wallet>>(W, { page, size }));
  },
  async credit(id: string, input: { currency: string; amount: number; reference?: string; idempotencyKey?: string }): Promise<WalletBalance> {
    return unwrap(await financeClient.post<WalletBalance>(`${W}/${id}/credit`, input));
  },
  async debit(id: string, input: { currency: string; amount: number; reference?: string; idempotencyKey?: string }): Promise<WalletBalance> {
    return unwrap(await financeClient.post<WalletBalance>(`${W}/${id}/debit`, input));
  },
  async transfer(id: string, input: { destinationWalletId: string; currency: string; amount: number; reference?: string; idempotencyKey?: string }): Promise<Wallet> {
    return unwrap(await financeClient.post<Wallet>(`${W}/${id}/transfers`, input));
  },
  async convert(id: string, input: { sellCurrency: string; buyCurrency: string; sellAmount: number; rate: number; fxReferenceId?: string; idempotencyKey?: string }): Promise<Wallet> {
    return unwrap(await financeClient.post<Wallet>(`${W}/${id}/conversions`, input));
  },
  async hold(id: string, input: { currency: string; amount: number; reference?: string; ttlMinutes?: number }): Promise<WalletHold> {
    return unwrap(await financeClient.post<WalletHold>(`${W}/${id}/holds`, input));
  },
  async listHolds(id: string): Promise<WalletHold[]> {
    return unwrapList(await financeClient.get<WalletHold[]>(`${W}/${id}/holds`));
  },
  async releaseHold(holdId: string): Promise<WalletHold> {
    return unwrap(await financeClient.post<WalletHold>(`${W}/holds/${holdId}/release`));
  },
  async captureHold(holdId: string, reference?: string): Promise<WalletHold> {
    return unwrap(await financeClient.post<WalletHold>(`${W}/holds/${holdId}/capture`, reference ? { reference } : {}));
  },
  async statement(id: string, params: { currency?: string; page?: number; size?: number } = {}): Promise<WalletEntry[]> {
    return unwrapList(await financeClient.get<Page<WalletEntry>>(`${W}/${id}/statement`, { page: 0, size: 50, ...params }));
  },
  async freeze(id: string): Promise<Wallet> { return unwrap(await financeClient.post<Wallet>(`${W}/${id}/freeze`)); },
  async unfreeze(id: string): Promise<Wallet> { return unwrap(await financeClient.post<Wallet>(`${W}/${id}/unfreeze`)); },
  async close(id: string): Promise<Wallet> { return unwrap(await financeClient.post<Wallet>(`${W}/${id}/close`)); },
};
