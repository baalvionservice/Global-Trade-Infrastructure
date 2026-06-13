/**
 * @file src/api/client.ts
 * @description Foundation for the Trade Operations (TradeOps Cloud) API layer.
 *
 * ARCHITECTURE (NON-NEGOTIABLE):
 *   The browser only ever talks to this origin. Every TradeOps call goes through the canonical
 *   `apiClient` (src/lib/api-client.ts) whose base `/trade-bff` same-origin proxy forwards to the
 *   auth-gateway, which:
 *     • owns the httpOnly session cookies (access/refresh) + the readable CSRF cookie,
 *     • verifies the RS256 access token + Redis session,
 *     • injects the SIGNED identity + tenant headers (x-tenant-id / x-identity-envelope) before
 *       forwarding to trade-service (:3025).
 *   So tenant enforcement, auth, CSRF, retry, and the single-flight 401 refresh are ALL handled by
 *   `apiClient`. This layer NEVER sets a bearer token or a tenant header in JS — doing so would both
 *   regress the security model and be rejected by the trade-service `authMiddleware`.
 *
 * PATHS: `apiClient` rewrites `/trade-bff/<path>` → gateway `/api/trade/v1/<path>` → trade-service
 *   `/v1/<path>`. Therefore every path passed to the helpers below is the RESOURCE path WITHOUT the
 *   `/v1` prefix, e.g. `/shipments`, `/shipment_workflows/:id/transitions`.
 */
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types/api';

/** Standard trade-service paginated envelope payload (`data` of a list response). */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages?: number;
}

/** A thrown API failure carrying the transport + semantic codes for precise UI handling. */
export class TradeApiError extends Error {
  readonly code: string;
  readonly appCode?: string;
  constructor(message: string, code = 'UNKNOWN', appCode?: string) {
    super(message);
    this.name = 'TradeApiError';
    this.code = code;
    this.appCode = appCode;
  }
}

/**
 * Unwrap the `{ success, data, error }` envelope into `data`, throwing a {@link TradeApiError} on
 * failure so React Query surfaces a real error state (loading / empty / error / retry).
 */
export async function unwrap<T>(p: Promise<ApiResponse<T>>): Promise<T> {
  const res = await p;
  if (!res.success || res.data === null || res.data === undefined) {
    throw new TradeApiError(
      res.error?.message ?? 'Request failed.',
      res.error?.code ?? 'UNKNOWN',
      res.error?.appCode,
    );
  }
  return res.data;
}

/** Cleaned query params (drops undefined/null/empty) for list endpoints. */
export type Query = Record<string, string | number | boolean | undefined | null>;

export const tradeApi = {
  get: <T>(path: string, params: Query = {}): Promise<T> => unwrap<T>(apiClient.get<T>(path, params)),
  list: <T>(path: string, params: Query = {}): Promise<Paginated<T>> =>
    unwrap<Paginated<T>>(apiClient.get<Paginated<T>>(path, params)),
  post: <T>(path: string, body: unknown = {}): Promise<T> => unwrap<T>(apiClient.post<T>(path, body)),
  patch: <T>(path: string, body: unknown = {}): Promise<T> => unwrap<T>(apiClient.patch<T>(path, body)),
  put: <T>(path: string, body: unknown = {}): Promise<T> => unwrap<T>(apiClient.put<T>(path, body)),
};

/** A human-readable message from any thrown error (TradeApiError, Error, or unknown). */
export function errorMessage(error: unknown): string {
  if (error instanceof TradeApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Unexpected error.';
}
