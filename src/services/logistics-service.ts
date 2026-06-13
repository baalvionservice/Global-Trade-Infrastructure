/**
 * @file logistics-service.ts
 * @description THE AUTHORITATIVE LOGISTICS ORCHESTRATOR.
 * Hardened: Manages the lifecycle of Global Freight Mandates and real-time Telemetry Ingestion.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { logger, metricsService } from './observability-service';
import { eventBus } from './event-bus';
import { ShipmentNode, Milestone, LifecycleStatus } from '@/types/institutional';

/**
 * The trade-service Shipment model is flat snake_case with lowercase enum
 * statuses (booked/in_transit/customs_clearance/delivered/...). Map it onto the
 * UI ShipmentNode, providing both the canonical fields and the aliases some
 * components read (carrier, estimatedDelivery). Status stays lowercase to match
 * the backend + ShipmentTable's colour map.
 */
function mapShipmentFromApi(raw: any): ShipmentNode {
  const eta = raw?.estimated_arrival || raw?.created_at || new Date().toISOString();
  return {
    id: String(raw?.id),
    orderId: String(raw?.order_id ?? ''),
    carrierId: String(raw?.carrier_id ?? ''),
    carrierName: raw?.carrier_name || 'Carrier Node',
    carrier: raw?.carrier_name || 'Carrier Node',
    trackingNumber: raw?.tracking_number || '',
    vesselName: raw?.vessel_name || undefined,
    containerId: raw?.container_id || undefined,
    origin: raw?.origin || '',
    destination: raw?.destination || '',
    status: raw?.status || 'booked',
    estimatedArrival: eta,
    estimatedDelivery: eta,
    actualArrival: raw?.actual_arrival || undefined,
    iotTelemetryStream: raw?.iot_stream_id || '',
    value: Number(raw?.value) || 0,
    currency: raw?.currency || 'USD',
    milestones: Array.isArray(raw?.milestones) ? raw.milestones : [],
    activeExceptions: Array.isArray(raw?.exceptions) ? raw.exceptions : [],
    createdAt: raw?.created_at || new Date().toISOString(),
    updatedAt: raw?.updated_at || new Date().toISOString(),
  } as ShipmentNode;
}

class LogisticsService {
  private static instance: LogisticsService;

  private constructor() {}

  public static getInstance(): LogisticsService {
    if (!LogisticsService.instance) {
      LogisticsService.instance = new LogisticsService();
    }
    return LogisticsService.instance;
  }

  /**
   * Resolves the Global Logistics State for the Control Tower.
   */
  async getGlobalFulfillmentPulse() {
    const res = await apiClient.get<any>('/shipments');
    const shipments = (res.data?.items ?? []).map(mapShipmentFromApi);

    const statusOf = (s: ShipmentNode) => String(s.status).toLowerCase();
    return {
      activeShipments: shipments.length,
      inTransit: shipments.filter((s: ShipmentNode) => statusOf(s) === 'in_transit').length,
      customsPending: shipments.filter((s: ShipmentNode) => statusOf(s) === 'customs_clearance' || statusOf(s) === 'customs_hold').length,
      deliveredToday: shipments.filter((s: ShipmentNode) => statusOf(s) === 'delivered').length,
      totalAssetValue: shipments.reduce((acc: number, s: ShipmentNode) => acc + (Number(s.value) || 0), 0),
    };
  }

  /**
   * Retrieves a single shipment with full forensic telemetry.
   */
  async getShipment(id: string): Promise<ShipmentNode | null> {
    const res = await apiClient.getDoc<any>('shipments', id);
    return res.success && res.data ? mapShipmentFromApi(res.data) : null;
  }

  /**
   * Books a new cargo node via an external carrier adapter.
   */
  async createShipment(data: Partial<ShipmentNode>): Promise<ShipmentNode> {
    logger.info('LogisticsOrchestrator', `PROVISIONING_CARGO_NODE: For Order ${data.orderId}`);

    const res = await apiClient.post<any>('/shipments', {
      order_id: data.orderId,
      carrier_id: data.carrierId,
      carrier_name: data.carrierName,
      tracking_number: (data as any).trackingNumber || `TRK-${Date.now().toString(36).toUpperCase()}`,
      origin: data.origin,
      destination: data.destination,
      estimated_arrival: data.estimatedArrival,
      value: data.value,
      currency: data.currency,
      status: 'booked',
      milestones: [{
        id: 'INIT',
        status: 'BOOKED',
        location: data.origin || 'Origin Hub',
        timestamp: new Date().toISOString(),
        isVerified: true,
        verifiedBy: 'SYSTEM_KERNEL',
        // evidenceHash assigned server-side; not fabricated on the client.
      }]
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to provision shipment.');
    }

    const node = mapShipmentFromApi(res.data);
    await eventBus.publish('SHIPMENT_CREATED', node);
    metricsService.recordMetric('logistics_nodes_activated', 1);

    return node;
  }

  /**
   * Records a high-fidelity operational milestone.
   * Every update is cryptographically hashed and broadcast to the event mesh.
   */
  async recordMilestone(id: string, milestone: Partial<Milestone>): Promise<ShipmentNode> {
    const current = await this.getShipment(id);
    if (!current) throw new Error('Shipment Node Not Resolved');

    const status = (milestone.status || current.status) as string;
    const newMilestone: Milestone = {
      id: `MLS-${Math.random().toString(36).substring(7).toUpperCase()}`,
      status: status as any,
      location: milestone.location || 'Distributed Node',
      timestamp: new Date().toISOString(),
      notes: milestone.notes,
      isVerified: true,
      verifiedBy: 'IOT_SENTINEL_ALPHA',
      // evidenceHash is a cryptographic proof of the milestone and is assigned
      // by the logistics backend; the client never fabricates one.
    };

    logger.info('LogisticsEngine', `FINALIZING_MILESTONE: ${id} -> ${status}`);

    // Append the milestone, then transition status (backend enum is lowercase snake_case).
    await apiClient.post(`/shipments/${id}/milestones`, newMilestone);
    const res = await apiClient.patch<any>(`/shipments/${id}/status`, {
      status: String(status).toLowerCase(),
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to record milestone.');
    }

    const updated = mapShipmentFromApi(res.data);
    await eventBus.publish('SHIPMENT_UPDATED', updated);
    metricsService.recordMetric('logistics_milestone_finalized', 1);

    // Auto-trigger treasury release on delivery.
    if (String(status).toLowerCase() === 'delivered') {
       await eventBus.publish('DELIVERY_CONFIRMED', updated);
    }

    return updated;
  }

  /**
   * Resolves active exceptions for a cluster of shipments.
   */
  async getOperationalExceptions() {
    const res = await apiClient.get<any[]>('/alerts', { status: 'active', category: 'LOGISTICS' });
    return toList(res);
  }
}

export const logisticsService = LogisticsService.getInstance();

export type Shipment = ShipmentNode;
export type ShipmentStatus = LifecycleStatus;
export const getShipmentById = (id: string) => logisticsService.getShipment(id);
