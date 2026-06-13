/**
 * @file app/api/trades/[id]/finance/route.ts
 * @description Request trade finance for a trade, and list its finance records.
 */
import { FinanceInstrumentType } from '@prisma/client';
import { tradeFinanceService } from '@/server/finance/trade-finance-service';
import { tradeService } from '@/server/services/trade-service';
import {
  ok,
  toErrorResponse,
  requestFinancingSchema,
  rateLimit,
  clientKey,
  authorizeTradeAccess,
} from '@/server/http/api';

export const runtime = 'nodejs';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await authorizeTradeAccess(req, id);
    return ok(await tradeFinanceService.listForTrade(id));
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const principal = await authorizeTradeAccess(req, id);
    rateLimit(clientKey(principal, 'finance'), 30, 60_000);
    const body = requestFinancingSchema.parse(await req.json());
    const request = await tradeFinanceService.requestFinancing({
      tradeId: id,
      type: body.type as FinanceInstrumentType,
      amount: body.amount,
      currency: body.currency,
      requestedBy: principal.actorId,
      requestedRole: principal.actorRole,
      terms: body.terms,
    });
    return ok(request, 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}
