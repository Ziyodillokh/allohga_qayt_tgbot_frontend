"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, Moon, Sun, LogOut, User, Settings } from "lucide-react";
import { useState } from "react";
import { useAuth, useNotifications, useTheme } from "@/hooks";
import { Avatar, Badge, Button } from "@/components/ui";
import { cn, formatXP } from "@/lib/utils";
import { isTelegramWebApp } from "@/lib/telegram";

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  const isTelegram = isTelegramWebApp();

  // Hide global header on the home page because the home page
  // (`/src/app/page.tsx`) includes its own top section.
  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src="/logo.png"
                alt="Allohga Qayting Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Allohga Qayting
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            {!isTelegram && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            )}

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Link
                  href="/notifications"
                  className="relative p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Avatar
                      key={user?.avatar || "no-avatar"}
                      src={user?.avatar}
                      name={user?.fullName || "User"}
                      size="sm"
                    />
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatXP(user?.totalXP || 0)} XP
                      </p>
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {profileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setProfileOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {user?.fullName}
                          </p>
                          <p className="text-sm text-gray-500">
                            Level {user?.level}
                          </p>
                        </div>
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setProfileOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          Profil
                        </Link>
                        <Link
                          href="/achievements"
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => setProfileOpen(false)}
                        >
                          <span>🏆</span>
                          Yutuqlar
                        </Link>
                        {(user?.role === "ADMIN" ||
                          user?.role === "MODERATOR") &&
                          (pathname.startsWith("/admin") ? (
                            <Link
                              href="/"
                              className="flex items-center gap-2 px-4 py-2 text-teal-600 dark:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                              onClick={() => setProfileOpen(false)}
                            >
                              <User className="w-4 h-4" />
                              User Panel
                            </Link>
                          ) : (
                            <Link
                              href="/admin"
                              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                              onClick={() => setProfileOpen(false)}
                            >
                              <Settings className="w-4 h-4" />
                              Admin Panel
                            </Link>
                          ))}
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            logout();
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <LogOut className="w-4 h-4" />
                          Chiqish
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Kirish
                  </Button>
                </Link>
                <Link
                  href={
                    isTelegram ? "/auth/telegram-register" : "/auth/register"
                  }
                >
                  <Button size="sm">Ro'yxatdan o'tish</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
