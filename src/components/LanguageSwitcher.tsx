"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

const locales = ["ro", "ru", "en"] as const;

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <select
      aria-label="Language"
      className="min-h-[44px] min-w-[44px] rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 md:min-h-0 md:min-w-0 md:rounded md:px-2 md:py-1 md:text-xs"
      value={locale}
      onChange={(e) => {
        router.replace(pathname, { locale: e.target.value });
      }}
    >
      {locales.map((loc) => (
        <option key={loc} value={loc}>
          {loc.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
