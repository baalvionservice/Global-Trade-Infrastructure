/**
 * @file design.store.ts
 * @description Centralized state management for UI Governance, Theme, and Density.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DensityMode = 'compact' | 'standard' | 'executive';
export type ThemeVariant = 'institutional-dark' | 'institutional-light' | 'tactical-high-contrast';

interface DesignState {
  density: DensityMode;
  theme: ThemeVariant;
  rightPanelOpen: boolean;
  rightPanelWidth: number;
  
  // Actions
  setDensity: (mode: DensityMode) => void;
  setTheme: (theme: ThemeVariant) => void;
  toggleRightPanel: (open?: boolean) => void;
  setRightPanelWidth: (width: number) => void;
}

export const useDesignStore = create<DesignState>()(
  persist(
    (set) => ({
      density: 'standard',
      theme: 'institutional-light',
      rightPanelOpen: true,
      rightPanelWidth: 420,

      setDensity: (density) => set({ density }),
      setTheme: (theme) => set({ theme }),
      toggleRightPanel: (val) => set((state) => ({ 
        rightPanelOpen: val !== undefined ? val : !state.rightPanelOpen 
      })),
      setRightPanelWidth: (rightPanelWidth) => set({ rightPanelWidth }),
    }),
    {
      name: 'baalvion-experience-state',
    }
  )
);
