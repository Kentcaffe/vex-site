import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { ChatInboxShell } from "@/components/chat/messages/ChatInboxShell";
import { ChatServerError } from "@/components/chat/ChatServerError";
import { getChatInboxItemsForUser } from "@/lib/chat-inbox-server";
import { localizedHref } from "@/lib/paths";

type Props = { params: Promise<{ locale: string }> };

export default async function ChatInboxPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect(localizedHref(locale, "/cont"));
  }
  const userId = session.user.id;

  let items: Awaited<ReturnType<typeof getChatInboxItemsForUser>> = [];
  try {
    items = await getChatInboxItemsForUser(userId);
  } catch (e) {
    console.error("[chat/inbox]", e);
    return <ChatServerError />;
  }

  return <ChatInboxShell items={items} />;
}
