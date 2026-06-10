/**
 * @file server/http/api.ts
 * @description HTTP helpers for the trade API — authorization hook, validation,
 * pagination parsing and consistent error → status mapping.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { NotFoundError, OptimisticLockError, ValidationError } from '../db/errors';
import type { ActorRef } from '../services/trade-service';
import { verifyIdentity, Principal, UnauthorizedError } from './identity';
import { tradeService } from '../services/trade-service';

export { UnauthorizedError };
export type { Principal };

export class RateLimitError extends Error {
  constructor(message = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

const rateBuckets = new Map<string, { count: number; reset: number }>();

/** Fixed-window in-memory rate limiter (per instance). Throws on overflow. */
export function rateLimit(key: string, limit: number, windowMs: number): void {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.reset < now) {
    rateBuckets.set(key, { count: 1, reset: now + windowMs });
    return;
  }
  bucket.count += 1;
  if (bucket.count > limit) throw new RateLimitError();
}

/** Rate-limit bucket key derived from the VERIFIED principal (never client headers). */
export function clientKey(principal: Principal, scope: string): string {
  return `${scope}:${principal.organizationId}:${principal.actorId}`;
}

/**
 * Verify and return the gateway-attested principal. The single trusted source
 * of identity AND tenant for every API route. Throws UnauthorizedError for
 * anonymous, forged, role-spoofed or expired requests (CR-1).
 */
export function principalFrom(req: Request): Principal {
  return verifyIdentity(req);
}

/** Back-compat actor shape, derived strictly from the verified principal. */
export function requireActor(req: Request): ActorRef {
  const p = verifyIdentity(req);
  return { actorId: p.actorId, actorRole: p.actorRole };
}

/** The caller's organization — derived ONLY from the verified principal (CR-2/CR-3). */
export function organizationFrom(req: Request): string {
  return verifyIdentity(req).organizationId;
}

/**
 * Authorize access to a specific trade: verify the principal, then enforce that
 * the trade belongs to the principal's organization. Tenant isolation is
 * mandatory here — it can no longer be skipped by omitting a header (CR-2).
 * Returns the verified principal for downstream use.
 */
export async function authorizeTradeAccess(req: Request, tradeId: string): Promise<Principal> {
  const principal = verifyIdentity(req);
  await tradeService.assertTenant(tradeId, principal.organizationId);
  return principal;
}

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data, error: null }, { status });
}

export function fail(status: number, message: string): NextResponse {
  return NextResponse.json({ success: false, data: null, error: message }, { status });
}

/** Map domain/validation errors to HTTP responses. */
export function toErrorResponse(err: unknown): NextResponse {
  if (err instanceof UnauthorizedError) return fail(401, err.message);
  if (err instanceof RateLimitError) return fail(429, err.message);
  if (err instanceof NotFoundError) return fail(404, err.message);
  if (err instanceof OptimisticLockError) return fail(409, err.message);
  if (err instanceof ValidationError) return fail(400, err.message);
  if (err instanceof z.ZodError) return fail(400, err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
  const message = err instanceof Error ? err.message : 'Internal error';
  return fail(500, message);
}

export interface Pagination {
  page: number;
  pageSize: number;
}

export function parsePagination(url: URL): Pagination {
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);
  const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get('pageSize') ?? '25') || 25));
  return { page, pageSize };
}

export const tradeTermsSchema = z.object({
  buyerId: z.string().min(1),
  sellerId: z.string().min(1).optional(),
  commodity: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  currency: z.string().min(3).max(3),
  incoterm: z.string().optional(),
  originCountry: z.string().optional(),
  destinationCountry: z.string().optional(),
});

// Note: organizationId/Name/Slug are intentionally NOT accepted from the client.
// The tenant is derived exclusively from the verified principal (CR-2/CR-3).
export const createTradeSchema = z.object({
  reference: z.string().min(1).optional(),
  correlationId: z.string().min(1).optional(),
  terms: tradeTermsSchema,
  buyer: z.object({ name: z.string().min(1), externalRef: z.string().optional() }).optional(),
  supplier: z.object({ name: z.string().min(1), externalRef: z.string().optional() }).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const cancelSchema = z.object({ reason: z.string().min(1).default('cancelled_by_operator') });

export const FINANCE_TYPES = [
  'LETTER_OF_CREDIT',
  'BANK_GUARANTEE',
  'INVOICE_FINANCING',
  'FACTORING',
  'SUPPLY_CHAIN_FINANCE',
  'PURCHASE_ORDER_FINANCE',
] as const;

export const requestFinancingSchema = z.object({
  type: z.enum(FINANCE_TYPES),
  amount: z.number().positive(),
  currency: z.string().min(3).max(3).optional(),
  terms: z.record(z.string(), z.unknown()).optional(),
});

export const financeDecisionSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  reason: z.string().optional(),
  provider: z.string().optional(),
});

export const addDocumentSchema = z.object({
  kind: z.string().min(1),
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  url: z.string().url().optional(),
  hash: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
