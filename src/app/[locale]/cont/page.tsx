import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AccountHubView } from "@/components/account/AccountHubView";
import { AuthForms } from "@/components/AuthForms";
import { getOAuthAvailability } from "@/lib/oauth-env";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ContPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();

  if (session?.user) {
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true, avatarUrl: true },
    });

    if (!me) notFound();

    return (
      <AccountHubView
        user={{
          email: me.email,
          name: me.name,
          avatarUrl: me.avatarUrl,
        }}
      />
    );
  }

  const oauth = getOAuthAvailability();

  return (
    <div className="app-shell flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 py-12 sm:px-6">
      <AuthForms oauth={oauth} />
    </div>
  );
}
