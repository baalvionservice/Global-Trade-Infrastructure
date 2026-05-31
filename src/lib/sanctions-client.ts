/**
 * @file sanctions-client.ts
 * @description Browser client for the Sanctions Screening flow. Calls the same-origin GTI route
 * handler `/api/sanctions/screen`, which proxies to the risk-service `POST /api/v1/sanctions/screen`
 * (OFAC/UN/EU watchlist screening). Strict contract:
 *
 *   in : { name: string, country?: string }
 *   out: { status: 'CLEAR'|'POTENTIAL_MATCH'|'CONFIRMED_MATCH', confidence: number,
 *          matches: { name, source, program?, sourceConfidence? }[], sourcesChecked?: string[] }
 *
 * `sourceConfidence` (per match) and `sourcesChecked` (jurisdictions screened: OFAC/EU/UN) are additive
 * multi-jurisdiction fields — older callers that ignore them keep working unchanged.
 */

export type SanctionsStatus = 'CLEAR' | 'POTENTIAL_MATCH' | 'CONFIRMED_MATCH';

export interface SanctionsMatch {
  name: string;
  source: string;
  program?: string;
  /** Source-reliability-weighted confidence in [0,1] (additive). */
  sourceConfidence?: number;
}

export interface SanctionsScreenResult {
  status: SanctionsStatus;
  confidence: number;
  matches: SanctionsMatch[];
  /** Jurisdictions screened against, e.g. ["EU","OFAC","UN"] (additive). */
  sourcesChecked?: string[];
}

export interface SanctionsScreenInput {
  name: string;
  country?: string;
}

/**
 * Screen a subject against global sanctions lists. Throws an Error (with a human-readable message)
 * on validation / network / upstream failure so the caller can render an error + retry state.
 */
export async function screenSanctions(input: SanctionsScreenInput): Promise<SanctionsScreenResult> {
  const name = (input.name || '').trim();
  if (!name) {
    throw new Error('Please enter an entity name to screen.');
  }

  let res: Response;
  try {
    res = await fetch('/api/sanctions/screen', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, country: input.country?.trim() || undefined }),
    });
  } catch {
    throw new Error('Network error — could not reach the screening service. Please retry.');
  }

  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    const msg = detail?.error || `Screening service returned ${res.status}.`;
    throw new Error(msg);
  }

  const data = (await res.json()) as Partial<SanctionsScreenResult>;
  if (!data || typeof data.status !== 'string') {
    throw new Error('Malformed screening response.');
  }
  return {
    status: data.status as SanctionsStatus,
    confidence: typeof data.confidence === 'number' ? data.confidence : Number(data.confidence ?? 0),
    matches: Array.isArray(data.matches) ? data.matches : [],
    sourcesChecked: Array.isArray(data.sourcesChecked) ? data.sourcesChecked : undefined,
  };
}
