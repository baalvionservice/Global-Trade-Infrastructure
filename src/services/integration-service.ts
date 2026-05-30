/**
 * @file src/services/integration-service.ts
 * @description Service for managing institutional interoperability, API connectors, and digital sync state.
 * Refactored to act as the primary bridge between the UI and the Gateway Service.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';

export type IntegrationType = 'erp' | 'logistics' | 'banking' | 'government';
export type IntegrationStatus = 'active' | 'inactive' | 'error';

export interface Integration {
  id: string;
  companyId: string;
  name: string;
  type: IntegrationType;
  status: IntegrationStatus;
  config: any;
  createdAt: string;
  updatedAt: string;
}

export interface Webhook {
  id: string;
  companyId: string;
  eventType: string;
  targetUrl: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface IntegrationLog {
  id: string;
  integrationId: string;
  direction: 'inbound' | 'outbound';
  eventType: string;
  payload: any;
  status: 'success' | 'failed';
  errorMessage?: string;
  createdAt: string;
}

/**
 * Retrieves all active institutional integrations.
 */
export async function getIntegrations(companyId?: string): Promise<Integration[]> {
  const params = companyId ? { companyId } : {};
  const res = await apiClient.get<Integration[]>('/integrations', params);
  return toList(res);
}

/**
 * Provisions a new institutional connector mandate.
 */
export async function registerIntegration(data: Partial<Integration>): Promise<Integration> {
  const res = await apiClient.post<Integration>('/integrations', {
    ...data,
    status: 'active'
  });
  return res.data!;
}

/**
 * Retrieves the outbound callback registry.
 */
export async function getWebhooks(companyId?: string): Promise<Webhook[]> {
  const params = companyId ? { companyId } : {};
  const res = await apiClient.get<Webhook[]>('/webhooks', params);
  return toList(res);
}

/**
 * Provisions a new outbound callback endpoint.
 */
export async function registerWebhook(data: Partial<Webhook>): Promise<Webhook> {
  const res = await apiClient.post<Webhook>('/webhooks', {
    ...data,
    status: 'active'
  });
  return res.data!;
}

/**
 * Retrieves the interoperability audit ledger.
 */
export async function getIntegrationLogs(integrationId?: string): Promise<IntegrationLog[]> {
  const params = integrationId ? { integrationId } : {};
  const res = await apiClient.get<IntegrationLog[]>('/webhook_logs', params);
  return toList(res);
}
