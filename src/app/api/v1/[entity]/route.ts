import { proxyToBackend } from '@/lib/api-proxy';

/** API v1 entity collection — proxied to the Baalvion backend. */
export async function GET(req: Request, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  return proxyToBackend(req, entity);
}

export async function POST(req: Request, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  return proxyToBackend(req, entity);
}
