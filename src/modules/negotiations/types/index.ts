
/**
 * @file src/modules/negotiations/types/index.ts
 * @description Master data contracts for Institutional Negotiation, CLM, and Deal Room finality.
 */

import { LifecycleStatus } from "@/types/institutional";

export type ProposalStatus = 'DRAFT' | 'SENT' | 'REJECTED' | 'COUNTERED' | 'ACCEPTED' | 'EXPIRED';
export type ContractStatus = 'DRAFT' | 'LEGAL_REVIEW' | 'SIGNED' | 'EXECUTED' | 'SUPERSEDED' | 'DISPUTED';
export type ClauseRisk = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface NegotiationProposal {
  id: string;
  dealId: string;
  version: number;
  price: number;
  quantity: number;
  currency: string;
  terms: string;
  status: ProposalStatus;
  proposedBy: string;
  respondedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractClause {
  id: string;
  category: 'PAYMENT' | 'DELIVERY' | 'ARBITRATION' | 'LIABILITY' | 'ESG' | 'GOVERNANCE';
  title: string;
  content: string;
  riskLevel: ClauseRisk;
  isStandard: boolean;
  aiRecommendation?: string;
}

export interface SovereignContract {
  id: string;
  dealId: string;
  title: string;
  status: ContractStatus;
  version: number;
  buyerId: string;
  sellerId: string;
  parties: string[];
  clauses: ContractClause[];
  signatures: {
    partyId: string;
    actorId: string;
    timestamp: string;
    hash?: string; // cryptographic proof assigned by the signing backend
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface DealRoomContext {
  id: string;
  title: string;
  status: LifecycleStatus;
  activeProposalId?: string;
  participants: {
    id: string;
    name: string;
    role: string;
    isOnline: boolean;
  }[];
  intelligenceScore: number;
  lastActivity: string;
}
