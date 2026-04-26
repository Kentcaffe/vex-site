"use client";

import { useActionState, useMemo, useState } from "react";
import { reviewBugReport } from "@/app/actions/tester-bugs";
import type { BugAdminRow } from "@/lib/tester-bugs";

function statusBadge(status: string) {
  if (status === "accepted") return "bg-emerald-500/20 text-emerald-200 border-emerald-500/40";
  if (status === "rejected") return "bg-rose-500/20 text-rose-200 border-rose-500/40";
  return "bg-amber-500/20 text-amber-200 border-amber-500/40";
}

function statusLabel(status: string) {
  if (status === "accepted") return "Acceptat";
  if (status === "rejected") return "Respins";
  return "Deschis";
}

function categoryLabel(category: string) {
  if (category === "functional") return "Funcțional";
  if (category === "security") return "Securitate";
  return "Interfață (UI)";
}

function severityLabel(severity: string) {
  if (severity === "low") return "Mică";
  if (severity === "high") return "Ridicată";
  return "Medie";
}

export function AdminBugsPanel({
  bugs,
  leaderboard,
}: {
  bugs: BugAdminRow[];
  leaderboard: Array<{ user_name: string; accepted_count: number; total_reward: number }>;
}) {
  const initialReviewState: { ok: boolean; error?: string } = { ok: false };
  const [state, action, pending] = useActionState(reviewBugReport, initialReviewState);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "accepted" | "rejected">("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | "low" | "medium" | "high">("all");

  const filteredBugs = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return bugs.filter((bug) => {
      if (statusFilter !== "all" && bug.status !== statusFilter) {
        return false;
      }
      if (severityFilter !== "all" && bug.severity !== severityFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return `${bug.title} ${bug.description} ${bug.user_name} ${bug.user_email}`.toLowerCase().includes(query);
    });
  }, [bugs, searchText, severityFilter, statusFilter]);

  function exportAcceptedCsv() {
    const accepted = bugs.filter((bug) => bug.status === "accepted");
    const rows = [
      ["id", "tester", "email", "title", "category", "severity", "reward", "created_at"],
      ...accepted.map((bug) => [
        bug.id,
        bug.user_name,
        bug.user_email,
        bug.title.replaceAll('"', '""'),
        bug.category,
        bug.severity,
        bug.reproducibility ?? "",
        bug.page_url ?? "",
        bug.browser_info ?? "",
        bug.device_info ?? "",
        String(bug.reward),
        bug.created_at,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell)}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bugs-acceptate-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="text-lg font-semibold text-zinc-100">Leaderboard testeri</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {leaderboard.length === 0 ? (
            <p className="text-sm text-zinc-400">Momentan nu exista bug-uri acceptate.</p>
          ) : (
            leaderboard.map((item, idx) => (
              <article key={`${item.user_name}-${idx}`} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <p className="text-sm font-semibold text-zinc-100">#{idx + 1} {item.user_name}</p>
                <p className="mt-1 text-xs text-zinc-400">Bug-uri acceptate: {item.accepted_count}</p>
                <p className="text-xs text-yellow-300">Recompensă totală: {item.total_reward} lei</p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-100">Toate bug-urile raportate</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Caută titlu, descriere, tester..."
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "open" | "accepted" | "rejected")}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100"
            >
              <option value="all">Toate statusurile</option>
              <option value="open">Deschis</option>
              <option value="accepted">Acceptat</option>
              <option value="rejected">Respins</option>
            </select>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as "all" | "low" | "medium" | "high")}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100"
            >
              <option value="all">Toate severitățile</option>
              <option value="low">Mică</option>
              <option value="medium">Medie</option>
              <option value="high">Ridicată</option>
            </select>
            <button
              type="button"
              onClick={exportAcceptedCsv}
              className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-xs font-semibold text-yellow-200 hover:bg-yellow-500/20"
            >
              Export CSV (acceptate)
            </button>
          </div>
        </div>
        {state.error ? (
          <p className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{state.error}</p>
        ) : null}
        <div className="mt-4 space-y-3">
          {filteredBugs.length === 0 ? (
            <p className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-400">Nu exista bug-uri.</p>
          ) : (
            filteredBugs.map((bug) => (
              <article key={bug.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-zinc-100">{bug.title}</p>
                    <p className="text-xs text-zinc-400">de {bug.user_name} ({bug.user_email})</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase ${statusBadge(bug.status)}`}>{statusLabel(bug.status)}</span>
                </div>
                <p className="mt-2 text-sm text-zinc-300">{bug.description}</p>
                <p className="mt-2 text-xs text-zinc-400">
                  {categoryLabel(bug.category)} · Severitate: {severityLabel(bug.severity)} · Recompensă: {bug.reward} lei
                </p>
                <div className="mt-2 rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs text-zinc-300">
                  <p><span className="font-semibold text-zinc-100">Pași reproducere:</span> {bug.steps_to_reproduce ?? "—"}</p>
                  <p className="mt-1"><span className="font-semibold text-zinc-100">Rezultat așteptat:</span> {bug.expected_result ?? "—"}</p>
                  <p className="mt-1"><span className="font-semibold text-zinc-100">Rezultat actual:</span> {bug.actual_result ?? "—"}</p>
                  <p className="mt-1">
                    <span className="font-semibold text-zinc-100">Context:</span>{" "}
                    {bug.reproducibility ?? "—"} · {bug.browser_info ?? "browser n/a"} · {bug.device_info ?? "device n/a"}
                  </p>
                  {bug.page_url ? (
                    <p className="mt-1">
                      <span className="font-semibold text-zinc-100">Pagină:</span>{" "}
                      <a href={bug.page_url} target="_blank" rel="noreferrer" className="text-violet-300 hover:underline">
                        {bug.page_url}
                      </a>
                    </p>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  Raportat la: {new Date(bug.created_at).toLocaleString("ro-RO")}
                  {bug.image_url ? (
                    <>
                      {" · "}
                      <a href={bug.image_url} target="_blank" rel="noreferrer" className="text-violet-300 hover:underline">
                        Deschide screenshot
                      </a>
                    </>
                  ) : null}
                </p>
                <form action={action} className="mt-4 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="bugId" value={bug.id} />
                  <select
                    name="status"
                    defaultValue={bug.status}
                    className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                  >
                    <option value="open">deschis</option>
                    <option value="accepted">acceptat</option>
                    <option value="rejected">respins</option>
                  </select>
                  <input
                    type="number"
                    name="reward"
                    defaultValue={bug.reward}
                    min={0}
                    step={1}
                    className="w-28 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
                  />
                  <button
                    type="submit"
                    disabled={pending}
                    className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60"
                  >
                    Salveaza
                  </button>
                </form>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

