"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Conversation = {
  user_id: string;
  email: string;
  name: string;
  last_message: string;
  last_sender: "user" | "admin";
  last_created_at: string;
  unread_count: number;
};

type Message = {
  id: string;
  user_id: string;
  message: string;
  sender: "user" | "admin";
  created_at: string;
};

function fmt(value: string) {
  try {
    return new Date(value).toLocaleString("ro-RO", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export function AdminTesterSupportClient() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [adminOnline, setAdminOnline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pingPresence = useCallback(async () => {
    await fetch("/api/admin/tester-support/presence", {
      method: "POST",
      credentials: "include",
    }).catch(() => null);
  }, []);

  const loadConversations = useCallback(async (initial = false) => {
    try {
      if (initial) setLoading(true);
      const res = await fetch("/api/admin/tester-support/conversations", {
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as {
        conversations?: Conversation[];
        adminOnline?: boolean;
      };
      if (!res.ok) {
        setError("Nu am putut incarca conversatiile.");
        return;
      }
      const next = data.conversations ?? [];
      setConversations(next);
      setAdminOnline(Boolean(data.adminOnline));
      if (!selectedUserId && next[0]?.user_id) {
        setSelectedUserId(next[0].user_id);
      }
      setError(null);
    } catch {
      setError("Eroare de retea.");
    } finally {
      if (initial) setLoading(false);
    }
  }, [selectedUserId]);

  const loadMessages = useCallback(async (userId: string) => {
    if (!userId) return;
    const res = await fetch(`/api/admin/tester-support/messages/${encodeURIComponent(userId)}`, {
      credentials: "include",
    });
    const data = (await res.json().catch(() => ({}))) as { messages?: Message[] };
    if (!res.ok) return;
    setMessages(data.messages ?? []);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadConversations(true);
      void pingPresence();
    });
    const pollId = setInterval(() => {
      void loadConversations(false);
      if (selectedUserId) void loadMessages(selectedUserId);
    }, 3000);
    const presenceId = setInterval(() => void pingPresence(), 15000);
    return () => {
      clearInterval(pollId);
      clearInterval(presenceId);
    };
  }, [loadConversations, loadMessages, pingPresence, selectedUserId]);

  useEffect(() => {
    if (!selectedUserId) return;
    queueMicrotask(() => {
      void loadMessages(selectedUserId);
    });
  }, [loadMessages, selectedUserId]);

  const selectedConv = useMemo(
    () => conversations.find((c) => c.user_id === selectedUserId) ?? null,
    [conversations, selectedUserId],
  );

  const filteredConversations = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((c) =>
      `${c.name} ${c.email} ${c.last_message}`.toLowerCase().includes(query),
    );
  }, [conversations, q]);

  async function sendReply() {
    const msg = draft.trim();
    if (!selectedUserId || !msg || sending) return;
    setSending(true);
    try {
      const res = await fetch(
        `/api/admin/tester-support/messages/${encodeURIComponent(selectedUserId)}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg }),
        },
      );
      if (!res.ok) {
        setError("Nu am putut trimite raspunsul.");
        return;
      }
      setDraft("");
      await Promise.all([loadMessages(selectedUserId), loadConversations(false), pingPresence()]);
      setError(null);
    } catch {
      setError("Raspunsul nu a fost trimis (retea).");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Chat suport testeri
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Inbox centralizat: toate conversatiile individuale tester-admin.
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            adminOnline
              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
              : "border-zinc-500/50 bg-zinc-500/10 text-zinc-400"
          }`}
        >
          Admin {adminOnline ? "online" : "offline"}
        </span>
      </div>

      {error ? (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cauta dupa user/email..."
            className="mb-3 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
          <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
            {loading ? <p className="text-sm text-zinc-500">Se incarca...</p> : null}
            {filteredConversations.map((c) => (
              <button
                key={c.user_id}
                type="button"
                onClick={() => setSelectedUserId(c.user_id)}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  selectedUserId === c.user_id
                    ? "border-violet-500/50 bg-violet-500/10"
                    : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{c.name}</p>
                    <p className="text-xs text-zinc-500">{c.email}</p>
                  </div>
                  {c.unread_count > 0 ? (
                    <span className="rounded-full border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-200">
                      {c.unread_count}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-zinc-500">{c.last_message}</p>
                <p className="mt-1 text-[11px] text-zinc-400">{fmt(c.last_created_at)}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="flex min-h-[70vh] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            {selectedConv ? (
              <>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {selectedConv.name}
                </p>
                <p className="text-xs text-zinc-500">
                  {selectedConv.email} · user_id: {selectedConv.user_id}
                </p>
              </>
            ) : (
              <p className="text-sm text-zinc-500">Alege o conversatie din inbox.</p>
            )}
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-zinc-50 p-4 dark:bg-zinc-950/40">
            {messages.length === 0 ? (
              <p className="text-sm text-zinc-500">Fara mesaje inca.</p>
            ) : (
              messages.map((m) => {
                const mine = m.sender === "admin";
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl border px-3 py-2 text-sm ${
                        mine
                          ? "border-violet-500/50 bg-violet-600/15 text-violet-100"
                          : "border-zinc-300 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.message}</p>
                      <p className="mt-1 text-[11px] text-zinc-500">{fmt(m.created_at)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="border-t border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                placeholder="Scrie raspuns pentru tester..."
                className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
              <button
                type="button"
                onClick={() => void sendReply()}
                disabled={!selectedUserId || !draft.trim() || sending}
                className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
              >
                {sending ? "Se trimite..." : "Raspunde"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
