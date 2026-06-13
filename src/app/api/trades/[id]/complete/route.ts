/**
 * @file app/api/trades/[id]/complete/route.ts
 * @description Release settlement and drive the trade to TRADE_COMPLETED.
 */
import { tradeService } from '@/server/services/trade-service';
import { ok, toErrorResponse, authorizeTradeAccess } from '@/server/http/api';

export const runtime = 'nodejs';

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const principal = await authorizeTradeAccess(req, id);
    const graph = await tradeService.completeTrade(id, {
      actorId: principal.actorId,
      actorRole: principal.actorRole,
    });
    return ok(graph);
  } catch (err) {
    return toErrorResponse(err);
  }
}
