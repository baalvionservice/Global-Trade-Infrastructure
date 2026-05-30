
/**
 * @file src/modules/executive/types/index.ts
 * @description Master data contracts for Global Executive Command and Strategic Orchestration.
 */

export type MissionStatus = 'PREPARING' | 'EXECUTING' | 'SUCCEEDED' | 'FAILED' | 'ESCALATED';
export type CrisisSeverity = 'NORMAL' | 'ELEVATED' | 'CRITICAL' | 'EMERGENCY';

export interface ExecutiveMission {
  id: string;
  title: string;
  description: string;
  status: MissionStatus;
  priority: 'STRATEGIC' | 'TACTICAL' | 'OPERATIONAL';
  ownerId: string;
  domain: 'COMMERCE' | 'FINANCE' | 'LOGISTICS' | 'GOVERNANCE';
  dependencies: string[]; // List of Order/Shipment/Escrow IDs
  progress: number;
  updatedAt: string;
}

export interface StrategicForecast {
  id: string;
  targetMetric: string;
  horizon: '30D' | '90D' | '1Y';
  predictedDelta: number;
  confidenceScore: number;
  riskIndex: number;
  recommendation: string;
  justification: string;
  impactValue: number;
  currency: string;
}

export interface CrisisEvent {
  id: string;
  title: string;
  severity: CrisisSeverity;
  type: 'GEOPOLITICAL' | 'FINANCIAL' | 'CYBER' | 'OPERATIONAL';
  impactedClusters: string[];
  message: string;
  status: 'DETECTED' | 'CONTAINING' | 'RESOLVED';
  timestamp: string;
  mitigationWorkflowId?: string;
}

export interface ExecutiveKPI {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  delta: string;
  status: 'optimal' | 'warning' | 'critical';
  category: string;
}
