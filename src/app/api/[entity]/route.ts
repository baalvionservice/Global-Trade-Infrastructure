import { proxyToBackend } from '@/lib/api-proxy';
import { verifyIdentity, UnauthorizedError } from '@/server/http/identity';

export const runtime = 'nodejs';

/** Reject anonymous/forged callers before proxying (CR-11). */
function guard(req: Request): Response | null {
  try {
    verifyIdentity(req);
    return null;
  } catch (e) {
    const msg = e instanceof UnauthorizedError ? e.message : 'Authentication required.';
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }
}

/** Entity collection — proxied to the Baalvion backend (no embedded backend). */
export async function GET(req: Request, { params }: { params: Promise<{ entity: string }> }) {
  const denied = guard(req);
  if (denied) return denied;
  const { entity } = await params;
  return proxyToBackend(req, entity);
}

export async function POST(req: Request, { params }: { params: Promise<{ entity: string }> }) {
  const denied = guard(req);
  if (denied) return denied;
  const { entity } = await params;
  return proxyToBackend(req, entity);
}
