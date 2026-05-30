/**
 * @file matching-service.ts
 * @description Advanced matching engine for institutional buyers and sellers.
 * Uses a weighted affinity model to recommend high-trust counterparties.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { Company } from './profile-service';

export interface MatchResult {
  company: Company;
  matchScore: number;
  reasons: string[];
}

export const matchingService = {
  /**
   * Suggests counterparties based on a weighted affinity model.
   * Logic: Score = (0.4 * Industry) + (0.3 * Trust) + (0.2 * Verification) + (0.1 * Jurisdiction)
   */
  async getMatches(companyId: string): Promise<MatchResult[]> {
    const myCompRes = await apiClient.get<Company>(`/companies/${companyId}`);
    const myComp = myCompRes.data;
    if (!myComp) return [];

    const allCompRes = await apiClient.get<Company[]>('/companies');
    const allCompanies = toList<Company>(allCompRes);

    // Filter for complementary types (Buyer matches with Seller/Both, vice versa)
    const targetType = myComp.type === 'buyer' ? 'seller' : 'buyer';

    const matches = allCompanies
      .filter(c => c.id !== companyId && (c.type === targetType || c.type === 'both'))
      .map(c => {
        let score = 0;
        const reasons: string[] = [];

        // 1. Sector Alignment (40%)
        if (c.industry === myComp.industry) {
          score += 40;
          reasons.push(`Operates in same sector: ${c.industry}`);
        }

        // 2. Trust Pulse (30%)
        const trust = c.trustScore || 50;
        if (trust > 85) {
          score += 30;
          reasons.push('Tier 1 platform trust rating');
        } else if (trust > 70) {
          score += 15;
          reasons.push('High settlement reliability');
        }

        // 3. Identity Depth (20%)
        if (c.verificationStatus === 'verified') {
          score += 20;
          reasons.push('Institutional verification complete');
        }

        // 4. Jurisdictional Synergy (10%)
        if (c.country === myComp.country) {
          score += 10;
          reasons.push('Domestic node presence');
        }

        return { company: c, matchScore: Math.min(100, score), reasons };
      });

    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .filter(m => m.matchScore > 30)
      .slice(0, 5);
  }
};
