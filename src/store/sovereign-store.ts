'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useState, useEffect } from 'react';

/**
 * @file sovereign-store.ts
 * @description THE AUTHORITATIVE STATE CONTAINER. 
 * Hardened for hydration safety and cross-domain coherence.
 */

export interface SovereignState {
  coherenceScore: number;
  activeMissions: string[];
  threatLevel: 'STABLE' | 'ELEVATED' | 'CRITICAL';
  finalityLatencyMs: number;
  
  updateTelemetry: (metrics: Partial<SovereignState>) => void;
  triggerLockdown: () => void;
}

const useSovereignStoreBase = create<SovereignState>()(
  persist(
    (set) => ({
      coherenceScore: 99.98,
      activeMissions: [],
      threatLevel: 'STABLE',
      finalityLatencyMs: 142,

      updateTelemetry: (metrics) => set((state) => ({ ...state, ...metrics })),
      
      triggerLockdown: () => set({ 
        threatLevel: 'CRITICAL', 
        coherenceScore: 100 
      }),
    }),
    { name: 'baalvion-planetary-state' }
  )
);

export const useSovereignStore = <T,>(selector: (state: SovereignState) => T): T | null => {
  const [hasHydrated, setHasHydrated] = useState(false);
  const result = useSovereignStoreBase(selector);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) return null;
  return result;
};