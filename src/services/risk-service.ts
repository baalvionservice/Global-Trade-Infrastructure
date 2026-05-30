/**
 * @file src/services/risk-service.ts
 * @description Advanced engine for institutional risk scoring and jurisdictional compliance assessment.
 * Correlates statistical telemetry with qualitative analysis patterns.
 */
import { apiClient } from '@/lib/api-client';
import { logger } from './observability-service';
import { RiskLevel } from '@/types/institutional';

export interface RiskProfile {
  companyId: string;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  breakdown: {
    jurisdictional: number;
    identity: number;
    transactional: number;
    signals: number;
  };
  factors: string[];
  lastReviewAt: string;
}

const COUNTRY_RISK_MAP: Record<string, RiskLevel> = {
  'Singapore': 'low',
  'China': 'medium',
  'Vietnam': 'medium',
  'India': 'medium',
  'Switzerland': 'low',
  'United States': 'low',
  'Germany': 'low',
  'Russia': 'critical',
  'Iran': 'critical',
  'North Korea': 'critical'
};

export const riskService = {
  /**
   * Primary logic for calculating a dynamic risk score.
   * Model: FinalRiskScore = (0.3 * Jurisdictional) + (0.25 * Identity) + (0.25 * Transactional) + (0.2 * Signals)
   */
  async calculateRiskScore(companyId: string): Promise<RiskProfile> {
    logger.info('RiskEngine', `INITIATING_SCORING: Institution ${companyId}`);

    const companyRes = await apiClient.get<any>(`/organizations/${companyId}`);
    const company = companyRes.data;
    
    if (!company) throw new Error('Institutional record not found');
    
    const factors: string[] = [];
    
    // 1. Jurisdictional Risk (30%)
    const countryRisk = COUNTRY_RISK_MAP[company.country] || 'medium';
    let jurisdictionalScore = countryRisk === 'low' ? 10 : countryRisk === 'medium' ? 40 : 80;
    if (countryRisk === 'critical') jurisdictionalScore = 100;
    factors.push(`Operating Node: ${company.country} (${countryRisk} risk)`);

    // 2. Identity Depth (25%)
    let identityScore = 80; // Baseline for unverified
    if (company.verificationLevel >= 3) {
      identityScore = 15;
      factors.push('Institutional identity depth: Verified (Tier 1)');
    } else if (company.status === 'pending') {
      identityScore = 45;
      factors.push('KYC/KYB audit in progress');
    }

    // 3. Transactional Pulse (25%)
    let transactionalScore = 100 - (company.trustScore || 50);
    if ((company.trustScore || 0) > 85) {
      factors.push('High historical settlement reliability');
    }

    // 4. Live Signals (20%)
    const signalsRes = await apiClient.get<any[]>('/risk_signals', { orgId: companyId, isResolved: false });
    const activeSignals = signalsRes.data || [];
    let signalScore = Math.min(100, activeSignals.length * 25);
    if (activeSignals.length > 0) {
      factors.push(`${activeSignals.length} behavioral anomalies detected by Fraud Engine`);
    }

    // Weighted Aggregation
    let finalScore = (
      (jurisdictionalScore * 0.3) + 
      (identityScore * 0.25) + 
      (transactionalScore * 0.25) + 
      (signalScore * 0.2)
    );

    // HARD OVERRIDES
    if (company.sanctionsFlag || company.blacklistFlag) {
      finalScore = 100;
      factors.push('CRITICAL: Entity restricted by platform governance (Systemic Block)');
    }

    const level: RiskLevel = finalScore > 75 ? 'critical' : finalScore > 50 ? 'high' : finalScore > 25 ? 'medium' : 'low';

    const profile: RiskProfile = {
      companyId,
      riskScore: Math.round(finalScore),
      riskLevel: level,
      breakdown: {
        jurisdictional: jurisdictionalScore,
        identity: identityScore,
        transactional: transactionalScore,
        signals: signalScore
      },
      factors,
      lastReviewAt: new Date().toISOString()
    };

    // Synchronize with Organization record
    await apiClient.patch(`/organizations/${companyId}`, {
      riskScore: profile.riskScore,
      riskLevel: level,
      lastRiskReviewAt: (profile as any).lastRiskReviewAt
    });

    return profile;
  }
};

export function getRiskBadgeConfig(level: RiskLevel) {
  switch (level) {
    case 'low': return { label: 'Low Risk', color: 'bg-green-50 text-green-700 border-green-200' };
    case 'medium': return { label: 'Medium Risk', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
    case 'high': return { label: 'High Risk', color: 'bg-orange-50 text-orange-700 border-orange-200' };
    case 'critical': return { label: 'CRITICAL', color: 'bg-red-50 text-red-700 border-red-200 font-black animate-pulse' };
    default: return { label: 'Unknown', color: 'bg-muted text-muted-foreground' };
  }
}
