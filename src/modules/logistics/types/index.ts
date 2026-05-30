/**
 * @file src/modules/logistics/types/index.ts
 * @description Master data contracts for Global Supply-Chain Command and Freight Orchestration.
 */

import { LifecycleStatus, RiskLevel } from "@/types/institutional";

export type TransportMode = 'OCEAN' | 'AIR' | 'RAIL' | 'ROAD' | 'INTERMODAL';
export type NodeStatus = 'OPTIMAL' | 'CONGESTED' | 'OBSTRUCTED' | 'MAINTENANCE';

export interface FreightMandate {
  id: string;
  orderId: string;
  carrierId: string;
  transportMode: TransportMode;
  routeId: string;
  status: LifecycleStatus;
  vesselId?: string;
  containerId?: string;
  totalTeu?: number;
  weightKg: number;
  hazardous: boolean;
  value: number;
  currency: string;
  updatedAt: string;
}

export interface PortNode {
  id: string;
  name: string;
  code: string;
  jurisdiction: string;
  status: NodeStatus;
  currentThroughput: number; // containers per hour
  vesselsInPort: number;
  avgTurnaroundHours: number;
  telemetryStream: string;
}

export interface LogisticsTelemetryBurst {
  nodeId: string;
  timestamp: string;
  gps: { lat: number; lng: number; alt?: number };
  environmental: {
    temp: number;
    humidity: number;
    shockG: number;
    pressure?: number;
  };
  sealState: 'SECURE' | 'COMPROMISED' | 'OPEN_AUTHORIZED';
  batteryLevel: number;
}

export interface RouteAnomaly {
  id: string;
  type: 'COURSE_DEVIATION' | 'LOITERING' | 'CONGESTION' | 'GEOPOLITICAL_BLOCK';
  severity: RiskLevel;
  entityId: string; // Shipment or Vessel ID
  message: string;
  predictedImpactHours: number;
  mitigationSuggested: boolean;
  timestamp: string;
}

export interface LogisticsTwinState {
  entityId: string;
  actualState: LifecycleStatus;
  predictedState: LifecycleStatus;
  varianceIndex: number; // 0-1
  confidence: number;
  simulationLastRun: string;
}
