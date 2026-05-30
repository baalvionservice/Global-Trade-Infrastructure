
/**
 * @file command.store.ts
 * @description State management for the Platform Command Layer.
 */
import { create } from 'zustand';
import { GlobalSearchResult, OperationalAlert } from '../types';

interface CommandState {
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  searchResults: GlobalSearchResult[];
  setSearchResults: (results: GlobalSearchResult[]) => void;
  activeAlerts: OperationalAlert[];
  addAlert: (alert: OperationalAlert) => void;
  acknowledgeAlert: (id: string) => void;
}

export const useCommandStore = create<CommandState>((set) => ({
  isSearchOpen: false,
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  searchResults: [],
  setSearchResults: (searchResults) => set({ searchResults }),
  activeAlerts: [],
  addAlert: (alert) => set((state) => ({ activeAlerts: [alert, ...state.activeAlerts] })),
  acknowledgeAlert: (id) => set((state) => ({
    activeAlerts: state.activeAlerts.map(a => a.id === id ? { ...a, isAcknowledged: true } : a)
  })),
}));
