/**
 * @file app/api/trades/route.ts
 * @description Collection endpoints: create a trade, list trades.
 */
import { tradeService } from '@/server/services/trade-service';
import {
  principalFrom,
  ok,
  toErrorResponse,
  parsePagination,
  createTradeSchema,
} from '@/server/http/api';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // Identity AND tenant come solely from the verified principal (CR-1/CR-3).
    const principal = principalFrom(req);
    const body = createTradeSchema.parse(await req.json());
    const organizationId = await tradeService.ensureOrganization({
      id: principal.organizationId,
      name: 'Baalvion Tenant',
      slug: `tenant-${principal.organizationId}`,
    });
    const graph = await tradeService.createTrade({
      organizationId,
      actor: { actorId: principal.actorId, actorRole: principal.actorRole },
      terms: body.terms,
      buyer: body.buyer,
      supplier: body.supplier,
      reference: body.reference,
      correlationId: body.correlationId,
      metadata: body.metadata,
    });
    return ok(graph, 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function GET(req: Request) {
  try {
    // Authentication is mandatory and the tenant filter is forced to the
    // principal's organization — a client cannot widen or omit it (CR-3).
    const principal = principalFrom(req);
    const url = new URL(req.url);
    const { page, pageSize } = parsePagination(url);
    const where: Record<string, unknown> = { organizationId: principal.organizationId };
    const state = url.searchParams.get('state');
    if (state) where.currentState = state;
    const result = await tradeService.listTrades({ page, pageSize, where });
    return ok(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}
