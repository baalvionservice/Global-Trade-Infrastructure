/**
 * @file app/api/finance/[requestId]/decision/route.ts
 * @description Approve or reject a financing request.
 */
import { tradeFinanceService } from '@/server/finance/trade-finance-service';
import { financingRequestRepository } from '@/server/repositories';
import {
  principalFrom,
  ok,
  fail,
  toErrorResponse,
  financeDecisionSchema,
  rateLimit,
  clientKey,
} from '@/server/http/api';
import { NotFoundError } from '@/server/db/errors';
import { USER_ROLES } from '@/core/roles';

export const runtime = 'nodejs';

// Server-side function-level authorization: only these roles may approve/reject
// financing instruments (authz C-4). The client UI is not the security boundary.
const FINANCE_APPROVER_ROLES = new Set<string>([
  USER_ROLES.FINANCE_DIRECTOR,
  USER_ROLES.BANK_ADMIN,
  USER_ROLES.ORG_OWNER,
  USER_ROLES.EXECUTIVE_DIRECTOR,
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.PLATFORM_ADMIN,
]);

export async function POST(req: Request, ctx: { params: Promise<{ requestId: string }> }) {
  try {
    const principal = principalFrom(req);
    rateLimit(clientKey(principal, 'finance-decision'), 60, 60_000);
    if (!FINANCE_APPROVER_ROLES.has(String(principal.actorRole))) {
      return fail(403, 'Insufficient role to decide financing requests');
    }
    const { requestId } = await ctx.params;

    // Object-level authorization: the request must belong to the caller's tenant.
    // NotFound (not Forbidden) so existence is never leaked across tenants.
    const request = await financingRequestRepository.findById(requestId);
    if (!request || request.organizationId !== principal.organizationId) {
      throw new NotFoundError('FinancingRequest', requestId);
    }

    const body = financeDecisionSchema.parse(await req.json());
    const result = await tradeFinanceService.decideFinancing({
      requestId,
      decision: body.decision,
      reason: body.reason,
      provider: body.provider,
      actorId: principal.actorId,
      actorRole: principal.actorRole,
    });
    return ok(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}
