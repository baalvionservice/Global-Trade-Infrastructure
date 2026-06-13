/**
 * @file server/http/identity.ts
 * @description Trusted-principal verification for the trade API (CR-1).
 *
 * Identity is NEVER taken from client-supplied `x-actor-*` / `x-organization-id`
 * headers. The gateway forwards the authenticated principal as a signed
 * envelope: a base64url JSON document (`x-identity-envelope`) plus an
 * HMAC-SHA256 signature (`x-identity-signature`) computed with the shared
 * GATEWAY_SIGNING_SECRET. A request is authenticated only if the signature
 * verifies and the envelope has not expired. Anonymous requests, forged
 * headers and role spoofing all fail closed here.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { UserRole } from '@/core/roles';

export class UnauthorizedError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/** A verified, gateway-attested principal. The ONLY trusted source of identity. */
export interface Principal {
  actorId: string;
  actorRole: UserRole;
  organizationId: string;
}

interface EnvelopeClaims {
  sub: string; // actorId
  role: string; // actorRole
  org: string; // organizationId (UUID)
  iat: number; // issued-at (epoch ms)
  exp: number; // expiry (epoch ms)
}

const ENVELOPE_HEADER = 'x-identity-envelope';
const SIGNATURE_HEADER = 'x-identity-signature';
const DEV_DEFAULT_SECRET = 'dev_gateway_signing_secret_change_me_min32';
const DEFAULT_TTL_MS = 5 * 60_000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve the signing secret. In production a strong, non-default secret is
 * mandatory — the process refuses to verify identities without it (fail-fast).
 */
export function identitySecret(): string {
  const secret = process.env.GATEWAY_SIGNING_SECRET;
  const isProd = process.env.NODE_ENV === 'production';
  if (!secret || secret.length < 32 || secret === DEV_DEFAULT_SECRET) {
    if (isProd) {
      throw new Error(
        'GATEWAY_SIGNING_SECRET is missing, too short, or the known dev default; refusing to verify identities in production.',
      );
    }
    return secret && secret.length >= 16 ? secret : 'test_gateway_signing_secret_min_32_chars_long';
  }
  return secret;
}

function sign(envelopeB64: string, secret: string): string {
  return createHmac('sha256', secret).update(envelopeB64).digest('hex');
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Verify the gateway identity envelope on a request and return the principal.
 * Throws {@link UnauthorizedError} for anonymous, forged or expired requests.
 */
export function verifyIdentity(req: Request): Principal {
  const envelopeB64 = req.headers.get(ENVELOPE_HEADER);
  const signature = req.headers.get(SIGNATURE_HEADER);
  if (!envelopeB64 || !signature) {
    throw new UnauthorizedError('Missing signed identity envelope');
  }

  const expected = sign(envelopeB64, identitySecret());
  if (!safeEqualHex(expected, signature)) {
    throw new UnauthorizedError('Invalid identity signature');
  }

  let claims: EnvelopeClaims;
  try {
    claims = JSON.parse(Buffer.from(envelopeB64, 'base64url').toString('utf8')) as EnvelopeClaims;
  } catch {
    throw new UnauthorizedError('Malformed identity envelope');
  }

  if (!claims.sub || !claims.role || !claims.org) {
    throw new UnauthorizedError('Incomplete identity envelope');
  }
  if (!UUID_RE.test(claims.org)) {
    throw new UnauthorizedError('Identity organization is not a valid tenant id');
  }
  if (typeof claims.exp !== 'number' || claims.exp < Date.now()) {
    throw new UnauthorizedError('Identity envelope has expired');
  }

  return {
    actorId: claims.sub,
    actorRole: claims.role as UserRole,
    organizationId: claims.org,
  };
}

/**
 * Mint a signed identity envelope. Used by the gateway/BFF to attest a verified
 * session, and by tests to exercise the trusted path. `nowMs` is injectable so
 * callers in environments without `Date.now` can supply a clock.
 */
export function signIdentity(
  principal: Principal,
  opts: { secret?: string; ttlMs?: number; nowMs?: number } = {},
): { [ENVELOPE_HEADER]: string; [SIGNATURE_HEADER]: string } {
  const secret = opts.secret ?? identitySecret();
  const now = opts.nowMs ?? Date.now();
  const claims: EnvelopeClaims = {
    sub: principal.actorId,
    role: String(principal.actorRole),
    org: principal.organizationId,
    iat: now,
    exp: now + (opts.ttlMs ?? DEFAULT_TTL_MS),
  };
  const envelopeB64 = Buffer.from(JSON.stringify(claims), 'utf8').toString('base64url');
  return {
    [ENVELOPE_HEADER]: envelopeB64,
    [SIGNATURE_HEADER]: sign(envelopeB64, secret),
  };
}

export { ENVELOPE_HEADER, SIGNATURE_HEADER };
