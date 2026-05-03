"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import type { UserRole } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { hasSupabasePublicEnv, tryCreateSupabaseBrowserClient } from "@/lib/supabase";
import {
  canTesterDeleteChatMessages,
  canTesterSendChatMessage,
  normalizeTesterLevel,
  TesterProgramLevel,
  type TesterLevel,
} from "@/lib/tester-level";
import { TesterSidebar } from "@/components/tester/dashboard/TesterSidebar";
import { useTesterSidebarItems } from "@/components/tester/useTesterSidebarItems";
import { TesterChatHeader } from "@/components/tester/chat/TesterChatHeader";
import { TesterChatPinnedBar } from "@/components/tester/chat/TesterChatPinnedBar";
import { TesterChatTypingBar } from "@/components/tester/chat/TesterChatTypingBar";
import {
  TesterChatMessageRow,
  type ChatMessageModel,
} from "@/components/tester/chat/TesterChatMessageRow";
import { TesterChatInput } from "@/components/tester/chat/TesterChatInput";
import { TesterChatRightPanel } from "@/components/tester/chat/TesterChatRightPanel";
import { dayKey } from "@/components/tester/chat/tester-chat-utils";

export type TesterChatMessage = ChatMessageModel;

const TESTER_CHAT_CHANNEL = "tester-chat-global";
const TABLE = "tester_messages";

type PresencePayload = {
  name: string;
  role?: string;
  avatarUrl?: string | null;
  testerLevel?: string;
};

type Props = {
  locale: string;
  supabaseUserId: string;
  displayName: string;
  userRole: string;
  appRole: UserRole;
  myTesterLevel: TesterLevel;
  avatarUrl?: string | null;
};

function bugDiscussedHeuristic(text: string) {
  return /\bbug\b|buguri|bugs|#bug|raport|report|repro|reproduce|crash|eroare|error/i.test(text);
}

export function TesterChatClient({
  locale,
  supabaseUserId,
  displayName,
  userRole,
  appRole,
  myTesterLevel,
  avatarUrl,
}: Props) {
  const t = useTranslations("TesterChat");
  const sidebarItems = useTesterSidebarItems();
  const [messages, setMessages] = useState<TesterChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [levelBySupabaseId, setLevelBySupabaseId] = useState<Record<string, TesterLevel>>({});
  const levelBySupabaseIdResolved = useMemo(
    () => ({ ...levelBySupabaseId, [supabaseUserId]: myTesterLevel }),
    [levelBySupabaseId, supabaseUserId, myTesterLevel],
  );
  const [onlineByUserId, setOnlineByUserId] = useState<
    Record<
      string,
      { name: string; role?: string; avatarUrl?: string | null; testerLevel?: string }
    >
  >({});
  const [typingLine, setTypingLine] = useState<string | null>(null);
  const [reactionCountsByMessage, setReactionCountsByMessage] = useState<
    Record<string, Record<string, number>>
  >({});
  const [myReactionKeys, setMyReactionKeys] = useState<Record<string, true>>({});

  const listRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef(0);

  const canSend = canTesterSendChatMessage(myTesterLevel, appRole);
  const canDeleteOthers = canTesterDeleteChatMessages(myTesterLevel, appRole);

  useEffect(() => {
    const fromMessages = messages.map((m) => m.user_id);
    const fromOnline = Object.keys(onlineByUserId);
    const unique = [...new Set([...fromMessages, ...fromOnline, supabaseUserId])].filter(Boolean);
    const missing = unique.filter((id) => levelBySupabaseIdResolved[id] === undefined);
    if (missing.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/tester/levels?ids=${encodeURIComponent(missing.join(","))}`,
          { credentials: "include" },
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          levels?: Record<string, { testerLevel: TesterLevel }>;
        };
        const levels = data.levels;
        if (cancelled || !levels) return;
        setLevelBySupabaseId((prev) => {
          const next = { ...prev };
          for (const [id, meta] of Object.entries(levels)) {
            next[id] = normalizeTesterLevel(meta.testerLevel);
          }
          return next;
        });
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [messages, onlineByUserId, supabaseUserId, levelBySupabaseIdResolved]);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  const loadMessages = useCallback(async () => {
    const supabase = tryCreateSupabaseBrowserClient();
    if (!supabase) throw new Error("no_supabase");
    const { data, error: qErr } = await supabase
      .from(TABLE)
      .select("id,user_id,user,text,created_at")
      .order("created_at", { ascending: true });
    if (qErr) throw qErr;
    setMessages((data ?? []) as TesterChatMessage[]);
  }, []);

  useEffect(() => {
    if (!hasSupabasePublicEnv()) {
      queueMicrotask(() => {
        setLoading(false);
        setError(t("supabaseMissing"));
      });
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await loadMessages();
      } catch {
        if (!cancelled) setError(t("loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadMessages, t]);

  useEffect(() => {
    queueMicrotask(scrollToBottom);
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!hasSupabasePublicEnv()) return;

    const supabase = tryCreateSupabaseBrowserClient();
    if (!supabase) return;

    const channel = supabase
      .channel(TESTER_CHAT_CHANNEL, {
        config: {
          presence: { key: supabaseUserId },
          broadcast: { self: false },
        },
      })
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: TABLE },
        (payload) => {
          const row = payload.new as TesterChatMessage;
          if (!row?.id) return;
          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, row].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            );
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: TABLE },
        (payload) => {
          const oldRow = payload.old as Pick<TesterChatMessage, "id">;
          if (!oldRow?.id) return;
          setMessages((prev) => prev.filter((m) => m.id !== oldRow.id));
          setReactionCountsByMessage((prev) => {
            const next = { ...prev };
            delete next[oldRow.id];
            return next;
          });
          setMyReactionKeys((prev) => {
            const prefix = `${oldRow.id}::`;
            const next = { ...prev };
            for (const k of Object.keys(next)) {
              if (k.startsWith(prefix)) delete next[k];
            }
            return next;
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: TABLE },
        (payload) => {
          const row = payload.new as TesterChatMessage;
          if (!row?.id) return;
          setMessages((prev) => prev.map((m) => (m.id === row.id ? { ...m, ...row } : m)));
        },
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as Record<string, PresencePayload[]>;
        const next: Record<
          string,
          { name: string; role?: string; avatarUrl?: string | null; testerLevel?: string }
        > = {};
        for (const [key, presences] of Object.entries(state)) {
          const first = presences?.[0];
          if (first?.name) {
            next[key] = {
              name: first.name,
              role: first.role,
              avatarUrl: first.avatarUrl ?? null,
              testerLevel: first.testerLevel,
            };
          }
        }
        setOnlineByUserId(next);
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const p = payload as { name?: string; userId?: string };
        if (!p?.name || p.userId === supabaseUserId) return;
        setTypingLine(t("typingLine", { name: p.name }));
        if (typingClearRef.current) clearTimeout(typingClearRef.current);
        typingClearRef.current = setTimeout(() => setTypingLine(null), 2800);
      })
      .on("broadcast", { event: "reaction" }, ({ payload }) => {
        const p = payload as {
          messageId?: string;
          emoji?: string;
          userId?: string;
          active?: boolean;
        };
        if (!p?.messageId || !p?.emoji || typeof p.active !== "boolean") return;
        if (p.userId === supabaseUserId) return;
        setReactionCountsByMessage((prev) => {
          const msg = { ...(prev[p.messageId!] ?? {}) };
          const n = Math.max(0, (msg[p.emoji!] ?? 0) + (p.active ? 1 : -1));
          if (n === 0) delete msg[p.emoji!];
          else msg[p.emoji!] = n;
          const out = { ...prev };
          if (Object.keys(msg).length === 0) delete out[p.messageId!];
          else out[p.messageId!] = msg;
          return out;
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            name: displayName || t("anonymous"),
            role: userRole,
            avatarUrl: avatarUrl ?? null,
            testerLevel: myTesterLevel,
          } satisfies PresencePayload);
        }
      });

    channelRef.current = channel;
    return () => {
      if (typingClearRef.current) clearTimeout(typingClearRef.current);
      void supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [avatarUrl, displayName, myTesterLevel, supabaseUserId, t, userRole]);

  const onlineList = useMemo(() => {
    return Object.entries(onlineByUserId).map(([id, meta]) => ({
      id,
      ...meta,
    }));
  }, [onlineByUserId]);

  const filteredMessages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        m.text.toLowerCase().includes(q) ||
        m.user.toLowerCase().includes(q) ||
        m.user_id.toLowerCase().includes(q),
    );
  }, [messages, search]);

  const grouped = useMemo(() => {
    const groups: { day: string; items: TesterChatMessage[] }[] = [];
    let currentDay = "";
    for (const m of filteredMessages) {
      const dk = dayKey(m.created_at);
      if (dk !== currentDay) {
        currentDay = dk;
        groups.push({ day: dk, items: [m] });
      } else {
        groups[groups.length - 1]!.items.push(m);
      }
    }
    return groups;
  }, [filteredMessages]);

  function formatDayLabel(iso: string) {
    const today = new Date().toDateString();
    if (dayKey(iso) === today) return t("dateToday");
    try {
      return new Date(iso).toLocaleDateString(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    } catch {
      return iso;
    }
  }

  const badgeForMessageAuthor = useCallback(
    (userId: string) => {
      const r = onlineByUserId[userId]?.role?.toUpperCase();
      if (r === "ADMIN") return t("roleAdmin");
      if (r === "MODERATOR") return t("roleModerator");
      const lvl = levelBySupabaseIdResolved[userId] ?? TesterProgramLevel.trial;
      switch (lvl) {
        case TesterProgramLevel.tester:
          return t("badgeTester");
        case TesterProgramLevel.advanced:
          return t("badgeAdvanced");
        case TesterProgramLevel.lead:
          return t("badgeLead");
        default:
          return t("badgeTrial");
      }
    },
    [levelBySupabaseIdResolved, onlineByUserId, t],
  );

  const myMessageCount = useMemo(
    () => messages.filter((m) => m.user_id === supabaseUserId).length,
    [messages, supabaseUserId],
  );
  const bugDiscussedCount = useMemo(
    () => messages.filter((m) => bugDiscussedHeuristic(m.text)).length,
    [messages],
  );
  const onlineCount = onlineList.length;

  function myReactionKey(mid: string, emoji: string) {
    return `${mid}::${emoji}`;
  }

  function hasMyReaction(key: string) {
    return !!myReactionKeys[key];
  }

  function toggleReaction(messageId: string, emoji: string) {
    const ch = channelRef.current;
    if (!ch) return;
    const key = myReactionKey(messageId, emoji);
    const active = !myReactionKeys[key];

    setMyReactionKeys((prev) => {
      const next = { ...prev };
      if (active) next[key] = true;
      else delete next[key];
      return next;
    });
    setReactionCountsByMessage((prev) => {
      const cur = { ...(prev[messageId] ?? {}) };
      const n = Math.max(0, (cur[emoji] ?? 0) + (active ? 1 : -1));
      if (n === 0) delete cur[emoji];
      else cur[emoji] = n;
      const out = { ...prev };
      if (Object.keys(cur).length === 0) delete out[messageId];
      else out[messageId] = cur;
      return out;
    });

    void ch.send({
      type: "broadcast",
      event: "reaction",
      payload: { messageId, emoji, userId: supabaseUserId, active },
    });
  }

  function onDraftChange(next: string) {
    setDraft(next);
    if (!canSend) return;
    const ch = channelRef.current;
    if (!ch) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current < 1400) return;
    lastTypingSentRef.current = now;
    void ch.send({
      type: "broadcast",
      event: "typing",
      payload: { name: displayName || t("anonymous"), userId: supabaseUserId },
    });
  }

  async function submitMessage() {
    if (!canSend) return;
    const text = draft.trim();
    if (!text || sending) return;

    const supabase = tryCreateSupabaseBrowserClient();
    if (!supabase) {
      setError(t("supabaseMissing"));
      return;
    }

    setSending(true);
    setError(null);
    const { error: insErr } = await supabase.from(TABLE).insert({
      user_id: supabaseUserId,
      user: displayName || t("anonymous"),
      text,
    });
    setSending(false);
    if (insErr) {
      setError(t("sendError"));
      return;
    }
    setDraft("");
  }

  async function deleteMessage(messageId: string) {
    if (!canDeleteOthers) return;
    setError(null);
    const res = await fetch(
      `/api/tester/messages?messageId=${encodeURIComponent(messageId)}`,
      { method: "DELETE", credentials: "include" },
    );
    if (res.status === 204) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      return;
    }
    let detail = "";
    try {
      const body = (await res.json()) as { message?: string };
      if (body.message) detail = ` (${body.message})`;
    } catch {
      /* ignore */
    }
    if (res.status === 403) {
      setError(t("deleteErrorForbidden"));
      return;
    }
    setError(`${t("deleteError")}${detail}`);
  }

  const guideSteps = useMemo(
    () =>
      [t("chatGuide1"), t("chatGuide2"), t("chatGuide3"), t("chatGuide4"), t("chatGuide5")] as [
        string,
        string,
        string,
        string,
        string,
      ],
    [t],
  );

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0B0F1A] text-slate-200">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.22),transparent)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_0%,rgba(56,189,248,0.12),transparent)]" />

      <div className="relative mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_300px]">
          <TesterSidebar items={sidebarItems} chatHref="/tester/chat" chatLabel={t("dashboardLink")} />

          <div className="flex min-h-[min(100dvh,880px)] min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/50 backdrop-blur-xl lg:min-h-[calc(100dvh-10rem)]">
            <TesterChatHeader
              backLabel={t("backToDashboard")}
              backHref="/tester"
              title={t("title")}
              subtitle={t("subtitle")}
              onlineBadge={t("onlineNow", { count: onlineCount })}
              searchPlaceholder={t("searchPlaceholder")}
              search={search}
              onSearchChangeAction={setSearch}
            />

            <TesterChatPinnedBar title={t("pinnedTitle")} body={t("pinnedBody")} />
            <TesterChatTypingBar label={typingLine} />

            <div
              ref={listRef}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:px-5"
              role="log"
              aria-live="polite"
              aria-relevant="additions"
            >
              {loading ? (
                <div className="flex justify-center py-16 text-violet-400/80">
                  <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
                </div>
              ) : null}

              {error ? (
                <p
                  className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              {!loading && filteredMessages.length === 0 && !error ? (
                <p className="py-12 text-center text-sm text-slate-500">
                  {messages.length === 0 ? t("empty") : t("searchEmpty")}
                </p>
              ) : null}

              {grouped.map((group) => (
                <div key={group.day} className="space-y-4">
                  <div className="flex justify-center">
                    <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-medium text-slate-400">
                      {formatDayLabel(group.items[0]!.created_at)}
                    </span>
                  </div>
                  {group.items.map((m) => {
                    const mine = m.user_id === supabaseUserId;
                    return (
                      <TesterChatMessageRow
                        key={m.id}
                        message={m}
                        mine={mine}
                        locale={locale}
                        badgeText={badgeForMessageAuthor(m.user_id)}
                        canDelete={canDeleteOthers}
                        onDeleteAction={canDeleteOthers ? (id) => void deleteMessage(id) : undefined}
                        reactionCounts={reactionCountsByMessage[m.id] ?? {}}
                        myReactionKeyAction={myReactionKey}
                        hasMyReactionAction={hasMyReaction}
                        onToggleReactionAction={toggleReaction}
                        reactionAria={t("reactionToggleAria")}
                        deleteAria={t("deleteAria")}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {canSend ? (
              <TesterChatInput
                value={draft}
                onChangeAction={onDraftChange}
                onSubmitAction={() => void submitMessage()}
                sending={sending}
                disabled={sending}
                placeholder={t("placeholder")}
                emojiPickerAria={t("emojiPickerAria")}
                attachAria={t("attachAria")}
              />
            ) : (
              <div className="shrink-0 border-t border-white/[0.08] bg-black/30 px-4 py-4 text-center text-sm text-slate-400">
                {t("trialReadOnly")}
              </div>
            )}
          </div>

          <TesterChatRightPanel
            guideTitle={t("guideChatTitle")}
            steps={guideSteps}
            onlineTitle={t("onlineTitle")}
            onlineEmpty={t("onlineEmpty")}
            onlineUsers={onlineList.map((u) => ({ id: u.id, name: u.name }))}
            statsTitle={t("statsChatTitle")}
            statMessages={t("statMessagesSent")}
            statBugs={t("statBugsDiscussed")}
            statReporters={t("statActiveReporters")}
            statMessagesValue={myMessageCount}
            statBugsValue={bugDiscussedCount}
            statReportersValue={onlineCount}
          />
        </div>
      </div>
    </div>
  );
}
