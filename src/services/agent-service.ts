/**
 * @file src/services/agent-service.ts
 * @description Agent & Broker Marketplace + Service Requests — backed by the live trade-service
 * generic store (`/agents`, `/service_requests`). Persisted, tenant-scoped, real.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';

export type AgentType = 'broker' | 'inspector' | 'logistics';
export type RequestStatus = 'requested' | 'accepted' | 'completed' | 'cancelled';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  region: string;
  rating: number;
  experience: number; // years
  description: string;
  certifications: string[];
  logo: string;
}

export interface ServiceRequest {
  id: string;
  agentId: string;
  agentName: string;
  agentType: AgentType;
  userId: string;
  clientName?: string;
  shipmentId?: string;
  orderId?: string;
  type: string;
  status: RequestStatus;
  createdAt: string;
}

export async function getAgents(): Promise<Agent[]> {
  const res = await apiClient.get<Agent[]>('/agents');
  return toList<Agent>(res);
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const res = await apiClient.getDoc<Agent>('agents', id);
  return res.success ? (res.data ?? null) : null;
}

export async function hireAgent(data: { agentId: string; type: string; shipmentId?: string; orderId?: string }): Promise<ServiceRequest> {
  const agent = await getAgentById(data.agentId);
  const res = await apiClient.post<ServiceRequest>('/service_requests', {
    agentId: data.agentId,
    agentName: agent?.name || 'Unknown Agent',
    agentType: agent?.type || 'broker',
    shipmentId: data.shipmentId,
    orderId: data.orderId,
    type: data.type,
    status: 'requested',
    createdAt: new Date().toISOString(),
  });
  return res.data as ServiceRequest;
}

export async function getServiceRequests(): Promise<ServiceRequest[]> {
  const res = await apiClient.get<ServiceRequest[]>('/service_requests', { sortBy: 'createdAt', order: 'desc' });
  return toList<ServiceRequest>(res);
}

export async function updateRequestStatus(id: string, status: RequestStatus): Promise<void> {
  await apiClient.patch(`/service_requests/${id}`, { status });
}
