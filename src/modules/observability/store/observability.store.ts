'use client';

import { create } from 'zustand';
import { useState, useEffect } from 'react';
import { HealthStatus, TelemetryPoint, OperationalIncident, NodeHealth } from '../types';

/**
 * @file observability.store.ts
 * @description Centralized state management for Platform Health and Telemetry.
 * Hardened with hydration guards for Sovereign Singularity compliance.
 */

interface ObservabilityState {
  healthScore: number;
  overallStatus: HealthStatus;
  liveSignals: TelemetryPoint[];
  incidents: OperationalIncident[];
  nodes: NodeHealth[];
  isStreaming: boolean;
  
  setHealth: (score: number, status: HealthStatus) => void;
  updateSignals: (signals: TelemetryPoint[]) => void;
  setIncidents: (incidents: OperationalIncident[]) => void;
  setNodes: (nodes: NodeHealth[]) => void;
  toggleStreaming: (val: boolean) => void;
}

const useObservabilityStoreBase = create<ObservabilityState>((set) => ({
  healthScore: 99.8,
  overallStatus: 'OPTIMAL',
  liveSignals: [],
  incidents: [],
  nodes: [],
  isStreaming: true,

  setHealth: (healthScore, overallStatus) => set({ healthScore, overallStatus }),
  updateSignals: (liveSignals) => set({ liveSignals }),
  setIncidents: (incidents) => set({ incidents }),
  setNodes: (nodes) => set({ nodes }),
  toggleStreaming: (isStreaming) => set({ isStreaming }),
}));

export const useObservabilityStore = <T,>(selector?: (state: ObservabilityState) => T): T => {
  const [hasHydrated, setHasHydrated] = useState(false);
  const result = useObservabilityStoreBase(selector as (state: ObservabilityState) => T);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // Before hydration, return the deterministic initial state (SSR-safe: identical on
  // server + client) rather than null — so consumers that destructure never crash.
  if (!hasHydrated) {
    const initial = useObservabilityStoreBase.getState();
    return (selector ? selector(initial) : (initial as unknown as T));
  }
  return result;
};