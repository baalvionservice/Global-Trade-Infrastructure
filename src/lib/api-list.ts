/**
 * @file api-list.ts
 * @description Normalizes a trade-service list response to a plain array.
 *
 * trade-service returns lists in two shapes:
 *   • typed resources (sendPaginated)  → { data: { items, total, page, limit } }
 *   • generic store / simple lists     → { data: [ ... ] }
 *
 * Consuming `.data` directly with `.map/.filter/.reduce` crashes on the paginated shape.
 * `toList()` accepts either and always yields an array, so list consumers are crash-proof.
 */
export function toList<T = any>(res: { data?: unknown } | null | undefined): T[] {
  const d = res?.data as unknown;
  if (Array.isArray(d)) return d as T[];
  if (d && typeof d === 'object' && Array.isArray((d as { items?: unknown }).items)) {
    return (d as { items: T[] }).items;
  }
  return [];
}
