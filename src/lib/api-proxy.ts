/**
 * Reverse proxy for Global-Trade's Next.js API routes.
 * The backend is no longer embedded in the app — requests are forwarded to the
 * real Baalvion backend (trade-service / Baalvion OS). Configure via env.
 */
const TARGET = process.env.GLOBAL_TRADE_API_URL || 'https://api.baalvion.com/api/v1/commerce/trade/v1';

export async function proxyToBackend(req: Request, entity: string, id?: string): Promise<Response> {
  const incoming = new URL(req.url);
  const target =
    `${TARGET}/${encodeURIComponent(entity)}` +
    (id ? `/${encodeURIComponent(id)}` : '') +
    incoming.search;

  const headers: Record<string, string> = {};
  const ct = req.headers.get('content-type');
  if (ct) headers['content-type'] = ct;
  const auth = req.headers.get('authorization');
  if (auth) headers['authorization'] = auth;

  const init: RequestInit = { method: req.method, headers };
  if (!['GET', 'HEAD'].includes(req.method)) init.body = await req.text();

  try {
    const res = await fetch(target, init);
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { 'content-type': res.headers.get('content-type') || 'application/json' },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ success: false, error: 'Upstream backend unavailable', detail: e?.message }),
      { status: 502, headers: { 'content-type': 'application/json' } },
    );
  }
}
