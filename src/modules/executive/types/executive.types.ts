
/**
 * @file executive.types.ts
 * @description Master data contracts for institutional analytics and command intelligence.
 */

export type KpiMetric = {
  id: string;
  label: string;
  value: string | number;
  trend: number;
  status: 'optimal' | 'stable' | 'at_risk' | 'critical';
  description: string;
  category: 'execution' | 'finance' | 'compliance' | 'logistics';
};

export type TradeFlow = {
  jurisdiction: string;
  volume: number;
  activeNodes: number;
  compliancePassRate: number;
  intensity: number; // 0-100 for heatmap
};

export type SpendBreakdown = {
  category: string;
  amount: number;
  percentage: number;
  trend: number;
};

export type OperationalForesight = {
  probabilityOfFailure: number;
  estimatedDelayHours: number;
  impactValue: number;
  recommendation: string;
  context: string;
};

export interface ExecutiveDashboardData {
  kpis: KpiMetric[];
  globalFlows: TradeFlow[];
  spendAnalytics: SpendBreakdown[];
  foresight: OperationalForesight[];
}
