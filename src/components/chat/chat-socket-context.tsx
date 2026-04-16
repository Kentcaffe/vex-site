"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuthSession } from "@/components/auth/SupabaseSessionProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type ChatSocketContextValue = {
  connected: boolean;
  unreadCount: number;
  refreshUnread: () => Promise<void>;
};

const ChatSocketContext = createContext<ChatSocketContextValue | null>(null);

async function noopRefresh(): Promise<void> {}

const disconnectedValue: ChatSocketContextValue = {
  connected: false,
  unreadCount: 0,
  refreshUnread: noopRefresh,
};

function ChatSocketConnectedProvider({ children }: { children: ReactNode }) {
  const { data: session } = useAuthSession();
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const realtimeRef = useRef<ReturnType<ReturnType<typeof createSupabaseBrowserClient>["channel"]> | null>(null);

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

  /** Badge mesaje menținut în sync prin endpoint + Supabase Realtime insert events. */
  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }
    const timer = setTimeout(() => {
      void refreshUnread();
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [session?.user?.id, refreshUnread]);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`messages-unread-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          if (typeof window !== "undefined" && document.hidden && Notification.permission === "granted") {
            try {
              const preview = typeof payload.new?.content === "string" ? payload.new.content : "";
              new Notification("VEX", { body: preview.slice(0, 120) });
            } catch {
              /* ignore */
            }
          }
          void refreshUnread();
        },
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });
    realtimeRef.current = channel;
    const timer = setTimeout(() => {
      void refreshUnread();
    }, 0);

    return () => {
      clearTimeout(timer);
      realtimeRef.current?.unsubscribe();
      realtimeRef.current = null;
      setConnected(false);
    };
  }, [session?.user?.id, refreshUnread]);

  const value = useMemo(
    () => ({
      connected,
      unreadCount,
      refreshUnread,
    }),
    [connected, unreadCount, refreshUnread],
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
