import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { ChatRoomView, type ChatBootstrap } from "@/components/chat/ChatRoomView";
import { ChatServerError } from "@/components/chat/ChatServerError";
import { CHAT_MESSAGE_MAX } from "@/lib/chat-actions";
import { listRoomMessages } from "@/lib/chat-realtime-store";
import { resolvePublicMediaUrl } from "@/lib/media-url";
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

  try {
    const buyerRow = await prisma.user.findUnique({ where: { id: userId }, select: { avatarUrl: true } });
    if (!buyerRow) {
      redirect(localizedHref(locale, "/cont"));
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
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
        readStates: { where: { userId: { in: [userId, listing.userId] } } },
        buyer: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    const messages = await listRoomMessages(room.id, 200);
    const messageRows = Array.isArray(messages) ? messages : [];

    const seller = listing.user;
    const readByOther = room.readStates.find((s: { userId: string }) => s.userId !== userId);
    const myRead = room.readStates.find((s: { userId: string }) => s.userId === userId);

    const bootstrap: ChatBootstrap = {
      roomId: room.id,
      listing: { id: listing.id, title: listing.title },
      seller: {
        id: seller.id,
        name: seller.name ?? seller.email ?? "",
        avatarUrl: resolvePublicMediaUrl(seller.avatarUrl ?? null),
      },
      buyer: {
        id: room.buyer.id,
        name: room.buyer.name ?? room.buyer.email ?? "",
        avatarUrl: resolvePublicMediaUrl(room.buyer.avatarUrl ?? null),
      },
      meIsBuyer: true,
      otherUserName: seller.name ?? seller.email ?? "",
      otherUserAvatarUrl: resolvePublicMediaUrl(seller.avatarUrl ?? null),
      myAvatarUrl: resolvePublicMediaUrl(buyerRow.avatarUrl ?? null),
      messages: messageRows.map((m: { id: string; senderId: string; content: string; createdAt: Date }) => ({
        id: m.id,
        senderId: m.senderId,
        body: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
      otherLastReadAt: readByOther?.lastReadAt.toISOString() ?? null,
      myLastReadAt: myRead?.lastReadAt.toISOString() ?? null,
      maxBodyLength: CHAT_MESSAGE_MAX,
    };

    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <ChatRoomView key={room.id} bootstrap={bootstrap} currentUserId={userId} />
      </div>
    );
  } catch (e) {
    console.error("[chat/listing]", e);
    return <ChatServerError />;
  }
}
