/**
 * @file services/trade-command-service.ts
 * @description Same-origin client for the orchestration Trade API
 * (/api/trades/*). Mirrors the platform's { success, data, error } envelope and
 * forwards the caller's identity headers so the server enforces auth/tenancy.
 * This is the read/command bridge the Trade Command Center UI uses.
 */
import type { TradeTerms } from '@/orchestration/ports';

export interface Auth {
  userId: string;
  role: string;
  orgId: string;
}

export interface NamedRef {
  id: string;
  name: string;
}

export interface StatusRow {
  id: string;
  status: string;
  createdAt: string;
  amount?: string;
  currency?: string;
  totalAmount?: string;
  externalRef?: string | null;
  carrier?: string | null;
  origin?: string | null;
  destination?: string | null;
  country?: string | null;
}

export interface WorkflowEventRow {
  id: string;
  type: string;
  fromState: string | null;
  toState: string;
  actorId: string;
  actorRole: string;
  reason: string | null;
  sequence: number;
  createdAt: string;
}

export interface DocumentRow {
  id: string;
  kind: string;
  version: number;
  status: string;
  url: string | null;
  createdAt: string;
}

export interface TradeGraph {
  id: string;
  reference: string;
  correlationId: string;
  currentState: string;
  riskStatus: string;
  complianceStatus: string;
  organizationId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  buyer: NamedRef | null;
  supplier: NamedRef | null;
  rfqId: string | null;
  dealId: string | null;
  orderId: string | null;
  escrowId: string | null;
  paymentId: string | null;
  shipmentId: string | null;
  customsId: string | null;
  settlementId: string | null;
  terms: TradeTerms;
  rfq: StatusRow | null;
  deal: StatusRow | null;
  order: StatusRow | null;
  escrow: StatusRow | null;
  payment: StatusRow | null;
  shipment: StatusRow | null;
  customs: StatusRow | null;
  settlement: StatusRow | null;
  documents: DocumentRow[];
  workflowEvents: WorkflowEventRow[];
}

export interface TradeListItem {
  id: string;
  reference: string;
  currentState: string;
  riskStatus: string;
  complianceStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export interface WorkflowView {
  tradeId: string;
  currentState: string;
  version: number;
  riskStatus: string;
  complianceStatus: string;
  history: WorkflowEventRow[];
}

export interface RiskRow {
  id: string;
  score: number;
  level: string;
  factors: string[];
  model: string;
  createdAt: string;
}

export interface ComplianceRow {
  id: string;
  type: string;
  outcome: string;
  subject: string;
  reasons: string[];
  createdAt: string;
}

export interface ComplianceView {
  risk: RiskRow[];
  compliance: ComplianceRow[];
}

export interface FinanceInstrumentRow {
  id: string;
  type: string;
  status: string;
  amount: string;
  currency: string;
  provider: string | null;
  createdAt: string;
}

export interface FinanceRequestRow {
  id: string;
  type: string;
  status: string;
  amount: string;
  currency: string;
  requestedBy: string;
  decidedBy: string | null;
  reason: string | null;
  instrumentId: string | null;
  createdAt: string;
}

export interface FinanceView {
  instruments: FinanceInstrumentRow[];
  requests: FinanceRequestRow[];
}

export interface DomainEventRow {
  id: string;
  eventId: string;
  type: string;
  correlationId: string;
  occurredAt: string;
  payload: unknown;
}

export interface AuditRow {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  actorRole: string | null;
  source: string;
  createdAt: string;
}

interface Envelope<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

function authHeaders(auth?: Auth): Record<string, string> {
  if (!auth) return {};
  return {
    'x-actor-id': auth.userId,
    'x-actor-role': auth.role,
    'x-organization-id': auth.orgId,
  };
}

async function request<T>(path: string, init: RequestInit = {}, auth?: Auth): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(auth),
      ...(init.headers as Record<string, string> | undefined),
    },
  });
  const body = (await res.json().catch(() => null)) as Envelope<T> | null;
  if (!res.ok || !body || body.success === false) {
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return body.data as T;
}

export interface CreateTradeBody {
  organizationName?: string;
  organizationSlug?: string;
  reference?: string;
  terms: TradeTerms;
  buyer?: { name: string; externalRef?: string };
  supplier?: { name: string; externalRef?: string };
  metadata?: Record<string, unknown>;
}

export const tradeCommandService = {
  list(params: { page?: number; pageSize?: number; state?: string } = {}): Promise<Paginated<TradeListItem>> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    if (params.state) q.set('state', params.state);
    return request<Paginated<TradeListItem>>(`/api/trades?${q.toString()}`);
  },

  get(id: string): Promise<TradeGraph> {
    return request<TradeGraph>(`/api/trades/${id}`);
  },

  workflow(id: string): Promise<WorkflowView> {
    return request<WorkflowView>(`/api/trades/${id}/workflow`);
  },

  compliance(id: string): Promise<ComplianceView> {
    return request<ComplianceView>(`/api/trades/${id}/compliance`);
  },

  finance(id: string): Promise<FinanceView> {
    return request<FinanceView>(`/api/trades/${id}/finance`);
  },

  documents(id: string): Promise<DocumentRow[]> {
    return request<DocumentRow[]>(`/api/trades/${id}/documents`);
  },

  events(id: string): Promise<DomainEventRow[]> {
    return request<DomainEventRow[]>(`/api/trades/${id}/events`);
  },

  audit(id: string, page = 1): Promise<Paginated<AuditRow>> {
    return request<Paginated<AuditRow>>(`/api/trades/${id}/audit?page=${page}`);
  },

  create(body: CreateTradeBody, auth: Auth): Promise<TradeGraph> {
    return request<TradeGraph>('/api/trades', { method: 'POST', body: JSON.stringify(body) }, auth);
  },

  cancel(id: string, reason: string, auth: Auth): Promise<TradeGraph> {
    return request<TradeGraph>(`/api/trades/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }, auth);
  },

  complete(id: string, auth: Auth): Promise<TradeGraph> {
    return request<TradeGraph>(`/api/trades/${id}/complete`, { method: 'POST', body: JSON.stringify({}) }, auth);
  },

  requestFinance(
    id: string,
    body: { type: string; amount: number; currency?: string },
    auth: Auth,
  ): Promise<FinanceRequestRow> {
    return request<FinanceRequestRow>(`/api/trades/${id}/finance`, { method: 'POST', body: JSON.stringify(body) }, auth);
  },

  decideFinance(
    requestId: string,
    body: { decision: 'approved' | 'rejected'; reason?: string; provider?: string },
    auth: Auth,
  ): Promise<unknown> {
    return request(`/api/finance/${requestId}/decision`, { method: 'POST', body: JSON.stringify(body) }, auth);
  },

  addDocument(
    id: string,
    body: { kind: string; url?: string; metadata?: Record<string, unknown> },
    auth: Auth,
  ): Promise<DocumentRow> {
    return request<DocumentRow>(`/api/trades/${id}/documents`, { method: 'POST', body: JSON.stringify(body) }, auth);
  },
};
