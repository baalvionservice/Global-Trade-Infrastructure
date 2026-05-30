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

export async function getBuyerDashboardData(): Promise<BuyerDashboardData> {
  const [rfqsRes, ordersRes, shipmentsRes] = await Promise.all([
    apiClient.get<any[]>('/rfqs', { status: 'open' }),
    apiClient.get<any[]>('/orders'),
    apiClient.get<any[]>('/shipments', { status: 'in_transit' })
  ]);

  return {
    kpis: {
      activeRfqs: toList(rfqsRes).length,
      activeOrders: toList(ordersRes).length,
      pendingPayments: 4,
      shipmentsInTransit: toList(shipmentsRes).length,
    },
    activities: [
      { id: '1', type: 'RFQ', title: 'New RFQ response from Global Steel Ltd', timestamp: '10m ago' },
      { id: '2', type: 'ORDER', title: 'Order #ORD-992 confirmed by supplier', timestamp: '45m ago' },
      { id: '3', type: 'PAYMENT', title: 'Payment for #ORD-881 pending approval', timestamp: '2h ago' },
      { id: '4', type: 'LOGISTICS', title: 'Shipment #SHP-442 departed Singapore Port', timestamp: '4h ago' },
    ],
    tradeVolume: [
      { date: '2024-10-01', value: 450000 },
      { date: '2024-10-02', value: 520000 },
      { date: '2024-10-03', value: 480000 },
      { date: '2024-10-04', value: 610000 },
      { date: '2024-10-05', value: 590000 },
      { date: '2024-10-06', value: 720000 },
      { date: '2024-10-07', value: 680000 },
    ],
  };
}
