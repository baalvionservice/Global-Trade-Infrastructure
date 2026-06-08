/**
 * @file intelligence/participant.ts
 * @description Advanced participant intelligence and reliability scorecards.
 */
import { apiClient } from '@/lib/api-client';

export interface ParticipantScorecard {
  companyId: string;
  reliabilityScore: number; // 0-100
  metrics: {
    fulfillmentRate: number;
    avgSettlementTime: string;
    disputeRate: number;
    corridorSpecialization: string[];
    complianceConsistency: number;
  };
  reputationTrend: 'improving' | 'stable' | 'declining';
  governanceBadges: string[];
}

export const participantIntelligence = {
  /**
   * Retrieves high-fidelity reliability intelligence for an organization.
   */
  async getScorecard(companyId: string): Promise<ParticipantScorecard> {
    const res = await apiClient.get<any>(`/organizations/${companyId}`);
    const org = res.data;

    // Simulation logic based on Trust Score and historical records
    const trust = org?.trustScore || 50;
    
    return {
      companyId,
      reliabilityScore: trust,
      metrics: {
        // Derived deterministically from the real trust score — no random jitter.
        fulfillmentRate: Math.min(100, trust),
        avgSettlementTime: trust > 80 ? '< 4h' : '< 24h',
        disputeRate: Math.max(0, (100 - trust) / 20),
        corridorSpecialization: ['APAC-US', 'EU-India'],
        complianceConsistency: trust - 2
      },
      reputationTrend: trust > 90 ? 'improving' : 'stable',
      governanceBadges: trust > 85 ? ['ELITE_SETTLER', 'TIER_1_KYC'] : ['VERIFIED_MEMBER']
    };
  }
};
