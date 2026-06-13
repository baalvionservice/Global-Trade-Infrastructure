/**
 * @file src/api/customs.ts
 * @description Customs gateway — async submission to national customs systems (ICEGATE / ACE /
 * EU-CDS / Mirsal) with retry + failure recovery + normalized responses.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tradeApi } from './client';
import { qk } from './keys';

export type CustomsChannel = 'icegate' | 'ace' | 'eu_cds' | 'mirsal';
export type CustomsStatus =
  | 'draft' | 'queued' | 'submitting' | 'submitted'
  | 'accepted' | 'rejected' | 'failed' | 'cancelled';

export interface CustomsSubmission {
  id: string;
  tenant_id: string;
  customs_entry_id: string | null;
  shipment_id: string | null;
  trade_operation_id: string | null;
  channel: CustomsChannel;
  direction: 'import' | 'export';
  origin_country: string | null;
  destination_country: string | null;
  status: CustomsStatus;
  attempts: number;
  max_attempts: number;
  gateway_reference: string | null;
  gateway_status: string | null;
  declaration: Record<string, unknown> | null;
  normalized_response: Record<string, unknown> | null;
  messages: unknown[] | null;
  last_error: string | null;
  failure_kind: 'validation' | 'transient' | 'permanent' | null;
  submitted_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomsEvent {
  id: string;
  submission_id: string;
  channel: string;
  event_type: string;
  status: string | null;
  attempt: number;
  message: string | null;
  detail: Record<string, unknown> | null;
  created_at: string;
}

export interface CustomsChannels {
  engine_version: string;
  channels: string[];
  supported_channels: string[];
  statuses: string[];
  terminal_statuses: string[];
  country_routing?: Record<string, string>;
}

export interface CreateCustomsBody {
  shipment_id?: string;
  trade_operation_id?: string;
  channel?: CustomsChannel;
  direction?: 'import' | 'export';
  origin_country?: string;
  destination_country?: string;
  declaration?: Record<string, unknown>;
}

export const customsApi = {
  channels: () => tradeApi.get<CustomsChannels>('/customs_submissions/channels'),
  list: (params: { page?: number; limit?: number; shipment_id?: string } = {}) =>
    tradeApi.list<CustomsSubmission>('/customs_submissions', params),
  get: (id: string) => tradeApi.get<CustomsSubmission>(`/customs_submissions/${id}`),
  events: (id: string) => tradeApi.get<CustomsEvent[]>(`/customs_submissions/${id}/events`),
  create: (body: CreateCustomsBody) => tradeApi.post<CustomsSubmission>('/customs_submissions', body),
  retry: (id: string) => tradeApi.post<CustomsSubmission>(`/customs_submissions/${id}/retry`, {}),
  cancel: (id: string) => tradeApi.post<CustomsSubmission>(`/customs_submissions/${id}/cancel`, {}),
};

export function useCustomsChannels() {
  return useQuery({ queryKey: qk.customs.channels, queryFn: customsApi.channels, staleTime: 60 * 60_000 });
}

export function useCustomsSubmissions(params: { page?: number; limit?: number; shipment_id?: string } = {}, opts: { enabled?: boolean; poll?: boolean } = {}) {
  return useQuery({
    queryKey: qk.customs.list(params),
    queryFn: () => customsApi.list(params),
    enabled: opts.enabled ?? true,
    refetchInterval: opts.poll ? 30_000 : false,
  });
}

export function useCustomsEvents(id: string | undefined) {
  return useQuery({
    queryKey: qk.customs.events(id ?? ''),
    queryFn: () => customsApi.events(id as string),
    enabled: !!id,
  });
}

function useCustomsMutation<TVars>(fn: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: qk.customs.all }) });
}

export function useCreateCustoms() {
  return useCustomsMutation((body: CreateCustomsBody) => customsApi.create(body));
}
export function useRetryCustoms() {
  return useCustomsMutation((id: string) => customsApi.retry(id));
}
export function useCancelCustoms() {
  return useCustomsMutation((id: string) => customsApi.cancel(id));
}
