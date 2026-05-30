/**
 * @file intelligence/types.ts
 * @description Master data contracts for Global Trade Intelligence & Maritime SIGINT.
 */

import { RiskLevel } from '@/types/institutional';

export type IntelligenceType = 'MARITIME' | 'GEOPOLITICAL' | 'TRADE_SIGNAL' | 'DISRUPTION' | 'FORECAST';

export interface MaritimeEvent {
  id: string;
  vesselId: string;
  vesselName: string;
  type: 'PORT_ARRIVAL' | 'PORT_DEPARTURE' | 'COURSE_DEVIATION' | 'LOITERING_DETECTED';
  location: string;
  corridorId: string;
  timestamp: string;
  severity: RiskLevel;
}

export interface GeopoliticalAlert {
  id: string;
  region: string;
  title: string;
  message: string;
  impactScore: number; // 0-100
  affectedNodes: string[];
  severity: RiskLevel;
  createdAt: string;
}

export interface DisruptionCase {
  id: string;
  type: 'CONGESTION' | 'STRIKE' | 'SANCTIONS_BLOCK' | 'INFRASTRUCTURE_FAILURE';
  title: string;
  estimatedDelayHours: number;
  probability: number;
  status: 'ACTIVE' | 'MITIGATING' | 'RESOLVED';
  involvedEntities: string[];
  createdAt: string;
}

export interface OperationalForecast {
  id: string;
  target: 'CORRIDOR_THROUGHPUT' | 'SETTLEMENT_LATENCY' | 'SUPPLIER_RISK';
  prediction: string;
  confidence: number;
  trend: 'OPTIMIZING' | 'STABLE' | 'DEGRADED';
  validUntil: string;
}
