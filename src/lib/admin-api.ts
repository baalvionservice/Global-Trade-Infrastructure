/**
 * @file admin-api.ts
 * @description Typed client for the self-service multi-org administration surface.
 *
 * Routing: every authenticated call goes through the same-origin `/trade-bff` proxy →
 * auth-gateway `/auth/svc/*` → auth-service `/v1/auth/*` (the gateway forwards the session's
 * access token as Bearer and enforces CSRF on unsafe methods). Public invite / password /
 * MFA-challenge flows hit the gateway's unauthenticated `/auth/*` endpoints directly.
 *
 * auth-service enforces all authorization (platform-owner authority for /platform/*, and the
 * org capability model for /orgs/*). The client never trusts its own role for security.
 */
import { apiClient } from './api-client';
import type { ApiResponse } from '@/types/api';
import type { OrgType, MembershipRole } from '@/core/organizations';

const SVC = '/auth/svc';            // authenticated auth-service passthrough
const BFF = '/trade-bff';           // same-origin gateway proxy (public auth endpoints)

// ── Domain types ────────────────────────────────────────────────────────────────

export type OrgStatus = 'active' | 'suspended';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: OrgType;
  status: OrgStatus;
  plan: string;
  legalName: string | null;
  displayName: string | null;
  country: string | null;
  jurisdiction: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  ownerId: string | null;
  createdAt: string;
  memberCount?: number;
  owner?: { id: string; email: string; fullName: string | null } | null;
}

export interface OrgMember {
  id: number;
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: MembershipRole;
  serviceRoles: Record<string, string>;
  status: 'active' | 'suspended' | 'removed';
  userStatus: string;
  mfaEnabled: boolean;
  mfaRequired: boolean;
  lastLoginAt: string | null;
  joinedAt: string | null;
}

export interface OrgInvitation {
  id: string;
  email: string;
  role: MembershipRole;
  fullName: string | null;
  expiresAt: string;
  createdAt: string;
  expired: boolean;
}

export interface PlatformMetrics {
  organizations: { total: number; byType: Record<string, number>; byStatus: Record<string, number> };
  users: { total: number };
  invitations: { pending: number };
}

export interface Paginated<T> { total: number; page: number; limit: number; items: T[] }
export interface AuditLog {
  id: number; user_id: string | null; org_id: string | null; action: string;
  resource_type: string | null; resource_id: string | null; metadata: Record<string, unknown>;
  ip_address: string | null; created_at: string;
}

// ── Platform-owner console ──────────────────────────────────────────────────────

export interface CreateOrgInput {
  name: string;
  type: OrgType;
  slug?: string;
  legalName?: string;
  displayName?: string;
  country?: string;
  jurisdiction?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: OrgStatus;
  ownerEmail?: string;
  ownerFullName?: string;
}

export const platformApi = {
  metrics: () => apiClient.get<PlatformMetrics>(`${SVC}/platform/metrics`),

  listOrganizations: (params: { search?: string; type?: string; status?: string; page?: number; limit?: number } = {}) =>
    apiClient.get<Paginated<Organization>>(`${SVC}/platform/organizations`, params),

  createOrganization: (data: CreateOrgInput) =>
    apiClient.post<{ org: Organization; ownerInvite: { id: string; email: string; expiresAt: string } | null }>(`${SVC}/platform/organizations`, data),

  getOrganization: (orgId: string) =>
    apiClient.get<Organization>(`${SVC}/platform/organizations/${orgId}`),

  updateOrganization: (orgId: string, fields: Partial<CreateOrgInput>) =>
    apiClient.patch<Organization>(`${SVC}/platform/organizations/${orgId}`, fields),

  setStatus: (orgId: string, status: OrgStatus) =>
    apiClient.post<Organization>(`${SVC}/platform/organizations/${orgId}/status`, { status }),

  listUsers: (orgId: string) =>
    apiClient.get<OrgMember[]>(`${SVC}/platform/organizations/${orgId}/users`),

  audit: (orgId: string, params: { page?: number; limit?: number } = {}) =>
    apiClient.get<{ total: number; page: number; limit: number; logs: AuditLog[] }>(`${SVC}/platform/organizations/${orgId}/audit`, params),
};

// ── Organization admin console (caller's own org) ────────────────────────────────

export const orgAdminApi = {
  getOrg: (orgId: string) => apiClient.get<Organization>(`${SVC}/orgs/${orgId}`),
  updateOrg: (orgId: string, fields: Partial<CreateOrgInput>) => apiClient.patch<Organization>(`${SVC}/orgs/${orgId}`, fields),
  transferOwnership: (orgId: string, newOwnerUserId: string) =>
    apiClient.post<{ ownerId: string }>(`${SVC}/orgs/${orgId}/transfer-ownership`, { newOwnerUserId }),

  listMembers: (orgId: string, includeInactive = true) =>
    apiClient.get<OrgMember[]>(`${SVC}/orgs/${orgId}/members`, { includeInactive: includeInactive ? 'true' : 'false' }),
  updateMemberRole: (orgId: string, userId: string, role: MembershipRole) =>
    apiClient.patch<{ role: string }>(`${SVC}/orgs/${orgId}/members/${userId}`, { role }),
  removeMember: (orgId: string, userId: string) => apiClient.delete(`${SVC}/orgs/${orgId}/members/${userId}`),
  suspendMember: (orgId: string, userId: string) => apiClient.post(`${SVC}/orgs/${orgId}/members/${userId}/suspend`, {}),
  reactivateMember: (orgId: string, userId: string) => apiClient.post(`${SVC}/orgs/${orgId}/members/${userId}/reactivate`, {}),
  forcePasswordReset: (orgId: string, userId: string) => apiClient.post<{ email: string }>(`${SVC}/orgs/${orgId}/members/${userId}/force-password-reset`, {}),
  forceMfa: (orgId: string, userId: string, required = true) => apiClient.post<{ mfaRequired: boolean }>(`${SVC}/orgs/${orgId}/members/${userId}/force-mfa`, { required }),

  invite: (orgId: string, email: string, role: MembershipRole, fullName?: string) =>
    apiClient.post<{ id: string; email: string; role: string; expiresAt: string }>(`${SVC}/orgs/${orgId}/invite`, { email, role, fullName }),
  bulkInvite: (orgId: string, invites: { email: string; role: MembershipRole; fullName?: string }[]) =>
    apiClient.post<{ invited: { email: string; role: string; id: string }[]; failed: { email: string; reason: string }[] }>(`${SVC}/orgs/${orgId}/invite/bulk`, { invites }),
  listInvitations: (orgId: string) => apiClient.get<OrgInvitation[]>(`${SVC}/orgs/${orgId}/invitations`),
  resendInvitation: (orgId: string, invitationId: string) => apiClient.post(`${SVC}/orgs/${orgId}/invitations/${invitationId}/resend`, {}),
  revokeInvitation: (orgId: string, invitationId: string) => apiClient.delete(`${SVC}/orgs/${orgId}/invitations/${invitationId}`),

  audit: (params: { page?: number; limit?: number } = {}) =>
    apiClient.get<{ total: number; page: number; limit: number; logs: AuditLog[] }>(`${SVC}/audit-logs`, params),

  // MFA enrolment (authenticated)
  mfaEnable: () => apiClient.post<{ qrCodeUrl: string; secret: string; recoveryCodes: string[] }>(`${SVC}/mfa/enable`, {}),
  mfaVerify: (code: string) => apiClient.post<{ message: string }>(`${SVC}/mfa/verify`, { code }),

  // Rich self profile (includes mfaRequired/lastLoginAt that gateway /auth/me omits)
  me: () => apiClient.get<{ id: string; email: string; mfaEnabled: boolean; mfaRequired: boolean }>(`${SVC}/me`),
};

// ── Public flows (no session) ────────────────────────────────────────────────────

async function publicPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BFF}${path}`, {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const json = await res.json().catch(() => null) as any;
  if (!res.ok) {
    const err = new Error(json?.error?.message || 'Request failed.') as Error & { code?: string };
    err.code = json?.error?.code;
    throw err;
  }
  return json as T;
}

export interface InvitePreview { email: string; role: string; orgName: string; expiresAt: string }

export const publicAuthApi = {
  /** Look up an invitation by token (gateway → auth-service /validate-invite). */
  async validateInvite(token: string): Promise<InvitePreview> {
    const res = await fetch(`${BFF}/auth/validate-invite?token=${encodeURIComponent(token)}`, { credentials: 'include' });
    const json = await res.json().catch(() => null) as any;
    if (!res.ok) {
      const err = new Error(json?.error?.message || 'Invalid invitation.') as Error & { code?: string };
      err.code = json?.error?.code;
      throw err;
    }
    // auth-service wraps in { success, data }
    return (json?.data ?? json) as InvitePreview;
  },

  /** Accept an invite → sets the session cookies (auto-login). Returns the safe profile. */
  acceptInvite: (input: { token: string; email: string; password: string; fullName?: string }) =>
    publicPost<{ user: { id?: string; email?: string; roles?: string[]; orgId?: string | null; orgType?: string | null }; csrfToken: string }>(
      '/auth/accept-invite', input,
    ),

  forgotPassword: (email: string) => publicPost<unknown>('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => publicPost<unknown>('/auth/reset-password', { token, newPassword }),

  /** Second step of an MFA login (after /auth/login returns mfaRequired). Establishes cookies. */
  mfaChallenge: (challengeToken: string, code: string) =>
    publicPost<{ user: { roles?: string[]; orgId?: string | null; orgType?: string | null }; csrfToken: string }>(
      '/auth/mfa-challenge', { challengeToken, code },
    ),

  /**
   * Force-MFA enrolment step 1 (after /auth/login returns mfaEnrollmentRequired): fetch the
   * provisioning material. Does NOT consume the challenge or set cookies.
   */
  mfaEnrollStart: (challengeToken: string) =>
    publicPost<{ qrCodeUrl: string; secret: string; recoveryCodes: string[] }>(
      '/auth/mfa-enroll/start', { challengeToken },
    ),

  /** Force-MFA enrolment step 2: confirm the code, activate MFA, and establish cookies (auto-login). */
  mfaEnrollComplete: (challengeToken: string, code: string) =>
    publicPost<{ user: { roles?: string[]; orgId?: string | null; orgType?: string | null }; csrfToken: string }>(
      '/auth/mfa-enroll', { challengeToken, code },
    ),
};

export type { ApiResponse };
