/**
 * @file api-client.ts
 * @description Production API client for the Baalvion Trade OS.
 *
 * AUTH MODEL (Phase 6E-8 — canonical auth-gateway BFF):
 *   The browser only ever talks to this origin. The same-origin `/trade-bff` proxy
 *   (next.config rewrites) forwards to the auth-gateway, which:
 *     • owns the httpOnly session cookies (access/refresh) + a NON-httpOnly `csrf_token` cookie,
 *     • verifies the RS256 access token + Redis session,
 *     • forwards data calls to trade-service with signed identity headers (x-identity-envelope).
 *   There is NO bearer token in JS. Identity rides the cookies; we only add the CSRF
 *   double-submit header on unsafe methods, and rely on a single-flight cookie refresh on 401.
 */
import { ApiResponse } from '@/types/api';

// Same-origin proxy. next.config rewrites:
//   /trade-bff/auth/*  → gateway /auth/*           (login / register / refresh / logout / me)
//   /trade-bff/*       → gateway /api/trade/v1/*   (data; session + CSRF + signed-identity proxy)
const BASE_URL = '/trade-bff';

const MAX_RETRIES = 3;
const UNSAFE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// ── Legacy bearer-token shims ────────────────────────────────────────────────
// Cookie mode keeps NO token in JS. These remain as no-ops so existing imports
// (realtime handshake, app-state, settings UI) keep compiling without change.
export function setToken(_token: string): void { /* cookie mode: no JS token */ }
export function setRefreshToken(_token: string): void { /* refresh token is an httpOnly cookie */ }
export function clearToken(): void { /* cookies are cleared server-side on logout */ }
export function getAccessToken(): string | null { return null; }

// CSRF double-submit: the gateway sets a readable `csrf_token` cookie on login/refresh.
// Echo it back on every unsafe request. Reading the cookie each time keeps it correct
// across refreshes and full page reloads without any in-memory state.
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

// Auth endpoints must never themselves trigger a refresh retry (avoids recursion
// and prevents a failed login from masquerading as an expired session).
function isAuthBypass(path: string): boolean {
  return /^\/auth\/(login|register|refresh|logout)\b/.test(path);
}

// Single-flight refresh: concurrent 401s share ONE /auth/refresh call so we never
// rotate the refresh cookie twice in parallel (which the backend treats as a breach).
let refreshInFlight: Promise<boolean> | null = null;

function refreshTokens(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async (): Promise<boolean> => {
      try {
        // No body: the refresh token rides the httpOnly cookie. The gateway rotates the
        // access + csrf cookies on success — nothing to store in JS.
        const res = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        return res.ok;
      } catch {
        return false;
      }
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export const apiClient = {
  async request<T>(path: string, options: RequestInit, retries = 0, didRefresh = false): Promise<ApiResponse<T>> {
    const method = (options.method || 'GET').toString();
    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        credentials: 'include', // same-origin proxy → send the httpOnly session cookies
        headers: {
          ...buildHeaders(method),
          ...(options.headers as Record<string, string> || {}),
        },
      });

      if (!response.ok) {
        // Expired access cookie: attempt a one-time silent cookie refresh, then retry.
        if (response.status === 401 && !didRefresh && !isAuthBypass(path)) {
          const refreshed = await refreshTokens();
          if (refreshed) return this.request<T>(path, options, retries, true);
        }
        if (response.status >= 500 && retries < MAX_RETRIES) {
          const backoff = Math.pow(2, retries) * 1000;
          await new Promise((r) => setTimeout(r, backoff));
          return this.request(path, options, retries + 1, didRefresh);
        }
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          data: null,
          error: {
            code: `HTTP_${response.status}`,
            // Tolerate both the trade-service envelope ({error:{message}}) and the
            // gateway's raw error shape ({error:{code,message}}).
            message: errorData?.error?.message || errorData?.message || 'Request failed.',
            appCode: errorData?.error?.code,
          },
          timestamp: new Date().toISOString(),
        };
      }

      return response.json();
    } catch (e: unknown) {
      if (retries < MAX_RETRIES) {
        const backoff = Math.pow(2, retries) * 1000;
        await new Promise((r) => setTimeout(r, backoff));
        return this.request(path, options, retries + 1, didRefresh);
      }
      return {
        success: false,
        data: null,
        error: { code: 'NETWORK_FAILURE', message: 'Backend connection timeout.' },
        timestamp: new Date().toISOString(),
      };
    }
  },

  async get<T>(path: string, params: Record<string, any> = {}): Promise<ApiResponse<T>> {
    const validParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    );
    const query = new URLSearchParams(validParams as Record<string, string>).toString();
    return this.request<T>(`${path}${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  async post<T>(path: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async patch<T>(path: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async put<T>(path: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(path: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(path, { method: 'DELETE' });
  },

  async getDoc<T>(collection: string, id: string): Promise<ApiResponse<T>> {
    // Tolerate callers that pass a leading slash ('/orders') as well as bare
    // names ('orders') — both must yield '/orders/:id', never '//orders/:id'.
    const c = collection.replace(/^\/+/, '');
    return this.get<T>(`/${c}/${id}`);
  },
};

export interface AuthSession {
  userId: string;
  role: string;
  orgId?: string | null;
  orgType?: string | null;
  csrfToken?: string;
  user?: GatewayUser;
}

export interface GatewayUser {
  id?: string;
  userId?: string;
  email?: string;
  fullName?: string;
  roles?: string[];
  orgId?: string | null;
  /** Organization type — drives dashboard access in the multi-tenant model. */
  orgType?: string | null;
  permissions?: string[];
}

export interface DeviceSession {
  id: string;
  current: boolean;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
}

// The gateway's /auth/* endpoints return RAW JSON (not the trade-service {success,data}
// envelope): login/register → { user, csrfToken }; errors → { error:{code,message} }.
async function gatewayAuth<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const json = await res.json().catch(() => null) as any;
  if (!res.ok) {
    const err = new Error(json?.error?.message || 'Authentication failed.') as Error & { code?: string };
    err.code = json?.error?.code; // e.g. MFA_REQUIRED, ACCOUNT_LOCKED, CSRF
    throw err;
  }
  return json as T;
}

export const authApi = {
  /**
   * Authenticates against the auth-gateway (→ auth-service RS256). The gateway sets the
   * httpOnly session cookies + the csrf cookie and returns the SAFE profile (no token).
   */
  async login(email: string, password: string, mfaCode?: string): Promise<AuthSession> {
    const json = await gatewayAuth<{ user: GatewayUser; csrfToken: string }>('/auth/login', { email, password, mfaCode });
    return {
      userId: String(json.user?.id ?? json.user?.userId ?? email),
      role: (json.user?.roles && json.user.roles[0]) || 'client',
      orgId: json.user?.orgId ?? null,
      orgType: json.user?.orgType ?? null,
      csrfToken: json.csrfToken,
      user: json.user,
    };
  },

  /**
   * Registers a new institutional user (gateway → auth-service) and signs them in.
   * auth-service creates the user as `owner` of a new org. `name` → fullName.
   */
  async register(payload: {
    email: string;
    password: string;
    name?: string;
    orgName?: string;
    role?: 'admin' | 'operator' | 'client';
  }): Promise<AuthSession> {
    const json = await gatewayAuth<{ user: GatewayUser; csrfToken: string }>('/auth/register', {
      email: payload.email,
      password: payload.password,
      fullName: payload.name,
      orgName: payload.orgName,
    });
    return {
      userId: String(json.user?.id ?? json.user?.userId ?? payload.email),
      role: (json.user?.roles && json.user.roles[0]) || 'owner',
      orgId: json.user?.orgId ?? null,
      csrfToken: json.csrfToken,
      user: json.user,
    };
  },

  /**
   * Resolves the current authenticated identity from the session cookie (gateway GET /auth/me).
   * Returns null when there is no valid session.
   */
  async me<T = GatewayUser>(): Promise<T | null> {
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, { method: 'GET', credentials: 'include' });
      if (!res.ok) return null;
      const json = await res.json().catch(() => null) as any;
      return (json?.user ?? null) as T | null;
    } catch {
      return null;
    }
  },

  /** Device-session management is not exposed by the gateway; degrade gracefully. */
  async listSessions(): Promise<DeviceSession[]> {
    const res = await apiClient.get<DeviceSession[]>('/auth/sessions');
    return res.success && res.data ? res.data : [];
  },
  async revokeSession(id: string): Promise<boolean> {
    const res = await apiClient.delete(`/auth/sessions/${id}`);
    return res.success;
  },
  async revokeAllSessions(): Promise<boolean> {
    const res = await apiClient.delete('/auth/sessions');
    return res.success;
  },

  /**
   * Revokes the session server-side and clears the httpOnly session cookies. Awaitable so callers
   * can guarantee the cookies are gone BEFORE navigating to /login (otherwise the edge would
   * immediately bounce the user back into the app).
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch { /* best-effort: client state is cleared regardless by the caller */ }
  },
};
