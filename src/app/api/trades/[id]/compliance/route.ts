/**
 * @file app/api/trades/[id]/compliance/route.ts
 * @description Risk assessments and compliance checks recorded for a trade.
 */
import { riskAssessmentRepository, complianceCheckRepository } from '@/server/repositories';
import { tradeService } from '@/server/services/trade-service';
import { ok, toErrorResponse, authorizeTradeAccess } from '@/server/http/api';

export const runtime = 'nodejs';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await authorizeTradeAccess(req, id);
    const [risk, compliance] = await Promise.all([
      riskAssessmentRepository.listByTrade(id),
      complianceCheckRepository.listByTrade(id),
    ]);
    return ok({ risk, compliance });
  } catch (err) {
    return toErrorResponse(err);
  }
}
