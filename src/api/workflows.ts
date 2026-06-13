/**
 * @file src/api/workflows.ts
 * @description Shipment workflow state machine — the event-driven engine that controls a shipment's
 * lifecycle (CREATED → … → COMPLETED/FAILED). Exposes the public state-machine descriptor, workflow
 * rows, and the CORE transition dispatch (`POST /shipment_workflows/:id/transitions`).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tradeApi } from './client';
import { qk } from './keys';

export type WorkflowState =
  | 'CREATED' | 'DOCUMENT_COLLECTION' | 'DOCUMENT_VERIFICATION' | 'COMPLIANCE_CHECK'
  | 'HS_CLASSIFICATION' | 'CUSTOMS_READY' | 'FREIGHT_BOOKED' | 'DISPATCH_READY'
  | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'FAILED';

export interface WorkflowTransitionDef {
  event: string;
  from: WorkflowState[];
  to: WorkflowState;
  kind: 'forward' | 'rework' | 'terminal';
}

export interface WorkflowDefinition {
  states: WorkflowState[];
  initial_state: WorkflowState;
  terminal_states: WorkflowState[];
  events: string[];
  transitions: WorkflowTransitionDef[];
}

export interface ShipmentWorkflow {
  id: string;
  tenant_id: string;
  reference_no: string | null;
  shipment_id: string | null;
  trade_operation_id: string | null;
  current_state: WorkflowState;
  status: 'active' | 'completed' | 'failed';
  last_event: string | null;
  last_transition_at: string | null;
  failure_reason: string | null;
  retry_count: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  version: number;
  // Server-computed view extras:
  allowed_events?: string[];
  next_forward_state?: WorkflowState | null;
  is_terminal?: boolean;
}

export interface WorkflowTransition {
  id: string;
  workflow_id: string;
  seq: number;
  event: string;
  from_state: WorkflowState | null;
  to_state: WorkflowState;
  actor: string | null;
  source: string;
  reason: string | null;
  payload: Record<string, unknown> | null;
  occurred_at: string;
  created_at: string;
}

export interface DispatchResult {
  workflow: ShipmentWorkflow;
  transition: WorkflowTransition;
  idempotent: boolean;
}

export type WorkflowListParams = {
  page?: number;
  limit?: number;
  shipment_id?: string;
  status?: string;
};

export const workflowsApi = {
  definition: () => tradeApi.get<WorkflowDefinition>('/shipment_workflows/definition'),
  list: (params: WorkflowListParams = {}) => tradeApi.list<ShipmentWorkflow>('/shipment_workflows', params),
  get: (id: string) => tradeApi.get<ShipmentWorkflow>(`/shipment_workflows/${id}`),
  transitions: (id: string) => tradeApi.get<WorkflowTransition[]>(`/shipment_workflows/${id}/transitions`),
  create: (body: { shipment_id?: string; trade_operation_id?: string; reference_no?: string }) =>
    tradeApi.post<ShipmentWorkflow>('/shipment_workflows', body),
  dispatchEvent: (id: string, body: { event: string; reason?: string; idempotency_key?: string; payload?: Record<string, unknown> }) =>
    tradeApi.post<DispatchResult>(`/shipment_workflows/${id}/transitions`, body),
};

export function useWorkflowDefinition() {
  return useQuery({
    queryKey: qk.workflows.definition,
    queryFn: workflowsApi.definition,
    staleTime: 60 * 60_000, // the state machine is static
  });
}

export function useWorkflows(params: WorkflowListParams = {}, opts: { enabled?: boolean; poll?: boolean } = {}) {
  return useQuery({
    queryKey: qk.workflows.list(params),
    queryFn: () => workflowsApi.list(params),
    enabled: opts.enabled ?? true,
    refetchInterval: opts.poll ? 30_000 : false,
  });
}

export function useWorkflow(id: string | undefined, opts: { poll?: boolean } = {}) {
  return useQuery({
    queryKey: qk.workflows.detail(id ?? ''),
    queryFn: () => workflowsApi.get(id as string),
    enabled: !!id,
    refetchInterval: opts.poll ? 20_000 : false,
  });
}

export function useWorkflowTransitions(id: string | undefined) {
  return useQuery({
    queryKey: qk.workflows.transitions(id ?? ''),
    queryFn: () => workflowsApi.transitions(id as string),
    enabled: !!id,
  });
}

export function useDispatchEvent(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { event: string; reason?: string; payload?: Record<string, unknown> }) =>
      workflowsApi.dispatchEvent(id, vars),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.workflows.detail(id) });
      void qc.invalidateQueries({ queryKey: qk.workflows.transitions(id) });
      void qc.invalidateQueries({ queryKey: qk.workflows.all });
      // A transition recomputes readiness/compliance downstream — refresh those surfaces too.
      void qc.invalidateQueries({ queryKey: qk.readiness.all });
    },
  });
}
