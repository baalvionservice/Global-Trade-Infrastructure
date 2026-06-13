'use client';

/**
 * @file src/api/query-provider.tsx
 * @description TanStack Query provider for the Trade Operations control center. Scoped to the
 * dashboard tree. A single QueryClient is created per browser session (lazy useState init) so the
 * cache survives client-side navigation but never leaks across SSR requests.
 */
import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Live-trade defaults: short staleness so dashboards feel fresh, one silent retry (the apiClient
// already retries 5xx + refreshes 401 underneath), no refetch-on-focus storm.
function makeClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 15_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: 0 },
    },
  });
}

export function TradeQueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(makeClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
