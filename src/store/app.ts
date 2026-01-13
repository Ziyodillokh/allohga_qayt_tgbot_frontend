import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
  _count?: {
    questions: number;
    testAttempts: number;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'SYSTEM' | 'ACHIEVEMENT' | 'LEVEL_UP' | 'RANKING' | 'MESSAGE';
  isRead: boolean;
  createdAt: string;
}

interface AppState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Categories
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  setUnreadCount: (count: number) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  
  // Test state
  currentTestId: string | null;
  setCurrentTestId: (id: string | null) => void;
  
  // UI state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Socket connection
  isSocketConnected: boolean;
  setSocketConnected: (connected: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      
      // Categories
      categories: [],
      setCategories: (categories) => set({ categories }),
      
      // Notifications
      notifications: [],
      unreadCount: 0,
      setNotifications: (notifications) => set({ notifications }),
      setUnreadCount: (unreadCount) => set({ unreadCount }),
      addNotification: (notification) => {
        const notifications = [notification, ...get().notifications];
        set({ 
          notifications, 
          unreadCount: get().unreadCount + 1 
        });
      },
      markAsRead: (id) => {
        const notifications = get().notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        );
        const unreadCount = notifications.filter(n => !n.isRead).length;
        set({ notifications, unreadCount });
      },
      
      // Test state
      currentTestId: null,
      setCurrentTestId: (currentTestId) => set({ currentTestId }),
      
      // UI state
      sidebarOpen: false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      
      // Socket connection
      isSocketConnected: false,
      setSocketConnected: (isSocketConnected) => set({ isSocketConnected }),
    }),
    {
      name: 'bilimdon-app',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        theme: state.theme,
      }),
    }
  )
);
