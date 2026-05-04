"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Row = {
  id: string;
  email: string;
  lastLogin: string | null;
  sessionsCount: number;
  totalTimeSpent: number;
  lastActive: string | null;
  lastPath: string | null;
  status: "active" | "inactive";
};

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function AdminTestersClient() {
  const t = useTranslations("Admin.testers");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [sort, setSort] = useState<"lastActive" | "email" | "sessions" | "time">("lastActive");
  const [createOpen, setCreateOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [createPending, setCreatePending] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (status !== "all") p.set("status", status);
    p.set("sort", sort);
    return p.toString();
  }, [q, status, sort]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/testers?${query}`, { credentials: "include" });
      const data = (await res.json()) as { ok?: boolean; testers?: Row[]; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "error");
        setRows([]);
        return;
      }
      setRows(data.testers ?? []);
    } catch {
      setError("network");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateMsg(null);
    setCreatePending(true);
    try {
      const res = await fetch("/api/admin/testers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), tempPassword }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setCreateMsg(data.error ?? "error");
        setCreatePending(false);
        return;
      }
      setCreateMsg("ok");
      setEmail("");
      setTempPassword("");
      setCreateOpen(false);
      void load();
    } catch {
      setCreateMsg("network");
    } finally {
      setCreatePending(false);
    }
  }

  async function disableTester(id: string) {
    if (!window.confirm(t("confirmDisable"))) return;
    const res = await fetch("/api/admin/testers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId: id, action: "disable" }),
    });
    if (res.ok) void load();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{t("title")}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen((v) => !v)}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          {createOpen ? t("hideCreate") : t("createTester")}
        </button>
      </div>

      {createOpen ? (
        <form onSubmit={onCreate} className="max-w-lg space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{t("createHint")}</p>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{t("email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{t("tempPassword")}</label>
            <input
              type="text"
              autoComplete="off"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              required
              minLength={10}
            />
          </div>
          {createMsg && createMsg !== "ok" ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              {[
                "email_exists",
                "weak_password",
                "forbidden",
                "server",
                "network",
                "error",
                "service_role_missing",
                "supabase_create_failed",
              ].includes(createMsg)
                ? t(`errors.${createMsg}` as "errors.email_exists")
                : createMsg}
            </p>
          ) : null}
          {createMsg === "ok" ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{t("created")}</p> : null}
          <button
            type="submit"
            disabled={createPending}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {createPending ? t("creating") : t("submitCreate")}
          </button>
        </form>
      ) : null}

      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[200px] flex-1">
          <label className="text-xs font-semibold text-zinc-500">{t("search")}</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchPh")}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-500">{t("filterStatus")}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="mt-1 block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="all">{t("statusAll")}</option>
            <option value="active">{t("statusActive")}</option>
            <option value="inactive">{t("statusInactive")}</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-500">{t("sort")}</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="mt-1 block w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="lastActive">{t("sortLastActive")}</option>
            <option value="email">{t("sortEmail")}</option>
            <option value="sessions">{t("sortSessions")}</option>
            <option value="time">{t("sortTime")}</option>
          </select>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-600">
          {error === "forbidden" ||
          error === "server" ||
          error === "network" ||
          error === "error"
            ? t(`errors.${error}` as "errors.network")
            : t("errors.unknown")}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3">{t("colEmail")}</th>
              <th className="px-4 py-3">{t("colLastLogin")}</th>
              <th className="px-4 py-3">{t("colSessions")}</th>
              <th className="px-4 py-3">{t("colTime")}</th>
              <th className="px-4 py-3">{t("colStatus")}</th>
              <th className="px-4 py-3">{t("colActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  {t("loading")}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  {t("empty")}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{r.email}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{r.lastLogin ? new Date(r.lastLogin).toLocaleString() : "—"}</td>
                  <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">{r.sessionsCount}</td>
                  <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">{formatDuration(r.totalTimeSpent)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        r.status === "active"
                          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                          : "rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
                      }
                    >
                      {r.status === "active" ? t("badgeActive") : t("badgeInactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void disableTester(r.id)}
                      className="text-xs font-semibold text-red-600 underline-offset-2 hover:underline dark:text-red-400"
                    >
                      {t("disable")}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
