
/**
 * @file fx-service.ts
 * @description Foreign exchange engine for institutional trade conversion.
 * Enhanced with time-bound quoting and rate lock capabilities.
 */
import { apiClient } from '@/lib/api-client';
import { logger } from './observability-service';

export interface FXRate {
  base: string;
  target: string;
  rate: number;
  updatedAt: string;
}

export interface FXQuote {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  expiresAt: string;
  status: 'active' | 'used' | 'expired';
}

/**
 * Retrieves the current conversion rate between two institutional currencies.
 */
export async function getFXRate(from: string, to: string): Promise<number> {
  if (from === to) return 1.0;

  // Real FX provider (Frankfurter/ECB live, with backend circuit-breaker fallback).
  const res = await apiClient.get<{ rate: number }>('/fx/rates', { base: from, target: to });
  if (res.success && res.data && typeof res.data.rate === 'number') {
    return res.data.rate;
  }

  // Client-side static fallback (only if the API is unreachable).
  const mockRates: Record<string, number> = {
    'USD_INR': 83.45,
    'USD_EUR': 0.92,
    'USD_SGD': 1.35,
    'EUR_USD': 1.09,
    'INR_USD': 0.012,
  };

  const key = `${from}_${to}`;
  if (mockRates[key]) return mockRates[key];

  return 1.0; 
}

/**
 * Generates a time-bound FX quote (60-second lock) for a trade transaction.
 */
export async function requestFXQuote(from: string, to: string): Promise<FXQuote> {
  const currentRate = await getFXRate(from, to);
  
  const res = await apiClient.post<FXQuote>('/fx_quotes', {
    baseCurrency: from,
    targetCurrency: to,
    rate: currentRate,
    expiresAt: new Date(Date.now() + 60000).toISOString(), // 60s lock
    status: 'active'
  });

  logger.info('FXEngine', `QUOTE_ISSUED: ${from}/${to} @ ${currentRate}`);
  return res.data!;
}

/**
 * Validates if an FX quote is still active and authorized for use.
 */
export async function validateQuote(quoteId: string): Promise<FXQuote> {
  const res = await apiClient.getDoc<FXQuote>('/fx_quotes', quoteId);
  const quote = res.data;

  if (!quote) throw new Error('Quote identifier not found.');
  if (quote.status !== 'active') throw new Error('Quote has already been consumed.');
  if (new Date(quote.expiresAt) < new Date()) {
    await apiClient.patch(`/fx_quotes/${quoteId}`, { status: 'expired' });
    throw new Error('Quote has expired.');
  }

  return quote;
}
