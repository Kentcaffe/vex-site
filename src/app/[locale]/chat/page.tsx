import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { ChatInboxList } from "@/components/chat/ChatInboxList";
import { localizedHref } from "@/lib/paths";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ locale: string }> };

export default async function ChatInboxPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect(localizedHref(locale, "/cont"));
  }
  const userId = session.user.id;

  const rooms = await prisma.chatRoom.findMany({
    where: { OR: [{ buyerId: userId }, { listing: { userId } }] },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          userId: true,
          user: { select: { name: true, email: true } },
        },
      },
      buyer: { select: { id: true, name: true, email: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const items = rooms.map((r) => {
    const seller = r.listing.user;
    const isBuyer = r.buyerId === userId;
    const otherName = isBuyer ? seller.name ?? seller.email ?? "" : r.buyer.name ?? r.buyer.email ?? "";
    const last = r.messages[0];
    return {
      roomId: r.id,
      listingTitle: r.listing.title,
      otherUserName: otherName,
      lastMessageBody: last?.body ?? null,
      lastMessageAt: last?.createdAt.toISOString() ?? null,
      lastSenderId: last?.senderId ?? null,
    };
  });

  const t = await getTranslations("Chat");
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="border-b border-zinc-200/80 pb-6 dark:border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("inboxTitle")}</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{t("inboxSubtitle")}</p>
      </div>
      <ChatInboxList items={items} currentUserId={userId} />
    </div>
  );
}
