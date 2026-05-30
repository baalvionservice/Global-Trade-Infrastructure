/**
 * @file src/modules/ai/types/index.ts
 * @description Master contracts for the Baalvion AI Civilization and Sovereign Cognitive Fabric.
 */

import { LifecycleStatus, RiskLevel } from "@/types/institutional";

export type AgentRole = 
  | 'TREASURY_ORACLE' 
  | 'LOGISTICS_SENTINEL' 
  | 'COMPLIANCE_GUARD' 
  | 'SOURCING_ADVISOR' 
  | 'LEGAL_ORACLE'
  | 'EXECUTIVE_STRATEGIST'
  | 'OBSERVABILITY_AGENT'
  | 'COORDINATOR_PRIME';

export type AgentStatus = 'IDLE' | 'THINKING' | 'EXECUTING' | 'NEGOTIATING' | 'ESCALATED' | 'OFFLINE';

export interface AIAgent {
  id: string;
  role: AgentRole;
  name: string;
  status: AgentStatus;
  capabilities: string[];
  trustScore: number; // 0-1000
  cognitiveDomain: string; // e.g., "FINANCIAL_SETTLEMENT"
  lastActive: string;
  modelId: string;
  [key: string]: any;
}

export interface CognitiveNode {
  id: string;
  type: 'OBSERVATION' | 'INFERENCE' | 'CORRELATION' | 'ACTION_PLAN' | 'GOVERNANCE_CHECK';
  agentId: string;
  content: string;
  evidenceRefs: string[]; // Links to Ledger/Document/Telemetry IDs
  confidence: number;
  timestamp: string;
}

export interface AIReasoningTrace {
  sessionId: string;
  missionId: string;
  nodes: CognitiveNode[];
  overallConfidence: number;
  finalityStatus: 'STAGED' | 'AUTHORIZED' | 'EXECUTED';
  metadata: Record<string, any>;
}

export interface MissionMandate {
  id: string;
  title: string;
  description: string;
  status: 'PREPARING' | 'ACTIVE' | 'RESOLVED' | 'FAILED';
  priority: 'STRATEGIC' | 'TACTICAL' | 'CRITICAL';
  leadAgentId: string;
  involvedAgents: string[];
  constraints: string[]; // Policy IDs
  progress: number;
  createdAt: string;
}

export interface MemoryFragment {
  id: string;
  entityId: string;
  content: string;
  vectorId: string; // Reference to Qdrant/pgvector
  classification: 'OPERATIONAL' | 'STRATEGIC' | 'FORENSIC';
  timestamp: string;
  authorId: string;
}

export interface AutonomousIntervention {
  id: string;
  type: 'CORRIDOR_REBALANCE' | 'LIQUIDITY_SWAP' | 'IDENTITY_ISOLATION' | 'PROTOCOL_FREEZE';
  justification: string;
  impactScore: number;
  requiresApproval: boolean;
  status: 'PENDING' | 'AUTHORIZED' | 'EXECUTED' | 'DISMISSED';
  traceId: string;
  createdAt: string;
}

export interface AIRecommendation {
  id: string;
  type?: string;
  title: string;
  description?: string;
  confidence?: number;
  impact?: string;
  agentId?: string;
  action?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface AISummary {
  id?: string;
  title?: string;
  summary: string;
  highlights?: string[];
  confidence?: number;
  generatedAt?: string;
  [key: string]: any;
}

export interface AISummaryRequest {
  context: string;
  entityId?: string;
  scope?: string;
  [key: string]: any;
}

export interface AutonomousAction {
  id: string;
  type?: string;
  description?: string;
  status?: 'PENDING' | 'AUTHORIZED' | 'EXECUTED' | 'DISMISSED';
  requiresApproval?: boolean;
  timestamp?: string;
  [key: string]: any;
}
