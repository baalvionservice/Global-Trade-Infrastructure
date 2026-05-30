/**
 * @file collaboration.store.ts
 * @description Centralized state management for Multi-User Workspaces and Global Synchronization.
 */
import { create } from 'zustand';
import { CollaborationWorkspace, CollaborationSignal, CollaborationStatus } from '../types';

interface CollaborationState {
  activeWorkspaces: CollaborationWorkspace[];
  liveSignals: CollaborationSignal[];
  syncHealth: 'OPTIMAL' | 'DRIFT' | 'ERROR';
  
  // Actions
  setWorkspaces: (workspaces: CollaborationWorkspace[]) => void;
  updateWorkspaceStatus: (id: string, status: CollaborationStatus) => void;
  pushSignal: (signal: CollaborationSignal) => void;
  setSyncHealth: (health: CollaborationState['syncHealth']) => void;
}

export const useCollaborationStore = create<CollaborationState>((set) => ({
  activeWorkspaces: [],
  liveSignals: [],
  syncHealth: 'OPTIMAL',

  setWorkspaces: (activeWorkspaces) => set({ activeWorkspaces }),
  
  updateWorkspaceStatus: (id, status) => set((state) => ({
    activeWorkspaces: state.activeWorkspaces.map(w => w.id === id ? { ...w, status } : w)
  })),

  pushSignal: (signal) => set((state) => ({
    liveSignals: [signal, ...state.liveSignals].slice(0, 50)
  })),

  setSyncHealth: (syncHealth) => set({ syncHealth }),
}));
