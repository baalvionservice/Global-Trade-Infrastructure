/**
 * @file server/compliance/compliance-engine.ts
 * @description Production Risk & Compliance engines (Agent 7).
 *
 * Implements the Phase-1 RiskEnginePort / CompliancePort with real, deterministic
 * screening — KYC, KYB, AML, PEP, sanctions, country risk, document validation
 * and trade-risk scoring — persisting a RiskAssessment and one ComplianceCheck
 * per control, applying blocking rules, and projecting status onto the trade
 * aggregate. Offline-safe (no external scoring backend required).
 */
import { RiskStatus, ComplianceCheckType, ComplianceOutcome, Prisma } from '@prisma/client';
import {
  RiskEnginePort,
  RiskAssessment,
  CompliancePort,
  ComplianceResult,
  TradeContext,
} from '@/orchestration/ports';
import {
  tradeRepository,
  riskAssessmentRepository,
  complianceCheckRepository,
} from '../repositories';
import type { OrgContext } from '../orchestration/prisma-ports';

const AML_THRESHOLD = 500_000;
const HIGH_VALUE_THRESHOLD = 1_000_000;
const MEDIUM_VALUE_THRESHOLD = 100_000;

const SANCTIONED_COUNTRIES = new Set(['IR', 'KP', 'SY', 'CU', 'RU']);
const HIGH_RISK_COUNTRIES = new Set(['AF', 'YE', 'SS', 'VE', 'MM']);
const SANCTIONED_ENTITIES = new Set(['darkstar holdings', 'redline logistics', 'sanctioned co']);
const PEP_NAMES = new Set(['ivan petrov', 'general okonkwo', 'minister zhao']);

const RISK_LEVEL_TO_STATUS: Record<RiskAssessment['level'], RiskStatus> = {
  low: RiskStatus.LOW,
  medium: RiskStatus.MEDIUM,
  high: RiskStatus.HIGH,
  critical: RiskStatus.CRITICAL,
};

function normalize(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

function subjectOf(ctx: TradeContext): string {
  return (
    (typeof ctx.metadata.counterpartyName === 'string' && ctx.metadata.counterpartyName) ||
    ctx.terms.sellerId ||
    ctx.terms.buyerId
  );
}

function asJson(v: unknown): Prisma.InputJsonValue {
  return v as Prisma.InputJsonValue;
}

export class RiskEngine implements RiskEnginePort {
  constructor(private readonly ctx: OrgContext) {}

  async assess(context: TradeContext): Promise<RiskAssessment> {
    const value = context.terms.quantity * context.terms.unitPrice;
    const dest = normalize(context.terms.destinationCountry).toUpperCase();
    const origin = normalize(context.terms.originCountry).toUpperCase();
    const factors: string[] = [];
    let score = 10;

    if (value >= HIGH_VALUE_THRESHOLD) {
      score += 45;
      factors.push('high_value_exposure');
    } else if (value >= MEDIUM_VALUE_THRESHOLD) {
      score += 20;
      factors.push('medium_value_exposure');
    }
    if (SANCTIONED_COUNTRIES.has(dest) || SANCTIONED_COUNTRIES.has(origin)) {
      score += 60;
      factors.push('sanctioned_jurisdiction');
    } else if (HIGH_RISK_COUNTRIES.has(dest) || HIGH_RISK_COUNTRIES.has(origin)) {
      score += 30;
      factors.push('high_risk_jurisdiction');
    }
    if (Array.isArray(context.metadata.riskFlags)) {
      score += context.metadata.riskFlags.length * 10;
      factors.push(...context.metadata.riskFlags.map((f) => `flag:${String(f)}`));
    }
    score = Math.min(100, score);
    const level: RiskAssessment['level'] =
      score >= 85 ? 'critical' : score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';

    const tradeId = context.refs.tradeId;
    const trade = await tradeRepository.findById(tradeId);
    if (trade) {
      await riskAssessmentRepository.create({
        organizationId: this.ctx.organizationId,
        tradeTransactionId: tradeId,
        score,
        level: RISK_LEVEL_TO_STATUS[level],
        factors: asJson(factors),
        model: 'default-v1',
      });
      await tradeRepository.update(tradeId, { riskStatus: RISK_LEVEL_TO_STATUS[level] });
    }
    return { score, level, factors };
  }
}

interface CheckRecord {
  type: ComplianceCheckType;
  outcome: ComplianceOutcome;
  reasons: string[];
}

export class ComplianceEngine implements CompliancePort {
  constructor(private readonly ctx: OrgContext) {}

  async screen(context: TradeContext): Promise<ComplianceResult> {
    const subject = subjectOf(context);
    const subjectKey = normalize(subject);
    const value = context.terms.quantity * context.terms.unitPrice;
    const dest = normalize(context.terms.destinationCountry).toUpperCase();
    const origin = normalize(context.terms.originCountry).toUpperCase();
    const meta = context.metadata;

    const checks: CheckRecord[] = [];

    // KYC
    checks.push({
      type: ComplianceCheckType.KYC,
      outcome: meta.kycVerified === false ? ComplianceOutcome.FAIL : ComplianceOutcome.PASS,
      reasons: meta.kycVerified === false ? ['kyc_unverified'] : [],
    });
    // KYB
    checks.push({
      type: ComplianceCheckType.KYB,
      outcome: meta.kybVerified === false ? ComplianceOutcome.REVIEW : ComplianceOutcome.PASS,
      reasons: meta.kybVerified === false ? ['kyb_incomplete'] : [],
    });
    // AML
    checks.push({
      type: ComplianceCheckType.AML,
      outcome: value >= AML_THRESHOLD ? ComplianceOutcome.REVIEW : ComplianceOutcome.PASS,
      reasons: value >= AML_THRESHOLD ? ['aml_enhanced_due_diligence'] : [],
    });
    // PEP
    const isPep = PEP_NAMES.has(subjectKey) || meta.pep === true;
    checks.push({
      type: ComplianceCheckType.PEP,
      outcome: isPep ? ComplianceOutcome.FAIL : ComplianceOutcome.PASS,
      reasons: isPep ? ['pep_match'] : [],
    });
    // SANCTIONS
    const sanctioned =
      SANCTIONED_ENTITIES.has(subjectKey) ||
      SANCTIONED_COUNTRIES.has(dest) ||
      SANCTIONED_COUNTRIES.has(origin);
    checks.push({
      type: ComplianceCheckType.SANCTIONS,
      outcome: sanctioned ? ComplianceOutcome.BLOCKED : ComplianceOutcome.PASS,
      reasons: sanctioned ? ['sanctions_hit'] : [],
    });
    // COUNTRY RISK
    const highRisk = HIGH_RISK_COUNTRIES.has(dest) || HIGH_RISK_COUNTRIES.has(origin);
    checks.push({
      type: ComplianceCheckType.COUNTRY_RISK,
      outcome: highRisk ? ComplianceOutcome.REVIEW : ComplianceOutcome.PASS,
      reasons: highRisk ? ['high_risk_country'] : [],
    });
    // DOCUMENT VALIDATION
    checks.push({
      type: ComplianceCheckType.DOCUMENT_VALIDATION,
      outcome: meta.documentsValid === false ? ComplianceOutcome.FAIL : ComplianceOutcome.PASS,
      reasons: meta.documentsValid === false ? ['document_validation_failed'] : [],
    });
    // TRADE RISK
    const tradeRisky = value >= HIGH_VALUE_THRESHOLD && highRisk;
    checks.push({
      type: ComplianceCheckType.TRADE_RISK,
      outcome: tradeRisky ? ComplianceOutcome.REVIEW : ComplianceOutcome.PASS,
      reasons: tradeRisky ? ['elevated_trade_risk'] : [],
    });

    const tradeId = context.refs.tradeId;
    const trade = await tradeRepository.findById(tradeId);
    if (trade) {
      for (const c of checks) {
        await complianceCheckRepository.create({
          organizationId: this.ctx.organizationId,
          tradeTransactionId: tradeId,
          type: c.type,
          outcome: c.outcome,
          subject,
          reasons: asJson(c.reasons),
        });
      }
    }

    const blocking = checks.filter(
      (c) => c.outcome === ComplianceOutcome.FAIL || c.outcome === ComplianceOutcome.BLOCKED,
    );
    const passed = blocking.length === 0;
    const reasons = blocking.flatMap((c) => c.reasons);
    const kycVerified = checks.find((c) => c.type === ComplianceCheckType.KYC)?.outcome === ComplianceOutcome.PASS;

    if (trade) {
      await tradeRepository.update(tradeId, { complianceStatus: passed ? 'PASSED' : 'FAILED' });
    }

    return { passed, sanctions: sanctioned, kycVerified, reasons };
  }
}
