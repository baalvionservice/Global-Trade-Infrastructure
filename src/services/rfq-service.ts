/**
 * @file rfq-service.ts
 * @description Global Trade RFQ & Quotation Intelligence Engine.
 * Manages weighted ranking, discovery filters, and deterministic state transitions.
 */
import { apiClient } from '@/lib/api-client';
import { logger } from './observability-service';
import { eventBus } from './event-bus';
import { notificationDispatcher } from './notification-dispatcher';
import { resolveSessionOrgId } from './session-org';

export type RFQStatus = 
  | 'DRAFT' 
  | 'INTERNAL_REVIEW' 
  | 'OPEN' 
  | 'EVALUATION' 
  | 'NEGOTIATION' 
  | 'AWARDED' 
  | 'CLOSED' 
  | 'CANCELLED';

export interface RFQ {
  id: string;
  rfq_id: string;
  title: string;
  product?: string;
  category: string;
  description?: string;
  quantity: {
    value: number;
    unit: string;
  };
  buyer: {
    country: string;
    buyer_id: string;
    type: string;
    region?: string;
  };
  pricing: {
    target_price: number;
    currency: string;
    pricing_model: string; 
  };
  logistics: {
    destination_port: string;
    shipment_terms: string;
  };
  compliance: {
    certifications: string[];
  };
  timeline: {
    deadline: string;
    urgency: string;
  };
  flags: {
    quality_score: number;
  };
  engagement: {
    views: number;
    quotes_received: number;
  };
  status: RFQStatus;
  createdAt: string;
  updatedAt: string;
  orgId: string;
  deliveryDate?: string;
  deliveryCountry?: string;
  productName?: string;
  currency?: string;
  targetPrice?: number;
  unit?: string;
}

export interface RFQResponse {
  id: string;
  rfqId: string;
  sellerId: string;
  sellerName: string;
  price: number;
  deliveryTime: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  rankingBadge?: 'Best Price' | 'Fastest Delivery' | 'Most Trusted';
  supplier?: {
    rating: string;
    experience_years: number;
    trustScore: number;
  };
  evaluationScore?: number;
  createdAt: string;
}

/**
 * The trade-service Rfq model is flat snake_case; the UI speaks a richer
 * nested/camelCase shape. These adapters translate between the two so the
 * existing pages keep working against real persisted data.
 */
const STATUS_TO_UI: Record<string, RFQStatus> = {
  draft: 'DRAFT', open: 'OPEN', closed: 'CLOSED', awarded: 'AWARDED', cancelled: 'CANCELLED',
};

function mapRfqFromApi(raw: any): RFQ {
  const qty = Number(raw?.quantity) || 0;
  const price = Number(raw?.target_price ?? raw?.budget_usd ?? 0);
  const currency = raw?.currency || 'USD';
  const country = raw?.destination_country || '';
  const incoterm = raw?.incoterm || 'FOB';
  return {
    id: String(raw?.id),
    rfq_id: `RFQ-${raw?.id}`,
    title: raw?.title || raw?.product_name || '',
    productName: raw?.product_name || raw?.title || '',
    category: raw?.category || '',
    description: raw?.description || '',
    quantity: { value: qty, unit: raw?.unit || 'Units' },
    unit: raw?.unit || 'Units',
    targetPrice: price,
    currency,
    deliveryCountry: country,
    deliveryDate: raw?.required_delivery_date || '',
    status: STATUS_TO_UI[raw?.status] || 'OPEN',
    createdAt: raw?.created_at || raw?.createdAt || new Date().toISOString(),
    updatedAt: raw?.updated_at || raw?.updatedAt || new Date().toISOString(),
    orgId: String(raw?.buyer_org_id ?? ''),
    buyer: { country: country || 'Global', buyer_id: String(raw?.buyer_org_id ?? ''), type: 'institution' },
    pricing: { target_price: price, currency, pricing_model: incoterm },
    logistics: { destination_port: country, shipment_terms: incoterm },
    compliance: { certifications: [] },
    timeline: { deadline: raw?.required_delivery_date || '', urgency: 'standard' },
    flags: { quality_score: 90 },
    engagement: { views: 0, quotes_received: 0 },
  };
}

function toApiPayload(form: any): Record<string, any> {
  return {
    title: form.productName,
    product_name: form.productName,
    commodity: form.category || form.productName,
    category: form.category,
    description: form.description,
    quantity: Number(form.quantity) || 0,
    unit: form.unit,
    destination_country: form.deliveryCountry,
    incoterm: form.pricingModel,            // FOB/CIF/EXW/DDP map 1:1 to the enum
    required_delivery_date: form.deliveryDate || null,
    target_price: Number(form.targetPrice) || 0,
    budget_usd: Number(form.targetPrice) || 0,
    currency: form.currency,
    status: 'open',
  };
}

export async function getRfqs(): Promise<RFQ[]> {
  const res = await apiClient.get<any>('/rfqs');
  const items = res.data?.items ?? [];
  return items.map(mapRfqFromApi);
}

export async function getRfqById(id: string): Promise<RFQ | null> {
  const res = await apiClient.getDoc<any>('/rfqs', id);
  return res.success && res.data ? mapRfqFromApi(res.data) : null;
}

export async function createRfq(data: any): Promise<RFQ> {
  const res = await apiClient.post<any>('/rfqs', toApiPayload(data));
  if (!res.success || !res.data) {
    throw new Error(res.error?.message || 'Failed to publish RFQ.');
  }
  const rfq = mapRfqFromApi(res.data);
  eventBus.publish('RFQ_CREATED', rfq);
  return rfq;
}

export async function getSellerResponses(rfqId: string): Promise<RFQResponse[]> {
  const res = await apiClient.get<any>('/quotations', { rfqId });
  const data: any[] = res.data?.items ?? [];

  // Backend orders bids by price ASC, so index 0 is the lowest offer.
  return data.map((q, i) => {
    const trust = Number(q.trustScore ?? 820);
    return {
      ...q,
      rankingBadge: i === 0 ? 'Best Price' : i === 1 ? 'Fastest Delivery' : 'Most Trusted',
      supplier: { rating: '4.8', experience_years: 12, trustScore: trust },
      evaluationScore: Math.max(60, Math.min(99, Math.round(trust / 10) - i * 2)),
    };
  });
}

export async function acceptQuote(quote: RFQResponse, rfq: RFQ): Promise<string> {
  logger.info('RFQService', `Accepting quote ${quote.id} for RFQ ${rfq.id}`);

  await apiClient.patch(`/quotations/${quote.id}`, { status: 'accepted' });

  // The trade-service Deal model is flat snake_case.
  const qty = (rfq.quantity as any)?.value ?? Number(rfq.quantity) ?? 0;
  const dealRes = await apiClient.post<any>('/deals', {
    rfq_id: rfq.id,
    buyer_org_id: rfq.orgId,
    seller_org_id: quote.sellerId,
    commodity: rfq.productName || rfq.title,
    quantity: qty,
    unit: (rfq.quantity as any)?.unit || rfq.unit,
    unit_price: quote.price,
    total_value: quote.price * qty,
    currency: rfq.pricing?.currency || rfq.currency || 'USD',
    incoterm: rfq.pricing?.pricing_model || 'FOB',
    destination: rfq.deliveryCountry,
    status: 'negotiation',
  });
  if (!dealRes.success || !dealRes.data) {
    throw new Error(dealRes.error?.message || 'Failed to create deal.');
  }
  const dealId = String(dealRes.data.id);

  // Award the RFQ via the real lifecycle endpoint.
  await apiClient.patch(`/rfqs/${rfq.id}/award`, {});

  await notificationDispatcher.dispatch({
    companyId: rfq.orgId,
    title: 'Negotiation Node Created',
    message: `Secure deal room ${dealId} is now active with ${quote.sellerName}.`,
    priority: 'medium',
    type: 'trade'
  });

  eventBus.publish('QUOTE_ACCEPTED', { rfqId: rfq.id, dealId });

  return dealId;
}

export async function closeRfq(id: string): Promise<RFQ> {
  const res = await apiClient.patch<any>(`/rfqs/${id}/close`, {});
  if (!res.success || !res.data) {
    throw new Error(res.error?.message || 'Failed to close RFQ.');
  }
  return mapRfqFromApi(res.data);
}

export interface RFQDiscoveryParams {
  search?: string;
  category?: string;
  country?: string;
  sortBy?: string;
}

export async function getMarketplaceRfqs(params: RFQDiscoveryParams): Promise<RFQ[]> {
  const res = await apiClient.get<any>('/rfqs', {
    status: 'open',
    commodity: params.search,
  });
  const items = res.data?.items ?? [];
  return items.map(mapRfqFromApi);
}

export async function submitQuote(data: any): Promise<RFQResponse> {
  const res = await apiClient.post<any>('/quotations', {
    rfqId: data.rfqId,
    sellerName: data.sellerName,
    price: Number(data.price) || 0,
    deliveryTime: data.deliveryTime,
    message: data.message,
    status: 'pending',
  });
  if (!res.success || !res.data) {
    throw new Error(res.error?.message || 'Failed to submit quote.');
  }

  const rfq = await getRfqById(data.rfqId);
  if (rfq) {
    await notificationDispatcher.dispatch({
      companyId: rfq.orgId,
      title: 'New Bid Received',
      message: `${data.sellerName} submitted a commercial proposal for ${rfq.title}.`,
      priority: 'medium',
      type: 'trade'
    });
  }

  return res.data;
}

export async function getMyResponses(): Promise<RFQResponse[]> {
  // "My" responses are the quotes submitted by the authenticated seller org. Resolve the
  // real org id from the session; if anonymous, return nothing rather than another tenant's quotes.
  const sellerId = await resolveSessionOrgId();
  if (!sellerId) return [];
  const res = await apiClient.get<any>('/quotations', { sellerId });
  return res.data?.items ?? [];
}

export const rfqService = {
  getRfqs,
  getRfqById,
  createRfq,
  getSellerResponses,
  acceptQuote,
  closeRfq,
  getMarketplaceRfqs,
  submitQuote,
  getMyResponses,
};
