/**
 * @file sea-route-intelligence-service.ts
 * @description Service for maritime route discovery, congestion tracking, and risk assessment.
 */
import { apiClient } from '@/lib/api-client';

export interface SeaRoute {
  id: string;
  name: string;
  originNode: string;
  destinationNode: string;
  status: 'active' | 'obstructed' | 'rerouted';
  avgTransitDays: number;
  currentCongestionLevel: number; // 0-100
}

export interface RiskZone {
  id: string;
  name: string;
  type: 'piracy' | 'geopolitical' | 'weather';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedCorridorIds: string[];
  active: boolean;
}

export interface CongestionReport {
  id: string;
  portId: string;
  delayHours: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  timestamp: string;
}

export const seaRouteIntelligenceService = {
  /**
   * Retrieves active maritime corridors and their health metrics.
   */
  async getSeaRoutes(): Promise<SeaRoute[]> {
    const res = await apiClient.get<SeaRoute[]>('/sea_routes');
    return res.data || [
      { id: 'SR-1', name: 'South China Sea Corridor', originNode: 'Shanghai', destinationNode: 'Singapore', status: 'active', avgTransitDays: 5, currentCongestionLevel: 42 },
      { id: 'SR-2', name: 'Trans-Pacific Direct', originNode: 'Singapore', destinationNode: 'Long Beach', status: 'active', avgTransitDays: 14, currentCongestionLevel: 68 },
      { id: 'SR-3', name: 'Euro-Asia Link', originNode: 'Rotterdam', destinationNode: 'Mumbai', status: 'active', avgTransitDays: 18, currentCongestionLevel: 24 }
    ];
  },

  /**
   * Retrieves active risk zones impacting global trade routes.
   */
  async getRiskZones(): Promise<RiskZone[]> {
    const res = await apiClient.get<RiskZone[]>('/risk_zones', { active: true });
    return res.data || [
      { id: 'RZ-1', name: 'Red Sea Zone', type: 'geopolitical', severity: 'critical', description: 'Increased security risk in the Bab el-Mandeb strait.', affectedCorridorIds: ['SR-3'], active: true },
      { id: 'RZ-2', name: 'South China Sea', type: 'geopolitical', severity: 'medium', description: 'Naval exercises reported near major shipping lanes.', affectedCorridorIds: ['SR-1'], active: true }
    ];
  },

  /**
   * Retrieves port-level congestion telemetry.
   */
  async getCongestionReports(): Promise<CongestionReport[]> {
    const res = await apiClient.get<CongestionReport[]>('/congestion_reports', { sortBy: 'delayHours', order: 'desc' });
    return res.data || [
      { id: 'CR-1', portId: 'Port of Long Beach', delayHours: 72, trend: 'increasing', timestamp: new Date().toISOString() },
      { id: 'CR-2', portId: 'Shanghai Terminal 4', delayHours: 12, trend: 'stable', timestamp: new Date().toISOString() }
    ];
  },

  /**
   * Calculates an overall Route Health Index (0-100).
   */
  calculateRouteHealth(route: SeaRoute, reports: CongestionReport[], zones: RiskZone[]): number {
    let health = 100;

    // 1. Congestion Impact
    health -= (route.currentCongestionLevel / 2);

    // 2. Port Delay Impact
    const portDelays = reports.filter(r => r.portId.includes(route.originNode) || r.portId.includes(route.destinationNode));
    portDelays.forEach(r => {
      health -= (r.delayHours / 8);
    });

    // 3. Risk Zone Impact
    const relatedRisks = zones.filter(z => z.affectedCorridorIds.includes(route.id));
    relatedRisks.forEach(z => {
      if (z.severity === 'critical') health -= 40;
      else if (z.severity === 'high') health -= 25;
      else if (z.severity === 'medium') health -= 10;
    });

    return Math.max(0, Math.round(health));
  }
};
