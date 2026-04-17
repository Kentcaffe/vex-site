/**
 * Placeholder când anunțul nu are imagine — același text pe grid acasă și pe listă.
 * `compact`: miniaturi înguste (ex. favorite) — doar titlu, text mic.
 */
export function ListingImagePlaceholder({
  title,
  hint,
  compact = false,
  className = "",
}: {
  title: string;
  hint: string;
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <div className={`flex h-full items-center justify-center px-1 text-center ${className}`}>
        <p className="text-[10px] font-semibold leading-tight text-[#1f2937] dark:text-[#e5e7eb]">{title}</p>
      </div>
    );
  }
  return (
    <div
      className={`flex h-full flex-col items-center justify-center gap-1 px-3 py-4 text-center ${className}`}
    >
      <p className="text-[13px] font-semibold text-[#1f2937] dark:text-[#e5e7eb]">{title}</p>
      <p className="max-w-[12rem] text-xs leading-snug text-[#374151] dark:text-[#d1d5db]">{hint}</p>
    </div>
  );
}
