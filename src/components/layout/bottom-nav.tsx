"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Trophy, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks";

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // Don't show on auth pages, admin pages, or when chatbot modal is open
  if (pathname.startsWith("/auth") || pathname.startsWith("/admin"))
    return null;

  // Hide nav when chatbot is active (check if body has data-chatbot-open attribute)
  if (
    typeof window !== "undefined" &&
    document.body.hasAttribute("data-chatbot-open")
  )
    return null;

  // return (
  //   <nav
  //     className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-amber-950 to-orange-950/95 backdrop-blur-xl border-t border-amber-800/30 pb-safe"
  //     style={{ backgroundColor: "rgba(26,15,10,0.95)" }}
  //   >
  //     {/* <div className="max-w-2xl mx-auto flex items-center justify-around h-16">
  //       {navItems.map((item) => {
  //         const isActive =
  //           pathname === item.href ||
  //           (item.href !== "/" && pathname.startsWith(item.href));
  //         const Icon = item.icon;

  //         // Hide profile if not authenticated
  //         if (item.href === "/profile" && !isAuthenticated) {
  //           return (
  //             <Link
  //               key="/auth/login"
  //               href="/auth/login"
  //               className="flex flex-col items-center justify-center w-16 py-1 text-amber-200"
  //             >
  //               <User className="w-5 h-5 text-amber-200" />
  //               <span className="text-[10px] mt-1 text-amber-200">Kirish</span>
  //             </Link>
  //           );
  //         }

  //         return (
  //           <Link
  //             key={item.href}
  //             href={item.href}
  //             className={cn(
  //               "flex flex-col items-center justify-center w-16 py-1 transition-colors",
  //               isActive ? "text-amber-400" : "text-amber-200/70"
  //             )}
  //           >
  //             <Icon
  //               className={cn("w-5 h-5", isActive && "scale-110")}
  //               style={{
  //                 color: isActive ? undefined : "rgba(245,158,11,0.85)",
  //               }}
  //             />
  //             <span
  //               className={cn("text-[10px] mt-1", isActive && "font-medium")}
  //             >
  //               {item.label}
  //             </span>
  //             {isActive && (
  //               <div className="absolute bottom-1 w-1 h-1 bg-amber-400 rounded-full" />
  //             )}
  //           </Link>
  //         );
  //       })}
  //     </div> */}
  //   </nav>
  // );
}
