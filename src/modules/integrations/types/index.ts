/**
 * @file src/modules/integrations/types/index.ts
 * @description Master data contracts for the Baalvion Interoperability & API Gateway.
 */

export type ConnectorType = 'ERP' | 'BANKING' | 'CUSTOMS' | 'LOGISTICS' | 'INTELLIGENCE' | 'GOVERNANCE';
export type ConnectorStatus = 'ACTIVE' | 'SYNCING' | 'DEGRADED' | 'OFFLINE' | 'PROVISIONING';
export type SyncDirection = 'INBOUND' | 'OUTBOUND' | 'BIDIRECTIONAL';

export interface ConnectorNode {
  id: string;
  name: string;
  type: ConnectorType;
  provider: string;
  status: ConnectorStatus;
  direction: SyncDirection;
  lastSyncAt: string;
  uptime: number; // 0-100
  throughput: string;
  latencyMs: number;
  metadata: Record<string, any>;
}

export interface WebhookEndpoint {
  id: string;
  title: string;
  url: string;
  events: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'FAILED';
  secretHash: string;
  lastDelivery?: {
    timestamp: string;
    statusCode: number;
    latency: number;
  };
}

export interface IntegrationAuditLog {
  id: string;
  connectorId: string;
  action: string;
  direction: 'IN' | 'OUT';
  payloadSize: string;
  status: 'SUCCESS' | 'FAILURE' | 'RETRIED';
  timestamp: string;
  correlationId: string;
}

export interface GatewayMetrics {
  totalRequests: number;
  avgLatency: number;
  errorRate: number;
  activeConnectors: number;
  peakThroughput: string;
}
