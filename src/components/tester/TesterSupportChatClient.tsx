"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Message = {
  id: string;
  user_id: string;
  message: string;
  sender: "user" | "admin";
  created_at: string;
};

function timeLabel(value: string) {
  try {
    return new Date(value).toLocaleString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return value;
  }
}

export function TesterSupportChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminOnline, setAdminOnline] = useState(false);
  const [lastAdminReplyAt, setLastAdminReplyAt] = useState<string | null>(null);
  const [newAdminCount, setNewAdminCount] = useState(0);
  const lastSeenAdminReplyRef = useRef<string>("");
  const listRef = useRef<HTMLDivElement>(null);

  async function loadMessages(initial = false) {
    try {
      if (initial) setLoading(true);
      const res = await fetch("/api/tester/support/messages", { credentials: "include" });
      const data = (await res.json().catch(() => ({}))) as {
        messages?: Message[];
        adminOnline?: boolean;
      };
      if (!res.ok) {
        setError("Nu am putut încărca chat-ul de suport.");
        return;
      }
      const next = data.messages ?? [];
      setMessages(next);
      setAdminOnline(Boolean(data.adminOnline));
      const latestAdmin = [...next].reverse().find((m) => m.sender === "admin");
      if (latestAdmin?.created_at) {
        setLastAdminReplyAt(latestAdmin.created_at);
        if (!lastSeenAdminReplyRef.current) {
          lastSeenAdminReplyRef.current = latestAdmin.created_at;
        } else if (latestAdmin.created_at !== lastSeenAdminReplyRef.current) {
          setNewAdminCount((v) => v + 1);
          lastSeenAdminReplyRef.current = latestAdmin.created_at;
        }
      }
      setError(null);
    } catch {
      setError("Conexiune întreruptă. Reîncearcă.");
    } finally {
      if (initial) setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadMessages(true);
    });
    const id = setInterval(() => void loadMessages(false), 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const stats = useMemo(() => {
    const total = messages.length;
    const mine = messages.filter((m) => m.sender === "user").length;
    const admin = total - mine;
    return { total, mine, admin };
  }, [messages]);

  async function sendMessage() {
    const message = draft.trim();
    if (!message || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/tester/support/messages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) {
        setError("Nu am putut trimite mesajul.");
        return;
      }
      setDraft("");
      void loadMessages(false);
    } catch {
      setError("Eroare de rețea la trimitere.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 sm:p-6">
        <h1 className="text-xl font-bold text-white">Suport tester individual</h1>
        <p className="mt-2 text-sm text-slate-400">
          Acest chat este privat: doar tu si adminul vede mesajele.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`rounded-full border px-2.5 py-1 font-semibold ${
              adminOnline
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                : "border-zinc-600 bg-zinc-800/60 text-zinc-300"
            }`}
          >
            Admin {adminOnline ? "online" : "offline"}
          </span>
          {newAdminCount > 0 ? (
            <span className="rounded-full border border-violet-500/40 bg-violet-500/15 px-2.5 py-1 font-semibold text-violet-200">
              Mesaje noi: {newAdminCount}
            </span>
          ) : null}
          {lastAdminReplyAt ? (
            <span className="text-slate-500">Ultimul raspuns admin: {timeLabel(lastAdminReplyAt)}</span>
          ) : (
            <span className="text-slate-500">Adminul nu a raspuns inca.</span>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          <p className="text-xs text-slate-400">Total mesaje</p>
          <p className="mt-1 text-2xl font-bold text-white">{stats.total}</p>
        </article>
        <article className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          <p className="text-xs text-slate-400">Trimise de tine</p>
          <p className="mt-1 text-2xl font-bold text-white">{stats.mine}</p>
        </article>
        <article className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          <p className="text-xs text-slate-400">Raspunsuri admin</p>
          <p className="mt-1 text-2xl font-bold text-white">{stats.admin}</p>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/20">
        <div
          ref={listRef}
          className="max-h-[58vh] space-y-3 overflow-y-auto p-4 sm:p-5"
          aria-live="polite"
        >
          {loading ? <p className="text-sm text-slate-400">Se incarca...</p> : null}
          {!loading && messages.length === 0 ? (
            <p className="text-sm text-slate-500">Incepe conversatia cu un mesaj catre admin.</p>
          ) : null}
          {messages.map((m) => {
            const mine = m.sender === "user";
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[82%] rounded-2xl border px-4 py-2.5 text-sm ${
                    mine
                      ? "border-violet-500/40 bg-violet-600/20 text-violet-50"
                      : "border-zinc-700 bg-zinc-900/80 text-zinc-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.message}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{timeLabel(m.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="border-t border-white/[0.08] bg-black/30 p-3 sm:p-4">
          {error ? (
            <p className="mb-2 rounded-lg border border-rose-500/35 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {error}
            </p>
          ) : null}
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              maxLength={4000}
              placeholder="Scrie mesajul pentru admin..."
              className="min-h-[52px] flex-1 resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/50"
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={sending || !draft.trim()}
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
            >
              {sending ? "Se trimite..." : "Trimite"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
