/**
 * @file src/services/logistics/types.ts
 * @description Standardized types and interfaces for the Logistics Integration Layer.
 */
import { ShipmentNode, Milestone, LifecycleStatus } from '@/types/institutional';

export type ShipmentStatus = LifecycleStatus;

export interface ExternalTrackingUpdate {
  status: ShipmentStatus;
  location: string;
  timestamp: string;
  notes?: string;
  rawPayload?: any;
}

export interface BookingResponse {
  success: boolean;
  trackingNumber: string;
  estimatedDelivery: string;
  externalRefId: string;
  error?: string;
}

/**
 * The core Adapter Interface for all institutional logistics providers.
 */
export interface ILogisticsAdapter {
  providerId: string;
  providerName: string;
  
  /**
   * Translates institutional order into carrier-specific mandate.
   */
  bookShipment(data: Partial<ShipmentNode>): Promise<BookingResponse>;

  /**
   * Synchronizes external carrier telemetry with platform lifecycle.
   */
  trackShipment(trackingNumber: string): Promise<ExternalTrackingUpdate>;

  /**
   * Executes a formal cancellation on the carrier's gateway.
   */
  cancelShipment(trackingNumber: string): Promise<boolean>;
}
