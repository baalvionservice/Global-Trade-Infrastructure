/**
 * @file constitution.ts
 * @description THE AI REASONING CONSTITUTION.
 * Governs the cognitive boundaries and accountability of the Baalvion AI Civilization.
 */

export interface AIReasoningLaw {
  id: string;
  law: string;
  enforcement: 'BLOCKING' | 'GATED' | 'AUDIT_ONLY';
}

export const AI_COGNITION_LAWS: AIReasoningLaw[] = [
  {
    id: 'AI_L1_AUDITABILITY',
    law: 'Every autonomous proposal MUST be accompanied by a verifiable reasoning trace linked to ledger evidence.',
    enforcement: 'BLOCKING'
  },
  {
    id: 'AI_L2_SANCTIONS',
    law: 'Inference logic MUST prioritize jurisdictional sanctions registries (OFAC/UN) over commercial optimization.',
    enforcement: 'BLOCKING'
  },
  {
    id: 'AI_L3_LIQUIDITY',
    law: 'Autonomous treasury movements exceeding $1M require human-in-the-loop sign-off from a Finance Director.',
    enforcement: 'GATED'
  },
  {
    id: 'AI_L4_STABILITY',
    law: 'Systemic rebalancing directives MUST maintain a System Equilibrium Index above 99%.',
    enforcement: 'BLOCKING'
  }
];

export const AI_GOVERNANCE_CONFIG = {
  maxInferenceDepth: 4,
  requiredConfidenceThreshold: 0.85,
  hallucinationAuditActive: true,
  traceRetentionYears: 15
};
