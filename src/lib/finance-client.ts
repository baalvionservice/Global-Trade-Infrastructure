/**
 * @file finance-client.ts
 * @description HTTP client for the financial-services-java microservices
 * (trade-finance :3036, credit :3037, fx :3038, wallet :3039).
 *
 * AUTH MODEL — identical to api-client.ts (canonical auth-gateway BFF, Phase 6E-8):
 *   The browser only talks to this origin. The same-origin `/finance-bff` proxy (next.config
 *   rewrite) forwards to the SAME auth-gateway, which owns the httpOnly session cookies + a
 *   readable `csrf_token` cookie, verifies RS256 + Redis session, injects the signed identity +
 *   X-Tenant-ID, and routes `/api/<resource>` to the Java resource server (prepending /api/v1).
 *   There is NO bearer token in JS. We send cookies (credentials:include), echo the CSRF
 *   double-submit header on unsafe methods, and do a single-flight cookie refresh on 401.
 *
 * RESPONSE ADAPTER — the Java services return RAW DTO JSON (or a Spring `Page`), NOT the
 *   trade-service {success,data} envelope. This client adapts every response into the app's
 *   `ApiResponse<T>` so the finance SDK and pages use one familiar shape. Spring `Page` bodies
 *   are passed through as data; use `pageContent()` to read `.content`.
 */
import { ApiResponse } from '@/types/api';

const BASE_URL = '/finance-bff';
// The refresh endpoint lives on the auth rewrite (same gateway, same cookies).
const REFRESH_URL = '/trade-bff/auth/refresh';

const MAX_RETRIES = 2;
const UNSAFE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function readCsrfCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

function buildHeaders(method: string, extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...extra };
  if (UNSAFE.has(method.toUpperCase())) {
    const csrf = readCsrfCookie();
    if (csrf) headers['x-csrf-token'] = csrf;
  }
  return headers;
}

let refreshInFlight: Promise<boolean> | null = null;
function refreshTokens(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async (): Promise<boolean> => {
      try {
        const res = await fetch(REFRESH_URL, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        return res.ok;
      } catch {
        return false;
      }
    })().finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}

async function request<T>(path: string, options: RequestInit, retries = 0, didRefresh = false): Promise<ApiResponse<T>> {
  const method = (options.method || 'GET').toString();
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: { ...buildHeaders(method), ...(options.headers as Record<string, string> || {}) },
    });

    if (!response.ok) {
      if (response.status === 401 && !didRefresh) {
        const refreshed = await refreshTokens();
        if (refreshed) return request<T>(path, options, retries, true);
      }
      if (response.status >= 500 && retries < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, Math.pow(2, retries) * 1000));
        return request<T>(path, options, retries + 1, didRefresh);
      }
      const errorData = await response.json().catch(() => ({} as any));
      return {
        success: false,
        data: null,
        // Java standard error envelope: { code, message, status, fieldErrors? }.
        error: {
          code: `HTTP_${response.status}`,
          message: errorData?.message || errorData?.error || 'Request failed.',
          appCode: errorData?.code,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse<T>;
    }

    // 2xx — Java returns the DTO (or Spring Page) directly; wrap it in the app envelope.
    const data = response.status === 204 ? (null as unknown as T) : ((await response.json().catch(() => null)) as T);
    return { success: true, data, timestamp: new Date().toISOString() } as ApiResponse<T>;
  } catch (e: unknown) {
    if (retries < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, Math.pow(2, retries) * 1000));
      return request<T>(path, options, retries + 1, didRefresh);
    }
    return {
      success: false,
      data: null,
      error: { code: 'NETWORK_FAILURE', message: 'Finance backend connection timeout.' },
      timestamp: new Date().toISOString(),
    } as ApiResponse<T>;
  }
}

export const financeClient = {
  request,
  get<T>(path: string, params: Record<string, any> = {}): Promise<ApiResponse<T>> {
    const valid = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    );
    const query = new URLSearchParams(valid as Record<string, string>).toString();
    return request<T>(`${path}${query ? `?${query}` : ''}`, { method: 'GET' });
  },
  post<T>(path: string, data?: unknown): Promise<ApiResponse<T>> {
    return request<T>(path, { method: 'POST', body: data !== undefined ? JSON.stringify(data) : undefined });
  },
  patch<T>(path: string, data?: unknown): Promise<ApiResponse<T>> {
    return request<T>(path, { method: 'PATCH', body: data !== undefined ? JSON.stringify(data) : undefined });
  },
  delete<T>(path: string): Promise<ApiResponse<T>> {
    return request<T>(path, { method: 'DELETE' });
  },
};

/** Spring `Page<T>` shape returned by the finance list endpoints. */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/** Reads `.content` out of a Spring Page (tolerates a bare array or null). */
export function pageContent<T>(data: Page<T> | T[] | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as Page<T>).content)) return (data as Page<T>).content;
  return [];
}
