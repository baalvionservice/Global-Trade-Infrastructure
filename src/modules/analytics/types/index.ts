/**
 * @file src/modules/analytics/types/index.ts
 * @description Master data contracts for the Baalvion Enterprise Intelligence Layer.
 */

export type MetricTrend = 'up' | 'down' | 'stable';
export type MetricStatus = 'optimal' | 'warning' | 'critical' | 'nominal';

export interface KpiDefinition {
  id: string;
  key: string;
  label: string;
  category: 'FINANCIAL' | 'OPERATIONAL' | 'COMPLIANCE' | 'STRATEGIC' | 'LOGISTICS';
  value: number | string;
  unit?: string;
  trend: MetricTrend;
  delta: number;
  status: MetricStatus;
  thresholds: {
    warning: number;
    critical: number;
  };
  ownerId: string;
  lastUpdated: string;
}

export interface ForecastSignal {
  id: string;
  targetMetric: string;
  horizon: '7d' | '30d' | '90d' | '1y';
  predictedValue: number;
  confidenceScore: number; // 0-1
  probabilityDensity: number[]; // For distribution curves
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

export interface WarehouseHealth {
  syncRate: number;
  ingestionDelayMs: number;
  nodeConsensus: number;
  storageUtilization: number;
  activeIndexers: number;
  lastBackup: string;
  integritySignature: string;
}

export interface SpendAnalytics {
  totalSpend: number;
  currency: string;
  breakdown: {
    category: string;
    amount: number;
    percentage: number;
    trend: number;
  }[];
  corridorWeights: {
    corridor: string;
    weight: number;
  }[];
}

export interface DataDomain {
  id: string;
  name: string;
  ownerOrgId: string;
  entityCount: number;
  lastSyncAt: string;
  healthIndex: number;
}

export interface SemanticNode {
  id: string;
  label: string;
  type: 'INSTITUTION' | 'ORDER' | 'SHIPMENT' | 'GEO_SIGNAL';
  relevance: number;
  metadata: Record<string, any>;
}
