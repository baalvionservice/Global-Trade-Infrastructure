/**
 * @file personas.ts
 * @description THE PERSONA REGISTRY — the single source of truth that gives every role in the
 * Baalvion authority matrix its OWN distinct, scoped dashboard experience.
 *
 * Each persona declares:
 *   - `home`     : the landing route the persona is sent to after login (a console built for them)
 *   - `nav`      : the curated allowlist of route paths/prefixes they see in the sidebar
 *                  (the sentinel `'*'` means "every route" — reserved for sovereign/platform tiers)
 *   - branding   : label, tagline, accent, icon — so each console reads as a purpose-built surface
 *
 * This registry drives: the scoped sidebar, the post-login redirect, the per-persona landing,
 * and the header identity. Adding a new persona = one entry here, not a new shell.
 */
import { LucideIcon } from 'lucide-react';
import {
  ShieldCheck, Server, Crosshair, Landmark, ScrollText, Building2, Activity,
  FileCheck, Gavel, Eye, Ship, Wallet, Compass, Truck, Store, BarChart3, Users,
  ShieldAlert, RefreshCw, Radar,
} from 'lucide-react';
import { USER_ROLES, UserRole } from './roles';

export interface PersonaDef {
  /** Stable persona id (kebab-case). */
  id: string;
  /** The role(s) that resolve to this persona. */
  roles: UserRole[];
  /** Display name of the persona surface, e.g. "Bank Authority". */
  label: string;
  /** One-line description of the persona's mandate. */
  tagline: string;
  /** Landing route after login — a console built for this persona. */
  home: string;
  /** Brand icon for the persona. */
  icon: LucideIcon;
  /** Tailwind text-color token for the persona accent. */
  accent: string;
  /**
   * Curated nav allowlist: exact paths or path prefixes this persona may see in the sidebar.
   * `['*']` grants the full registry (sovereign / platform god-view only).
   */
  nav: string[];
  /** True for sovereign/platform tiers that get the cross-persona switcher (god-view). */
  godView?: boolean;
}

// ── Reusable nav bundles ─────────────────────────────────────────────────────
// Composed into personas so we never hand-duplicate route lists.

const NAV_TRADE_CORE = [
  '/marketplace', '/discovery', '/sourcing', '/suppliers', '/deals',
  '/negotiations', '/messages', '/orders', '/trade-management', '/trade-ops',
  '/logistics-shipment', '/shipments', '/carriers', '/customs',
  '/payments', '/escrow', '/financials/invoices', '/insurance',
  '/compliance', '/documents', '/intelligence-hub', '/profile',
];

const NAV_FINANCE = [
  '/financials', '/finance-settlement', '/payments', '/escrow',
  '/governance/bank-admin', '/financials/treasury', '/financials/trade-finance',
  '/financials/credit-lines', '/intelligence-hub/analytics', '/documents', '/profile',
];

const NAV_COMPLIANCE = [
  '/governance/compliance-admin', '/governance/disputes', '/governance/approvals',
  '/governance/regulatory', '/compliance', '/compliance-regulatory', '/trade-ops',
  '/sanctions-screening', '/governance/audit-logs', '/documents', '/profile',
];

const NAV_LOGISTICS = [
  '/logistics-shipment', '/shipments', '/carriers', '/customs', '/trade-ops',
  '/governance/maritime', '/governance/sla', '/intelligence-hub/maritime',
  '/intelligence-hub/sea-routes', '/documents', '/profile',
];

// ── The persona registry ─────────────────────────────────────────────────────

export const PERSONAS: PersonaDef[] = [
  // ============ TIER 0 / 1 — SOVEREIGN & PLATFORM (god-view) ============
  {
    id: 'sovereign-master',
    roles: [USER_ROLES.SUPER_ADMIN],
    label: 'Sovereign Master',
    tagline: 'Absolute authority across the entire trade infrastructure.',
    home: '/governance',
    icon: ShieldCheck,
    accent: 'text-amber-400',
    nav: ['*'],
    godView: true,
  },
  {
    id: 'platform-admin',
    roles: [USER_ROLES.PLATFORM_ADMIN],
    label: 'Platform Administrator',
    tagline: 'Platform-wide infrastructure, tenants, and operations control.',
    home: '/governance/platform-admin',
    icon: Server,
    accent: 'text-sky-400',
    nav: ['*'],
    godView: true,
  },
  {
    id: 'sovereign-admin',
    roles: [USER_ROLES.SOVEREIGN_ADMIN],
    label: 'Sovereign Administrator',
    tagline: 'Root governance, policy, and constitutional authority.',
    home: '/governance/sovereign-admin',
    icon: ShieldCheck,
    accent: 'text-amber-300',
    nav: ['*'],
    godView: true,
  },
  {
    id: 'sovereign-operator',
    roles: [USER_ROLES.SOVEREIGN_OPERATOR],
    label: 'Sovereign Operator',
    tagline: 'Live command-tower operations and incident response.',
    home: '/governance/control-tower',
    icon: Crosshair,
    accent: 'text-orange-400',
    nav: [
      '/governance/control-tower', '/governance/war-room', '/governance/emergency-ops',
      '/governance/observability', '/governance/infrastructure', '/governance/resilience',
      '/governance/automation', '/intelligence-hub', '/profile',
    ],
  },
  {
    id: 'platform-auditor',
    roles: [USER_ROLES.PLATFORM_AUDITOR],
    label: 'Sovereign Auditor',
    tagline: 'Read-only oversight: immutable ledgers, telemetry, and trails.',
    home: '/governance/audit-logs',
    icon: Eye,
    accent: 'text-violet-400',
    nav: [
      '/governance/audit-logs', '/governance/observability', '/governance/soc',
      '/governance/compliance-admin', '/governance/regulatory', '/documents', '/profile',
    ],
  },
  {
    id: 'national-regulator',
    roles: [USER_ROLES.NATIONAL_REGULATOR],
    label: 'National Regulator',
    tagline: 'Jurisdictional regulatory oversight, audit, and reporting.',
    home: '/governance/regulatory',
    icon: ScrollText,
    accent: 'text-rose-400',
    nav: [
      '/governance/regulatory', '/governance/compliance-admin', '/governance/audit-logs',
      '/governance/policies', '/governance/customs', '/sanctions-screening',
      '/documents', '/profile',
    ],
  },

  // ============ TIER 2 — INSTITUTIONAL LEADERSHIP ============
  {
    id: 'org-owner',
    roles: [USER_ROLES.ORG_OWNER],
    label: 'Organization Principal',
    tagline: 'Full command of your organization across trade and treasury.',
    home: '/executive/command',
    icon: Building2,
    accent: 'text-primary',
    nav: [
      '/executive/command', '/dashboard', ...NAV_TRADE_CORE, ...NAV_FINANCE,
      '/governance/organizations', '/governance/identity', '/settings',
    ],
  },
  {
    id: 'executive-director',
    roles: [USER_ROLES.EXECUTIVE_DIRECTOR],
    label: 'Executive Command',
    tagline: 'Strategic oversight of deals, settlement, and performance.',
    home: '/executive/command',
    icon: Crosshair,
    accent: 'text-primary',
    nav: [
      '/executive/command', '/dashboard', '/deals', '/negotiations', '/orders',
      '/finance-settlement', '/financials', '/intelligence-hub', '/governance/control-tower',
      '/messages', '/documents', '/profile',
    ],
  },
  {
    id: 'finance-director',
    roles: [USER_ROLES.FINANCE_DIRECTOR],
    label: 'Treasury Command',
    tagline: 'Treasury, settlement, trade finance, and credit authority.',
    home: '/financials/treasury',
    icon: Landmark,
    accent: 'text-emerald-400',
    nav: NAV_FINANCE,
  },
  {
    id: 'compliance-director',
    roles: [USER_ROLES.COMPLIANCE_DIRECTOR],
    label: 'Compliance Command',
    tagline: 'KYC, AML, sanctions, and dispute adjudication authority.',
    home: '/governance/compliance-admin',
    icon: FileCheck,
    accent: 'text-cyan-400',
    nav: NAV_COMPLIANCE,
  },
  {
    id: 'compliance-admin',
    roles: [USER_ROLES.COMPLIANCE_ADMIN],
    label: 'Compliance Administrator',
    tagline: 'Day-to-day compliance casework and screening.',
    home: '/governance/compliance-admin',
    icon: FileCheck,
    accent: 'text-cyan-300',
    nav: NAV_COMPLIANCE,
  },
  {
    id: 'operations-director',
    roles: [USER_ROLES.OPERATIONS_DIRECTOR],
    label: 'Logistics Command',
    tagline: 'End-to-end logistics, carriers, and customs orchestration.',
    home: '/logistics-shipment/control-tower',
    icon: Truck,
    accent: 'text-blue-400',
    nav: ['/logistics-shipment', ...NAV_LOGISTICS, '/sourcing', '/orders'],
  },

  // ============ TRADE PARTICIPANTS ============
  {
    id: 'buyer',
    roles: [USER_ROLES.BUYER, USER_ROLES.BUYER_NODE],
    label: 'Buyer',
    tagline: 'Source, negotiate, and execute purchases across the world.',
    home: '/buyer/dashboard',
    icon: Store,
    accent: 'text-blue-400',
    nav: [
      '/buyer/dashboard', '/marketplace', '/discovery', '/buyer/rfqs',
      '/sourcing', '/suppliers', '/deals', '/negotiations', '/messages',
      '/orders', '/trade-ops', '/logistics-shipment', '/shipments', '/customs',
      '/payments', '/escrow', '/financials/invoices', '/insurance',
      '/compliance', '/documents', '/intelligence-hub', '/profile',
    ],
  },
  {
    id: 'seller',
    roles: [USER_ROLES.SELLER, USER_ROLES.SELLER_NODE],
    label: 'Seller',
    tagline: 'List, win RFQs, and fulfil orders to global buyers.',
    home: '/seller/dashboard',
    icon: BarChart3,
    accent: 'text-emerald-400',
    nav: [
      '/seller/dashboard', '/seller/listings', '/seller/rfqs', '/seller/responses',
      '/marketplace', '/deals', '/negotiations', '/messages', '/orders', '/trade-ops',
      '/logistics-shipment', '/shipments', '/carriers', '/customs',
      '/payments', '/escrow', '/financials/invoices', '/insurance',
      '/compliance', '/documents', '/intelligence-hub', '/profile',
    ],
  },
  {
    id: 'agent',
    roles: [USER_ROLES.AGENT],
    label: 'Trade Agent',
    tagline: 'Broker deals and coordinate across counterparties.',
    home: '/agent/dashboard',
    icon: Users,
    accent: 'text-purple-400',
    nav: [
      '/agent/dashboard', '/agent/requests', '/marketplace', '/discovery',
      '/deals', '/negotiations', '/messages', '/suppliers', '/orders',
      '/logistics-shipment', '/documents', '/intelligence-hub', '/profile',
    ],
  },

  // ============ TIER 3 — TACTICAL EXECUTION ============
  {
    id: 'treasury-operator',
    roles: [USER_ROLES.TREASURY_OPERATOR],
    label: 'Treasury Node',
    tagline: 'Execute settlements and manage payment rails.',
    home: '/finance-settlement',
    icon: RefreshCw,
    accent: 'text-emerald-300',
    nav: ['/finance-settlement', '/payments', '/escrow', '/financials/invoices', '/documents', '/profile'],
  },
  {
    id: 'compliance-officer',
    roles: [USER_ROLES.COMPLIANCE_OFFICER],
    label: 'Compliance Node',
    tagline: 'Frontline screening, casework, and audit support.',
    home: '/compliance',
    icon: ShieldAlert,
    accent: 'text-cyan-300',
    nav: ['/compliance', '/compliance-regulatory', '/sanctions-screening', '/governance/compliance-admin', '/documents', '/profile'],
  },
  {
    id: 'trade-analyst',
    roles: [USER_ROLES.TRADE_ANALYST],
    label: 'Intelligence Node',
    tagline: 'Market, risk, and geopolitical intelligence.',
    home: '/intelligence-hub',
    icon: Compass,
    accent: 'text-indigo-400',
    nav: ['/intelligence-hub', '/discovery', '/marketplace/prices', '/documents', '/profile'],
  },
  {
    id: 'logistics-coordinator',
    roles: [USER_ROLES.LOGISTICS_COORDINATOR],
    label: 'Fulfillment Node',
    tagline: 'Track shipments and coordinate carriers.',
    home: '/logistics-shipment',
    icon: Truck,
    accent: 'text-blue-300',
    nav: ['/logistics-shipment', '/shipments', '/carriers', '/customs', '/documents', '/profile'],
  },

  // ============ EXTERNAL AUTHORITY NODES ============
  {
    id: 'bank-admin',
    roles: [USER_ROLES.BANK_ADMIN],
    label: 'Bank Authority',
    tagline: 'Settlement rails, escrow release, and trade-finance approvals.',
    home: '/governance/bank-admin',
    icon: Landmark,
    accent: 'text-emerald-400',
    nav: [
      '/governance/bank-admin', '/finance-settlement', '/payments', '/escrow',
      '/financials/trade-finance', '/financials/credit-lines', '/governance/approvals',
      '/trade-ops', '/governance/audit-logs', '/documents', '/profile',
    ],
  },
  {
    id: 'insurance-admin',
    roles: [USER_ROLES.INSURANCE_ADMIN],
    label: 'Insurance Authority',
    tagline: 'Underwrite policies, assess cargo risk, and settle claims.',
    home: '/insurance',
    icon: ShieldCheck,
    accent: 'text-teal-400',
    nav: [
      '/insurance', '/insurance/policies', '/insurance/claims', '/shipments',
      '/logistics-shipment', '/intelligence-hub/risk', '/governance/audit-logs',
      '/documents', '/profile',
    ],
  },
  {
    id: 'customs-agent',
    roles: [USER_ROLES.CUSTOMS_AGENT],
    label: 'Customs Authority',
    tagline: 'Declarations, tariffs, and clearance authority.',
    home: '/governance/customs',
    icon: Gavel,
    accent: 'text-orange-400',
    nav: [
      '/governance/customs', '/customs', '/compliance-regulatory/declarations',
      '/compliance-regulatory/hs-codes', '/shipments', '/logistics-shipment', '/trade-ops',
      '/governance/audit-logs', '/documents', '/profile',
    ],
  },
  {
    id: 'arbitrator',
    roles: [USER_ROLES.ARBITRATOR],
    label: 'Legal Adjudicator',
    tagline: 'Dispute resolution and arbitration authority.',
    home: '/governance/disputes',
    icon: Gavel,
    accent: 'text-rose-400',
    nav: ['/governance/disputes', '/governance/approvals', '/governance/audit-logs', '/documents', '/profile'],
  },
];

// ── Resolution helpers ────────────────────────────────────────────────────────

/**
 * Least-privilege baseline persona. This is BOTH the explicit MEMBER persona AND the defensive
 * fallback for any role somehow missing from the registry. Its `home` (/dashboard) is included in
 * its own nav allowlist so the route guard can never bounce it into a redirect loop.
 */
const DEFAULT_PERSONA: PersonaDef = {
  id: 'member',
  roles: [USER_ROLES.MEMBER],
  label: 'Trade Participant',
  tagline: 'Your operational console.',
  home: '/dashboard',
  icon: Compass,
  accent: 'text-primary',
  nav: ['/dashboard', ...NAV_TRADE_CORE],
};

/** Persona lookup by stable id — lets the organization-type layer reuse curated nav allowlists. */
const PERSONA_BY_ID: Map<string, PersonaDef> = (() => {
  const map = new Map<string, PersonaDef>();
  for (const persona of [...PERSONAS, DEFAULT_PERSONA]) map.set(persona.id, persona);
  return map;
})();

/** Returns the persona with the given id, or undefined when none matches. */
export function getPersonaById(id: string): PersonaDef | undefined {
  return PERSONA_BY_ID.get(id);
}

const PERSONA_BY_ROLE: Map<UserRole, PersonaDef> = (() => {
  const map = new Map<UserRole, PersonaDef>();
  // Include the baseline MEMBER persona so the explicit least-privilege role resolves to a real,
  // intentional console rather than relying solely on the `?? DEFAULT_PERSONA` safety net.
  for (const persona of [...PERSONAS, DEFAULT_PERSONA]) {
    for (const role of persona.roles) map.set(role, persona);
  }
  return map;
})();

/** Resolve the persona for a given role. Always returns a usable persona. */
export function getPersona(role: UserRole): PersonaDef {
  return PERSONA_BY_ROLE.get(role) ?? DEFAULT_PERSONA;
}

/** The home (landing) route for a role. */
export function getPersonaHome(role: UserRole): string {
  return getPersona(role).home;
}

/**
 * Does this persona's nav allowlist permit the given route path?
 * `'*'` grants everything; otherwise exact-match or prefix-match (`/a/b` matches `/a/b/c`).
 */
export function personaAllowsPath(persona: PersonaDef, path: string): boolean {
  if (persona.nav.includes('*')) return true;
  return persona.nav.some((allow) => path === allow || path.startsWith(`${allow}/`));
}
