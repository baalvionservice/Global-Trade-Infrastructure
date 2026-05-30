/**
 * @file use-analytics-store.ts
 * @description Centralized state management for enterprise analytics and strategic orchestration.
 */
import { create } from 'zustand';
import { KpiDefinition, WarehouseHealth, SpendAnalytics } from '../types';

interface AnalyticsState {
  kpis: KpiDefinition[];
  setKpis: (kpis: KpiDefinition[]) => void;
  warehouse: WarehouseHealth | null;
  setWarehouse: (health: WarehouseHealth) => void;
  spend: SpendAnalytics | null;
  setSpend: (spend: SpendAnalytics) => void;
  lastSync: string;
  isSyncing: boolean;
  setSyncing: (val: boolean) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  kpis: [],
  setKpis: (kpis) => set({ kpis, lastSync: new Date().toISOString() }),
  warehouse: null,
  setWarehouse: (warehouse) => set({ warehouse }),
  spend: null,
  setSpend: (spend) => set({ spend }),
  lastSync: new Date().toISOString(),
  isSyncing: false,
  setSyncing: (isSyncing) => set({ isSyncing }),
}));
