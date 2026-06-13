/**
 * @file src/api/shipments.ts
 * @description Shipments domain — the spine of the Trade Operations control center. Wraps the live
 * trade-service `/shipments` surface (list, detail, lifecycle status, milestones, exceptions, and
 * carrier tracking) with normalized DTOs + React Query hooks.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tradeApi, type Paginated } from './client';
import { qk } from './keys';

export type ShipmentStatus =
  | 'booked' | 'picked_up' | 'in_transit' | 'port_processing' | 'customs_clearance'
  | 'customs_hold' | 'released' | 'out_for_delivery' | 'delivered' | 'delayed'
  | 're_routed' | 'exception' | 'cancelled';

/** An embedded carrier milestone on the shipment record. */
export interface ShipmentMilestone {
  id?: string;
  status: string;
  location?: string | null;
  timestamp: string;
  isVerified?: boolean;
  notes?: string;
  source?: string;
}

/** An embedded shipment exception. */
export interface ShipmentException {
  code?: string;
  severity?: 'low' | 'medium' | 'high' | string;
  message?: string;
  detectedAt?: string;
  resolved?: boolean;
}

/**
 * Live shipment shape served by trade-service `/v1/shipments` (the order-linked operational
 * shipment record). NOTE: `id` is numeric and timestamps are camelCase (`createdAt`/`updatedAt`).
 */
export interface Shipment {
  id: number;
  tenant_id: string;
  order_id: number | null;
  carrier_id: string | null;
  carrier_name: string | null;
  tracking_number: string | null;
  vessel_name: string | null;
  container_id: string | null;
  origin: string | null;
  destination: string | null;
  status: ShipmentStatus;
  estimated_arrival: string | null;
  actual_arrival: string | null;
  value: string | number | null;
  currency: string | null;
  milestones: ShipmentMilestone[] | null;
  exceptions: ShipmentException[] | null;
  iot_stream_id: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingEvent {
  id: string;
  status: string;
  location?: string | null;
  timestamp: string;
  source?: string;
}

export interface ShipmentTracking {
  shipmentId: number;
  status: string;
  trackingNumber: string | null;
  tracking: {
    mode?: string;
    status?: string;
    progress?: number;
    eta?: string | null;
    position?: string;
    events?: TrackingEvent[];
  } | null;
}

export type ShipmentListParams = {
  page?: number;
  limit?: number;
  status?: ShipmentStatus | '';
  q?: string;
  trade_operation_id?: string;
};

export interface CreateShipmentBody {
  order_id?: number;
  carrier_name?: string;
  vessel_name?: string;
  container_id?: string;
  tracking_number?: string;
  origin?: string;
  destination?: string;
  value?: number;
  currency?: string;
  estimated_arrival?: string;
}

// ── API ───────────────────────────────────────────────────────────────────────
export const shipmentsApi = {
  list: (params: ShipmentListParams = {}) => tradeApi.list<Shipment>('/shipments', params),
  get: (id: string) => tradeApi.get<Shipment>(`/shipments/${id}`),
  track: (id: string) => tradeApi.get<ShipmentTracking>(`/shipments/${id}/track`),
  create: (body: CreateShipmentBody) => tradeApi.post<Shipment>('/shipments', body),
  updateStatus: (id: string, status: ShipmentStatus, reason?: string) =>
    tradeApi.patch<Shipment>(`/shipments/${id}/status`, { status, reason }),
  addMilestone: (id: string, body: { status: string; location?: string; occurred_at?: string }) =>
    tradeApi.post<Shipment>(`/shipments/${id}/milestones`, body),
  addException: (id: string, body: { code: string; severity?: string; message: string }) =>
    tradeApi.post<Shipment>(`/shipments/${id}/exceptions`, body),
  refreshTracking: (id: string) => tradeApi.post(`/shipments/${id}/track/refresh`, {}),
};

// ── Hooks ──────────────────────────────────────────────────────────────────────
export function useShipments(params: ShipmentListParams = {}, opts: { poll?: boolean } = {}) {
  return useQuery({
    queryKey: qk.shipments.list(params),
    queryFn: () => shipmentsApi.list(params),
    refetchInterval: opts.poll ? 30_000 : false,
    placeholderData: (prev) => prev, // keepPreviousData for smooth pagination/filter changes
  });
}

export function useShipment(id: string | undefined, opts: { poll?: boolean } = {}) {
  return useQuery({
    queryKey: qk.shipments.detail(id ?? ''),
    queryFn: () => shipmentsApi.get(id as string),
    enabled: !!id,
    refetchInterval: opts.poll ? 30_000 : false,
  });
}

export function useShipmentTracking(id: string | undefined, opts: { poll?: boolean } = {}) {
  return useQuery({
    queryKey: qk.shipments.track(id ?? ''),
    queryFn: () => shipmentsApi.track(id as string),
    enabled: !!id,
    refetchInterval: opts.poll ? 30_000 : false,
  });
}

export function useCreateShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateShipmentBody) => shipmentsApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.shipments.all }),
  });
}

export function useUpdateShipmentStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { status: ShipmentStatus; reason?: string }) =>
      shipmentsApi.updateStatus(id, vars.status, vars.reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.shipments.detail(id) });
      void qc.invalidateQueries({ queryKey: qk.shipments.all });
    },
  });
}

export function useRefreshTracking(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => shipmentsApi.refreshTracking(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.shipments.track(id) });
      void qc.invalidateQueries({ queryKey: qk.shipments.detail(id) });
    },
  });
}
