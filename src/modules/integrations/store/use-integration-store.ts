/**
 * @file use-integration-store.ts
 * @description Centralized state for Institutional Interoperability and Gateway Monitoring.
 */
import { create } from 'zustand';
import { ConnectorNode, WebhookEndpoint, GatewayMetrics, IntegrationAuditLog } from '../types';

interface IntegrationState {
  connectors: ConnectorNode[];
  webhooks: WebhookEndpoint[];
  logs: IntegrationAuditLog[];
  metrics: GatewayMetrics | null;
  isSyncing: boolean;
  
  setConnectors: (nodes: ConnectorNode[]) => void;
  setWebhooks: (endpoints: WebhookEndpoint[]) => void;
  setLogs: (logs: IntegrationAuditLog[]) => void;
  setMetrics: (metrics: GatewayMetrics) => void;
  setSyncing: (val: boolean) => void;
}

export const useIntegrationStore = create<IntegrationState>((set) => ({
  connectors: [],
  webhooks: [],
  logs: [],
  metrics: null,
  isSyncing: false,

  setConnectors: (connectors) => set({ connectors }),
  setWebhooks: (webhooks) => set({ webhooks }),
  setLogs: (logs) => set({ logs }),
  setMetrics: (metrics) => set({ metrics }),
  setSyncing: (isSyncing) => set({ isSyncing }),
}));
