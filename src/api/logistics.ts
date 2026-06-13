/**
 * @file src/api/logistics.ts
 * @description Logistics / route optimization — multi-leg route optimization over the carrier lane
 * network (cheapest / fastest / balanced), a stateless quote preview, persisted optimization runs,
 * and route selection (which hands off to freight booking).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tradeApi } from './client';
import { qk } from './keys';

export type RouteStrategy = 'cheapest' | 'fastest' | 'balanced';

export interface RouteLeg {
  origin: string;
  destination: string;
  carrier_id?: string;
  carrier_name?: string;
  mode?: string;
  cost?: number;
  eta_days?: number;
}

export interface RouteCandidate {
  id: string;
  legs: RouteLeg[];
  total_cost: number;
  total_eta_days: number;
  score?: number;
  strategy?: RouteStrategy;
}

export interface RouteWarning {
  code: string;
  message: string;
}

export interface OptimizationResult {
  routes: RouteCandidate[];
  cheapest?: RouteCandidate | null;
  fastest?: RouteCandidate | null;
  balanced?: RouteCandidate | null;
  recommended?: RouteCandidate | null;
  warnings?: RouteWarning[];
}

export interface RouteOptimization extends OptimizationResult {
  id: string;
  tenant_id: string;
  reference: string | null;
  shipment_id: string | null;
  trade_operation_id: string | null;
  origin_hub: string | null;
  destination_hub: string | null;
  weight_kg: number | string | null;
  strategy: RouteStrategy;
  status: 'optimized' | 'selected' | 'failed';
  selected_strategy: RouteStrategy | null;
  selected_route: RouteCandidate | null;
  created_at: string;
  updated_at: string;
}

export interface NetworkHub {
  code: string;
  name: string;
  country: string;
  modes: string[];
  gateway: boolean;
}

export interface NetworkCarrier {
  id: string;
  name: string;
  modes: string[];
  reliability: number;
}

export interface LogisticsNetwork {
  engine_version: string;
  modes: string[];
  strategies: RouteStrategy[];
  hubs: NetworkHub[];
  carriers: NetworkCarrier[];
  lane_count: number;
}

export interface QuoteBody {
  origin: { country?: string; hub?: string };
  destination: { country?: string; hub?: string };
  weight_kg?: number;
  modes?: string[];
  shipment_id?: string;
}

export const logisticsApi = {
  network: () => tradeApi.get<LogisticsNetwork>('/route_optimizations/network'),
  preview: (body: QuoteBody) => tradeApi.post<OptimizationResult>('/route_optimizations/preview', body),
  optimize: (body: QuoteBody) => tradeApi.post<RouteOptimization>('/route_optimizations', body),
  list: (params: { page?: number; limit?: number; shipment_id?: string } = {}) =>
    tradeApi.list<RouteOptimization>('/route_optimizations', params),
  get: (id: string) => tradeApi.get<RouteOptimization>(`/route_optimizations/${id}`),
  select: (id: string, strategy: RouteStrategy) =>
    tradeApi.post<RouteOptimization>(`/route_optimizations/${id}/select`, { strategy }),
};

export function useLogisticsNetwork() {
  return useQuery({ queryKey: qk.logistics.network, queryFn: logisticsApi.network, staleTime: 60 * 60_000 });
}

export function useOptimizations(params: { page?: number; limit?: number; shipment_id?: string } = {}, opts: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: qk.logistics.list(params),
    queryFn: () => logisticsApi.list(params),
    enabled: opts.enabled ?? true,
  });
}

export function useQuotePreview() {
  return useMutation({ mutationFn: (body: QuoteBody) => logisticsApi.preview(body) });
}

export function useOptimizeRoute(shipmentId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: QuoteBody) => logisticsApi.optimize(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.logistics.all });
      if (shipmentId) void qc.invalidateQueries({ queryKey: qk.readiness.forShipment(shipmentId) });
    },
  });
}

export function useSelectRoute(shipmentId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; strategy: RouteStrategy }) => logisticsApi.select(vars.id, vars.strategy),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.logistics.all });
      if (shipmentId) void qc.invalidateQueries({ queryKey: qk.readiness.forShipment(shipmentId) });
    },
  });
}
