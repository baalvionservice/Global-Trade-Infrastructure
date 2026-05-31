/**
 * @file finance/fx.ts
 * @description FX SDK — rates, indicative quotes, spot conversion, rate-locks, forwards.
 * Talks to fx-service (:3038) via the auth-gateway (/finance-bff/fx/*).
 */
import { financeClient, unwrap, unwrapList, type Page } from './http';
import type { FxRate, FxQuote, FxConversion, FxRateLock, FxForward } from './types';

export const fx = {
  /** All supported pairs against `base` (default USD). */
  async rates(base = 'USD'): Promise<FxRate[]> {
    return unwrap(await financeClient.get<FxRate[]>('/fx/rates', { base }));
  },

  /** Two-sided rate (mid/bid/ask) for a single pair. */
  async rate(base: string, quote: string): Promise<FxRate> {
    return unwrap(await financeClient.get<FxRate>(`/fx/rates/${base}/${quote}`));
  },

  /** Indicative (non-binding) conversion quote. */
  async quote(sell: string, buy: string, amount: number): Promise<FxQuote> {
    return unwrap(await financeClient.get<FxQuote>('/fx/rates/quote', { sell, buy, amount }));
  },

  /** Execute a spot conversion. */
  async convert(input: { sellCurrency: string; buyCurrency: string; sellAmount: number; idempotencyKey?: string }): Promise<FxConversion> {
    return unwrap(await financeClient.post<FxConversion>('/fx/conversions', input));
  },

  async listConversions(page = 0, size = 20): Promise<FxConversion[]> {
    return unwrapList(await financeClient.get<Page<FxConversion>>('/fx/conversions', { page, size }));
  },

  /** Lock a firm rate for a validity window. */
  async lock(input: { sellCurrency: string; buyCurrency: string; sellAmount: number; lockSeconds?: number; idempotencyKey?: string }): Promise<FxRateLock> {
    return unwrap(await financeClient.post<FxRateLock>('/fx/rate-locks', input));
  },

  /** Execute a still-valid lock into a conversion at the locked rate. */
  async executeLock(id: string): Promise<FxConversion> {
    return unwrap(await financeClient.post<FxConversion>(`/fx/rate-locks/${id}/execute`));
  },

  async cancelLock(id: string): Promise<FxRateLock> {
    return unwrap(await financeClient.post<FxRateLock>(`/fx/rate-locks/${id}/cancel`));
  },

  async getLock(id: string): Promise<FxRateLock> {
    return unwrap(await financeClient.get<FxRateLock>(`/fx/rate-locks/${id}`));
  },

  async listLocks(status?: string, page = 0, size = 20): Promise<FxRateLock[]> {
    return unwrapList(await financeClient.get<Page<FxRateLock>>('/fx/rate-locks', { status, page, size }));
  },

  /** Book a forward contract (rate via covered interest-rate parity). */
  async bookForward(input: { sellCurrency: string; buyCurrency: string; notionalAmount: number; valueDate: string; idempotencyKey?: string }): Promise<FxForward> {
    return unwrap(await financeClient.post<FxForward>('/fx/forwards', input));
  },

  async settleForward(id: string): Promise<FxForward> {
    return unwrap(await financeClient.post<FxForward>(`/fx/forwards/${id}/settle`));
  },

  async cancelForward(id: string, reason?: string): Promise<FxForward> {
    return unwrap(await financeClient.post<FxForward>(`/fx/forwards/${id}/cancel${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`));
  },

  async listForwards(status?: string, page = 0, size = 20): Promise<FxForward[]> {
    return unwrapList(await financeClient.get<Page<FxForward>>('/fx/forwards', { status, page, size }));
  },
};
