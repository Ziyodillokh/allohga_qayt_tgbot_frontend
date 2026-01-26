"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore, useAppStore } from "@/store";
import { notificationsApi } from "@/lib/api";
import toast from "react-hot-toast";

interface NotificationSocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const NotificationSocketContext = createContext<NotificationSocketContextType>({
  socket: null,
  connected: false,
});

export function NotificationSocketProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { token, isAuthenticated } = useAuthStore();
  const {
    setNotifications,
    setUnreadCount,
    addNotification,
    setSocketConnected,
  } = useAppStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token || !isAuthenticated) {
      console.log("🔌 Token yoki autentifikatsiya yo'q, socket ulanmaydi");
      return;
    }

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
      setConnected(true);
      setSocketConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ WebSocket uzildi. Sabab:", reason);
      setConnected(false);
      setSocketConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("🚫 WebSocket ulanish xatosi:", error.message);
    });

    socketInstance.on("notification", (notification) => {
      console.log("🔔 Yangi notification keldi:", notification);
      addNotification(notification);
      toast(notification.title || "Yangi bildirishnoma", {
        icon: "🔔",
        duration: 5000,
      });
    });

    setSocket(socketInstance);

    return () => {
      console.log("🔌 WebSocket uzilyapti...");
      socketInstance.disconnect();
    };
  }, [token, isAuthenticated]);

  return (
    <NotificationSocketContext.Provider value={{ socket, connected }}>
      {children}
    </NotificationSocketContext.Provider>
  );
}

export function useNotificationSocket() {
  return useContext(NotificationSocketContext);
}
