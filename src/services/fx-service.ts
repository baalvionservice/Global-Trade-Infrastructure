/**
 * @file fx-service.ts
 * @description Foreign exchange engine for institutional trade conversion.
 *
 * Now backed by the REAL fx-service (financial-services-java :3038) via the auth-gateway BFF
 * (/finance-bff/fx/*) through the typed SDK in `@/services/finance`. Rate-locks are genuine,
 * server-issued firm quotes held for a validity window (no client-minted quotes). The legacy
 * function/shape contract is preserved so existing callers compile unchanged.
 */
import { fx } from '@/services/finance';
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

const num = (v: unknown): number => (typeof v === 'number' ? v : Number(v) || 0);

function lockStatusToQuote(s: string): FXQuote['status'] {
  if (s === 'EXECUTED') return 'used';
  if (s === 'EXPIRED' || s === 'CANCELLED') return 'expired';
  return 'active';
}

/**
 * Retrieves the current mid conversion rate between two institutional currencies from the live
 * FX engine (short-TTL snapshot). Falls back to a static table ONLY if the API is unreachable.
 */
export async function getFXRate(from: string, to: string): Promise<number> {
  if (from === to) return 1.0;
  try {
    const r = await fx.rate(from, to);
    const rate = num(r.midRate);
    if (rate > 0) return rate;
  } catch (e) {
    logger.warn('FXEngine', `RATE_FALLBACK ${from}/${to}: ${(e as Error)?.message}`);
  }
  const fallback: Record<string, number> = {
    USD_INR: 83.45, USD_EUR: 0.92, USD_SGD: 1.35, EUR_USD: 1.09, INR_USD: 0.012,
  };
  return fallback[`${from}_${to}`] ?? 1.0;
}

/**
 * Issues a real, time-bound FX rate-lock (firm quote) for a trade transaction. `amount` is the
 * sell-side notional being locked; defaults to a unit quote when omitted.
 */
export async function requestFXQuote(from: string, to: string, amount = 1): Promise<FXQuote> {
  const lock = await fx.lock({ sellCurrency: from, buyCurrency: to, sellAmount: amount });
  logger.info('FXEngine', `QUOTE_ISSUED: ${from}/${to} @ ${lock.lockedRate} (lock ${lock.id})`);
  return {
    id: lock.id,
    baseCurrency: lock.sellCurrency,
    targetCurrency: lock.buyCurrency,
    rate: num(lock.lockedRate),
    expiresAt: lock.expiresAt,
    status: lockStatusToQuote(lock.status),
  };
}

/**
 * Validates that an FX rate-lock is still active and authorized for use, reading the live lock
 * state from the FX engine.
 */
export async function validateQuote(quoteId: string): Promise<FXQuote> {
  const lock = await fx.getLock(quoteId);
  const status = lockStatusToQuote(lock.status);
  if (status === 'used') throw new Error('Quote has already been consumed.');
  if (status === 'expired' || new Date(lock.expiresAt) < new Date()) throw new Error('Quote has expired.');
  return {
    id: lock.id,
    baseCurrency: lock.sellCurrency,
    targetCurrency: lock.buyCurrency,
    rate: num(lock.lockedRate),
    expiresAt: lock.expiresAt,
    status,
  };
}

/** Executes a previously issued rate-lock into a settled spot conversion at the locked rate. */
export async function executeFXQuote(quoteId: string): Promise<{ id: string; buyAmount: number; rate: number }> {
  const conv = await fx.executeLock(quoteId);
  return { id: conv.id, buyAmount: num(conv.buyAmount), rate: num(conv.rate) };
}
