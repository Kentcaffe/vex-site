/**
 * Contrast explicit pe mobil (Safari) — același principiu ca ListingForm:
 * bg + text + caret + [color-scheme] pe input/select/textarea.
 */
export const accountLabelClass =
  "block text-xs font-medium text-zinc-800 dark:text-zinc-200";

export const accountInputClass =
  "mt-1 min-h-[48px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-base leading-normal text-zinc-900 caret-zinc-900 placeholder:text-zinc-500 [color-scheme:light] dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:caret-zinc-100 dark:placeholder:text-zinc-400 md:min-h-[44px] md:py-2.5 md:text-sm";

export const accountTextareaClass =
  "mt-1 min-h-[120px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-base leading-normal text-zinc-900 caret-zinc-900 placeholder:text-zinc-500 [color-scheme:light] dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:caret-zinc-100 dark:placeholder:text-zinc-400 md:text-sm";

export const accountSelectClass =
  "mt-1 min-h-[48px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-base text-zinc-900 [color-scheme:light] dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 md:min-h-[44px] md:py-2.5 md:text-sm";

export const accountInputReadonlyClass =
  "mt-1 min-h-[48px] w-full cursor-not-allowed rounded-xl border border-zinc-300 bg-zinc-100 px-3 py-3 text-base text-zinc-800 [color-scheme:light] dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200 md:min-h-[44px] md:py-2.5 md:text-sm";

/** Câmp confirmare ștergere cont */
export const accountDangerInputClass =
  "mt-1 min-h-[48px] w-full rounded-xl border border-red-200 bg-white px-3 py-3 text-base leading-normal text-zinc-900 caret-zinc-900 placeholder:text-red-400/80 [color-scheme:light] dark:border-red-900/60 dark:bg-zinc-950 dark:text-zinc-100 dark:caret-zinc-100 md:min-h-[44px] md:py-2.5 md:text-sm";
