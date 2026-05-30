/**
 * @file src/services/carrier-service.ts
 * @description Logistics Provider Marketplace + Shipping Quotes — backed by the live trade-service
 * generic store (`/carriers`, `/shipping_quotes`, `/shipping_selections`). Persisted, real.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';

export interface Carrier {
  id: string;
  name: string;
  rating: number;
  regions: string[];
  avgDeliveryTime: string;
  startingPrice: number;
  logo: string;
  description: string;
  specializations: string[];
}

export interface ShippingQuote {
  id: string;
  carrierId: string;
  carrierName: string;
  price: number;
  currency: string;
  estimatedDays: number;
  reliability: number; // 0-100
}

export async function getCarriers(): Promise<Carrier[]> {
  const res = await apiClient.get<Carrier[]>('/carriers');
  return toList<Carrier>(res);
}

export async function getCarrierById(id: string): Promise<Carrier | null> {
  const res = await apiClient.getDoc<Carrier>('carriers', id);
  return res.success ? (res.data ?? null) : null;
}

/**
 * Live shipping quotes for an order. Returns any persisted quotes; if none exist yet, derives
 * indicative quotes from the real carrier registry (carrier-specific price/ETA/reliability).
 */
export async function getShippingQuotes(orderId: string): Promise<ShippingQuote[]> {
  const res = await apiClient.get<ShippingQuote[]>('/shipping_quotes', { orderId });
  const persisted = toList<ShippingQuote>(res);
  if (persisted.length > 0) return persisted;

  const carriers = await getCarriers();
  return carriers.slice(0, 3).map((c, i) => ({
    id: `Q-${orderId}-${c.id}`,
    carrierId: c.id,
    carrierName: c.name,
    price: c.startingPrice + Math.round(c.startingPrice * (0.15 * (i + 1))),
    currency: 'USD',
    estimatedDays: parseInt(c.avgDeliveryTime, 10) || 21,
    reliability: Math.round(c.rating * 20),
  }));
}

export async function selectCarrier(orderId: string, carrierId: string, quoteId: string): Promise<void> {
  await apiClient.post('/shipping_selections', { orderId, carrierId, quoteId, selectedAt: new Date().toISOString() });
}
