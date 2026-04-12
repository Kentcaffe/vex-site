import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { ChatRoomView, type ChatBootstrap } from "@/components/chat/ChatRoomView";
import { CHAT_MESSAGE_MAX } from "@/lib/chat-actions";
import { localizedHref } from "@/lib/paths";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ locale: string; roomId: string }> };

export default async function ChatRoomPage({ params }: Props) {
  const { locale, roomId } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect(localizedHref(locale, "/cont"));
  }
  const userId = session.user.id;

  const me = await prisma.user.findUnique({ where: { id: userId } });
  if (!me) {
    redirect(localizedHref(locale, "/cont"));
  }

  const room = await prisma.chatRoom.findFirst({
    where: {
      id: roomId,
      OR: [{ buyerId: userId }, { listing: { userId } }],
    },
    include: {
      listing: {
        select: {
          id: true,
          title: true,
          userId: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      buyer: { select: { id: true, name: true, email: true } },
      messages: { orderBy: { createdAt: "asc" }, take: 200 },
      readStates: true,
    },
  });

  if (!room) {
    notFound();
  }

  const seller = room.listing.user;
  const isBuyer = userId === room.buyerId;
  const otherName = isBuyer ? seller.name ?? seller.email ?? "" : room.buyer.name ?? room.buyer.email ?? "";
  const readByOther = room.readStates.find((s: { userId: string }) => s.userId !== userId);
  const myRead = room.readStates.find((s: { userId: string }) => s.userId === userId);

  const bootstrap: ChatBootstrap = {
    roomId: room.id,
    listing: { id: room.listing.id, title: room.listing.title },
    seller: { id: seller.id, name: seller.name ?? seller.email ?? "" },
    buyer: { id: room.buyer.id, name: room.buyer.name ?? room.buyer.email ?? "" },
    meIsBuyer: isBuyer,
    otherUserName: otherName,
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
