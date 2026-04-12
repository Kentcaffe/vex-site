"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Props = {
  listingId: string;
  sellerUserId: string;
};

export function ContactSellerButton({ listingId, sellerUserId }: Props) {
  const { data: session, status } = useSession();
  const t = useTranslations("Chat");

  if (status === "loading") {
    return (
      <span className="inline-block rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-400 dark:border-zinc-700">
        …
      </span>
    );
  }

  if (!session?.user?.id) {
    return (
      <Link
        href="/cont"
        className="inline-block rounded-lg border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
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
      className="inline-block rounded-lg border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
    >
      {t("contactSeller")}
    </Link>
  );
}
