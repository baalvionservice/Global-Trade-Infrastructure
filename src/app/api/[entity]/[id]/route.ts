import { proxyToBackend } from '@/lib/api-proxy';

/** Single entity — proxied to the Baalvion backend. */
export async function GET(req: Request, { params }: { params: Promise<{ entity: string; id: string }> }) {
  const { entity, id } = await params;
  return proxyToBackend(req, entity, id);
}
export async function PATCH(req: Request, { params }: { params: Promise<{ entity: string; id: string }> }) {
  const { entity, id } = await params;
  return proxyToBackend(req, entity, id);
}
export async function DELETE(req: Request, { params }: { params: Promise<{ entity: string; id: string }> }) {
  const { entity, id } = await params;
  return proxyToBackend(req, entity, id);
}
