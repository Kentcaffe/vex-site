"use client";

import { useMemo, useState } from "react";
import type { BugRow } from "@/lib/tester-bugs";

export type TesterBugsTableCopy = {
  title: string;
  searchPh: string;
  statusAll: string;
  statusOpen: string;
  statusAccepted: string;
  statusRejected: string;
  sevAll: string;
  sevLow: string;
  sevMed: string;
  sevHigh: string;
  empty: string;
  colTitle: string;
  colStatus: string;
  colMeta: string;
  rewardSuffix: string;
  statusLabelOpen: string;
  statusLabelAccepted: string;
  statusLabelRejected: string;
  sevLabelLow: string;
  sevLabelMed: string;
  sevLabelHigh: string;
  catUi: string;
  catFunctional: string;
  catSecurity: string;
};

function statusBadge(status: string, copy: TesterBugsTableCopy) {
  if (status === "accepted") {
    return {
      label: copy.statusLabelAccepted,
      className: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200",
    };
  }
  if (status === "rejected") {
    return {
      label: copy.statusLabelRejected,
      className: "border-rose-500/40 bg-rose-500/15 text-rose-200",
    };
  }
  return {
    label: copy.statusLabelOpen,
    className: "border-amber-500/40 bg-amber-500/15 text-amber-100",
  };
}

function severityLabel(sev: string, copy: TesterBugsTableCopy) {
  if (sev === "low") return copy.sevLabelLow;
  if (sev === "high") return copy.sevLabelHigh;
  return copy.sevLabelMed;
}

function categoryLabel(cat: string, copy: TesterBugsTableCopy) {
  if (cat === "functional") return copy.catFunctional;
  if (cat === "security") return copy.catSecurity;
  return copy.catUi;
}

type Props = {
  bugs: BugRow[];
  copy: TesterBugsTableCopy;
};

export function TesterBugsTable({ bugs, copy }: Props) {
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "accepted" | "rejected">("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [searchText, setSearchText] = useState("");

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return bugs.filter((bug) => {
      if (statusFilter !== "all" && bug.status !== statusFilter) {
        return false;
      }
      if (severityFilter !== "all" && bug.severity !== severityFilter) {
        return false;
      }
      if (!q) {
        return true;
      }
      return `${bug.title} ${bug.description}`.toLowerCase().includes(q);
    });
  }, [bugs, searchText, severityFilter, statusFilter]);

  const selectClass =
    "rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-medium text-slate-200 outline-none focus:border-violet-400/50";

  return (
    <div
      id="reports"
      className="scroll-mt-28 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 shadow-xl shadow-black/40 backdrop-blur-xl sm:p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <h2 className="text-lg font-bold text-white">{copy.title}</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={copy.searchPh}
            className={`min-w-[180px] flex-1 ${selectClass}`}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className={selectClass}
          >
            <option value="all">{copy.statusAll}</option>
            <option value="open">{copy.statusOpen}</option>
            <option value="accepted">{copy.statusAccepted}</option>
            <option value="rejected">{copy.statusRejected}</option>
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as typeof severityFilter)}
            className={selectClass}
          >
            <option value="all">{copy.sevAll}</option>
            <option value="low">{copy.sevLow}</option>
            <option value="medium">{copy.sevMed}</option>
            <option value="high">{copy.sevHigh}</option>
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.06]">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-black/30 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <th className="px-4 py-3">{copy.colTitle}</th>
              <th className="px-4 py-3">{copy.colStatus}</th>
              <th className="px-4 py-3">{copy.colMeta}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-slate-500">
                  {copy.empty}
                </td>
              </tr>
            ) : (
              filtered.map((bug) => {
                const st = statusBadge(bug.status, copy);
                return (
                  <tr
                    key={bug.id}
                    className="border-b border-white/[0.04] transition hover:bg-white/[0.03] last:border-0"
                  >
                    <td className="max-w-[320px] px-4 py-4 align-top">
                      <p className="font-semibold text-white">{bug.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-400">{bug.description}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${st.className}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top text-xs text-slate-400">
                      {categoryLabel(bug.category, copy)} · {severityLabel(bug.severity, copy)} · {bug.reward}{" "}
                      {copy.rewardSuffix}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
