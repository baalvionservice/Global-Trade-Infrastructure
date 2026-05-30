/**
 * @file insight-service.ts
 * @description Refactored AI intelligence service integrating the new strategic and predictive layers.
 */
import { apiClient } from '@/lib/api-client';
import { logger } from './observability-service';
import { intelligenceEngine, IntelligenceRecommendation } from './intelligence/engine';

export type InsightType = 'risk' | 'market' | 'operations' | 'compliance' | 'treasury' | 'logistics' | 'economic';
export type InsightSeverity = 'info' | 'warning' | 'critical';

export interface Insight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  message: string;
  relatedEntity?: string;
  ctaLabel?: string;
  ctaLink?: string;
  createdAt: string;
}

export const insightService = {
  /**
   * Generates dynamic insights for a specific company or the platform.
   * Leverages the Predictive Optimization Layer.
   */
  async getInsights(companyId?: string): Promise<Insight[]> {
    const targetId = companyId || 'PLATFORM_ROOT';
    logger.info('InsightService', `Fetching predictive insights for ${targetId}`);

    const recs = await intelligenceEngine.getStrategicRecommendations(targetId);
    
    return recs.map(r => ({
      id: r.id,
      type: r.type as InsightType,
      severity: r.impact === 'critical' ? 'critical' : r.impact === 'high' ? 'warning' : 'info',
      message: r.message,
      ctaLabel: r.ctaLabel,
      ctaLink: r.ctaLink,
      createdAt: r.createdAt
    }));
  },

  async recordInsightFeedback(insightId: string, helpful: boolean) {
    logger.info('InsightService', `Insight feedback recorded: ${insightId} - ${helpful ? 'HELPFUL' : 'NOT_HELPFUL'}`);
    // In production, this feeds the Continuous Learning Loop
  }
};
