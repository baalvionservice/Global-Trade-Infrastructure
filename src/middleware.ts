import { NextRequest, NextResponse } from 'next/server';
import { isAdminPath, needsAuth } from '@/lib/route-access';
import { safeInternalPath } from '@/lib/safe-redirect';

/**
 * SECURITY MODEL (P0 remediation): the access token is in memory and not visible to the edge, so
 * this gates on the un-forgeable httpOnly `refresh_token` cookie set by trade-service. The old
 * forgeable base64-JSON `baalvion_trade_session` role cookie is NO LONGER read or trusted.
 *
 * The edge proves a SESSION exists. The SPECIFIC authority (who may see /governance, /financials,
 * etc.) is enforced by two layers the edge can't reach: the client `RouteGuard` (persona allowlist)
 * and the API (authoritative). Route classification lives in `@/lib/route-access` so the edge and
 * the guard share one source of truth and can never drift.
 */
const AUTH_COOKIE = process.env.NEXT_PUBLIC_REFRESH_COOKIE_NAME || 'refresh_token';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/trade-bff') || // same-origin auth/data proxy must be reachable
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|woff|woff2|ttf|css|js)$/)
  ) {
    return NextResponse.next();
  }

  const isAuthenticated = Boolean(request.cookies.get(AUTH_COOKIE)?.value);

  // Every protected surface (operational OR governance) requires an authenticated session at the
  // edge. Per-authority checks happen in the RouteGuard + API.
  if (isAdminPath(pathname) || needsAuth(pathname)) {
    if (!isAuthenticated) {
      const back = safeInternalPath(pathname, '/dashboard');
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(back)}`, request.url));
    }
    return secureHeaders(NextResponse.next(), request);
  }

  // Already authenticated and hitting /login: send them on. The redirect target is validated to be
  // same-origin (open-redirect / CWE-601 defense) before we trust it.
  if (pathname === '/login' && isAuthenticated) {
    const target = safeInternalPath(request.nextUrl.searchParams.get('redirect'), '/dashboard');
    return NextResponse.redirect(new URL(target, request.url));
  }

  return secureHeaders(NextResponse.next(), request);
}

function secureHeaders(response: NextResponse, _request: NextRequest): NextResponse {
  const isDev = process.env.NODE_ENV !== 'production';

  // Content-Security-Policy. `script-src` keeps 'unsafe-inline' (and 'unsafe-eval' in dev) because
  // Next.js injects inline bootstrap/hydration scripts; the high-value clamps are object-src 'none',
  // base-uri 'self', and frame-ancestors 'none' (clickjacking). Nonce-based script-src is the next
  // hardening step but requires per-request nonce plumbing.
  const csp = [
    "default-src 'self'",
    // Payment gateways: Razorpay Checkout.js + Stripe.js load as scripts; their hosted widgets run
    // in iframes (frame-src); PayU is a top-level form-POST (form-action).
    `script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://*.razorpay.com https://js.stripe.com${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src 'self' https://api.razorpay.com https://*.razorpay.com https://api.stripe.com${isDev ? ' ws: wss:' : ''}`,
    "frame-src https://api.razorpay.com https://checkout.razorpay.com https://*.razorpay.com https://js.stripe.com https://*.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self' https://*.payu.in https://secure.payu.in https://test.payu.in https://checkout.stripe.com",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (!isDev) {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
