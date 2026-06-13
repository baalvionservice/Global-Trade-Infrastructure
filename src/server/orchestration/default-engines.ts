/**
 * @file server/orchestration/default-engines.ts
 * @description Deterministic, offline-safe Risk / Compliance / Pricing engines
 * implementing the Phase-1 ports. Real logic (not mocks) — derived from trade
 * terms — so orchestration is reproducible without the external scoring
 * backends. Production may swap in the Phase-1 live adapters via DI.
 */
import {
  RiskEnginePort,
  RiskAssessment,
  CompliancePort,
  ComplianceResult,
  PricingPort,
  PriceQuote,
  TradeContext,
} from '@/orchestration/ports';

const HIGH_VALUE_THRESHOLD = 1_000_000;
const MEDIUM_VALUE_THRESHOLD = 100_000;
const SANCTIONED_COUNTRIES = new Set(['IR', 'KP', 'SY', 'CU', 'RU']);

export class DefaultRiskEngine implements RiskEnginePort {
  async assess(ctx: TradeContext): Promise<RiskAssessment> {
    const value = ctx.terms.quantity * ctx.terms.unitPrice;
    const factors: string[] = [];
    let score = 10;
    if (value >= HIGH_VALUE_THRESHOLD) {
      score += 50;
      factors.push('high_value_exposure');
    } else if (value >= MEDIUM_VALUE_THRESHOLD) {
      score += 25;
      factors.push('medium_value_exposure');
    }
    const dest = (ctx.terms.destinationCountry ?? '').toUpperCase();
    const origin = (ctx.terms.originCountry ?? '').toUpperCase();
    if (SANCTIONED_COUNTRIES.has(dest) || SANCTIONED_COUNTRIES.has(origin)) {
      score += 60;
      factors.push('sanctioned_jurisdiction');
    }
    score = Math.min(100, score);
    const level: RiskAssessment['level'] =
      score >= 85 ? 'critical' : score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';
    return { score, level, factors };
  }
}

export class DefaultComplianceEngine implements CompliancePort {
  async screen(ctx: TradeContext): Promise<ComplianceResult> {
    const dest = (ctx.terms.destinationCountry ?? '').toUpperCase();
    const origin = (ctx.terms.originCountry ?? '').toUpperCase();
    const sanctions = SANCTIONED_COUNTRIES.has(dest) || SANCTIONED_COUNTRIES.has(origin);
    const kycVerified = ctx.metadata.kycVerified !== false; // verified unless explicitly false
    const reasons: string[] = [];
    if (sanctions) reasons.push('sanctioned_jurisdiction');
    if (!kycVerified) reasons.push('kyc_unverified');
    return { passed: !sanctions && kycVerified, sanctions, kycVerified, reasons };
  }
}

export class DefaultPricingEngine implements PricingPort {
  async quote(ctx: TradeContext): Promise<PriceQuote> {
    const fxRate = typeof ctx.metadata.fxRate === 'number' ? ctx.metadata.fxRate : 1;
    const totalPrice = ctx.terms.quantity * ctx.terms.unitPrice;
    return { unitPrice: ctx.terms.unitPrice, totalPrice, currency: ctx.terms.currency, fxRate };
  }
}
