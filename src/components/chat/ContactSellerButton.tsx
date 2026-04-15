"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useAuthSession } from "@/components/auth/SupabaseSessionProvider";

type Props = {
  listingId: string;
  sellerUserId: string;
};

export function ContactSellerButton({ listingId, sellerUserId }: Props) {
  const { data: session, status } = useAuthSession();
  const t = useTranslations("Chat");

  if (status === "loading") {
    return (
      <span className="inline-flex min-h-[44px] min-w-[160px] items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
        …
      </span>
    );
  }

  if (!session?.user?.id) {
    return (
      <Link
        href="/cont"
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {t("contactLogin")}
      </Link>
    );
  }

  if (session.user.id === sellerUserId) {
    return null;
  }

  return (
    <Link
      href={`/chat/listing/${listingId}`}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      {t("contactSeller")}
    </Link>
  );
}
