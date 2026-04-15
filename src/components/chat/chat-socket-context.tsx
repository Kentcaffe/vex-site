"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuthSession } from "@/components/auth/SupabaseSessionProvider";

type ChatSocketContextValue = {
  socket: Socket | null;
  connected: boolean;
  unreadCount: number;
  refreshUnread: () => Promise<void>;
};

const ChatSocketContext = createContext<ChatSocketContextValue | null>(null);

async function noopRefresh(): Promise<void> {}

const disconnectedValue: ChatSocketContextValue = {
  socket: null,
  connected: false,
  unreadCount: 0,
  refreshUnread: noopRefresh,
};

function socketUrl(): string {
  return process.env.NEXT_PUBLIC_SOCKET_URL ?? "https://vex.md";
}

function ChatSocketConnectedProvider({ children }: { children: ReactNode }) {
  const { data: session } = useAuthSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  const refreshUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/unread", { credentials: "include" });
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as { count?: number };
      setUnreadCount(typeof data.count === "number" ? data.count : 0);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      return;
    }

    let cancelled = false;
    const run = async () => {
      const tokRes = await fetch("/api/chat/token", { credentials: "include" });
      if (!tokRes.ok || cancelled) {
        return;
      }
      const { token } = (await tokRes.json()) as { token?: string };
      if (!token || cancelled) {
        return;
      }
      const s = io(socketUrl(), {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });
      socketRef.current = s;
      setSocket(s);

      s.on("connect", () => {
        if (!cancelled) {
          setConnected(true);
        }
      });
      s.on("disconnect", () => {
        if (!cancelled) {
          setConnected(false);
        }
      });
      s.on("unread:refresh", () => {
        void refreshUnread();
      });
      s.on("chat:notify", (payload: { preview?: string }) => {
        if (typeof window !== "undefined" && document.hidden && Notification.permission === "granted") {
          try {
            new Notification("VEX", { body: payload?.preview ?? "" });
          } catch {
            /* ignore */
          }
        }
        void refreshUnread();
      });

      void refreshUnread();
    };

    void run();

    return () => {
      cancelled = true;
      socketRef.current?.removeAllListeners();
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [session?.user?.id, refreshUnread]);

  const value = useMemo(
    () => ({
      socket,
      connected,
      unreadCount,
      refreshUnread,
    }),
    [socket, connected, unreadCount, refreshUnread],
  );

  return <ChatSocketContext.Provider value={value}>{children}</ChatSocketContext.Provider>;
}

export function ChatSocketProvider({ children }: { children: ReactNode }) {
  const { status } = useAuthSession();

  if (status === "loading" || status === "unauthenticated") {
    return <ChatSocketContext.Provider value={disconnectedValue}>{children}</ChatSocketContext.Provider>;
  }

  return <ChatSocketConnectedProvider>{children}</ChatSocketConnectedProvider>;
}

export function useChatSocketContext(): ChatSocketContextValue {
  const ctx = useContext(ChatSocketContext);
  if (!ctx) {
    throw new Error("useChatSocketContext must be used within ChatSocketProvider");
  }
  return ctx;
}

export function useOptionalChatSocket(): ChatSocketContextValue | null {
  return useContext(ChatSocketContext);
}
