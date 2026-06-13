/**
 * @file app/api/trades/[id]/route.ts
 * @description Retrieve the full trade graph for a single trade id.
 */
import { tradeService } from '@/server/services/trade-service';
import { ok, fail, toErrorResponse, authorizeTradeAccess } from '@/server/http/api';

export const runtime = 'nodejs';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await authorizeTradeAccess(req, id);
    const graph = await tradeService.getTrade(id);
    if (!graph) return fail(404, `TradeTransaction_NOT_FOUND: ${id}`);
    return ok(graph);
  } catch (err) {
    return toErrorResponse(err);
  }
}
