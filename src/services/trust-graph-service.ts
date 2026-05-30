/**
 * @file trust-graph-service.ts
 * @description THE GLOBAL TRUST GRAPH ENGINE.
 * Calculates dynamic behavioral scores and maps institutional relationship density.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { logger } from './observability-service';

export interface TrustEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationType: 'TRADE_PARTNER' | 'FINANCIER' | 'CARRIER' | 'GOVERNED_BY';
  strength: number; // 0-1
  lastHandshakeAt: string;
}

class TrustGraphEngine {
  private static instance: TrustGraphEngine;

  private constructor() {}

  public static getInstance(): TrustGraphEngine {
    if (!TrustGraphEngine.instance) {
      TrustGraphEngine.instance = new TrustGraphEngine();
    }
    return TrustGraphEngine.instance;
  }

  /**
   * Calculates a dynamic trust score for an institution.
   * Model: Score = (0.4 * completion_rate) + (0.3 * verification_level) - (0.3 * dispute_freq)
   */
  async calculateDynamicTrust(orgId: string): Promise<number> {
    const [orgRes, ordersRes, disputesRes] = await Promise.all([
      apiClient.getDoc<any>('/organizations', orgId),
      apiClient.get<any[]>('/orders', { companyId: orgId }),
      apiClient.get<any[]>('/disputes', { initiatorId: orgId }) // Simplification
    ]);

    const org = orgRes.data;
    if (!org) return 500;

    const vLevel = org.verificationLevel || 0;
    const orderCount = toList(ordersRes).length;
    const disputeCount = toList(disputesRes).length;
    
    const successRate = orderCount > 0 ? (orderCount - disputeCount) / orderCount : 0.5;
    
    let baseScore = (successRate * 400) + (vLevel * 100);
    baseScore = Math.max(0, Math.min(1000, baseScore));

    // Update SSOT
    await apiClient.patch(`/organizations/${orgId}`, { trustScore: Math.round(baseScore) });
    
    return Math.round(baseScore);
  }

  /**
   * Maps a new trust edge between two verified institutions.
   */
  async linkEntities(sourceId: string, targetId: string, type: TrustEdge['relationType']) {
    logger.info('TrustGraph', `MAPPING_RELATIONSHIP: ${sourceId} ↔ ${targetId} (${type})`);

    return apiClient.post<TrustEdge>('/trust_graph', {
      sourceId,
      targetId,
      relationType: type,
      strength: 0.1, // Starts low, grows with history
      lastHandshakeAt: new Date().toISOString()
    });
  }

  /**
   * Retrieves the trust density for a specific region or corridor.
   */
  async getTrustDensity(jurisdiction: string): Promise<number> {
    const res = await apiClient.get<any[]>('/organizations', { country: jurisdiction });
    const nodes = res.data || [];
    if (nodes.length === 0) return 0;
    
    const avg = nodes.reduce((sum, n) => sum + (n.trustScore || 0), 0) / nodes.length;
    return Math.round((avg / 1000) * 100);
  }
}

export const trustGraph = TrustGraphEngine.getInstance();
