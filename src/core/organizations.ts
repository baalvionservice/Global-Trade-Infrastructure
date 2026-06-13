/**
 * @file organizations.ts
 * @description THE MULTI-TENANT ORGANIZATION MODEL — the single source of truth that maps an
 * organization's TYPE to the dashboard surface it operates, and a member's ROLE to what they may do.
 *
 * GTI is a true multi-tenant platform: every user belongs to an organization, every organization has
 * a type, and every user has a role within that organization. Dashboard access is determined by
 * (orgType, role) — NOT by superadmin persona impersonation. Platform administration is the ONLY
 * cross-tenant authority (platform_owner org type or a super_admin authority).
 *
 * Surfaces (home + nav allowlist) are REUSED from the existing persona registry by id, so all
 * existing dashboards and their curated navigation are preserved without duplication.
 */
import { getPersonaById, PersonaDef } from './personas';

// ── Organization types ────────────────────────────────────────────────────────
export const ORG_TYPES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  TRADE_AGENT: 'trade_agent',
  LOGISTICS_PROVIDER: 'logistics_provider',
  CUSTOMS_AUTHORITY: 'customs_authority',
  BANK: 'bank',
  INSURANCE_PROVIDER: 'insurance_provider',
  COMPLIANCE_AGENCY: 'compliance_agency',
  REGULATOR: 'regulator',
  PLATFORM_OWNER: 'platform_owner',
} as const;

export type OrgType = (typeof ORG_TYPES)[keyof typeof ORG_TYPES];

// ── Membership roles (capability tier WITHIN an organization) ───────────────────
export const MEMBERSHIP_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  OFFICER: 'officer',
  ANALYST: 'analyst',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
} as const;

export type MembershipRole = (typeof MEMBERSHIP_ROLES)[keyof typeof MEMBERSHIP_ROLES];

/** What a member can DO. Org TYPE decides WHICH surface; ROLE decides the capability level. */
export interface RoleCapabilities {
  view: boolean;
  edit: boolean;
  approve: boolean;
  manageUsers: boolean;
  manageOrg: boolean;
}

export const ROLE_CAPABILITIES: Readonly<Record<MembershipRole, RoleCapabilities>> = {
  owner:    { view: true, edit: true,  approve: true,  manageUsers: true,  manageOrg: true },
  admin:    { view: true, edit: true,  approve: true,  manageUsers: true,  manageOrg: false },
  manager:  { view: true, edit: true,  approve: true,  manageUsers: false, manageOrg: false },
  officer:  { view: true, edit: true,  approve: true,  manageUsers: false, manageOrg: false },
  operator: { view: true, edit: true,  approve: false, manageUsers: false, manageOrg: false },
  analyst:  { view: true, edit: false, approve: false, manageUsers: false, manageOrg: false },
  viewer:   { view: true, edit: false, approve: false, manageUsers: false, manageOrg: false },
};

/** Least-privilege capability floor — used when a role is unrecognized (fail-closed). */
export const VIEWER_CAPABILITIES: RoleCapabilities = ROLE_CAPABILITIES.viewer;

// ── Shared org self-administration paths (visible to every org type) ───────────
/** Routes every organization's members can reach to self-administer their org. */
const ORG_SELF_ADMIN_NAV: string[] = [
  '/organization/settings',
  '/organization/users',
  '/organization/audit',
];

// ── Org type → dashboard surface ────────────────────────────────────────────────
export interface OrgTypeConfig {
  /** Human label for the organization type. */
  label: string;
  /** Landing dashboard after login. */
  home: string;
  /** Persona id whose curated nav allowlist this org type reuses. */
  personaId: string;
  /** Extra nav paths/prefixes to grant beyond the reused persona allowlist. */
  extraNav?: string[];
  /** Platform-level cross-tenant authority — sees every route (god-view). */
  platformLevel?: boolean;
}

export const ORG_TYPE_CONFIG: Readonly<Record<OrgType, OrgTypeConfig>> = {
  buyer:              { label: 'Buyer',              home: '/buyer/dashboard',                  personaId: 'buyer',               extraNav: [...ORG_SELF_ADMIN_NAV] },
  seller:             { label: 'Seller',             home: '/seller/dashboard',                 personaId: 'seller',              extraNav: [...ORG_SELF_ADMIN_NAV] },
  trade_agent:        { label: 'Trade Agent',        home: '/agent/dashboard',                  personaId: 'agent',               extraNav: [...ORG_SELF_ADMIN_NAV] },
  logistics_provider: { label: 'Logistics Provider', home: '/logistics-shipment/control-tower', personaId: 'operations-director', extraNav: [...ORG_SELF_ADMIN_NAV] },
  customs_authority:  { label: 'Customs Authority',  home: '/governance/customs',               personaId: 'customs-agent',       extraNav: [...ORG_SELF_ADMIN_NAV] },
  bank:               { label: 'Bank',               home: '/governance/bank-admin',            personaId: 'bank-admin',          extraNav: [...ORG_SELF_ADMIN_NAV] },
  insurance_provider: { label: 'Insurance Provider', home: '/insurance',                        personaId: 'insurance-admin',     extraNav: [...ORG_SELF_ADMIN_NAV] },
  compliance_agency:  { label: 'Compliance Agency',  home: '/governance/compliance-admin',      personaId: 'compliance-admin',    extraNav: [...ORG_SELF_ADMIN_NAV] },
  regulator:          { label: 'Regulator',          home: '/governance',                       personaId: 'national-regulator',  extraNav: ['/governance', ...ORG_SELF_ADMIN_NAV] },
  // platform_owner has platformLevel: true → getOrgTypeNav returns ['*'] (every route).
  // extraNav is included for completeness so /platform/organizations is explicitly enumerable
  // if callers inspect the config directly rather than going through getOrgTypeNav.
  platform_owner:     { label: 'Platform Owner',     home: '/executive/command',                personaId: 'org-owner',           extraNav: ['/platform/organizations', ...ORG_SELF_ADMIN_NAV], platformLevel: true },
};

// ── Resolution helpers ──────────────────────────────────────────────────────────

function normalize(value: string | null | undefined): string {
  return (value || '').toLowerCase().trim().replace(/[\s-]+/g, '_');
}

const ORG_TYPE_SET: ReadonlySet<string> = new Set(Object.values(ORG_TYPES));
const MEMBERSHIP_ROLE_SET: ReadonlySet<string> = new Set(Object.values(MEMBERSHIP_ROLES));

/** Resolve a backend org-type string. Unknown → null (caller falls back to persona/legacy). */
export function resolveOrgType(value: string | null | undefined): OrgType | null {
  const n = normalize(value);
  return ORG_TYPE_SET.has(n) ? (n as OrgType) : null;
}

/**
 * Resolve a backend membership-role string to a capability tier. Fail-closed: unknown → viewer.
 * Recognizes a few common aliases from the legacy role vocabulary.
 */
export function resolveMembershipRole(value: string | null | undefined): MembershipRole {
  const n = normalize(value);
  if (MEMBERSHIP_ROLE_SET.has(n)) return n as MembershipRole;
  // Legacy / privileged aliases → reasonable capability tiers.
  if (n === 'super_admin' || n === 'platform_admin' || n === 'sovereign_admin') return MEMBERSHIP_ROLES.OWNER;
  if (n === 'member' || n === 'client') return MEMBERSHIP_ROLES.VIEWER;
  return MEMBERSHIP_ROLES.VIEWER;
}

/** Capabilities for a membership role (fail-closed to viewer). */
export function getRoleCapabilities(role: MembershipRole | string | null | undefined): RoleCapabilities {
  const resolved = resolveMembershipRole(role as string);
  return ROLE_CAPABILITIES[resolved] ?? VIEWER_CAPABILITIES;
}

/** The dashboard landing route for an org type. */
export function getDashboardForOrgType(orgType: OrgType): string {
  return ORG_TYPE_CONFIG[orgType].home;
}

/** The label for an org type. */
export function getOrgTypeLabel(orgType: OrgType): string {
  return ORG_TYPE_CONFIG[orgType].label;
}

/** True when this org type is a platform-level (cross-tenant) authority. */
export function isPlatformOrgType(orgType: OrgType | null | undefined): boolean {
  return !!orgType && ORG_TYPE_CONFIG[orgType].platformLevel === true;
}

/**
 * The full nav allowlist for an org type: the reused persona allowlist ∪ its extras ∪ its home.
 * Platform-level org types receive the sentinel `'*'` (every route).
 */
export function getOrgTypeNav(orgType: OrgType): string[] {
  const cfg = ORG_TYPE_CONFIG[orgType];
  if (cfg.platformLevel) return ['*'];
  const persona: PersonaDef | undefined = getPersonaById(cfg.personaId);
  const base = persona ? persona.nav : [];
  return Array.from(new Set([...base, ...(cfg.extraNav ?? []), cfg.home]));
}

/**
 * Does an org type's nav allowlist permit `path`? `'*'` grants everything; otherwise exact-match or
 * prefix-match (`/a/b` matches `/a/b/c`). The org's own home is always permitted.
 */
export function orgTypeAllowsPath(orgType: OrgType, path: string): boolean {
  const nav = getOrgTypeNav(orgType);
  if (nav.includes('*')) return true;
  return nav.some((allow) => path === allow || path.startsWith(`${allow}/`));
}
