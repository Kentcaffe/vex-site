"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuthSession } from "@/components/auth/SupabaseSessionProvider";
import {
  getChatNotificationTitleFromLocale,
  showNewChatMessageNotification,
} from "@/lib/chat-notifications-client";
import { tryCreateSupabaseBrowserClient } from "@/lib/supabase";

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

function buildChatMessageRoomFilter(roomIds: string[]): string | null {
  if (roomIds.length === 0) {
    return null;
  }
  if (roomIds.length === 1) {
    return `roomId=eq.${roomIds[0]}`;
  }
  return `roomId=in.(${roomIds.join(",")})`;
}

function ChatSocketConnectedProvider({ children }: { children: ReactNode }) {
  const { data: session } = useAuthSession();
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const refreshUnreadRef = useRef<() => Promise<void>>(noopRefresh);

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
    refreshUnreadRef.current = refreshUnread;
  }, [refreshUnread]);

  /** Badge: endpoint + Realtime (messages + ChatMessage) + polling de siguranță. */
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

    const supabase = tryCreateSupabaseBrowserClient();
    if (!supabase) {
      return;
    }
    let cancelled = false;
    let activeChannel: ReturnType<typeof supabase.channel> | null = null;

    const notifyIfBackground = (body: string) => {
      if (typeof window === "undefined" || typeof document === "undefined") {
        return;
      }
      if (!document.hidden) {
        return;
      }
      showNewChatMessageNotification(getChatNotificationTitleFromLocale(), body);
    };

    const connect = async () => {
      let roomIds: string[] = [];
      try {
        const res = await fetch("/api/chat/room-ids", { credentials: "include" });
        if (res.ok) {
          const data = (await res.json()) as { roomIds?: string[] };
          roomIds = Array.isArray(data.roomIds) ? data.roomIds : [];
        }
      } catch {
        /* ignore */
      }
      if (cancelled) {
        return;
      }

      if (activeChannel) {
        void supabase.removeChannel(activeChannel);
        activeChannel = null;
      }

      const ch = supabase.channel(`messages-unread-${userId}-${Date.now()}`);

      const chatMsgFilter = buildChatMessageRoomFilter(roomIds);
      if (chatMsgFilter) {
        ch.on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "ChatMessage",
            filter: chatMsgFilter,
          },
          (payload) => {
            const row = payload.new as { senderId?: string; body?: string };
            const senderId = typeof row.senderId === "string" ? row.senderId : "";
            if (senderId !== userId) {
              const preview = typeof row.body === "string" ? row.body : "";
              notifyIfBackground(preview);
            }
            void refreshUnreadRef.current();
          },
        );
      }

      ch.on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          const preview =
            typeof payload.new === "object" && payload.new !== null && "content" in payload.new
              ? String((payload.new as { content?: unknown }).content ?? "")
              : "";
          notifyIfBackground(preview);
          void refreshUnreadRef.current();
        },
      );

      ch.subscribe((status) => {
        if (!cancelled) {
          setConnected(status === "SUBSCRIBED");
        }
      });

      if (cancelled) {
        void supabase.removeChannel(ch);
        return;
      }
      activeChannel = ch;
    };

    void connect();

    const bootTimer = setTimeout(() => {
      void refreshUnreadRef.current();
    }, 0);

    const pollUnread = setInterval(() => {
      void refreshUnreadRef.current();
    }, 90000);

    const onFocus = () => {
      void connect();
    };
    const onVisibility = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        void connect();
      }
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearTimeout(bootTimer);
      clearInterval(pollUnread);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      if (activeChannel) {
        void supabase.removeChannel(activeChannel);
      }
      setConnected(false);
    };
  }, [session?.user?.id]);

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
