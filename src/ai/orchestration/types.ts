/**
 * @file types.ts
 * @description Master TypeScript contracts for the AI Orchestration Layer.
 * Defines the ontology for agents, reasoning steps, and cognitive contexts.
 */

export type AgentDomain = 'EXECUTIVE' | 'TRADE' | 'OPERATIONS' | 'FINANCE' | 'COMPLIANCE' | 'SECURITY' | 'ANALYTICS';

export type AgentStatus = 'IDLE' | 'THINKING' | 'EXECUTING' | 'VALIDATING' | 'ESCALATED' | 'OFFLINE';

export interface ReasoningStep {
  agentId: string;
  thought: string;
  action?: any;
  confidence: number;
  timestamp: string;
}

export interface CognitiveContext {
  userId: string;
  tenantId: string;
  jurisdiction: string;
  permissions: string[];
  entityId?: string;
  missionId: string;
}

export interface AIState {
  missionId: string;
  context: CognitiveContext;
  reasoningTrace: ReasoningStep[];
  proposedActions: any[];
  confidenceScore: number;
  activeAgent: string;
  status: AgentStatus;
}

export interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  domain: AgentDomain;
  capabilities: string[];
  execute: (context: any) => Promise<{ log: string; actions: any[] }>;
}
