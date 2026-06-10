/**
 * @file app/api/trades/[id]/audit/route.ts
 * @description Paginated audit trail for a trade.
 */
import { tradeService } from '@/server/services/trade-service';
import { ok, toErrorResponse, parsePagination, authorizeTradeAccess } from '@/server/http/api';

export const runtime = 'nodejs';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await authorizeTradeAccess(req, id);
    const { page, pageSize } = parsePagination(new URL(req.url));
    const result = await tradeService.getAudit(id, { page, pageSize });
    return ok(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}
