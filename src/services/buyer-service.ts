/**
 * @file src/services/buyer-service.ts
 * @description Institutional service layer for Buyer Operations.
 */
import { apiClient } from '@/lib/api-client';
import { toList } from '@/lib/api-list';

export interface DashboardKPIs {
  activeRfqs: number;
  activeOrders: number;
  pendingPayments: number;
  shipmentsInTransit: number;
}

export interface BuyerActivity {
  id: string;
  type: 'RFQ' | 'ORDER' | 'PAYMENT' | 'LOGISTICS';
  title: string;
  timestamp: string;
}

export interface TradeVolumePoint {
  date: string;
  value: number;
}

export interface BuyerDashboardData {
  kpis: DashboardKPIs;
  activities: BuyerActivity[];
  tradeVolume: TradeVolumePoint[];
}

/** Compact relative-time formatter ("12m ago", "3h ago", "2d ago"). */
function ago(ts: any): string {
  const t = new Date(ts ?? Date.now()).getTime();
  if (!Number.isFinite(t)) return 'recently';
  const s = Math.max(1, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}
const money = (n: any, cur = 'USD') => {
  const v = Number(n ?? 0);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur || 'USD', maximumFractionDigits: 0, notation: v >= 1_000_000 ? 'compact' : 'standard' }).format(v);
};
const tsOf = (x: any) => new Date(x?.createdAt ?? x?.updatedAt ?? x?.created_at ?? Date.now()).getTime();

export async function getBuyerDashboardData(): Promise<BuyerDashboardData> {
  const [rfqsRes, ordersRes, shipmentsRes, paymentsRes, transitRes] = await Promise.all([
    apiClient.get<any[]>('/rfqs', { status: 'open' }),
    apiClient.get<any[]>('/orders'),
    apiClient.get<any[]>('/shipments', { status: 'in_transit' }),
    apiClient.get<any[]>('/payments'),
    apiClient.get<any[]>('/shipments'),
  ]);
  const norm = (v: any) => String(v ?? '').toLowerCase();
  const rfqs = toList<any>(rfqsRes);
  const orders = toList<any>(ordersRes);
  const payments = toList<any>(paymentsRes);
  const shipments = toList<any>(transitRes);
  const pendingPayments = payments.filter((p) => ['pending', 'processing', 'awaiting'].includes(norm(p.status))).length;

  // Build a real, time-ordered activity feed from the freshest records across domains.
  const feed: (BuyerActivity & { _t: number })[] = [
    ...rfqs.map((r) => ({ id: `rfq-${r.id}`, type: 'RFQ' as const, title: `RFQ opened · ${r.title || r.product_name || r.commodity || 'New tender'}`, timestamp: ago(r.createdAt), _t: tsOf(r) })),
    ...orders.map((o) => ({ id: `ord-${o.id}`, type: 'ORDER' as const, title: `Order #${o.id} ${String(o.status || 'placed')} · ${money(o.total_value ?? o.total_amount ?? o.amount, o.currency)}`, timestamp: ago(o.createdAt), _t: tsOf(o) })),
    ...payments.map((p) => ({ id: `pay-${p.id}`, type: 'PAYMENT' as const, title: `Payment ${String(p.status || 'initiated')} · ${money(p.amount, p.currency)} (${String(p.method || 'wire').replace(/_/g, ' ')})`, timestamp: ago(p.createdAt), _t: tsOf(p) })),
    ...shipments.map((s) => ({ id: `shp-${s.id}`, type: 'LOGISTICS' as const, title: `Shipment ${s.tracking_number || `#${s.id}`} ${String(s.status || 'booked').replace(/_/g, ' ')} · ${s.origin || '—'} → ${s.destination || '—'}`, timestamp: ago(s.createdAt), _t: tsOf(s) })),
  ];
  const activities: BuyerActivity[] = feed.sort((a, b) => b._t - a._t).slice(0, 6).map(({ _t, ...a }) => a);

  return {
    kpis: {
      activeRfqs: rfqs.length,
      activeOrders: orders.length,
      pendingPayments,
      shipmentsInTransit: toList(shipmentsRes).length,
    },
    activities,
    tradeVolume: [],
  };
}
