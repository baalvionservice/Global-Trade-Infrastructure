/**
 * @file app/api/trades/[id]/workflow/route.ts
 * @description Persisted workflow state + transition/compensation history.
 */
import { tradeService } from '@/server/services/trade-service';
import { ok, toErrorResponse, authorizeTradeAccess } from '@/server/http/api';

export const runtime = 'nodejs';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await authorizeTradeAccess(req, id);
    const workflow = await tradeService.getWorkflow(id);
    return ok(workflow);
  } catch (err) {
    return toErrorResponse(err);
  }
}
