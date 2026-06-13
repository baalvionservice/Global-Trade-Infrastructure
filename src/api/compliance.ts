/**
 * @file src/api/compliance.ts
 * @description Compliance — two engines: the deterministic RULE screening engine
 * (`/compliance_screening`: sanctioned countries/parties, controlled goods, trade bans → decision
 * clear/review/block) and the AI compliance AGENT (`/compliance_agent`: risk-scored shipment
 * assessment with explainability). Compliance affects dispatch eligibility.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tradeApi } from './client';
import { qk } from './keys';

export type ScreeningDecision = 'clear' | 'review' | 'block';
export type AssessmentDecision = 'clear' | 'monitor' | 'review' | 'block';
export type Severity = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface ComplianceViolation {
  check: string;
  severity: Severity;
  message: string;
  subject?: string;
}

export interface ComplianceScreening {
  id: string;
  tenant_id: string;
  subject_ref: string | null;
  trade_operation_id: string | null;
  shipment_id: string | null;
  decision: ScreeningDecision;
  risk_score: number | string;
  severity: Severity;
  violation_count: number;
  blocking: boolean;
  origin_country: string | null;
  destination_country: string | null;
  parties: unknown[] | null;
  goods: unknown[] | null;
  violations: ComplianceViolation[] | null;
  checks: Record<string, unknown> | null;
  kyc_status: string;
  aml_status: string;
  report: Record<string, unknown> | null;
  trigger: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceListEntry {
  id: string;
  tenant_id: string;
  list_type: 'blacklist' | 'whitelist';
  subject_type: 'party' | 'country' | 'good' | 'hs_code' | 'entity';
  value: string;
  reason: string | null;
  severity: Severity;
  active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ComplianceFinding {
  category?: string;
  severity: Severity;
  message: string;
  source?: 'rule' | 'ai' | string;
}

export interface ComplianceAssessment {
  id: string;
  tenant_id: string;
  shipment_id: string | null;
  trade_operation_id: string | null;
  subject_ref: string | null;
  decision: AssessmentDecision;
  risk_score: number | string;
  risk_level: 'minimal' | 'low' | 'moderate' | 'high' | 'critical';
  severity: Severity;
  confidence: number;
  blocking: boolean;
  finding_count: number;
  rule_finding_count: number;
  ai_finding_count: number;
  origin_country: string | null;
  destination_country: string | null;
  top_risks: string[] | null;
  findings: ComplianceFinding[] | null;
  reasoning: unknown[] | null;
  narrative: string | null;
  model_provider: string | null;
  engine_version: string;
  trigger: string;
  created_at: string;
  updated_at: string;
}

// ── Rule screening ──────────────────────────────────────────────────────────────
export const screeningApi = {
  definition: () => tradeApi.get<Record<string, unknown>>('/compliance_screening/definition'),
  list: (params: { page?: number; limit?: number } = {}) =>
    tradeApi.list<ComplianceScreening>('/compliance_screening', params),
  screen: (body: { parties?: unknown[]; goods?: unknown[]; origin_country?: string; destination_country?: string }) =>
    tradeApi.post<ComplianceScreening>('/compliance_screening/screen', body),
  forOperation: (operationId: string) =>
    tradeApi.get<ComplianceScreening>(`/compliance_screening/operations/${operationId}`),
  screenOperation: (operationId: string, body: Record<string, unknown> = {}) =>
    tradeApi.post<ComplianceScreening>(`/compliance_screening/operations/${operationId}/screen`, body),
  lists: (params: { page?: number; limit?: number; list_type?: string } = {}) =>
    tradeApi.list<ComplianceListEntry>('/compliance_screening/lists', params),
};

// ── AI agent ─────────────────────────────────────────────────────────────────────
export const complianceAgentApi = {
  definition: () => tradeApi.get<Record<string, unknown>>('/compliance_agent/definition'),
  list: (params: { page?: number; limit?: number } = {}) =>
    tradeApi.list<ComplianceAssessment>('/compliance_agent', params),
  forShipment: (shipmentId: string) =>
    tradeApi.get<ComplianceAssessment>(`/compliance_agent/shipments/${shipmentId}`),
  assessShipment: (shipmentId: string, body: Record<string, unknown> = {}) =>
    tradeApi.post<ComplianceAssessment>(`/compliance_agent/shipments/${shipmentId}/assess`, body),
};

// ── Hooks ──────────────────────────────────────────────────────────────────────
export function useScreenings(params: { page?: number; limit?: number } = {}) {
  return useQuery({ queryKey: qk.compliance.screenings(params), queryFn: () => screeningApi.list(params) });
}

export function useComplianceLists(params: { page?: number; limit?: number; list_type?: string } = {}) {
  return useQuery({ queryKey: qk.compliance.lists(params), queryFn: () => screeningApi.lists(params) });
}

export function useShipmentAssessment(shipmentId: string | undefined) {
  return useQuery({
    queryKey: qk.compliance.shipmentAssessment(shipmentId ?? ''),
    queryFn: () => complianceAgentApi.forShipment(shipmentId as string),
    enabled: !!shipmentId,
    retry: (count, err) => ((err as { code?: string })?.code === 'HTTP_404' ? false : count < 1),
  });
}

export function useAssessShipment(shipmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown> = {}) => complianceAgentApi.assessShipment(shipmentId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.compliance.shipmentAssessment(shipmentId) });
      void qc.invalidateQueries({ queryKey: qk.compliance.all });
      void qc.invalidateQueries({ queryKey: qk.readiness.forShipment(shipmentId) });
    },
  });
}
