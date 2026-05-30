/**
 * @file event.store.ts
 * @description Centralized state management for Real-Time Event Streams and Operational Awareness.
 */
import { create } from 'zustand';
import { PlatformEvent, EventSeverity } from '@/orchestration/event-bus';
import { PlatformNotification } from '../services/notification.service';

interface EventState {
  liveStream: PlatformEvent[];
  notifications: PlatformNotification[];
  unreadCount: number;
  isStreaming: boolean;
  
  // Actions
  addEvent: (event: PlatformEvent) => void;
  setNotifications: (notifs: PlatformNotification[]) => void;
  markRead: (id: string) => void;
  toggleStream: (val: boolean) => void;
  clearStream: () => void;
}

export const useEventStore = create<EventState>((set) => ({
  liveStream: [],
  notifications: [],
  unreadCount: 0,
  isStreaming: true,

  addEvent: (event) => set((state) => ({
    liveStream: [event, ...state.liveStream].slice(0, 100)
  })),

  setNotifications: (notifications) => set({
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length
  }),

  markRead: (id) => set((state) => {
    const updated = state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    return {
      notifications: updated,
      unreadCount: updated.filter(n => !n.isRead).length
    };
  }),

  toggleStream: (isStreaming) => set({ isStreaming }),
  
  clearStream: () => set({ liveStream: [] })
}));
