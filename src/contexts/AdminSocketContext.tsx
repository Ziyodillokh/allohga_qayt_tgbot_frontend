"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks";

interface DashboardStats {
  users: { total: number; today: number; thisWeek: number };
  tests: { total: number; today: number; averageScore: number };
  questions: number;
  categories: number;
  aiChats: { total: number; today: number };
  topCategories: Array<{ id: string; name: string; testsCount: number }>;
  lowQuestionCategories?: Array<{
    id: string;
    name: string;
    slug: string;
    totalQuestions: number;
    usedQuestions: number;
    unusedQuestions: number;
    questionsCount: number;
    needed: number;
  }>;
  zikr?: {
    total: number;
    active: number;
    completions: { total: number; today: number; thisWeek: number };
    totalXpEarned: number;
    topZikrs: Array<{
      id: string;
      title: string;
      emoji: string;
      count: number;
      xpReward: number;
      completions: number;
    }>;
  };
  xp?: { totalEarned: number; fromZikrs: number };
  correctAnswers?: { total: number; today: number };
}

interface AdminSocketContextType {
  socket: Socket | null;
  connected: boolean;
  stats: DashboardStats | null;
  loading: boolean;
  lastUpdated: Date | null;
  refresh: () => void;
}

const AdminSocketContext = createContext<AdminSocketContextType>({
  socket: null,
  connected: false,
  stats: null,
  loading: true,
  lastUpdated: null,
  refresh: () => {},
});

// Audio notification function
const playNotificationSound = (type: "default" | "zikr" = "default") => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === "zikr") {
      // Pleasant chime for zikr completion
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
      oscillator.frequency.setValueAtTime(1108, audioContext.currentTime + 0.1); // C#6
      oscillator.frequency.setValueAtTime(1318, audioContext.currentTime + 0.2); // E6
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } else {
      // Simple notification beep
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  } catch (error) {
    console.log("Audio notification not available:", error);
  }
};

export function AdminSocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const WS_URL = API_URL.replace("/api", "");

  useEffect(() => {
    if (!token) return;

    const newSocket = io(`${WS_URL}/admin`, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("✅ Admin socket connected! Socket ID:", newSocket.id);
      setConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Admin socket disconnected. Reason:", reason);
      setConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("🚫 Admin socket connection error:", error.message);
    });

    newSocket.on("dashboard:update", (data: DashboardStats) => {
      setStats(data);
      setLastUpdated(new Date());
      setLoading(false);
    });

    newSocket.on("user:new", (user: any) => {
      console.log("New user registered:", user);
      // Play notification sound
      playNotificationSound();
    });

    newSocket.on("test:completed", (test: any) => {
      console.log("Test completed:", test);
      playNotificationSound();
    });

    newSocket.on("zikr:completed", (zikr: any) => {
      console.log("🎉 Zikr completed:", zikr);
      // Play audio notification for zikr completion
      playNotificationSound("zikr");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, WS_URL]);

  const refresh = useCallback(() => {
    if (socket && connected) {
      socket.emit("dashboard:refresh");
    }
  }, [socket, connected]);

  return (
    <AdminSocketContext.Provider
      value={{ socket, connected, stats, loading, lastUpdated, refresh }}
    >
      {children}
    </AdminSocketContext.Provider>
  );
}

export function useAdminSocket() {
  return useContext(AdminSocketContext);
}
