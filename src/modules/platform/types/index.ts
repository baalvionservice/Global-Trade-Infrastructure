/**
 * @file src/modules/platform/types/index.ts
 * @description Master data contracts for Sovereign Platform Governance.
 */

export type TenantIsolationState = 'SECURE' | 'DEGRADED' | 'ISOLATED' | 'MAINTENANCE';
export type PlatformThreatLevel = 'STABLE' | 'ELEVATED' | 'CRITICAL' | 'EMERGENCY_LOCKDOWN';

export interface SovereignTenant {
  id: string;
  name: string;
  orgId: string;
  region: string;
  isolationState: TenantIsolationState;
  nodeCount: number;
  uptime: number;
  lastHardeningSync: string;
  dataResidency: string;
}

export interface PlatformHealthMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  status: 'optimal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

export interface GovernanceIntervention {
  id: string;
  type: 'ISOLATION' | 'THROTTLE' | 'REBALANCING' | 'PROTOCOL_FREEZE';
  target: string;
  status: 'ACTIVE' | 'RESOLVED' | 'STAGED';
  reasoning: string;
  authorizedBy: string;
  timestamp: string;
}

export interface GlobalRiskSignal {
  id: string;
  category: 'FINANCIAL' | 'GEOPOLITICAL' | 'CYBER' | 'OPERATIONAL';
  severity: 'low' | 'medium' | 'high' | 'critical';
  impactNodes: string[];
  message: string;
  confidence: number;
  timestamp: string;
}