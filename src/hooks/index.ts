"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/auth";
import { useAppStore } from "../store/app";
import { authApi, categoriesApi, notificationsApi, statsApi } from "../lib/api";
import {
  isTelegramWebApp,
  getTelegramInitData,
  telegramReady,
  telegramExpand,
  requestTelegramContact,
} from "../lib/telegram";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

// Stats interface
interface PublicStats {
  users: number;
  questions: number;
  categories: number;
  tests: number;
}

// Public Stats hook
export function useStats() {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

        const res = await fetch(`${apiUrl}/stats/public`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        const text = await res.text();
        console.log("Raw response:", text);

        try {
          const data = JSON.parse(text);
          console.log("Parsed stats:", data);

          if (data && typeof data.users === "number") {
            setStats(data);
          }
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
        }
      } catch (err: any) {
        console.error("Stats fetch error:", err);
        setError(err.message || "Statistikani yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

// Auth hook
export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setLoading,
    updateUser,
  } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      // Check if in Telegram Mini App
      if (isTelegramWebApp()) {
        telegramReady();
        telegramExpand();

        const initData = getTelegramInitData();
        if (initData && initData.length > 0 && !isAuthenticated) {
          try {
            const { data } = await authApi.telegramAuth(initData);
            login(data.user, data.token);

            // Don't auto-redirect to registration - let user use platform first
            // They can register later if they want to login from website
            toast.success("✅ Telegram orqali kirdingiz!");
          } catch (error: any) {
            console.error("Telegram auth error:", error);
          }
        }
      } else if (token) {
        // Har doim yangi user ma'lumotlarini backenddan olish (avatar yangilanishi uchun)
        try {
          const { data } = await authApi.getProfile();
          // Agar backend avatar null qaytarsa, store'dagi mavjud avatar'ni saqlab qolish
          const currentUser = useAuthStore.getState().user;
          const userWithAvatar = {
            ...data,
            avatar: data.avatar || currentUser?.avatar || null,
          };
          login(userWithAvatar, token);
        } catch (error) {
          logout();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    router.push("/auth/login");
  }, [logout, router]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout: handleLogout,
    updateUser,
  };
}

// Categories hook
export function useCategories() {
  const { categories, setCategories } = useAppStore();
  const [loading, setLoading] = useState(!categories.length);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (categories.length > 0) return;

      try {
        const { data } = await categoriesApi.getAll();
        setCategories(data);
      } catch (err: any) {
        setError(err.message || "Kategoriyalarni yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [categories.length, setCategories]);

  return { categories, loading, error };
}

// Notifications hook with WebSocket
export function useNotifications() {
  const { token } = useAuthStore();
  const {
    notifications,
    unreadCount,
    setNotifications,
    setUnreadCount,
    addNotification,
    markAsRead,
    setSocketConnected,
  } = useAppStore();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const [notifRes, countRes] = await Promise.all([
          notificationsApi.getAll(),
          notificationsApi.getUnreadCount(),
        ]);
        setNotifications(notifRes.data.notifications || notifRes.data);
        setUnreadCount(countRes.data.unreadCount || countRes.data.count || 0);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    // Setup WebSocket - API_URL dan /api ni olib tashlaymiz
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const WS_URL = API_URL.replace("/api", "");
    console.log("🔌 WebSocket ulanmoqda:", `${WS_URL}/notifications`);

    const socketInstance = io(`${WS_URL}/notifications`, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("✅ WebSocket ulandi! Socket ID:", socketInstance.id);
      setSocketConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ WebSocket uzildi. Sabab:", reason);
      setSocketConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("🚫 WebSocket ulanish xatosi:", error.message);
    });

    socketInstance.on("notification", (notification) => {
      addNotification(notification);
      toast(notification.title, {
        icon: "🔔",
        duration: 5000,
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  const handleMarkAsRead = useCallback(
    async (id: string) => {
      try {
        await notificationsApi.markAsRead(id);
        markAsRead(id);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    [markAsRead],
  );

  return {
    notifications,
    unreadCount,
    markAsRead: handleMarkAsRead,
  };
}

// Theme hook
export function useTheme() {
  const { theme, setTheme } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.toggle("dark", systemTheme === "dark");
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
  }, [theme, mounted]);

  return { theme, setTheme, mounted };
}

// Media query hook
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Local storage hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue] as const;
}
