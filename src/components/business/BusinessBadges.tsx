"use client";

type Props = {
  isBusiness: boolean;
  isVerified: boolean;
  className?: string;
};

export function BusinessBadges({ isBusiness, isVerified, className }: Props) {
  if (!isBusiness && !isVerified) {
    return null;
  }
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`.trim()}>
      {isBusiness ? (
        <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          Firma
        </span>
      ) : null}
      {isVerified ? (
        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          Verificat
        </span>
      ) : null}
    </div>
  );
}
