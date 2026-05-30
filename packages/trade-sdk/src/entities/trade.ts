import { z } from 'zod';

export const TradeStatusSchema = z.enum([
  'DRAFT', 'OPEN', 'NEGOTIATION', 'AWARDED', 'LOCKED', 'IN_TRANSIT', 'DELIVERED', 'SETTLED', 'CANCELLED'
]);

export type TradeStatus = z.infer<typeof TradeStatusSchema>;

export const TradeMandateSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string(),
  buyerId: z.string(),
  sellerId: z.string(),
  productName: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  totalValue: z.number(),
  currency: z.string().default('USD'),
  status: TradeStatusSchema,
  version: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type TradeMandate = z.infer<typeof TradeMandateSchema>;