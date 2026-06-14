/**
 * @file order-service.ts
 * @description Institutional Order Execution service — now backed by the GTOS
 * order-execution-service (schema `oms`, UUID-keyed, money-truth + forward-only saga).
 *
 * Contract shift (R3 cutover):
 *   - Orders carry a server-computed money breakdown: lines[] + subtotal + duty/tax +
 *     total_value + base_currency_amount + fx_rate_used. Totals are NEVER client-supplied.
 *   - Lifecycle is a forward-only saga (draft→placed→payment_confirmed→in_fulfillment→
 *     shipped→delivered→closed). There is no PATCH /status; the only client-driven action is
 *     POST /orders/:id/confirm-payment, which emits a payment intent the finance suite consumes.
 */
import { apiClient } from '@/lib/api-client';
import { TradeOrder, LifecycleStatus } from '@/types/institutional';
import { eventBus } from './event-bus';
import { logger } from './observability-service';
import { documentService } from './document-service';

/** A single order line on the GTOS order model. */
export interface OrderLine {
  product_id: string;
  sku?: string;
  hs_code?: string;
  quantity: number;
  unit_price: number;
}

/** Consumer gateway checkout (alongside the escrow/saga settlement rail). */
export type GatewaySlug = 'razorpay' | 'stripe' | 'payu' | 'bank';

export interface RazorpayVerification {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/** Provider-public params returned by POST /orders/:id/payment-intent. */
export interface GatewayIntent {
  intentId: string;
  status: string;
  keyId?: string;            // Razorpay key_id (open the popup)
  amount?: number;           // minor units
  currency?: string;
  instructions?: string;     // bank transfer wire instructions
  redirectUrl?: string;      // Stripe hosted Checkout
  clientSecret?: string;
  publishableKey?: string;
  formPost?: { action: string; fields: Record<string, string> }; // PayU
}

/**
 * Map the GTOS saga status (+ payment_status) to the canonical lowercase LifecycleStatus the
 * UI timeline/detail expect. A `placed` order whose payment intent is in-flight reads as
 * `confirmed` (terms locked, funds pending) so the "authorize escrow" step surfaces correctly.
 */
function mapStatus(rawStatus: string, paymentStatus: string): LifecycleStatus {
  const s = String(rawStatus || '').toLowerCase();
  const pay = String(paymentStatus || '').toLowerCase();
  if (s === 'cancelled') return 'cancelled' as LifecycleStatus;
  if (s === 'delivered' || s === 'closed') return 'delivered' as LifecycleStatus;
  if (s === 'shipped') return 'shipped' as LifecycleStatus;
  if (s === 'in_fulfillment') return 'processing' as LifecycleStatus;
  if (s === 'payment_confirmed') return 'confirmed' as LifecycleStatus;
  if (s === 'placed' || s === 'draft') {
    return (pay === 'pending' || pay === 'confirmed') ? ('confirmed' as LifecycleStatus) : ('pending' as LifecycleStatus);
  }
  return 'pending' as LifecycleStatus;
}

/**
 * Bridge the GTOS order row (UUID, lines[] JSONB, money breakdown) to the UI's TradeOrder.
 * Product/quantity/unit price are derived from lines for display; the authoritative money is
 * total_value (order currency) + base_currency_amount (normalized).
 */
function mapOrderFromApi(raw: any): TradeOrder {
  const lines: OrderLine[] = Array.isArray(raw?.lines) ? raw.lines : [];
  const totalQty = lines.reduce((s, l) => s + (Number(l.quantity) || 0), 0);
  const firstLine = lines[0];
  const totalValue = Number(raw?.total_value) || 0;

  return {
    id: String(raw?.id),
    dealId: raw?.deal_id || '',
    buyerId: String(raw?.buyer_org_id ?? ''),
    sellerId: String(raw?.seller_org_id ?? ''),
    // Display fields derived from lines; a multi-line order shows a roll-up label.
    product: firstLine?.product_id
      ? (lines.length > 1 ? `${firstLine.product_id} +${lines.length - 1} more` : String(firstLine.product_id))
      : `${lines.length} line item(s)`,
    quantity: totalQty,
    price: Number(firstLine?.unit_price) || 0,
    totalValue,
    currency: raw?.currency || 'USD',
    status: mapStatus(raw?.status, raw?.payment_status),
    fulfillmentState: 'PENDING',
    logisticsId: raw?.logistics_id || undefined,
    createdAt: raw?.created_at || new Date().toISOString(),
    updatedAt: raw?.updated_at || new Date().toISOString(),
    // Extra fields the detail/list surfaces read (kept off the strict type via cast).
    total: totalValue,
    paymentStatus: String(raw?.payment_status || 'unpaid'),
    baseCurrency: raw?.base_currency || 'USD',
    baseCurrencyAmount: Number(raw?.base_currency_amount) || totalValue,
    fxRateUsed: Number(raw?.fx_rate_used) || 1,
    subtotal: Number(raw?.subtotal) || 0,
    dutyAmount: Number(raw?.duty_amount) || 0,
    taxAmount: Number(raw?.tax_amount) || 0,
    sellerName: String(raw?.seller_org_id ?? ''),
    buyerName: String(raw?.buyer_org_id ?? ''),
    lines,
  } as TradeOrder;
}

class OrderService {
  private static instance: OrderService;
  private constructor() {}
  public static getInstance(): OrderService {
    if (!OrderService.instance) OrderService.instance = new OrderService();
    return OrderService.instance;
  }

  async getOrders(params: any = {}): Promise<TradeOrder[]> {
    const res = await apiClient.get<any>('/orders', params);
    const items = res.data?.items ?? res.data ?? [];
    return (Array.isArray(items) ? items : []).map(mapOrderFromApi);
  }

  async getOrderById(id: string): Promise<TradeOrder | null> {
    const res = await apiClient.getDoc<any>('orders', id);
    return res.success && res.data ? mapOrderFromApi(res.data) : null;
  }

  /**
   * Create a money-true order on the GTOS service. The total is COMPUTED server-side from
   * `lines` (+ duty/tax + FX); any total passed here is ignored by the backend.
   */
  async createOrder(input: {
    deal_id?: string;
    buyer_org_id?: string;
    seller_org_id?: string;
    lines: OrderLine[];
    currency?: string;
    destination_country?: string;
  }): Promise<TradeOrder> {
    const res = await apiClient.post<any>('/orders', {
      deal_id: input.deal_id,
      buyer_org_id: input.buyer_org_id,
      seller_org_id: input.seller_org_id,
      lines: input.lines,
      currency: input.currency || 'USD',
      ...(input.destination_country ? { destination_country: input.destination_country } : {}),
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to provision order.');
    }
    return mapOrderFromApi(res.data);
  }

  /**
   * Forward-only lifecycle: the only client-driven transition is confirming payment, which
   * emits a payment intent into the saga. (Fulfillment/shipment transitions arrive as events
   * from the logistics/finance services, not a client PATCH.)
   */
  async updateOrderStatus(orderId: string, status: LifecycleStatus): Promise<TradeOrder> {
    const target = String(status).toLowerCase();
    if (target !== 'confirmed') {
      throw new Error(`Transition to "${status}" is saga-driven and not client-initiated.`);
    }
    logger.info('OrderService', `CONFIRM_PAYMENT: ${orderId}`);
    const res = await apiClient.post<any>(`/orders/${orderId}/confirm-payment`, {});
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to confirm order payment.');
    }
    const order = mapOrderFromApi(res.data);
    eventBus.publish('ORDER_CONFIRMED', order);
    return order;
  }

  /**
   * Consumer gateway checkout — create a payment intent for THIS order on the chosen gateway.
   * Returns the provider-public params the page acts on (Razorpay key+orderId; Stripe redirectUrl;
   * PayU signed formPost; bank instructions). Distinct from confirm-payment (the escrow/saga rail).
   */
  async createPaymentIntent(orderId: string, gateway: GatewaySlug): Promise<GatewayIntent> {
    const res = await apiClient.post<GatewayIntent>(`/orders/${orderId}/payment-intent`, { gateway });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Could not start the payment.');
    }
    return res.data;
  }

  /**
   * Provider-authoritative capture. For Razorpay the page passes the signed handler triple; the
   * backend verifies the HMAC and only then marks the order paid. Returns the updated order.
   */
  async capturePayment(
    orderId: string,
    intentId: string,
    gateway: GatewaySlug,
    verification?: RazorpayVerification,
  ): Promise<TradeOrder> {
    const res = await apiClient.post<any>(`/orders/${orderId}/payment-capture`, {
      intentId,
      gateway,
      ...(verification ? { verification } : {}),
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Payment could not be confirmed.');
    }
    const order = mapOrderFromApi(res.data);
    if (order.paymentStatus === 'confirmed') eventBus.publish('ORDER_CONFIRMED', order);
    return order;
  }

  async getOrderDocuments(orderId: string): Promise<any[]> {
    return documentService.getDossier(orderId);
  }
}

export const orderService = OrderService.getInstance();

// Legacy Wrapper Exports
export const getOrders = (p?: any) => orderService.getOrders(p);
export const getOrderById = (id: string) => orderService.getOrderById(id);
export const updateOrderStatus = (id: string, s: any) => orderService.updateOrderStatus(id, s);
export const getOrderDocuments = (id: string) => orderService.getOrderDocuments(id);
export const createOrder = (input: Parameters<OrderService['createOrder']>[0]) => orderService.createOrder(input);
export const createPaymentIntent = (orderId: string, gateway: GatewaySlug) => orderService.createPaymentIntent(orderId, gateway);
export const capturePayment = (orderId: string, intentId: string, gateway: GatewaySlug, v?: RazorpayVerification) => orderService.capturePayment(orderId, intentId, gateway, v);

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
