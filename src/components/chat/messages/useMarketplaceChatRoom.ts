"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { normalizeRealtimeInsert } from "@/lib/chat-message-payload";
import {
  playIncomingChatSound,
  requestChatNotificationPermission,
  showNewChatMessageNotification,
} from "@/lib/chat-notifications-client";
import { upsertChatMessagesSorted, sortChatMessages, type ChatMessageRow } from "@/lib/chat-merge-messages";
import { tryCreateSupabaseBrowserClient } from "@/lib/supabase";
import type { ChatBootstrap } from "./chat-types";

export function useMarketplaceChatRoom(bootstrap: ChatBootstrap, currentUserId: string) {
  const t = useTranslations("Chat");
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState(() =>
    sortChatMessages(Array.isArray(bootstrap.messages) ? bootstrap.messages : []),
  );
  const [otherLastReadAt, setOtherLastReadAt] = useState<string | null>(bootstrap.otherLastReadAt);
  const [draft, setDraft] = useState("");
  const [showNewMessagesBanner, setShowNewMessagesBanner] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const roomId = bootstrap.roomId;

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollRef.current;
    if (!el) return;
    const target = el.scrollHeight - el.clientHeight;
    if (behavior === "smooth" && typeof el.scrollTo === "function") {
      el.scrollTo({ top: target, behavior: "smooth" });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  useEffect(() => {
    requestChatNotificationPermission();
  }, []);

  useEffect(() => {
    nearBottomRef.current = true;
    scrollToBottom("auto");
  }, [roomId, scrollToBottom]);

  const updateNearBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    const near = gap < 96;
    nearBottomRef.current = near;
    if (near) setShowNewMessagesBanner(false);
  }, []);

  const appendIncomingMessage = useCallback(
    (source: "messages" | "ChatMessage", raw: unknown) => {
      const normalized = normalizeRealtimeInsert(raw, source, roomId);
      if (!normalized) return;
      const wasNearBottom = nearBottomRef.current;
      const fromOther = normalized.senderId !== currentUserId;

      const row: ChatMessageRow = {
        id: normalized.id,
        senderId: normalized.senderId,
        body: normalized.body,
        createdAt: normalized.createdAt,
      };
      setMessages((prev) => upsertChatMessagesSorted(prev, row));

      if (fromOther) {
        void fetch(`/api/chat/room/${roomId}/read`, { method: "POST", credentials: "include" });
        setOtherLastReadAt(new Date().toISOString());
      }

      queueMicrotask(() => {
        requestAnimationFrame(() => {
          if (wasNearBottom) {
            scrollToBottom("smooth");
            setShowNewMessagesBanner(false);
          } else if (fromOther) {
            setShowNewMessagesBanner(true);
          }
        });
      });

      if (fromOther) {
        const inBackground = typeof document !== "undefined" && (document.hidden || !document.hasFocus());
        if (inBackground) {
          showNewChatMessageNotification(t("newMessageNotificationTitle"), normalized.body);
          playIncomingChatSound();
        } else if (!wasNearBottom) {
          playIncomingChatSound();
        }
      }
    },
    [currentUserId, roomId, scrollToBottom, t],
  );

  const appendRef = useRef(appendIncomingMessage);
  useEffect(() => {
    appendRef.current = appendIncomingMessage;
  }, [appendIncomingMessage]);

  useEffect(() => {
    const supabase = tryCreateSupabaseBrowserClient();
    if (!supabase) return;
    const channel = supabase
      .channel(`marketplace-room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ChatMessage",
          filter: `roomId=eq.${roomId}`,
        },
        (payload) => {
          appendRef.current("ChatMessage", payload.new);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          appendRef.current("messages", payload.new);
        },
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    void fetch(`/api/chat/room/${roomId}/read`, { method: "POST", credentials: "include" });
    return () => {
      void supabase.removeChannel(channel);
      setConnected(false);
    };
  }, [roomId]);

  useEffect(() => {
    let cancelled = false;
    const syncFromServer = async () => {
      try {
        const res = await fetch(`/api/chat/room/${roomId}`, { credentials: "include" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          messages?: { id: string; senderId: string; body: string; createdAt: string }[];
          otherLastReadAt?: string | null;
        };
        if (cancelled || !Array.isArray(data.messages)) return;
        setMessages((prev) => {
          let next = prev;
          for (const row of data.messages ?? []) {
            next = upsertChatMessagesSorted(next, row);
          }
          return next;
        });
        if (typeof data.otherLastReadAt === "string" || data.otherLastReadAt === null) {
          setOtherLastReadAt(data.otherLastReadAt);
        }
      } catch {
        /* ignore */
      }
    };
    void syncFromServer();
    const timer = window.setInterval(() => {
      void syncFromServer();
    }, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [roomId]);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text) return;
    const res = await fetch(`/api/chat/room/${roomId}/message`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as {
      message?: { id: string; senderId: string; body: string; createdAt: string };
    };
    if (data.message) {
      nearBottomRef.current = true;
      setShowNewMessagesBanner(false);
      setMessages((prev) => upsertChatMessagesSorted(prev, data.message!));
      queueMicrotask(() => {
        requestAnimationFrame(() => scrollToBottom("smooth"));
      });
    }
    setDraft("");
  }, [draft, roomId, scrollToBottom]);

  const lastOwn = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderId === currentUserId) {
        return messages[i];
      }
    }
    return null;
  }, [messages, currentUserId]);

  const seenOnLastOwn =
    lastOwn &&
    otherLastReadAt &&
    new Date(otherLastReadAt).getTime() >= new Date(lastOwn.createdAt).getTime();

  const remaining = bootstrap.maxBodyLength - draft.length;

  const scrollToLatest = useCallback(() => {
    nearBottomRef.current = true;
    setShowNewMessagesBanner(false);
    scrollToBottom("smooth");
  }, [scrollToBottom]);

  return {
    connected,
    messages,
    draft,
    setDraft,
    send,
    scrollRef,
    bottomRef,
    updateNearBottom,
    showNewMessagesBanner,
    scrollToLatest,
    seenOnLastOwn,
    lastOwn,
    remaining,
  };
}
