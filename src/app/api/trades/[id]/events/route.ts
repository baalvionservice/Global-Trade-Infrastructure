/**
 * @file app/api/trades/[id]/events/route.ts
 * @description Persisted domain-event history for a trade (oldest first).
 */
import { tradeService } from '@/server/services/trade-service';
import { ok, toErrorResponse, authorizeTradeAccess } from '@/server/http/api';

export const runtime = 'nodejs';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await authorizeTradeAccess(req, id);
    const events = await tradeService.getEvents(id);
    return ok(events);
  } catch (err) {
    return toErrorResponse(err);
  }
}
