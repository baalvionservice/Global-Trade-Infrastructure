/**
 * @file orchestration/types.ts
 * @description Core TypeScript definitions for the Baalvion Orchestration Layer.
 */

import { LifecycleStatus } from "@/types/institutional";
import { UserRole } from "@/core/roles";

export interface WorkflowInstance {
  id: string;
  domain: 'SOURCING' | 'NEGOTIATION' | 'EXECUTION' | 'FINANCIAL' | 'LOGISTICS' | 'COMPLIANCE';
  entityId: string;
  currentState: LifecycleStatus;
  version: number;
  history: WorkflowTransition[];
  metadata: Record<string, any>;
  updatedAt: string;
}

export interface WorkflowTransition {
  id: string;
  from: LifecycleStatus;
  to: LifecycleStatus;
  actorId: string;
  actorRole: UserRole;
  timestamp: string;
  metadata?: any;
  signature?: string;
}

export interface OrchestrationLog {
  id: string;
  action: string;
  entityId: string;
  status: 'success' | 'failed' | 'warning' | 'retry';
  message: string;
  timestamp: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  triggerEvent: string;
  condition: string;
  action: string;
  status: 'active' | 'inactive';
}

export interface CompensationAction {
  id: string;
  originalEventId: string;
  actionType: 'REVERSAL' | 'HOLD' | 'RETRY' | 'NOTIFY';
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
  payload: any;
}

export interface InstitutionalEvent {
  eventId: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  payload: any;
  metadata: any;
  version: number;
  timestamp: string;
  [key: string]: any;
}
