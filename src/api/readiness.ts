/**
 * @file src/api/readiness.ts
 * @description Shipment readiness scoring — the weighted 0–100 score (documentation 25 + compliance
 * 25 + logistics 20 + risk 30) that gates dispatch eligibility. Reflects the business rule that
 * documents/compliance/logistics/risk drive readiness.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tradeApi } from './client';
import { qk } from './keys';

export type ReadinessBand = 'high' | 'medium' | 'low';

export interface ReadinessBlocker {
  component?: string;
  code?: string;
  message: string;
  severity?: string;
}

export interface ShipmentReadiness {
  id: string;
  tenant_id: string;
  shipment_id: string;
  trade_operation_id: string | null;
  workflow_id: string | null;
  readiness_score: number | string;
  compliance_score: number | string;
  documentation_score: number | string;
  logistics_score: number | string;
  risk_score: number | string;
  band: ReadinessBand;
  capped: boolean;
  weights: Record<string, number> | null;
  components: Record<string, unknown> | null;
  blockers: ReadinessBlocker[] | null;
  blocker_count: number;
  engine_version: string;
  trigger: string;
  reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReadinessDefinition {
  engine_version: string;
  weights: Record<string, number>;
  bands: Record<string, string>;
  required_documents: string[];
  components: Record<string, string>;
  high_value_threshold?: number;
  triggers?: string[];
}

export const readinessApi = {
  definition: () => tradeApi.get<ReadinessDefinition>('/shipment_readiness/definition'),
  list: (params: { page?: number; limit?: number } = {}) =>
    tradeApi.list<ShipmentReadiness>('/shipment_readiness', params),
  forShipment: (shipmentId: string) => tradeApi.get<ShipmentReadiness>(`/shipment_readiness/${shipmentId}`),
  recalculate: (shipmentId: string) =>
    tradeApi.post<ShipmentReadiness>(`/shipment_readiness/${shipmentId}/recalculate`, {}),
};

export function useReadinessDefinition() {
  return useQuery({
    queryKey: qk.readiness.definition,
    queryFn: readinessApi.definition,
    staleTime: 60 * 60_000,
  });
}

export function useReadiness(shipmentId: string | undefined, opts: { poll?: boolean } = {}) {
  return useQuery({
    queryKey: qk.readiness.forShipment(shipmentId ?? ''),
    queryFn: () => readinessApi.forShipment(shipmentId as string),
    enabled: !!shipmentId,
    refetchInterval: opts.poll ? 30_000 : false,
    retry: (count, err) => {
      // A shipment with no score yet returns 404 — don't hammer it.
      const code = (err as { code?: string })?.code;
      if (code === 'HTTP_404') return false;
      return count < 1;
    },
  });
}

export function useRecalculateReadiness(shipmentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => readinessApi.recalculate(shipmentId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.readiness.forShipment(shipmentId) });
      void qc.invalidateQueries({ queryKey: qk.readiness.all });
    },
  });
}
