/**
 * @file regulatory.store.ts
 * @description Centralized state management for Sovereign Customs and Regulatory Intelligence.
 */
import { create } from 'zustand';
import { CustomsEntry, SanctionSignal, RegulatoryPulse } from '@/types/regulatory';

interface RegulatoryState {
  entries: CustomsEntry[];
  signals: SanctionSignal[];
  pulse: RegulatoryPulse | null;
  isLoading: boolean;
  
  // Actions
  setEntries: (entries: CustomsEntry[]) => void;
  setSignals: (signals: SanctionSignal[]) => void;
  setPulse: (pulse: RegulatoryPulse) => void;
  setLoading: (val: boolean) => void;
  updateEntryStatus: (id: string, status: CustomsEntry['status']) => void;
}

export const useRegulatoryStore = create<RegulatoryState>((set) => ({
  entries: [],
  signals: [],
  pulse: null,
  isLoading: false,

  setEntries: (entries) => set({ entries }),
  setSignals: (signals) => set({ signals }),
  setPulse: (pulse) => set({ pulse }),
  setLoading: (isLoading) => set({ isLoading }),
  
  updateEntryStatus: (id, status) => set((state) => ({
    entries: state.entries.map(e => e.id === id ? { ...e, status } : e)
  }))
}));
