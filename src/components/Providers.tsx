"use client";

import { ReactNode } from "react";
import { NotificationSocketProvider } from "@/contexts";

export function Providers({ children }: { children: ReactNode }) {
  return <NotificationSocketProvider>{children}</NotificationSocketProvider>;
}
