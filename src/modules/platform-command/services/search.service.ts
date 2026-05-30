
/**
 * @file search.service.ts
 * @description Universal Search Engine for the Baalvion OS.
 * Aggregates results across all institutional registries.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';
import { GlobalSearchResult, SearchResultCategory } from '../types';
import { PATHS } from '@/lib/paths';

class UniversalSearchService {
  private static instance: UniversalSearchService;

  private constructor() {}

  public static getInstance(): UniversalSearchService {
    if (!UniversalSearchService.instance) {
      UniversalSearchService.instance = new UniversalSearchService();
    }
    return UniversalSearchService.instance;
  }

  /**
   * Executes a cross-domain search across the platform's SSOT.
   */
  async search(query: string): Promise<GlobalSearchResult[]> {
    if (!query || query.length < 2) return [];

    const normalizedQuery = query.toLowerCase();
    const results: GlobalSearchResult[] = [];

    // Real cross-domain search across live trade-service registries (server-side substring
    // search supported by the generic store; typed resources fall back to client filtering).
    const [rfqsRes, orgsRes, shipmentsRes, escrowsRes] = await Promise.all([
      apiClient.get<any[]>('/rfqs', { search: query }),
      apiClient.get<any[]>('/organizations', { search: query }),
      apiClient.get<any[]>('/shipments', { search: query }),
      apiClient.get<any[]>('/escrows', { search: query }),
    ]);

    // 1. Search SOURCING (RFQs)
    toList<any>(rfqsRes).forEach((r: any) => {
      if (String(r.productName ?? r.product_name ?? '').toLowerCase().includes(normalizedQuery) || String(r.id).toLowerCase().includes(normalizedQuery)) {
        results.push({
          id: r.id,
          type: 'RFQ',
          category: 'SOURCING',
          title: r.productName || r.title,
          subtitle: `Ref: ${r.id} • ${r.status}`,
          status: r.status,
          path: `${PATHS.BUYER_RFQS}/${r.id}`,
          relevance: 1.0
        });
      }
    });

    // 2. Search IDENTITY (Organizations)
    toList<any>(orgsRes).forEach((o: any) => {
      if (String(o.name ?? '').toLowerCase().includes(normalizedQuery) || String(o.code ?? o.id).toLowerCase().includes(normalizedQuery)) {
        results.push({
          id: o.id,
          type: 'Organization',
          category: 'IDENTITY',
          title: o.name,
          subtitle: `${o.country} • Trust Score: ${o.trustScore}`,
          path: `/company/${o.id}`,
          relevance: 0.9
        });
      }
    });

    // 3. Search EXECUTION (Shipments)
    toList<any>(shipmentsRes).forEach((s: any) => {
      if (String(s.id).toLowerCase().includes(normalizedQuery) || String(s.trackingNumber ?? s.tracking_number ?? '').toLowerCase().includes(normalizedQuery)) {
        results.push({
          id: s.id,
          type: 'Shipment',
          category: 'EXECUTION',
          title: `Shipment ${s.id}`,
          subtitle: `${s.origin} ↔ ${s.destination}`,
          status: s.status,
          path: `${PATHS.LOGISTICS_SHIPMENT}/${s.id}`,
          relevance: 0.8
        });
      }
    });

    // 4. Search FINANCIAL (Escrows)
    toList<any>(escrowsRes).forEach((e: any) => {
      if (String(e.id).toLowerCase().includes(normalizedQuery) || String(e.orderId ?? e.order_id ?? '').toLowerCase().includes(normalizedQuery)) {
        results.push({
          id: e.id,
          type: 'Escrow',
          category: 'FINANCIAL',
          title: `Escrow ${e.id}`,
          subtitle: `Amount: ${e.currency} ${e.amount.toLocaleString()}`,
          status: e.status,
          path: `${PATHS.ESCROW}/${e.id}`,
          relevance: 0.8
        });
      }
    });

    return results.sort((a, b) => b.relevance - a.relevance);
  }
}

export const searchService = UniversalSearchService.getInstance();
