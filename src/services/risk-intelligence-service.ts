/**
 * @file risk-intelligence-service.ts
 * @description Master observatory for Global Corridor Risk and Commodity Volatility.
 */
import { apiClient } from '@/lib/api-client';

export interface RiskSignal {
  id: string;
  type: 'GEOPOLITICAL' | 'COMMODITY' | 'LOGISTICS' | 'REGULATORY';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  affectedCorridors: string[];
  impactScore: number;
  createdAt: string;
  [key: string]: any;
}

export const riskIntelligenceService = {
  async getGlobalSignals(): Promise<RiskSignal[]> {
    return [
      {
        id: 'RS-101',
        type: 'GEOPOLITICAL',
        severity: 'high',
        title: 'Red Sea Corridor Instability',
        message: 'Increased naval presence and insurance premium spikes detected. Rerouting probability: 64%.',
        affectedCorridors: ['APAC-EU', 'GCC-EU'],
        impactScore: 82,
        createdAt: new Date().toISOString()
      },
      {
        id: 'RS-102',
        type: 'COMMODITY',
        severity: 'medium',
        title: 'Lithium Supply-Chain Drift',
        message: 'Tier 2 mining nodes in South America reporting operational delays. Forward pricing volatility expected.',
        affectedCorridors: ['LATAM-ASIA', 'LATAM-US'],
        impactScore: 45,
        createdAt: new Date().toISOString()
      }
    ];
  },

  async getCorridorExposure() {
    return [
      { name: 'China-USA', value: 450000000, risk: 22 },
      { name: 'India-UAE', value: 320000000, risk: 12 },
      { name: 'Vietnam-USA', value: 180000000, risk: 54 },
      { name: 'EU-India', value: 125000000, risk: 8 }
    ];
  }
};
