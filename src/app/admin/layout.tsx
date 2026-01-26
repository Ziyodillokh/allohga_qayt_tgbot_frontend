"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks";
import { AdminProvider } from "@/contexts/AdminContext";
import {
  AdminSocketProvider,
  useAdminSocket,
} from "@/contexts/AdminSocketContext";
import {
  Home,
  Users,
  FolderOpen,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Wifi,
  WifiOff,
} from "lucide-react";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/zikr", label: "Zikrlar", icon: Sparkles },
  { href: "/admin/users", label: "Foydalanuvchilar", icon: Users },
  { href: "/admin/categories", label: "Kategoriyalar", icon: FolderOpen },
  { href: "/admin/messages", label: "Xabarlar", icon: MessageSquare },
  { href: "/admin/design", label: "Dizayn", icon: Settings },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading, logout } = useAuth();
  const { connected, lastUpdated } = useAdminSocket();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Login sahifasida redirect qilmaslik
    if (pathname === "/admin/login") {
      return;
    }
    
    if (!isLoading && !token) {
      router.push("/admin/login");
    } else if (!isLoading && user && user.role !== "ADMIN") {
      router.push("/");
    }
  }, [user, token, isLoading, router, pathname]);

  // Login sahifasi uchun oddiy render
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isLoading || !mounted) {
    return (
      <div className="min-h-screen bg-[#0F0E0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#D4AF37]/60 text-sm font-medium">
            Yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0F0E0A] text-[#E5C366]">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#D4AF37] rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#AA8232] rounded-full blur-[150px]"></div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1A1812] border-r border-[#D4AF37]/20 transform transition-all duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-[#D4AF37]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FBF0B2] via-[#D4AF37] to-[#AA8232] p-[2px]">
              <div className="w-full h-full rounded-full bg-[#0F0E0A] flex items-center justify-center">
                <span className="text-xl">🕌</span>
              </div>
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#FBF0B2]">
                Allohga Qayting
              </h1>
              <p className="text-[8px] text-[#D4AF37]/60 uppercase tracking-widest">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/30 text-[#FBF0B2]"
                    : "text-[#D4AF37]/70 hover:bg-[#D4AF37]/10 hover:text-[#FBF0B2]"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#D4AF37]/20">
          {/* Connection Status */}
          <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-lg bg-[#0F0E0A]">
            {connected ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-400 font-medium">
                  Jonli ulanish
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                <span className="text-xs text-amber-400 font-medium">
                  Ulanmoqda...
                </span>
              </>
            )}
            {lastUpdated && (
              <span className="text-[10px] text-[#D4AF37]/40 ml-auto">
                {lastUpdated.toLocaleTimeString("uz-UZ", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FBF0B2] via-[#D4AF37] to-[#AA8232] p-[1px]">
              <div className="w-full h-full rounded-full bg-[#1A1812] flex items-center justify-center">
                <span className="text-sm font-bold text-[#FBF0B2]">
                  {user.fullName?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#FBF0B2] truncate">
                {user.fullName}
              </p>
              <p className="text-xs text-[#D4AF37]/60">Administrator</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              router.push("/admin/login");
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Chiqish
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-[#1A1812]/95 backdrop-blur-xl border-b border-[#D4AF37]/20 px-4 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2.5 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-xl transition-colors"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xl">🕌</span>
          <span className="text-sm font-bold text-[#FBF0B2]">Admin</span>
        </div>

        <div className="flex items-center gap-2">
          {connected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-amber-500" />
          )}
        </div>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen relative z-10">
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <AdminSocketProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AdminSocketProvider>
    </AdminProvider>
  );
}
