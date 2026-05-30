/**
 * @file workspace-store.ts
 * @description THE AUTHORITATIVE WORKSPACE KERNEL.
 * Manages operational sessions, multi-pane layouts, and persistent workspace memory.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WorkspaceMode = 'focused' | 'split' | 'tactical';

export interface WorkspaceTab {
  id: string;
  title: string;
  path: string;
  entityId?: string;
  entityType?: string;
  lastActive: string;
}

interface WorkspaceState {
  activeTabId: string | null;
  tabs: WorkspaceTab[];
  sidebarCollapsed: boolean;
  mode: WorkspaceMode;
  rightPanelOpen: boolean;
  rightPanelWidth: number;
  activeContextId: string | null;
  
  // Actions
  addTab: (tab: Omit<WorkspaceTab, 'lastActive'>) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  toggleSidebar: () => void;
  setMode: (mode: WorkspaceMode) => void;
  toggleRightPanel: (open?: boolean) => void;
  setRightPanelWidth: (width: number) => void;
  setContext: (id: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeTabId: null,
      tabs: [],
      sidebarCollapsed: false,
      mode: 'tactical',
      rightPanelOpen: false,
      rightPanelWidth: 420,
      activeContextId: null,

      addTab: (tabData) => set((state) => {
        const exists = state.tabs.find(t => t.id === tabData.id);
        if (exists) return { activeTabId: tabData.id };
        
        const newTab = { ...tabData, lastActive: new Date().toISOString() };
        return {
          tabs: [newTab, ...state.tabs].slice(0, 10),
          activeTabId: tabData.id
        };
      }),

      removeTab: (id) => set((state) => {
        const filtered = state.tabs.filter(t => t.id !== id);
        return {
          tabs: filtered,
          activeTabId: state.activeTabId === id ? (filtered[0]?.id || null) : state.activeTabId
        };
      }),

      setActiveTab: (id) => set({ activeTabId: id }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setMode: (mode) => set({ mode }),
      toggleRightPanel: (open) => set((state) => ({ 
        rightPanelOpen: open !== undefined ? open : !state.rightPanelOpen 
      })),
      setRightPanelWidth: (rightPanelWidth) => set({ rightPanelWidth }),
      setContext: (activeContextId) => set({ activeContextId }),
    }),
    {
      name: 'baalvion-workspace-persistence',
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        sidebarCollapsed: state.sidebarCollapsed,
        rightPanelWidth: state.rightPanelWidth,
        mode: state.mode
      }),
    }
  )
);
