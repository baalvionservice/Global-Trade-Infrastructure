/**
 * @file gst.ts
 * @description THE GLOBAL SYSTEM TRUTH (GST) MATRIX.
 * The absolute authority for deterministic state transitions across all sovereign domains.
 */

import { UserRole, USER_ROLES } from "./roles";

export interface TransitionRule {
  target: string;
  requiredConsensus?: UserRole[];
  autoTrigger?: boolean;
  governanceGated?: boolean;
}

/**
 * AUTHORITATIVE EXECUTION MATRIX
 */
export const GST_TRANSITION_MATRIX: Record<string, TransitionRule[]> = {
  // --- SOURCING ---
  'SOURCING:DRAFT': [{ target: 'SOURCING:OPEN' }],
  'SOURCING:OPEN': [{ target: 'SOURCING:EVALUATION' }],
  'SOURCING:EVALUATION': [{ target: 'SOURCING:NEGOTIATION' }],
  'SOURCING:NEGOTIATION': [{ target: 'SOURCING:AWARDED', requiredConsensus: [USER_ROLES.BUYER_NODE] }],

  // --- NEGOTIATION ---
  'NEGOTIATION:ACTIVE': [{ target: 'NEGOTIATION:PROPOSAL_SENT' }],
  'NEGOTIATION:PROPOSAL_SENT': [{ target: 'NEGOTIATION:ACCEPTED', requiredConsensus: [USER_ROLES.BUYER_NODE, USER_ROLES.SELLER_NODE] }],
  'NEGOTIATION:ACCEPTED': [{ target: 'NEGOTIATION:FINALIZED', autoTrigger: true }],

  // --- SETTLEMENT ---
  'FINANCIAL:CREATED': [{ target: 'FINANCIAL:FUNDED' }],
  'FINANCIAL:FUNDED': [{ target: 'FINANCIAL:LOCKED', autoTrigger: true }],
  'FINANCIAL:LOCKED': [{ target: 'FINANCIAL:RELEASED', requiredConsensus: [USER_ROLES.BANK_ADMIN], governanceGated: true }],

  // --- LOGISTICS ---
  'LOGISTICS:BOOKED': [{ target: 'LOGISTICS:PICKED_UP' }],
  'LOGISTICS:PICKED_UP': [{ target: 'LOGISTICS:IN_TRANSIT' }],
  'LOGISTICS:IN_TRANSIT': [{ target: 'LOGISTICS:DELIVERED' }],
  'LOGISTICS:DELIVERED': [{ target: 'LOGISTICS:RELEASED', requiredConsensus: [USER_ROLES.CUSTOMS_AGENT] }],

  // --- SYSTEM ---
  'SYSTEM:HARDENING': [{ target: 'SYSTEM:STABILIZED' }],
  'SYSTEM:STABILIZED': [{ target: 'SYSTEM:LOCKED', requiredConsensus: [USER_ROLES.SUPER_ADMIN], governanceGated: true }]
};
