"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ChatSocketProvider } from "@/components/chat/chat-socket-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ChatSocketProvider>{children}</ChatSocketProvider>
    </SessionProvider>
  );
}
