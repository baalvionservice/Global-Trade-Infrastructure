/**
 * @file src/api/dispatch.ts
 * @description Dispatch orchestration — the gated saga that releases a shipment for dispatch only
 * once every condition (documents validated / compliance passed / customs ready / freight booked)
 * is signaled clear, with rollback + retry on saga failure.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tradeApi } from './client';
import { qk } from './keys';

export type DispatchStatus =
  | 'pending' | 'ready' | 'dispatching' | 'dispatched'
  | 'rolled_back' | 'failed' | 'cancelled';

export interface DispatchPlan {
  id: string;
  tenant_id: string;
  reference_no: string | null;
  workflow_id: string | null;
  shipment_id: string | null;
  trade_operation_id: string | null;
  auto_dispatch: boolean;
  rule: Record<string, unknown> | null;
  conditions: Record<string, boolean> | null;
  dispatch_steps: unknown[] | null;
  status: DispatchStatus;
  version: number;
  failure_reason: string | null;
  dispatched_at: string | null;
  rolled_back_at: string | null;
  engine_version: string;
  created_at: string;
  updated_at: string;
}

export interface DispatchEvent {
  id: string;
  plan_id: string;
  seq: number;
  event_type: string;
  step: string | null;
  condition: string | null;
  status: string | null;
  message: string | null;
  created_at: string;
}

export interface DispatchConfig {
  engine_version: string;
  conditions: string[];
  default_required: string[];
  statuses: string[];
  terminal_statuses: string[];
  recoverable_statuses: string[];
  steps: string[];
}

export const dispatchApi = {
  config: () => tradeApi.get<DispatchConfig>('/dispatch_orchestrations/config'),
  list: (params: { page?: number; limit?: number; shipment_id?: string } = {}) =>
    tradeApi.list<DispatchPlan>('/dispatch_orchestrations', params),
  get: (id: string) => tradeApi.get<DispatchPlan>(`/dispatch_orchestrations/${id}`),
  events: (id: string) => tradeApi.get<DispatchEvent[]>(`/dispatch_orchestrations/${id}/events`),
  create: (body: { shipment_id?: string; workflow_id?: string; auto_dispatch?: boolean; required?: string[] }) =>
    tradeApi.post<DispatchPlan>('/dispatch_orchestrations', body),
  signal: (id: string, condition: string, value = true) =>
    tradeApi.post<DispatchPlan>(`/dispatch_orchestrations/${id}/signals`, { condition, value }),
  dispatch: (id: string) => tradeApi.post<DispatchPlan>(`/dispatch_orchestrations/${id}/dispatch`, {}),
  rollback: (id: string, reason?: string) =>
    tradeApi.post<DispatchPlan>(`/dispatch_orchestrations/${id}/rollback`, { reason }),
  retry: (id: string) => tradeApi.post<DispatchPlan>(`/dispatch_orchestrations/${id}/retry`, {}),
};

export function useDispatchConfig() {
  return useQuery({ queryKey: qk.dispatch.config, queryFn: dispatchApi.config, staleTime: 60 * 60_000 });
}

export function useDispatchPlans(params: { page?: number; limit?: number; shipment_id?: string } = {}, opts: { enabled?: boolean; poll?: boolean } = {}) {
  return useQuery({
    queryKey: qk.dispatch.list(params),
    queryFn: () => dispatchApi.list(params),
    enabled: opts.enabled ?? true,
    refetchInterval: opts.poll ? 20_000 : false,
  });
}

export function useDispatchEvents(id: string | undefined) {
  return useQuery({
    queryKey: qk.dispatch.events(id ?? ''),
    queryFn: () => dispatchApi.events(id as string),
    enabled: !!id,
  });
}

function useDispatchMutation<TVars>(fn: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: qk.dispatch.all }) });
}

export function useCreateDispatch() {
  return useDispatchMutation((body: Parameters<typeof dispatchApi.create>[0]) => dispatchApi.create(body));
}
export function useSignalDispatch() {
  return useDispatchMutation((vars: { id: string; condition: string; value?: boolean }) =>
    dispatchApi.signal(vars.id, vars.condition, vars.value ?? true));
}
export function useTriggerDispatch() {
  return useDispatchMutation((id: string) => dispatchApi.dispatch(id));
}
export function useRollbackDispatch() {
  return useDispatchMutation((vars: { id: string; reason?: string }) => dispatchApi.rollback(vars.id, vars.reason));
}
export function useRetryDispatch() {
  return useDispatchMutation((id: string) => dispatchApi.retry(id));
}
