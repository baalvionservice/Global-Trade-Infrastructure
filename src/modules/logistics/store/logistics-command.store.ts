/**
 * @file logistics-command.store.ts
 * @description Centralized state management for the Global Logistics Command Center.
 */
import { create } from 'zustand';
import { FreightMandate, PortNode, RouteAnomaly, LogisticsTwinState } from '../types';

interface LogisticsCommandState {
  activeMandates: FreightMandate[];
  portNodes: PortNode[];
  anomalies: RouteAnomaly[];
  twinStates: Record<string, LogisticsTwinState>;
  isObserving: boolean;
  
  // Actions
  setMandates: (mandates: FreightMandate[]) => void;
  updateMandate: (id: string, updates: Partial<FreightMandate>) => void;
  setPortNodes: (nodes: PortNode[]) => void;
  addAnomaly: (anomaly: RouteAnomaly) => void;
  resolveAnomaly: (id: string) => void;
  updateTwin: (entityId: string, state: LogisticsTwinState) => void;
  setObserving: (val: boolean) => void;
}

export const useLogisticsStore = create<LogisticsCommandState>((set) => ({
  activeMandates: [],
  portNodes: [],
  anomalies: [],
  twinStates: {},
  isObserving: true,

  setMandates: (activeMandates) => set({ activeMandates }),
  updateMandate: (id, updates) => set((state) => ({
    activeMandates: state.activeMandates.map(m => m.id === id ? { ...m, ...updates } : m)
  })),

  setPortNodes: (portNodes) => set({ portNodes }),

  addAnomaly: (anomaly) => set((state) => ({
    anomalies: [anomaly, ...state.anomalies].slice(0, 50)
  })),

  resolveAnomaly: (id) => set((state) => ({
    anomalies: state.anomalies.filter(a => a.id !== id)
  })),

  updateTwin: (entityId, state) => set((stateStore) => ({
    twinStates: { ...stateStore.twinStates, [entityId]: state }
  })),

  setObserving: (isObserving) => set({ isObserving }),
}));
