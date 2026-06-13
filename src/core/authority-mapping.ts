/**
 * @file authority-mapping.ts
 * @description Pure, dependency-free resolution of a backend (auth-gateway) role string into the
 * frontend authority vocabulary. Extracted from the React state layer so it is unit-testable and
 * reusable, and so the security-critical rule lives in exactly one place.
 *
 * SECURITY CONTRACT (FAIL-CLOSED):
 *   • Resolution is an EXPLICIT allowlist — no fuzzy substring matching.
 *   • An unrecognized role resolves to the least-privilege MEMBER — NEVER a sovereign tier.
 *   • Org ownership is NOT platform sovereignty: `owner`/`admin` → ORG_OWNER, not SUPER_ADMIN.
 *     Platform god-view must be granted EXPLICITLY by the identity service (`super_admin`, …).
 *   • When a principal holds MULTIPLE roles, the EFFECTIVE authority is the highest-ranked
 *     recognized role — deterministic, never dependent on array order.
 */
import { USER_ROLES, UserRole } from './roles';

/** Explicit canonical-gateway-role → authority allowlist. Keys are normalized (see `normalize`). */
export const GATEWAY_ROLE_MAP: Readonly<Record<string, UserRole>> = {
  super_admin: USER_ROLES.SUPER_ADMIN,
  superadmin: USER_ROLES.SUPER_ADMIN,
  platform_admin: USER_ROLES.PLATFORM_ADMIN,
  sovereign_admin: USER_ROLES.SOVEREIGN_ADMIN,
  sovereign_operator: USER_ROLES.SOVEREIGN_OPERATOR,
  platform_auditor: USER_ROLES.PLATFORM_AUDITOR,
  auditor: USER_ROLES.PLATFORM_AUDITOR,
  national_regulator: USER_ROLES.NATIONAL_REGULATOR,
  regulator: USER_ROLES.NATIONAL_REGULATOR,
  org_owner: USER_ROLES.ORG_OWNER,
  owner: USER_ROLES.ORG_OWNER,
  admin: USER_ROLES.ORG_OWNER,
  executive_director: USER_ROLES.EXECUTIVE_DIRECTOR,
  executive: USER_ROLES.EXECUTIVE_DIRECTOR,
  finance_director: USER_ROLES.FINANCE_DIRECTOR,
  compliance_director: USER_ROLES.COMPLIANCE_DIRECTOR,
  compliance_admin: USER_ROLES.COMPLIANCE_ADMIN,
  operations_director: USER_ROLES.OPERATIONS_DIRECTOR,
  buyer: USER_ROLES.BUYER,
  buyer_node: USER_ROLES.BUYER_NODE,
  seller: USER_ROLES.SELLER,
  seller_node: USER_ROLES.SELLER_NODE,
  agent: USER_ROLES.AGENT,
  trade_agent: USER_ROLES.AGENT,
  treasury_operator: USER_ROLES.TREASURY_OPERATOR,
  compliance_officer: USER_ROLES.COMPLIANCE_OFFICER,
  trade_analyst: USER_ROLES.TRADE_ANALYST,
  analyst: USER_ROLES.TRADE_ANALYST,
  logistics_coordinator: USER_ROLES.LOGISTICS_COORDINATOR,
  bank_admin: USER_ROLES.BANK_ADMIN,
  insurance_admin: USER_ROLES.INSURANCE_ADMIN,
  customs_agent: USER_ROLES.CUSTOMS_AGENT,
  arbitrator: USER_ROLES.ARBITRATOR,
  client: USER_ROLES.MEMBER,
  member: USER_ROLES.MEMBER,
  operator: USER_ROLES.MEMBER, // generic "operator" stays least-privilege unless the backend is specific
};

/**
 * Privilege ranking (higher = more authority). Used to pick the effective role when a principal
 * holds several. Every UserRole has a rank; MEMBER is the floor so unrecognized roles can never
 * raise the effective authority.
 */
export const AUTHORITY_RANK: Readonly<Record<UserRole, number>> = {
  [USER_ROLES.SUPER_ADMIN]: 100,
  [USER_ROLES.SOVEREIGN_ADMIN]: 95,
  [USER_ROLES.PLATFORM_ADMIN]: 90,
  [USER_ROLES.SOVEREIGN_OPERATOR]: 80,
  [USER_ROLES.PLATFORM_AUDITOR]: 75,
  [USER_ROLES.NATIONAL_REGULATOR]: 75,
  [USER_ROLES.ORG_OWNER]: 70,
  [USER_ROLES.EXECUTIVE_DIRECTOR]: 65,
  [USER_ROLES.FINANCE_DIRECTOR]: 60,
  [USER_ROLES.COMPLIANCE_DIRECTOR]: 60,
  [USER_ROLES.OPERATIONS_DIRECTOR]: 60,
  [USER_ROLES.COMPLIANCE_ADMIN]: 55,
  [USER_ROLES.BANK_ADMIN]: 50,
  [USER_ROLES.INSURANCE_ADMIN]: 50,
  [USER_ROLES.CUSTOMS_AGENT]: 50,
  [USER_ROLES.ARBITRATOR]: 50,
  [USER_ROLES.TREASURY_OPERATOR]: 40,
  [USER_ROLES.COMPLIANCE_OFFICER]: 40,
  [USER_ROLES.LOGISTICS_COORDINATOR]: 40,
  [USER_ROLES.TRADE_ANALYST]: 40,
  [USER_ROLES.AGENT]: 30,
  [USER_ROLES.BUYER]: 25,
  [USER_ROLES.SELLER]: 25,
  [USER_ROLES.BUYER_NODE]: 20,
  [USER_ROLES.SELLER_NODE]: 20,
  [USER_ROLES.MEMBER]: 0,
};

function normalize(role: string | undefined | null): string {
  return (role || '').toLowerCase().trim().replace(/[\s-]+/g, '_');
}

/** Resolve ONE gateway role string. Fail-closed: unknown → MEMBER. */
export function mapAuthorityRole(gatewayRole: string | undefined | null): UserRole {
  return GATEWAY_ROLE_MAP[normalize(gatewayRole)] ?? USER_ROLES.MEMBER;
}

/**
 * Resolve the EFFECTIVE authority from a principal's full role set: the highest-ranked recognized
 * role. Deterministic regardless of input order. Empty/garbage input → MEMBER.
 */
export function resolveAuthority(roles: ReadonlyArray<string | undefined | null> | undefined | null): UserRole {
  const candidates = (roles ?? []).map(mapAuthorityRole);
  if (candidates.length === 0) return USER_ROLES.MEMBER;
  return candidates.reduce((best, r) => (AUTHORITY_RANK[r] > AUTHORITY_RANK[best] ? r : best), USER_ROLES.MEMBER);
}
