import type { Prisma } from "@prisma/client";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ApplyBusinessForm } from "@/components/business/ApplyBusinessForm";
import { Link } from "@/i18n/navigation";
import { localizedHref } from "@/lib/paths";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ApplyBusinessPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await auth();
  if (!session?.user?.id) {
    redirect(localizedHref(locale, "/cont"));
  }

  type ApplyBusinessMeRow = {
    companyName: string | null;
    companyType: string | null;
    idno: string | null;
    vatNumber: string | null;
    administratorName: string | null;
    companyAddress: string | null;
    companyCity: string | null;
    phone: string | null;
    companyEmail: string | null;
    companyLogo: string | null;
    companyDocument: string | null;
    registrationNumber: string | null;
    registrationDate: Date | null;
    businessStatus: string;
    accountType: string;
  };

  const me = await prisma.user.findUnique({
    where: { id: session.user.id } as Prisma.UserWhereUniqueInput,
    select: {
      companyName: true,
      companyType: true,
      idno: true,
      vatNumber: true,
      administratorName: true,
      companyAddress: true,
      companyCity: true,
      phone: true,
      companyEmail: true,
      companyLogo: true,
      companyDocument: true,
      registrationNumber: true,
      registrationDate: true,
      businessStatus: true,
      accountType: true,
    } as unknown as Prisma.UserSelect,
  }) as ApplyBusinessMeRow | null;
  if (!me) {
    redirect(localizedHref(locale, "/cont"));
  }

  return (
    <div className="app-shell app-section max-w-3xl">
      <Link href="/cont" className="mb-4 inline-flex text-sm font-semibold text-emerald-800 hover:underline">
        ← Înapoi la cont
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Aplicare cont business</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Introdu datele reale ale firmei. Cererea este verificată manual de un administrator.
      </p>

      {me.businessStatus === "pending" ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Cererea ta este în curs de verificare.
        </p>
      ) : null}

      <div className="mt-6">
        <ApplyBusinessForm
          locale={locale}
          initial={{
            companyName: me.companyName ?? "",
            companyType: me.companyType ?? "SRL",
            idno: me.idno ?? "",
            vatNumber: me.vatNumber ?? "",
            administratorName: me.administratorName ?? "",
            companyAddress: me.companyAddress ?? "",
            companyCity: me.companyCity ?? "",
            phone: me.phone ?? "",
            companyEmail: me.companyEmail ?? "",
            companyLogo: me.companyLogo ?? "",
            companyDocument: me.companyDocument ?? "",
            registrationNumber: me.registrationNumber ?? "",
            registrationDate: me.registrationDate ? me.registrationDate.toISOString().slice(0, 10) : "",
          }}
        />
      </div>
    </div>
  );
}
