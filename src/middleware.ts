import { NextRequest, NextResponse } from 'next/server';

/**
 * SECURITY MODEL (P0 remediation): the access token is in memory and not visible to the edge, so
 * this gates on the un-forgeable httpOnly `refresh_token` cookie set by trade-service. The old
 * forgeable base64-JSON `baalvion_trade_session` role cookie is NO LONGER read or trusted; per-role
 * (admin) authorization is enforced at the API + client guards.
 */
const AUTH_COOKIE = process.env.NEXT_PUBLIC_REFRESH_COOKIE_NAME || 'refresh_token';

const AUTH_REQUIRED_PREFIXES = [
  '/dashboard',
  '/buyer',
  '/seller',
  '/marketplace',
  '/deals',
  '/orders',
  '/logistics-shipment',
  '/payments',
  '/finance-settlement',
  '/escrow',
  '/financials',
  '/compliance',
  '/documents',
  '/messages',
  '/profile',
  '/insurance',
  '/intelligence-hub',
  '/negotiations',
  '/discovery',
  '/collaboration',
  '/executive',
  '/crisis-center',
  '/customs',
  '/sourcing',
  '/shipments',
  '/carriers',
  '/field',
  '/agents',
  '/suppliers',
  '/trade-management',
  '/settings',
];

const ADMIN_PREFIXES = [
  '/governance',
  '/oversight',
];

const PUBLIC_EXACT = new Set([
  '/',
  '/login',
  '/about',
  '/contact',
  '/pricing',
  '/privacy',
  '/terms',
  '/platform',
  '/banks',
  '/governments',
  '/enterprises',
  '/access/request',
  '/access/pending',
]);

function needsAuth(pathname: string): boolean {
  return AUTH_REQUIRED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function needsAdmin(pathname: string): boolean {
  return ADMIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

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

  // Admin areas require an authenticated session at the edge; the specific admin-role check is
  // enforced at the API + client guards (the access token / role is not visible to middleware).
  if (needsAdmin(pathname)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url));
    }
    return addSecurityHeaders(NextResponse.next());
  }

  if (needsAuth(pathname)) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url));
    }
    return addSecurityHeaders(NextResponse.next());
  }

  if (pathname === '/login' && isAuthenticated) {
    const redirectTo = request.nextUrl.searchParams.get('redirect') ?? '/dashboard';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return addSecurityHeaders(NextResponse.next());
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
