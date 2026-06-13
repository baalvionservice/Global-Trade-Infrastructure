/**
 * @file roles.ts
 * @description THE AUTHORITATIVE BAALVION AUTHORITY MATRIX.
 */

export const SOVEREIGN_TIERS = {
  TIER_0_KERNEL: 'Sovereign Core',
  TIER_1_GOVERNANCE: 'Sovereign Council',
  TIER_2_INSTITUTIONAL: 'Enterprise Node',
  TIER_3_OPERATIONAL: 'Execution Node',
} as const;

export const USER_ROLES = {
  // --- TIER 0 & 1: SOVEREIGN COMMAND (Platform Level) ---
  SUPER_ADMIN: 'Sovereign Master',
  PLATFORM_ADMIN: 'Platform Administrator',
  SOVEREIGN_ADMIN: 'Sovereign Administrator',
  SOVEREIGN_OPERATOR: 'Sovereign Operator',
  PLATFORM_AUDITOR: 'Sovereign Auditor',
  NATIONAL_REGULATOR: 'National Regulator',

  // --- TIER 2: INSTITUTIONAL LEADERSHIP ---
  ORG_OWNER: 'Organization Principal',
  EXECUTIVE_DIRECTOR: 'Executive Command',
  FINANCE_DIRECTOR: 'Treasury Command',
  COMPLIANCE_DIRECTOR: 'Compliance Command',
  COMPLIANCE_ADMIN: 'Compliance Administrator',
  OPERATIONS_DIRECTOR: 'Logistics Command',

  // --- TRADE PARTICIPANTS ---
  BUYER: 'Buyer',
  BUYER_NODE: 'Buyer Node',
  SELLER: 'Seller',
  SELLER_NODE: 'Seller Node',
  AGENT: 'Trade Agent',

  // --- TIER 3: TACTICAL EXECUTION ---
  TREASURY_OPERATOR: 'Treasury Node',
  COMPLIANCE_OFFICER: 'Compliance Node',
  TRADE_ANALYST: 'Intelligence Node',
  LOGISTICS_COORDINATOR: 'Fulfillment Node',

  // --- EXTERNAL AUTHORITY NODES ---
  BANK_ADMIN: 'Bank Authority',
  INSURANCE_ADMIN: 'Insurance Authority',
  CUSTOMS_AGENT: 'Customs Authority',
  ARBITRATOR: 'Legal Adjudicator',

  // --- BASELINE PARTICIPANT (least privilege; the FAIL-CLOSED default authority) ---
  // Any session whose backend role is unrecognized resolves here — never to a sovereign tier.
  MEMBER: 'Trade Participant',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export type PermissionResource =
  | 'sourcing'
  | 'negotiation'
  | 'settlement'
  | 'logistics'
  | 'compliance'
  | 'governance'
  | 'infrastructure'
  | 'identity'
  | 'constitution';

export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'approve'
  | 'audit'
  | 'settle'
  | 'override'
  | 'export'
  | 'seal';

export const PERMISSION_MATRIX: Record<UserRole, Partial<Record<PermissionResource, PermissionAction[]>>> = {
  [USER_ROLES.SUPER_ADMIN]: {
    infrastructure: ['read', 'update', 'audit'],
    governance: ['create', 'read', 'update', 'delete', 'approve', 'override'],
    identity: ['read', 'update', 'audit'],
    constitution: ['read', 'update', 'seal'],
    sourcing: ['audit'],
    settlement: ['audit'],
    compliance: ['audit'],
  },
  [USER_ROLES.PLATFORM_ADMIN]: {
    infrastructure: ['read', 'update', 'audit'],
    governance: ['create', 'read', 'update', 'approve'],
    identity: ['read', 'update', 'audit'],
    compliance: ['read', 'audit'],
    sourcing: ['audit'],
    settlement: ['audit'],
  },
  [USER_ROLES.SOVEREIGN_ADMIN]: {
    infrastructure: ['read', 'update', 'audit'],
    governance: ['create', 'read', 'update', 'approve', 'override'],
    identity: ['read', 'update', 'audit'],
    constitution: ['read', 'update'],
    compliance: ['audit'],
  },
  [USER_ROLES.SOVEREIGN_OPERATOR]: {
    infrastructure: ['read', 'update'],
    governance: ['read', 'update'],
    identity: ['read'],
  },
  [USER_ROLES.PLATFORM_AUDITOR]: {
    infrastructure: ['read', 'audit'],
    governance: ['read', 'audit'],
    compliance: ['read', 'audit', 'export'],
    identity: ['read', 'audit'],
  },
  [USER_ROLES.NATIONAL_REGULATOR]: {
    compliance: ['read', 'audit', 'export'],
    governance: ['read', 'audit'],
    constitution: ['read'],
  },
  [USER_ROLES.ORG_OWNER]: {
    sourcing: ['create', 'read', 'update', 'approve'],
    negotiation: ['create', 'read', 'update', 'approve'],
    settlement: ['read', 'approve'],
    logistics: ['read'],
    identity: ['read', 'update'],
    governance: ['read'],
    constitution: ['read'],
  },
  [USER_ROLES.EXECUTIVE_DIRECTOR]: {
    sourcing: ['read', 'approve'],
    negotiation: ['read', 'approve', 'audit'],
    settlement: ['read', 'approve'],
    governance: ['read', 'audit'],
  },
  [USER_ROLES.FINANCE_DIRECTOR]: {
    settlement: ['create', 'read', 'update', 'approve', 'settle', 'audit', 'export'],
    governance: ['read'],
    identity: ['read'],
  },
  [USER_ROLES.COMPLIANCE_DIRECTOR]: {
    compliance: ['create', 'read', 'update', 'approve', 'audit', 'export'],
    identity: ['read', 'audit'],
    governance: ['read', 'audit'],
  },
  [USER_ROLES.COMPLIANCE_ADMIN]: {
    compliance: ['create', 'read', 'update', 'approve', 'audit'],
    identity: ['read'],
    governance: ['read'],
  },
  [USER_ROLES.OPERATIONS_DIRECTOR]: {
    logistics: ['create', 'read', 'update', 'approve', 'audit'],
    sourcing: ['read'],
    governance: ['read'],
  },
  [USER_ROLES.BUYER]: {
    sourcing: ['create', 'read', 'update'],
    negotiation: ['create', 'read', 'update'],
    settlement: ['read'],
    logistics: ['read'],
  },
  [USER_ROLES.BUYER_NODE]: {
    sourcing: ['create', 'read'],
    negotiation: ['read'],
    logistics: ['read'],
  },
  [USER_ROLES.SELLER]: {
    sourcing: ['read'],
    negotiation: ['create', 'read', 'update'],
    settlement: ['read', 'approve'],
    logistics: ['create', 'read', 'update'],
  },
  [USER_ROLES.SELLER_NODE]: {
    sourcing: ['read'],
    negotiation: ['read'],
    logistics: ['read', 'update'],
  },
  [USER_ROLES.AGENT]: {
    sourcing: ['read'],
    negotiation: ['read'],
    logistics: ['read'],
    identity: ['read'],
  },
  [USER_ROLES.TREASURY_OPERATOR]: {
    settlement: ['create', 'read', 'update'],
  },
  [USER_ROLES.COMPLIANCE_OFFICER]: {
    compliance: ['read', 'update', 'audit'],
  },
  [USER_ROLES.LOGISTICS_COORDINATOR]: {
    logistics: ['read', 'update'],
  },
  [USER_ROLES.TRADE_ANALYST]: {
    sourcing: ['read'],
    negotiation: ['read'],
  },
  [USER_ROLES.BANK_ADMIN]: {
    settlement: ['approve', 'settle', 'audit'],
    identity: ['read'],
  },
  [USER_ROLES.INSURANCE_ADMIN]: {
    settlement: ['read', 'audit'],
    logistics: ['read', 'audit'],
    compliance: ['read'],
  },
  [USER_ROLES.CUSTOMS_AGENT]: {
    logistics: ['read', 'approve', 'audit'],
    compliance: ['read', 'update'],
  },
  [USER_ROLES.ARBITRATOR]: {
    governance: ['read', 'approve', 'audit'],
    compliance: ['read', 'audit'],
  },
  [USER_ROLES.MEMBER]: {
    // Baseline read-only participant — no privileged actions until the backend grants a real role.
    sourcing: ['read'],
    negotiation: ['read'],
  },
};
