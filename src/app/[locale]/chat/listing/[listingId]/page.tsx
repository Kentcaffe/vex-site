import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { ChatRoomView, type ChatBootstrap } from "@/components/chat/ChatRoomView";
import { CHAT_MESSAGE_MAX } from "@/lib/chat-actions";
import { localizedHref } from "@/lib/paths";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ locale: string; listingId: string }> };

/** Buyer opens chat from listing — creates room if needed, same UI as /chat/room/[roomId]. */
export default async function ChatFromListingPage({ params }: Props) {
  const { locale, listingId } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect(localizedHref(locale, "/cont"));
  }
  const userId = session.user.id;

  const buyerRow = await prisma.user.findUnique({ where: { id: userId } });
  if (!buyerRow) {
    redirect(localizedHref(locale, "/cont"));
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!listing) {
    notFound();
  }
  if (listing.userId === userId) {
    redirect(localizedHref(locale, "/chat"));
  }

  const room = await prisma.chatRoom.upsert({
    where: { listingId_buyerId: { listingId, buyerId: userId } },
    create: { listingId, buyerId: userId },
    update: {},
    include: {
      messages: { orderBy: { createdAt: "asc" }, take: 200 },
      readStates: { where: { userId: { in: [userId, listing.userId] } } },
      buyer: { select: { id: true, name: true, email: true } },
    },
  });

  const seller = listing.user;
  const readByOther = room.readStates.find((s: { userId: string }) => s.userId !== userId);
  const myRead = room.readStates.find((s: { userId: string }) => s.userId === userId);

  const bootstrap: ChatBootstrap = {
    roomId: room.id,
    listing: { id: listing.id, title: listing.title },
    seller: { id: seller.id, name: seller.name ?? seller.email ?? "" },
    buyer: { id: room.buyer.id, name: room.buyer.name ?? room.buyer.email ?? "" },
    meIsBuyer: true,
    otherUserName: seller.name ?? seller.email ?? "",
    messages: room.messages.map((m: { id: string; senderId: string; body: string; createdAt: Date }) => ({
      id: m.id,
      senderId: m.senderId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
    otherLastReadAt: readByOther?.lastReadAt.toISOString() ?? null,
    myLastReadAt: myRead?.lastReadAt.toISOString() ?? null,
    maxBodyLength: CHAT_MESSAGE_MAX,
  };

  const t = await getTranslations("Chat");
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-xl font-bold text-zinc-900 dark:text-zinc-50">{t("title")}</h1>
      <ChatRoomView bootstrap={bootstrap} currentUserId={userId} />
    </div>
  );
}
