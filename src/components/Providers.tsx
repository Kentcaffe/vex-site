"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ChatSocketProvider } from "@/components/chat/chat-socket-context";
import { ToastProvider } from "@/components/ui/SimpleToast";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <ChatSocketProvider>{children}</ChatSocketProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
