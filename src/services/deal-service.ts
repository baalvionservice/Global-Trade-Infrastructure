
/**
 * @file deal-service.ts
 * @description Integrated Deal Room service layer utilizing the Sovereign Domain Model.
 * Hardened for multi-party negotiation and AI-assisted finalization.
 */
import { apiClient } from '@/lib/api-client';
import { TradeDeal, Message } from '@/types/institutional';
export type { Message } from '@/types/institutional';
import { logger, metricsService } from './observability-service';
import { eventBus } from './event-bus';
import { notificationDispatcher } from './notification-dispatcher';
import { aiNegotiationAssistant } from '@/ai/flows/ai-negotiation-assistant-flow';

/**
 * The trade-service Deal model is flat snake_case; the UI consumes a richer
 * camelCase shape. This adapter bridges them so the deal list/room render real
 * persisted deals (created when a buyer awards a quote).
 */
function mapDealFromApi(raw: any): TradeDeal {
  const qty = Number(raw?.quantity) || 0;
  const price = Number(raw?.unit_price) || 0;
  return {
    id: String(raw?.id),
    rfqId: raw?.rfq_id || '',
    buyerId: String(raw?.buyer_org_id ?? ''),
    sellerId: String(raw?.seller_org_id ?? ''),
    buyerOrgId: String(raw?.buyer_org_id ?? ''),
    sellerOrgId: String(raw?.seller_org_id ?? ''),
    buyerName: raw?.buyer_name || 'Buyer Institution',
    sellerName: raw?.seller_name || 'Seller Institution',
    product: raw?.commodity || '',
    productName: raw?.commodity || '',
    quantity: qty,
    currentQuantity: qty,
    price,
    currentPrice: price,
    totalValue: Number(raw?.total_value) || price * qty,
    currency: raw?.currency || 'USD',
    incoterm: raw?.incoterm || '',
    destination: raw?.destination || '',
    status: String(raw?.status || 'negotiation').toLowerCase() as any,
    lastMessage: raw?.last_message || 'Deal room initialized.', // surfaced from chat_messages via sendMessage
    createdAt: raw?.created_at || new Date().toISOString(),
    updatedAt: raw?.updated_at || new Date().toISOString(),
  } as TradeDeal;
}

class DealService {
  private static instance: DealService;

  private constructor() {}

  public static getInstance(): DealService {
    if (!DealService.instance) {
      DealService.instance = new DealService();
    }
    return DealService.instance;
  }

  /**
   * Retrieves active deal mandates.
   */
  async getDeals(): Promise<TradeDeal[]> {
    const res = await apiClient.get<any>('/deals');
    const items = res.data?.items ?? [];
    return items.map(mapDealFromApi);
  }

  /**
   * Resolves a single deal room with authoritative metadata.
   */
  async getDealById(id: string): Promise<TradeDeal | null> {
    const res = await apiClient.getDoc<any>('deals', id);
    return res.success && res.data ? mapDealFromApi(res.data) : null;
  }

  /**
   * Synchronizes the conversation stream for a deal node.
   */
  async getMessages(dealId: string): Promise<any[]> {
    const res = await apiClient.get<any>('/chat_messages', { dealId });
    return res.data?.items ?? [];
  }

  /**
   * Authorizes and sends a message to the negotiation ledger.
   */
  async sendMessage(dealId: string, sender: 'buyer' | 'seller', content: string, type: string = 'text'): Promise<any> {
    const res = await apiClient.post<any>('/chat_messages', { dealId, sender, content, type });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to send message.');
    }

    // Surface the latest line on the deal record for the registry list.
    await apiClient.patch(`/deals/${dealId}`, { last_message: content });

    return res.data;
  }

  /**
   * Injects AI Strategic Intelligence into the negotiation stream.
   */
  async getAIStrategy(dealId: string): Promise<any> {
    const deal = await this.getDealById(dealId);
    if (!deal) throw new Error('Deal session invalid.');

    logger.info('StrategyOracle', `ANALYZING_NEGOTIATION: ${dealId}`);

    const price = Number((deal as any).currentPrice ?? deal.price) || 0;
    let content: string;
    let metadata: any;
    try {
      const strategy = await aiNegotiationAssistant({
        dealId: deal.id,
        productName: deal.productName,
        currentPrice: price,
        targetPrice: price * 0.92,
        counterpartyTrustScore: 884,
        marketBaselinePrice: price * 0.95,
        negotiationHistory: "Initial proposal accepted. Counter-offer version 2 pending review."
      });
      content = `AI Strategy Insight: ${strategy.suggestedAction} recommended. Probabilistic Success Rate: ${Math.round(strategy.successProbability * 100)}%. Reasoning: ${strategy.reasoningTrace[0]}`;
      metadata = strategy;
    } catch {
      // Genkit may be unconfigured; persist a deterministic fallback insight.
      content = `AI Strategy Insight: HOLD recommended. Counterparty trust is high and the market baseline supports your position — request a volume commitment in exchange for a ~2% concession.`;
      metadata = { fallback: true };
    }

    const res = await apiClient.post<any>('/chat_messages', {
      dealId,
      sender: 'system',
      content,
      type: 'ai_strategy',
      metadata,
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to record AI strategy.');
    }

    metricsService.recordMetric('ai_negotiation_insights', 1);
    return res.data;
  }

  /**
   * Submits a structured commercial offer to the deal room.
   */
  async sendOffer(dealId: string, sender: 'buyer' | 'seller', offer: { price: number, quantity: number, terms: string }) {
    const res = await apiClient.post<any>('/chat_messages', {
      dealId,
      sender,
      type: 'offer',
      content: `New Proposal: ${offer.price} per unit for ${offer.quantity} units.`,
      offerData: { ...offer, status: 'pending' },
    });
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to send offer.');
    }

    // Persist the proposed terms onto the deal (snake_case columns).
    await apiClient.patch(`/deals/${dealId}`, {
      unit_price: offer.price,
      quantity: offer.quantity,
      last_message: `Offer: ${offer.price}/unit × ${offer.quantity}`,
    });

    eventBus.publish('QUOTE_ACCEPTED' as any, { dealId, proposalId: res.data.id });
    return res.data;
  }

  /**
   * Finalizes the commercial handshake and triggers the Order Provisioning sequence.
   */
  async finalizeDeal(dealId: string): Promise<{ orderId: string }> {
    const deal = await this.getDealById(dealId);
    if (!deal) throw new Error('Deal handshake node not found.');

    logger.warn('NegotiationCore', `FINALIZING_HANDSHAKE: ${dealId}`);

    // Finalize the deal via the real lifecycle endpoint (sets status=finalized + signed_at).
    await apiClient.patch(`/deals/${dealId}/finalize`, {});

    const qty = Number((deal as any).currentQuantity ?? deal.quantity) || 0;
    const price = Number((deal as any).currentPrice ?? deal.price) || 0;

    // Provision the order on the GTOS order-execution-service. The TOTAL is COMPUTED
    // server-side from `lines` (+ customs duty/tax + FX normalization) — we deliberately
    // send NO client total (R3 money-truth).
    const orderRes = await apiClient.post<any>('/orders', {
      deal_id: dealId,
      buyer_org_id: deal.buyerOrgId ?? deal.buyerId,
      seller_org_id: deal.sellerOrgId ?? deal.sellerId,
      lines: [{
        product_id: deal.productName ?? deal.product ?? (deal as any).commodity ?? 'COMMODITY',
        quantity: qty,
        unit_price: price,
        ...(((deal as any).hsCode) ? { hs_code: (deal as any).hsCode } : {}),
      }],
      currency: deal.currency,
    });
    if (!orderRes.success || !orderRes.data) {
      throw new Error(orderRes.error?.message || 'Failed to provision order.');
    }
    const order = orderRes.data;
    const orderId = String(order.id);

    // Escrow auto-provisioning belongs to the legacy settlement rails (int-keyed order_id) and
    // is being re-homed in the Bank wedge; it cannot accept the new UUID order. Best-effort so a
    // failure never blocks the money-true order placement.
    try {
      await apiClient.post('/escrows', {
        order_id: order.id,
        buyer_org_id: deal.buyerOrgId ?? deal.buyerId,
        seller_org_id: deal.sellerOrgId ?? deal.sellerId,
        amount: Number(order.total_value) || price * qty,
        currency: deal.currency,
        release_conditions: { type: 'MILESTONE_VERIFIED' },
      });
    } catch (e) {
      logger.warn('NegotiationCore', `Escrow auto-provision skipped (legacy rails; Bank-wedge follow-up): ${(e as Error).message}`);
    }

    await notificationDispatcher.dispatch({
      companyId: deal.buyerOrgId ?? deal.buyerId,
      title: 'Handshake Finalized',
      message: `Commercial terms for ${deal.productName ?? deal.product} locked. Provisioning Order ${orderId}.`,
      priority: 'high',
      type: 'trade'
    });

    eventBus.publish('ORDER_CONFIRMED' as any, order);
    metricsService.recordMetric('trade_finalizations_total', 1);

    return { orderId };
  }
}

export const dealService = DealService.getInstance();

export type Deal = TradeDeal;
export const getDeals = () => dealService.getDeals();

export interface OfferData {
  id: string;
  dealId?: string;
  from?: string;
  party?: string;
  price?: number;
  amount?: number;
  currency?: string;
  terms?: string;
  status?: string;
  timestamp?: string;
  [key: string]: any;
}
