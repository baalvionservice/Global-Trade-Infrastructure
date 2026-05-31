/**
 * @file finance/http.ts
 * @description Shared helpers for the finance SDK: unwrap the ApiResponse envelope (throwing a
 * typed FinanceError on failure) and read Spring Page content.
 */
import { financeClient, pageContent, type Page } from '@/lib/finance-client';
import type { ApiResponse } from '@/types/api';

export class FinanceError extends Error {
  code?: string;
  appCode?: string;
  constructor(message: string, code?: string, appCode?: string) {
    super(message);
    this.name = 'FinanceError';
    this.code = code;
    this.appCode = appCode;
  }
}

/** Returns `data` on success, throws {@link FinanceError} otherwise. */
export function unwrap<T>(res: ApiResponse<T>): T {
  if (res.success) return res.data as T;
  throw new FinanceError(res.error?.message || 'Finance request failed', res.error?.code, (res.error as any)?.appCode);
}

/** Unwraps a paginated list endpoint to a plain array. */
export function unwrapList<T>(res: ApiResponse<Page<T> | T[]>): T[] {
  return pageContent<T>(unwrap(res));
}

export { financeClient, pageContent };
export type { Page };
