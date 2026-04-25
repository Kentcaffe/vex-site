"use client";

import { CheckCircle } from "lucide-react";

type BadgeUser = {
  accountType?: string | null;
  isVerified?: boolean | null;
  businessStatus?: string | null;
};

type Props = {
  user?: BadgeUser | null;
  className?: string;
};

export function UserBadges({ user, className }: Props) {
  const isBusiness = user?.accountType === "business";
  const isVerified = isBusiness && Boolean(user?.isVerified);
  const isPending = user?.businessStatus === "pending";

  if (!isBusiness && !isVerified && !isPending) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`.trim()}>
      {isBusiness ? (
        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          Firma
        </span>
      ) : null}
      {isVerified ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <CheckCircle className="h-3.5 w-3.5" aria-hidden />
          <span>✔ Verificat</span>
        </span>
      ) : null}
      {isPending ? (
        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
          În verificare
        </span>
      ) : null}
    </div>
  );
}
