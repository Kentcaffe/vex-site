"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

type Props = {
  userId: string;
  disabled?: boolean;
};

export function BusinessApplicationActions({ userId, disabled = false }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(decision: "approve" | "reject") {
    setPending(decision);
    setError(null);
    try {
      const res = await fetch("/api/admin/business/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, decision }),
      });
      if (!res.ok) {
        setError("Nu am putut salva decizia.");
        return;
      }
      router.refresh();
    } catch {
      setError("Nu am putut salva decizia.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || pending !== null}
          onClick={() => void decide("approve")}
          className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
        >
          {pending === "approve" ? "..." : "Aprobă"}
        </button>
        <button
          type="button"
          disabled={disabled || pending !== null}
          onClick={() => void decide("reject")}
          className="rounded-lg border border-red-300 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
        >
          {pending === "reject" ? "..." : "Respinge"}
        </button>
      </div>
      {error ? <p className="text-[11px] text-red-600">{error}</p> : null}
    </div>
  );
}
