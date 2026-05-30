/**
 * @file country-intelligence-service.ts
 * @description Service for managing sovereign trade intelligence and jurisdictional compliance metadata.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';

export interface RegulatoryRule {
  id: string;
  country: string;
  category: 'Import' | 'Export' | 'Financial' | 'Security';
  ruleType: 'Restriction' | 'Mandate' | 'Tariff';
  description: string;
  enforcedBy: string;
}

export const countryIntelligenceService = {
  /**
   * Retrieves all regulatory rules for a specific jurisdiction.
   */
  async getRulesByCountry(countryId: string): Promise<RegulatoryRule[]> {
    const res = await apiClient.get<RegulatoryRule[]>('/regulatory_rules', { countryId });
    return toList(res);
  },

  /**
   * Calculates a corridor complexity score based on jurisdictional rules.
   */
  async getCorridorComplexity(origin: string, destination: string): Promise<number> {
    // Mock complexity model: Base 10 + 5 per rule found
    const [originRules, destRules] = await Promise.all([
      this.getRulesByCountry(origin),
      this.getRulesByCountry(destination)
    ]);
    
    return Math.min(100, 10 + (originRules.length * 5) + (destRules.length * 5));
  }
};
