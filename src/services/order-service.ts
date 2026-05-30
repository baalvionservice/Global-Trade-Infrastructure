/**
 * @file order-service.ts
 * @description Institutional Order Execution service using the Sovereign Trade Domain Model.
 */
import { apiClient } from '@/lib/api-client';
import { TradeOrder, LifecycleStatus } from '@/types/institutional';
import { eventBus } from './event-bus';
import { logger } from './observability-service';
import { documentService } from './document-service';

/**
 * The trade-service Order model is flat snake_case; the UI consumes camelCase
 * TradeOrder. This adapter bridges them (status/fulfillment uppercased to match
 * the UI's LifecycleStatus convention).
 */
function mapOrderFromApi(raw: any): TradeOrder {
  const qty = Number(raw?.quantity) || 0;
  const price = Number(raw?.price) || 0;
  return {
    id: String(raw?.id),
    dealId: raw?.deal_id || '',
    buyerId: String(raw?.buyer_org_id ?? ''),
    sellerId: String(raw?.seller_org_id ?? ''),
    product: raw?.product || '',
    quantity: qty,
    price,
    totalValue: Number(raw?.total_value) || price * qty,
    currency: raw?.currency || 'USD',
    status: String(raw?.status || 'pending').toUpperCase() as any,
    fulfillmentState: String(raw?.fulfillment_state || 'pending').toUpperCase() as any,
    logisticsId: raw?.logistics_id || undefined,
    createdAt: raw?.created_at || new Date().toISOString(),
    updatedAt: raw?.updated_at || new Date().toISOString(),
  } as TradeOrder;
}

class OrderService {
  private static instance: OrderService;

  private constructor() {}

  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  async getOrders(params: any = {}): Promise<TradeOrder[]> {
    const res = await apiClient.get<any>('/orders', params);
    const items = res.data?.items ?? [];
    return items.map(mapOrderFromApi);
  }

  async getOrderById(id: string): Promise<TradeOrder | null> {
    const res = await apiClient.getDoc<any>('orders', id);
    return res.success && res.data ? mapOrderFromApi(res.data) : null;
  }

  async updateOrderStatus(orderId: string, status: LifecycleStatus): Promise<TradeOrder> {
    logger.info('OrderService', `TRANSITIONING_ORDER: ${orderId} to ${status}`);

    const res = await apiClient.patch<any>(`/orders/${orderId}/status`, {
      status: String(status).toLowerCase(),
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to update order status.');
    }

    const order = mapOrderFromApi(res.data);

    if (String(status).toUpperCase() === 'CONFIRMED') {
      eventBus.publish('ORDER_CONFIRMED', order);
    }

    return order;
  }

  async getOrderDocuments(orderId: string): Promise<any[]> {
    // Documents are keyed by entity_id in the real registry.
    return documentService.getDossier(orderId);
  }
}

export const orderService = OrderService.getInstance();

// Legacy Wrapper Exports
export const getOrders = (p?: any) => orderService.getOrders(p);
export const getOrderById = (id: string) => orderService.getOrderById(id);
export const updateOrderStatus = (id: string, s: any) => orderService.updateOrderStatus(id, s);
export const getOrderDocuments = (id: string) => orderService.getOrderDocuments(id);

export type Order = TradeOrder;
export type OrderStatus = TradeOrder['status'];
export interface OrderDocument {
  id: string;
  name?: string;
  type?: string;
  url?: string;
  status?: string;
  uploadedAt?: string;
  [key: string]: any;
}
