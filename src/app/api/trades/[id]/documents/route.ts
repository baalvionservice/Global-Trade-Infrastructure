/**
 * @file app/api/trades/[id]/documents/route.ts
 * @description List and attach versioned trade documents.
 */
import { documentService } from '@/server/documents/document-service';
import { ok, toErrorResponse, addDocumentSchema, rateLimit, clientKey, authorizeTradeAccess } from '@/server/http/api';

export const runtime = 'nodejs';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await authorizeTradeAccess(req, id);
    return ok(await documentService.listForTrade(id));
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const principal = await authorizeTradeAccess(req, id);
    rateLimit(clientKey(principal, 'documents'), 60, 60_000);
    const body = addDocumentSchema.parse(await req.json());
    const doc = await documentService.addDocument({
      tradeId: id,
      kind: body.kind,
      entityType: body.entityType,
      entityId: body.entityId,
      url: body.url,
      hash: body.hash,
      metadata: body.metadata,
      actorId: principal.actorId,
      actorRole: principal.actorRole,
    });
    return ok(doc, 201);
  } catch (err) {
    return toErrorResponse(err);
  }
}
