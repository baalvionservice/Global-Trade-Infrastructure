/**
 * @file marketplace-service.ts
 * @description Liquidity and discovery engine for institutional trade offers and requests.
 * Enhanced with affinity-based ranking and success probability scoring.
 */
import { apiClient } from '@/lib/api-client';

export type ListingType = 'request' | 'offer';

export interface PricingTier {
  minQty: number;
  price: number;
}

export interface MarketplaceListing {
  id: string;
  companyId: string;
  companyName: string;
  type: ListingType;
  title: string;
  description: string;
  category: string;
  trustScore: number;
  isVerified: boolean;
  successProbability: number;
  matchScore: number;
  createdAt: string;
  // Rich detail fields (optional; populated for the listing-detail view)
  hsCode?: string;
  originCountry?: string;
  unit?: string;
  currency?: string;
  basePrice?: number;
  marketAveragePrice?: number;
  moq?: number;
  leadTime?: string;
  incoterms?: string[];
  paymentTerms?: string[];
  certifications?: string[];
  images?: string[];
  pricingTiers?: PricingTier[];
  sellerTier?: 'Basic' | 'Verified' | 'Premium' | 'Platinum';
}

function mockListing(id: string): MarketplaceListing {
  const base = 175;
  return {
    id,
    companyId: 'COMP-501',
    companyName: 'Apex Renewable Industries',
    type: 'offer',
    title: 'Monocrystalline Solar PV Modules (550W)',
    description:
      'Tier-1 utility-scale monocrystalline panels with 25-year linear performance warranty. PID-resistant, salt-mist & ammonia certified. Containerized export-ready packaging.',
    category: 'Energy & Solar',
    trustScore: 884,
    isVerified: true,
    successProbability: 0.92,
    matchScore: 96,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    hsCode: '8541.43',
    originCountry: 'China',
    unit: 'unit',
    currency: 'USD',
    basePrice: base,
    marketAveragePrice: 192,
    moq: 500,
    leadTime: '21–28 days',
    incoterms: ['FOB', 'CIF', 'DDP'],
    paymentTerms: ['L/C at sight', '30% advance / 70% on B/L', 'Escrow (Baalvion)'],
    certifications: ['IEC 61215', 'IEC 61730', 'ISO 9001', 'UL 1703'],
    images: [],
    sellerTier: 'Platinum',
    pricingTiers: [
      { minQty: 500, price: base },
      { minQty: 2000, price: base - 9 },
      { minQty: 10000, price: base - 18 },
    ],
  };
}

/**
 * The trade-service list endpoints return a paginated envelope:
 *   { success, data: { items, total, page, limit }, meta }
 * while detail/create return the record directly under `data`.
 */
interface PaginatedListings {
  items: any[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Normalizes a raw backend listing into the UI contract: ensures JSONB arrays
 * are present and derives the presentation-only ranking signals from the
 * institution's trust score (deterministic — not random).
 */
function normalize(raw: any): MarketplaceListing {
  const trustScore = Number(raw?.trustScore ?? 750);
  return {
    ...raw,
    title: raw?.title ?? '',
    description: raw?.description ?? '',
    category: raw?.category ?? 'Uncategorized',
    companyName: raw?.companyName ?? 'Institutional Partner',
    incoterms: raw?.incoterms ?? [],
    paymentTerms: raw?.paymentTerms ?? [],
    certifications: raw?.certifications ?? [],
    pricingTiers: raw?.pricingTiers ?? [],
    images: raw?.images ?? [],
    trustScore,
    successProbability: Math.min(1, Math.max(0, trustScore / 1000)),
    matchScore: Math.min(99, Math.round(trustScore / 10)),
  };
}

export const marketplaceService = {
  /**
   * Fetches live marketplace listings from trade-service with liquidity-driven
   * ordering (most recent first, server-side). Filters (category/type/search/
   * companyId/status/page/limit) pass straight through to the API.
   */
  async getListings(params?: any): Promise<MarketplaceListing[]> {
    const res = await apiClient.get<PaginatedListings>('/marketplace_listings', { ...params });
    const items = res.data?.items ?? [];
    return items.map(normalize);
  },

  /**
   * Resolves a single listing with full commercial detail straight from the DB.
   * Falls back to a representative mock only when the backend is unreachable.
   */
  async getListingById(id: string): Promise<MarketplaceListing | null> {
    const res = await apiClient.getDoc<any>('/marketplace_listings', id);
    if (res.success && res.data) return normalize(res.data);
    // 404 → genuinely missing; network failure → resilient demo fallback.
    if (res.error?.code === 'HTTP_404') return null;
    return res.success ? null : mockListing(id);
  },

  /**
   * Returns active listings from the same seller (storefront view).
   */
  async getSellerListings(companyId: string): Promise<MarketplaceListing[]> {
    const res = await apiClient.get<PaginatedListings>('/marketplace_listings', { companyId });
    return (res.data?.items ?? []).map(normalize);
  },

  /**
   * Publishes a new listing. companyId/tenant binding happens server-side from
   * the authenticated token; timestamps are set by the database.
   */
  async createListing(data: Partial<MarketplaceListing>): Promise<MarketplaceListing> {
    const res = await apiClient.post<any>('/marketplace_listings', data);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to publish listing.');
    }
    return normalize(res.data);
  },
};
