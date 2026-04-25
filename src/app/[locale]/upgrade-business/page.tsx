import type { Prisma } from "@prisma/client";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UpgradeBusinessForm } from "@/components/business/UpgradeBusinessForm";
import { Link } from "@/i18n/navigation";
import { localizedHref } from "@/lib/paths";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function UpgradeBusinessPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect(localizedHref(locale, "/cont"));
  }

  type UpgradeBusinessMeRow = {
    companyName: string | null;
    vatNumber: string | null;
    companyAddress: string | null;
    phone: string | null;
    companyLogo: string | null;
    accountType: string;
  };

  const me = await prisma.user.findUnique({
    where: { id: session.user.id } as Prisma.UserWhereUniqueInput,
    select: {
      companyName: true,
      vatNumber: true,
      companyAddress: true,
      phone: true,
      companyLogo: true,
      accountType: true,
    } as unknown as Prisma.UserSelect,
  }) as UpgradeBusinessMeRow | null;
  if (!me) {
    redirect(localizedHref(locale, "/cont"));
  }

  return (
    <div className="app-shell app-section max-w-2xl">
      <Link href="/cont" className="mb-4 inline-flex text-sm font-semibold text-emerald-800 hover:underline">
        ← Înapoi la cont
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Cont business</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Completează datele firmei pentru a afișa badge-ul de firmă pe profil și anunțuri.
      </p>
      {me.accountType === "business" ? (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Contul tău este deja de tip firmă. Poți actualiza datele oricând.
        </p>
      ) : null}

      <div className="mt-6">
        <UpgradeBusinessForm
          locale={locale}
          initial={{
            companyName: me.companyName ?? "",
            vatNumber: me.vatNumber ?? "",
            companyAddress: me.companyAddress ?? "",
            phone: me.phone ?? "",
            companyLogo: me.companyLogo ?? "",
          }}
        />
      </div>
    </div>
  );
}
