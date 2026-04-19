"use client";

import type { ReactNode } from "react";
import { SupabaseSessionProvider } from "@/components/auth/SupabaseSessionProvider";
import { ChatSocketProvider } from "@/components/chat/chat-socket-context";
import { ForceLightTheme } from "@/components/theme/ForceLightTheme";
import { ToastProvider } from "@/components/ui/SimpleToast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SupabaseSessionProvider>
      <ToastProvider>
        <ChatSocketProvider>
          <ForceLightTheme />
          {children}
        </ChatSocketProvider>
      </ToastProvider>
    </SupabaseSessionProvider>
  );
}
