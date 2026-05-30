
import { create } from 'zustand';

interface AppState {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  notifications: any[];
  addNotification: (notification: any) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: true,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  notifications: [],
  addNotification: (notification) => set((state) => ({ 
    notifications: [notification, ...state.notifications] 
  })),
  clearNotifications: () => set({ notifications: [] }),
}));
