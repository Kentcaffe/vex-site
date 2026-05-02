"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { UserRole } from "@prisma/client";
import { ArrowLeft, Loader2, Paperclip, Send, Shield, Trash2 } from "lucide-react";
import { hasSupabasePublicEnv, tryCreateSupabaseBrowserClient } from "@/lib/supabase";
import {
  canTesterDeleteChatMessages,
  canTesterSendChatMessage,
  normalizeTesterLevel,
  testerLevelBadgeClasses,
  testerLevelLabelRo,
  TesterProgramLevel,
  type TesterLevel,
} from "@/lib/tester-level";

const TESTER_CHAT_CHANNEL = "tester-chat-global";
const TABLE = "tester_messages";

export type TesterChatMessage = {
  id: string;
  user_id: string;
  user: string;
  text: string;
  created_at: string;
};

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

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  if (p.length === 1) return p[0]!.slice(0, 2).toUpperCase();
  return (p[0]![0]! + p[p.length - 1]![0]!).toUpperCase();
}

function bubbleColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `hsl(${hue} 55% 42%)`;
}

function formatTime(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function dayKey(iso: string) {
  try {
    return new Date(iso).toDateString();
  } catch {
    return iso;
  }
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
  const [messages, setMessages] = useState<TesterChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [levelBySupabaseId, setLevelBySupabaseId] = useState<Record<string, TesterLevel>>(() => ({
    [supabaseUserId]: myTesterLevel,
  }));
  const [onlineByUserId, setOnlineByUserId] = useState<
    Record<
      string,
      { name: string; role?: string; avatarUrl?: string | null; testerLevel?: string }
    >
  >({});
  const listRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const canSend = canTesterSendChatMessage(myTesterLevel, appRole);
  const canDeleteOthers = canTesterDeleteChatMessages(myTesterLevel, appRole);

  useEffect(() => {
    setLevelBySupabaseId((prev) => ({ ...prev, [supabaseUserId]: myTesterLevel }));
  }, [supabaseUserId, myTesterLevel]);

  const levelRef = useRef(levelBySupabaseId);
  levelRef.current = levelBySupabaseId;

  useEffect(() => {
    const fromMessages = messages.map((m) => m.user_id);
    const fromOnline = Object.keys(onlineByUserId);
    const unique = [...new Set([...fromMessages, ...fromOnline, supabaseUserId])].filter(Boolean);
    const missing = unique.filter((id) => levelRef.current[id] === undefined);
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
  }, [messages, onlineByUserId, supabaseUserId]);

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
      setLoading(false);
      setError(t("supabaseMissing"));
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
        config: { presence: { key: supabaseUserId } },
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
              (a, b) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
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
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: TABLE },
        (payload) => {
          const row = payload.new as TesterChatMessage;
          if (!row?.id) return;
          setMessages((prev) =>
            prev.map((m) => (m.id === row.id ? { ...m, ...row } : m)),
          );
        },
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as Record<
          string,
          PresencePayload[]
        >;
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

  const grouped = useMemo(() => {
    const groups: { day: string; items: TesterChatMessage[] }[] = [];
    let currentDay = "";
    for (const m of messages) {
      const dk = dayKey(m.created_at);
      if (dk !== currentDay) {
        currentDay = dk;
        groups.push({ day: dk, items: [m] });
      } else {
        groups[groups.length - 1]!.items.push(m);
      }
    }
    return groups;
  }, [messages]);

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
    const supabase = tryCreateSupabaseBrowserClient();
    if (!supabase) {
      setError(t("supabaseMissing"));
      return;
    }
    setError(null);
    const { error: delErr } = await supabase.from(TABLE).delete().eq("id", messageId);
    if (delErr) {
      setError(t("deleteError"));
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    void submitMessage();
  }

  function roleLabel(role: string | undefined) {
    if (!role) return t("statusOnline");
    const k = role.toUpperCase();
    if (k === "TESTER") return t("roleTester");
    if (k === "MODERATOR") return t("roleModerator");
    if (k === "ADMIN") return t("roleAdmin");
    if (k === "USER") return t("roleUser");
    return t("statusOnline");
  }

  const onlineCount = onlineList.length;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-zinc-50 to-zinc-100/90 px-3 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-5">
        <div className="flex min-h-[calc(100dvh-5.5rem)] flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-lg shadow-zinc-900/5 lg:min-h-[min(70vh,640px)]">
          <header className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-zinc-100 px-4 py-4 sm:px-5">
            <div className="space-y-1">
              <Link
                href="/tester"
                className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800"
              >
                <ArrowLeft className="size-3.5" aria-hidden />
                {t("backToDashboard")}
              </Link>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                {t("title")}
              </h1>
              <p className="text-sm text-zinc-500">{t("subtitle")}</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
              <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(34,197,94,0.25)]" />
              {t("onlineBadge", { count: onlineCount })}
            </div>
          </header>

          <div
            ref={listRef}
            className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:px-5"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {loading ? (
              <div className="flex justify-center py-16 text-zinc-400">
                <Loader2 className="size-8 animate-spin" aria-hidden />
              </div>
            ) : null}

            {error ? (
              <p
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            {!loading && messages.length === 0 && !error ? (
              <p className="py-12 text-center text-sm text-zinc-500">{t("empty")}</p>
            ) : null}

            {grouped.map((group) => (
              <div key={group.day} className="space-y-3">
                <div className="flex justify-center">
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500">
                    {formatDayLabel(group.items[0]!.created_at)}
                  </span>
                </div>
                {group.items.map((m) => {
                  const mine = m.user_id === supabaseUserId;
                  return (
                    <div
                      key={m.id}
                      className={`flex gap-2 ${mine ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div
                        className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-inner ring-2 ring-white"
                        style={{
                          backgroundColor: mine ? "#22c55e" : bubbleColor(m.user_id),
                        }}
                        aria-hidden
                      >
                        {initials(m.user)}
                      </div>
                      <div
                        className={`max-w-[min(100%,28rem)] rounded-2xl px-4 py-2.5 shadow-sm ${
                          mine
                            ? "rounded-br-md bg-emerald-50 text-zinc-900 ring-1 ring-emerald-100/80"
                            : "rounded-bl-md bg-zinc-100 text-zinc-900 ring-1 ring-zinc-200/80"
                        }`}
                      >
                        <div
                          className={`mb-1 flex flex-wrap items-center gap-2 text-xs ${
                            mine ? "justify-end text-emerald-800" : "justify-between text-zinc-500"
                          }`}
                        >
                          <div
                            className={`flex min-w-0 flex-wrap items-center gap-2 ${
                              mine ? "justify-end" : ""
                            }`}
                          >
                            {!mine ? (
                              <span className="font-semibold text-emerald-700">{m.user}</span>
                            ) : (
                              <span className="font-semibold text-emerald-800">{t("you")}</span>
                            )}
                            <span
                              className={`inline-flex max-w-full shrink-0 truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${testerLevelBadgeClasses(
                                levelBySupabaseId[m.user_id] ?? TesterProgramLevel.trial,
                              )}`}
                              title={testerLevelLabelRo(
                                levelBySupabaseId[m.user_id] ?? TesterProgramLevel.trial,
                              )}
                            >
                              [
                              {testerLevelLabelRo(
                                levelBySupabaseId[m.user_id] ?? TesterProgramLevel.trial,
                              )}
                              ]
                            </span>
                            <time dateTime={m.created_at} className="tabular-nums text-zinc-400">
                              {formatTime(m.created_at, locale)}
                            </time>
                          </div>
                          {canDeleteOthers ? (
                            <button
                              type="button"
                              onClick={() => void deleteMessage(m.id)}
                              className="shrink-0 rounded-lg p-1 text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600"
                              aria-label={t("deleteAria")}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          ) : null}
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
                          {m.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {canSend ? (
            <form
              onSubmit={handleFormSubmit}
              className="shrink-0 border-t border-zinc-100 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:p-4"
            >
              <div className="flex items-end gap-2 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-2 shadow-inner ring-1 ring-zinc-100/80">
                <button
                  type="button"
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-600"
                  aria-label={t("attachSoon")}
                  title={t("attachSoon")}
                  disabled
                >
                  <Paperclip className="size-5" />
                </button>
                <label className="sr-only" htmlFor="tester-chat-input">
                  {t("inputLabel")}
                </label>
                <textarea
                  id="tester-chat-input"
                  rows={1}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void submitMessage();
                    }
                  }}
                  placeholder={t("placeholder")}
                  className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-600 disabled:pointer-events-none disabled:opacity-40"
                  aria-label={t("sendAria")}
                >
                  {sending ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Send className="size-5" />
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="shrink-0 border-t border-zinc-100 bg-zinc-50/90 px-4 py-4 text-center text-sm text-zinc-600">
              {t("trialReadOnly")}
            </div>
          )}
        </div>

        <aside className="hidden w-80 shrink-0 flex-col gap-4 lg:flex">
          <section className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-lg shadow-zinc-900/5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-zinc-900">{t("onlineTitle")}</h2>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                {onlineCount}
              </span>
            </div>
            <ul className="max-h-64 space-y-2 overflow-y-auto lg:max-h-[min(50vh,320px)]">
              {onlineList.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 px-3 py-2"
                >
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: bubbleColor(u.id) }}
                  >
                    {initials(u.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900">{u.name}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex max-w-full truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${testerLevelBadgeClasses(
                          levelBySupabaseId[u.id] ?? normalizeTesterLevel(u.testerLevel),
                        )}`}
                      >
                        [
                        {testerLevelLabelRo(
                          levelBySupabaseId[u.id] ?? normalizeTesterLevel(u.testerLevel),
                        )}
                        ]
                      </span>
                      <p className="truncate text-xs font-medium text-emerald-600">
                        {roleLabel(u.role)}
                      </p>
                    </div>
                  </div>
                  <span
                    className="size-2 shrink-0 rounded-full bg-emerald-500"
                    title={t("statusOnline")}
                  />
                </li>
              ))}
            </ul>
            {onlineList.length === 0 ? (
              <p className="mt-2 text-center text-xs text-zinc-400">{t("onlineEmpty")}</p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-lg shadow-zinc-900/5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <Shield className="size-4 text-emerald-600" aria-hidden />
              {t("rulesTitle")}
            </div>
            <ul className="space-y-2.5 text-sm text-zinc-600">
              <li className="flex gap-2">
                <span className="mt-0.5 text-emerald-500">✓</span>
                {t("rule1")}
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-emerald-500">✓</span>
                {t("rule2")}
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-emerald-500">✓</span>
                {t("rule3")}
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-emerald-500">✓</span>
                {t("rule4")}
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
