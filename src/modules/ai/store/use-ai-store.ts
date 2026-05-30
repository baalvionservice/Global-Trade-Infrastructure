/**
 * @file use-ai-store.ts
 * @description Centralized state management for the Sovereign AI Infrastructure.
 */
import { create } from 'zustand';
import { AIAgent, AutonomousAction, AIReasoningTrace } from '../types';

interface AIState {
  agents: AIAgent[];
  stagedActions: AutonomousAction[];
  activeTraces: AIReasoningTrace[];
  isThinking: boolean;
  
  // Actions
  setAgents: (agents: AIAgent[]) => void;
  setStagedActions: (actions: AutonomousAction[]) => void;
  addTrace: (trace: AIReasoningTrace) => void;
  setThinking: (val: boolean) => void;
  authorizeAction: (id: string) => void;
  rejectAction: (id: string) => void;
}

export const useAIStore = create<AIState>((set) => ({
  agents: [],
  stagedActions: [],
  activeTraces: [],
  isThinking: false,

  setAgents: (agents) => set({ agents }),
  setStagedActions: (stagedActions) => set({ stagedActions }),
  
  addTrace: (trace) => set((state) => ({ 
    activeTraces: [trace, ...state.activeTraces].slice(0, 10) 
  })),

  setThinking: (isThinking) => set({ isThinking }),

  authorizeAction: (id) => set((state) => ({
    stagedActions: state.stagedActions.map(a => 
      a.id === id ? { ...a, status: 'AUTHORIZED' } : a
    )
  })),

  rejectAction: (id) => set((state) => ({
    stagedActions: state.stagedActions.map(a => 
      a.id === id ? { ...a, status: 'REJECTED' as any } : a
    )
  }))
}));
