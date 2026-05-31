/**
 * Sanctions Screening BFF route. Proxies the browser's screening request to the risk-service
 * `POST /api/v1/sanctions/screen` and returns its strict contract verbatim:
 *   in : { name: string, country?: string }
 *   out: { status, confidence, matches: [{ name, source, program? }] }
 *
 * Base URL via SANCTIONS_API_URL (default risk-service direct, dev). In production point it at the
 * auth-gateway so the gateway injects the verified identity + tenant (see "missing production steps"
 * in the integration notes). A request timeout guards against a slow/hung upstream.
 */

const SANCTIONS_API_URL = process.env.SANCTIONS_API_URL || 'http://localhost:3035/api/v1/sanctions';
const TENANT_ID = process.env.SANCTIONS_TENANT_ID || '00000000-0000-0000-0000-000000000000';
const TIMEOUT_MS = Number(process.env.SANCTIONS_TIMEOUT_MS || 20000);

export async function POST(req: Request): Promise<Response> {
  let body: { name?: unknown; country?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const country = typeof body?.country === 'string' && body.country.trim() ? body.country.trim() : undefined;
  if (!name) {
    return json({ error: 'Field "name" is required.' }, 400);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const upstream = await fetch(`${SANCTIONS_API_URL}/screen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Dev: risk-service runs gateway-trusted (security disabled) and reads X-Tenant-ID.
        // Prod: route through the gateway, which supplies the verified tenant from the session.
        'X-Tenant-ID': TENANT_ID,
      },
      body: JSON.stringify({ name, country }),
      signal: controller.signal,
    });

    const text = await upstream.text();
    if (!upstream.ok) {
      return json(
        { error: `Sanctions service error (${upstream.status}). Please retry.`, detail: safeParse(text) },
        upstream.status >= 500 ? 502 : upstream.status,
      );
    }
    // Pass the strict contract through unchanged.
    return new Response(text, {
      status: 200,
      headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' },
    });
  } catch (e: any) {
    const timedOut = e?.name === 'AbortError';
    return json(
      { error: timedOut ? 'The screening service timed out. Please retry.' : 'Screening service unavailable. Please retry.' },
      timedOut ? 504 : 502,
    );
  } finally {
    clearTimeout(timer);
  }
}

function json(obj: unknown, status: number): Response {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
