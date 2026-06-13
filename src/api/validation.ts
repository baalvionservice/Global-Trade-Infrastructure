/**
 * @file src/api/validation.ts
 * @description AI document validation — runs documents through the validation engine (qty/weight/
 * address/currency/tax/missing checks + pluggable AI classifier) producing a report + readiness
 * impact. Validation influences the risk/readiness score.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tradeApi } from './client';
import { qk } from './keys';

export type ValidationStatus = 'passed' | 'passed_with_warnings' | 'failed';

export interface ValidationFinding {
  code: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | string;
  field?: string;
  message: string;
  expected?: unknown;
  actual?: unknown;
}

export interface ValidationReport {
  status: ValidationStatus;
  confidence: number;
  doc_type?: string;
  findings: ValidationFinding[];
  readiness_impact?: {
    readiness_score?: number;
    readiness_delta?: number;
  };
  [k: string]: unknown;
}

export interface DocumentValidation {
  id: string;
  tenant_id: string;
  document_ref: string;
  document_kind: string;
  trade_operation_id: string | null;
  doc_type: string | null;
  status: ValidationStatus;
  confidence: number;
  readiness_score: number | string | null;
  readiness_delta: number | null;
  finding_count: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  engine_version: string;
  report: ValidationReport | null;
  created_at: string;
  updated_at: string;
}

export type ValidationListParams = {
  page?: number;
  limit?: number;
  document_ref?: string;
  trade_operation_id?: string;
};

export const validationApi = {
  list: (params: ValidationListParams = {}) => tradeApi.list<DocumentValidation>('/document_validations', params),
  get: (id: string) => tradeApi.get<DocumentValidation>(`/document_validations/${id}`),
  /** Stateless validation of a raw payload (no persistence). */
  validatePayload: (body: { doc_type: string; payload: Record<string, unknown>; expected?: Record<string, unknown> }) =>
    tradeApi.post<{ validation_report: ValidationReport }>('/document_validations/validate', body),
  /** Document-bound validation: loads the document context, validates, and persists the report. */
  validateDocument: (body: { document_ref: string; document_kind?: string; trade_operation_id?: string }) =>
    tradeApi.post<{ validation_report: ValidationReport; validation_id: string | null }>('/document_validations', body),
};

export function useValidations(params: ValidationListParams = {}, opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: qk.validation.list(params),
    queryFn: () => validationApi.list(params),
    enabled: opts.enabled ?? true,
  });
}

export function useValidation(id: string | undefined) {
  return useQuery({
    queryKey: qk.validation.detail(id ?? ''),
    queryFn: () => validationApi.get(id as string),
    enabled: !!id,
  });
}

export function useValidateDocument(shipmentId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof validationApi.validateDocument>[0]) => validationApi.validateDocument(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.validation.all });
      void qc.invalidateQueries({ queryKey: qk.documents.all });
      if (shipmentId) void qc.invalidateQueries({ queryKey: qk.readiness.forShipment(shipmentId) });
    },
  });
}
