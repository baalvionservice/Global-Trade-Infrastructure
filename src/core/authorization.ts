/**
 * @file authorization.ts
 * @description Reusable, org-scoped authorization helpers for the GTI multi-tenant platform.
 *
 * Access is decided by an `AuthzContext` describing the caller's resolved organization type, their
 * membership role (capability tier), and whether they hold platform-level (cross-tenant) authority.
 *
 * SECURITY CONTRACT (FAIL-CLOSED):
 *   • A platform-level authority (platform_owner org OR super_admin) passes every check.
 *   • Otherwise capability comes from the membership role (unknown role → viewer).
 *   • Dashboard access is gated by the organization TYPE's nav allowlist — a member can never reach a
 *     surface belonging to another organization type unless they are platform-level.
 *   • This is a UX / leak guard; the API remains the authoritative gate for all data access.
 */
import {
  OrgType,
  MembershipRole,
  getRoleCapabilities,
  isPlatformOrgType,
  orgTypeAllowsPath,
  getDashboardForOrgType,
} from './organizations';

export interface AuthzContext {
  /** Resolved organization type, or null for legacy/unknown sessions. */
  orgType: OrgType | null;
  /** Resolved membership role (capability tier). */
  role: MembershipRole;
  /** True for platform-level authorities (platform_owner org or super_admin god-view). */
  isPlatformAdmin: boolean;
}

/** True when the context has platform-level (cross-tenant) authority. */
export function isPlatformAuthority(ctx: AuthzContext): boolean {
  return ctx.isPlatformAdmin || isPlatformOrgType(ctx.orgType);
}

/** Can the caller VIEW operational data? (Every authenticated member can at least view.) */
export function canView(ctx: AuthzContext): boolean {
  return isPlatformAuthority(ctx) || getRoleCapabilities(ctx.role).view;
}

/** Can the caller CREATE / EDIT operational records? */
export function canEdit(ctx: AuthzContext): boolean {
  return isPlatformAuthority(ctx) || getRoleCapabilities(ctx.role).edit;
}

/** Can the caller APPROVE / authorize actions (settlements, clearances, claims, …)? */
export function canApprove(ctx: AuthzContext): boolean {
  return isPlatformAuthority(ctx) || getRoleCapabilities(ctx.role).approve;
}

/** Can the caller manage the organization itself (settings, billing, lifecycle)? */
export function canManageOrganization(ctx: AuthzContext): boolean {
  return isPlatformAuthority(ctx) || getRoleCapabilities(ctx.role).manageOrg;
}

/** Can the caller manage users / memberships within the organization? */
export function canManageUsers(ctx: AuthzContext): boolean {
  return isPlatformAuthority(ctx) || getRoleCapabilities(ctx.role).manageUsers;
}

/**
 * Can the caller access the dashboard / route at `path`?
 *   • platform-level → any path
 *   • org member     → only paths inside their organization type's nav allowlist
 *   • no org type    → deny (caller should fall back to a legacy persona check)
 */
export function canAccessDashboard(ctx: AuthzContext, path: string): boolean {
  if (isPlatformAuthority(ctx)) return true;
  if (!ctx.orgType) return false;
  return orgTypeAllowsPath(ctx.orgType, path);
}

/** The landing dashboard for the context's organization type (null when unresolved). */
export function dashboardHomeFor(ctx: AuthzContext): string | null {
  if (!ctx.orgType) return null;
  return getDashboardForOrgType(ctx.orgType);
}
