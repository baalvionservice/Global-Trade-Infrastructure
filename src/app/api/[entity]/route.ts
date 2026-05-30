import { proxyToBackend } from '@/lib/api-proxy';

/** Entity collection — proxied to the Baalvion backend (no embedded backend). */
export async function GET(req: Request, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  return proxyToBackend(req, entity);
}

export async function POST(req: Request, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  return proxyToBackend(req, entity);
}
