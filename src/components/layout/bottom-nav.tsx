"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Trophy, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks";

const navItems = [
  { href: "/", icon: Home, label: "Bosh sahifa" },
  { href: "/categories", icon: LayoutGrid, label: "Kategoriyalar" },
  { href: "/leaderboard", icon: Trophy, label: "Reyting" },
  { href: "/ai", icon: Bot, label: "AI" },
  { href: "/profile", icon: User, label: "Profil" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // Don't show on auth pages and admin pages
  if (pathname.startsWith("/auth") || pathname.startsWith("/admin"))
    return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 pb-safe">
      <div className="max-w-2xl mx-auto flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          // Hide profile if not authenticated
          if (item.href === "/profile" && !isAuthenticated) {
            return (
              <Link
                key="/auth/login"
                href="/auth/login"
                className="flex flex-col items-center justify-center w-16 py-1"
              >
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] mt-1 text-gray-400">Kirish</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 py-1 transition-colors",
                isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
              <span
                className={cn("text-[10px] mt-1", isActive && "font-medium")}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
