/**
 * @file mobility.store.ts
 * @description Centralized state management for Mobile Command, Offline State, and Edge Sync.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MobileSession, SyncStatus, SyncQueueItem, FieldWorkflow } from '../types';

interface MobilityState {
  currentSession: MobileSession | null;
  syncStatus: SyncStatus;
  syncQueue: SyncQueueItem[];
  activeWorkflows: FieldWorkflow[];
  isOfflineMode: boolean;
  
  // Actions
  setSession: (session: MobileSession | null) => void;
  setSyncStatus: (status: SyncStatus) => void;
  addToSyncQueue: (item: SyncQueueItem) => void;
  removeFromSyncQueue: (id: string) => void;
  setOfflineMode: (val: boolean) => void;
  updateWorkflow: (id: string, updates: Partial<FieldWorkflow>) => void;
  setWorkflows: (workflows: FieldWorkflow[]) => void;
}

export const useMobilityStore = create<MobilityState>()(
  persist(
    (set) => ({
      currentSession: null,
      syncStatus: 'SYNCHRONIZED',
      syncQueue: [],
      activeWorkflows: [],
      isOfflineMode: false,

      setSession: (currentSession) => set({ currentSession }),
      setSyncStatus: (syncStatus) => set({ syncStatus }),
      
      addToSyncQueue: (item) => set((state) => ({ 
        syncQueue: [...state.syncQueue, item] 
      })),

      removeFromSyncQueue: (id) => set((state) => ({
        syncQueue: state.syncQueue.filter(i => i.id !== id)
      })),

      setOfflineMode: (isOfflineMode) => set({ isOfflineMode }),

      setWorkflows: (activeWorkflows) => set({ activeWorkflows }),

      updateWorkflow: (id, updates) => set((state) => ({
        activeWorkflows: state.activeWorkflows.map(w => 
          w.id === id ? { ...w, ...updates } : w
        )
      })),
    }),
    {
      name: 'baalvion-mobile-state',
      partialize: (state) => ({
        currentSession: state.currentSession,
        syncQueue: state.syncQueue,
        activeWorkflows: state.activeWorkflows,
        isOfflineMode: state.isOfflineMode
      }),
    }
  )
);
