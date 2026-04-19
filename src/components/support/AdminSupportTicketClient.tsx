"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { SupportTicketStatus } from "@/lib/support-enums";
import { SupportLiveChat } from "@/components/support/SupportLiveChat";

type Props = {
  ticketId: string;
  initialStatus: SupportTicketStatus;
  userEmail: string;
};

export function AdminSupportTicketClient({ ticketId, initialStatus, userEmail }: Props) {
  const t = useTranslations("Admin");
  const [status, setStatus] = useState(initialStatus);
  const [pending, setPending] = useState(false);

  async function changeStatus(next: SupportTicketStatus) {
    setPending(true);
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) setStatus(next);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{t("supportStatusLabel")}</span>
        <select
          value={status}
          disabled={pending}
          onChange={(e) => void changeStatus(e.target.value as SupportTicketStatus)}
          className="min-h-[44px] rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        >
          {(["OPEN", "PENDING", "RESOLVED", "CLOSED"] as const).map((s) => (
            <option key={s} value={s}>
              {t(`supportStatus_${s}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="h-[min(70vh,560px)] min-h-[400px]">
        <SupportLiveChat variant="staff" ticketId={ticketId} userEmail={userEmail} />
      </div>
    </div>
  );
}
