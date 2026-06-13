/**
 * @file app/api/trades/[id]/cancel/route.ts
 * @description Cancel a trade and compensate committed side-effects.
 */
import { tradeService } from '@/server/services/trade-service';
import { ok, toErrorResponse, cancelSchema, authorizeTradeAccess } from '@/server/http/api';

export const runtime = 'nodejs';

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const principal = await authorizeTradeAccess(req, id);
    const body = cancelSchema.parse(await req.json().catch(() => ({})));
    const graph = await tradeService.cancelTrade(
      id,
      { actorId: principal.actorId, actorRole: principal.actorRole },
      body.reason,
    );
    return ok(graph);
  } catch (err) {
    return toErrorResponse(err);
  }
}
