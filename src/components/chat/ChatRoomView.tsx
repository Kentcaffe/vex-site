"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useChatSocketContext } from "@/components/chat/chat-socket-context";

export type ChatBootstrap = {
  roomId: string;
  listing: { id: string; title: string };
  seller: { id: string; name: string };
  buyer?: { id: string; name: string };
  meIsBuyer: boolean;
  otherUserName: string;
  messages: { id: string; senderId: string; body: string; createdAt: string }[];
  otherLastReadAt: string | null;
  myLastReadAt: string | null;
  maxBodyLength: number;
};

type Props = {
  bootstrap: ChatBootstrap;
  currentUserId: string;
};

export function ChatRoomView({ bootstrap, currentUserId }: Props) {
  const t = useTranslations("Chat");
  const { socket, connected } = useChatSocketContext();
  const [messages, setMessages] = useState(bootstrap.messages);
  const [otherLastReadAt, setOtherLastReadAt] = useState<string | null>(bootstrap.otherLastReadAt);
  const [draft, setDraft] = useState("");
  const [typingPeer, setTypingPeer] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const roomId = bootstrap.roomId;

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.emit("room:join", { roomId }, (err?: string) => {
      if (err) {
        console.warn("room:join", err);
      }
    });
    const onNew = (msg: {
      id: string;
      roomId: string;
      senderId: string;
      body: string;
      createdAt: string;
    }) => {
      if (msg.roomId !== roomId) {
        return;
      }
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) {
          return prev;
        }
        return [...prev, { id: msg.id, senderId: msg.senderId, body: msg.body, createdAt: msg.createdAt }];
      });
      if (msg.senderId !== currentUserId) {
        void fetch(`/api/chat/room/${roomId}/read`, { method: "POST", credentials: "include" });
        socket.emit("read", { roomId });
      }
    };
    const onTyping = (p: { roomId?: string; userId?: string; typing?: boolean }) => {
      if (p.roomId !== roomId || !p.userId || p.userId === currentUserId) {
        return;
      }
      setTypingPeer(Boolean(p.typing));
    };
    const onRead = (p: { roomId?: string; userId?: string; lastReadAt?: string }) => {
      if (p.roomId !== roomId || !p.lastReadAt || p.userId === currentUserId) {
        return;
      }
      setOtherLastReadAt(p.lastReadAt);
    };
    socket.on("message:new", onNew);
    socket.on("typing", onTyping);
    socket.on("read:update", onRead);
    void fetch(`/api/chat/room/${roomId}/read`, { method: "POST", credentials: "include" });
    socket.emit("read", { roomId });

    return () => {
      socket.emit("room:leave", { roomId });
      socket.off("message:new", onNew);
      socket.off("typing", onTyping);
      socket.off("read:update", onRead);
    };
  }, [socket, roomId, currentUserId]);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || !socket) {
      return;
    }
    socket.emit("message:send", { roomId, body: text });
    setDraft("");
    socket.emit("typing", { roomId, typing: false });
  }, [draft, socket, roomId]);

  const onDraftChange = (v: string) => {
    setDraft(v);
    if (!socket) {
      return;
    }
    socket.emit("typing", { roomId, typing: v.length > 0 });
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }
    typingTimer.current = setTimeout(() => {
      socket.emit("typing", { roomId, typing: false });
    }, 2000);
  };

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

  return (
    <div className="flex min-h-[420px] flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <p className="text-xs text-zinc-500">{bootstrap.listing.title}</p>
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {t("with", { name: bootstrap.otherUserName })}
        </p>
        <p className="mt-1 text-[11px] text-zinc-400">
          {connected ? t("live") : t("connecting")}
        </p>
      </div>
      <div className="flex max-h-[min(60vh,520px)] min-h-[240px] flex-1 flex-col overflow-y-auto px-3 py-3">
        <ul className="space-y-2">
          {messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    mine
                      ? "bg-emerald-600 text-white dark:bg-emerald-700"
                      : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={`mt-1 text-[10px] ${mine ? "text-emerald-100" : "text-zinc-500"}`}>
                    {new Date(m.createdAt).toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        {typingPeer ? (
          <p className="mt-2 text-xs italic text-zinc-500">{t("typing")}</p>
        ) : null}
        <div ref={bottomRef} />
      </div>
      {lastOwn && seenOnLastOwn ? (
        <p className="border-t border-zinc-100 px-4 py-1 text-[11px] text-zinc-500 dark:border-zinc-800">{t("seen")}</p>
      ) : null}
      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <div className="flex gap-2">
          <textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            maxLength={bootstrap.maxBodyLength}
            rows={2}
            placeholder={t("placeholder")}
            className="min-h-[44px] flex-1 resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={!draft.trim() || !connected}
            className="self-end rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {t("send")}
          </button>
        </div>
      </div>
    </div>
  );
}
