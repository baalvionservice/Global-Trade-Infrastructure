/**
 * @file src/api/hscodes.ts
 * @description HS Code intelligence — keyword search, AI product→HS suggestion, classification, and
 * duty estimation over the HS database.
 */
import { useMutation, useQuery } from '@tanstack/react-query';
import { tradeApi } from './client';
import { qk } from './keys';

export interface HsCandidate {
  hs_code: string;
  description: string;
  confidence?: number;
  method?: string;
  heading?: string;
  chapter?: string;
}

export interface HsSuggestionReport {
  candidates: HsCandidate[];
  recommended?: HsCandidate | null;
  duty?: DutyEstimate | null;
  needs_review?: boolean;
  [k: string]: unknown;
}

export interface DutyEstimate {
  hs_code: string;
  country: string;
  base_rate?: number;
  effective_rate?: number;
  calculated_duty?: number;
  total_landed_cost?: number;
  currency?: string;
  [k: string]: unknown;
}

export interface HsCodeRecord {
  hs_code: string;
  heading?: string;
  chapter?: string;
  description: string;
  category?: string;
  unit?: string;
  controls?: unknown[];
  duty?: DutyEstimate | null;
}

export const hsCodesApi = {
  search: (q: string, country?: string) =>
    tradeApi.get<{ query: string; suggestions: HsCandidate[] }>('/hs_codes/search', { q, country }),
  suggest: (body: { product_description: string; destination_country?: string; origin_country?: string }) =>
    tradeApi.post<{ suggestion_report: HsSuggestionReport }>('/hs_codes/suggest', body),
  duty: (body: { hs_code: string; country: string; value?: number; currency?: string }) =>
    tradeApi.post<{ duty_estimate: DutyEstimate }>('/hs_codes/duty', body),
  lookup: (code: string) => tradeApi.get<HsCodeRecord>(`/hs_codes/${code}`),
};

export function useHsSearch(q: string) {
  return useQuery({
    queryKey: qk.hscodes.search(q),
    queryFn: () => hsCodesApi.search(q),
    enabled: q.trim().length >= 2,
    staleTime: 5 * 60_000,
  });
}

export function useHsSuggest() {
  return useMutation({
    mutationFn: (body: Parameters<typeof hsCodesApi.suggest>[0]) => hsCodesApi.suggest(body),
  });
}

export function useDutyEstimate() {
  return useMutation({
    mutationFn: (body: Parameters<typeof hsCodesApi.duty>[0]) => hsCodesApi.duty(body),
  });
}
