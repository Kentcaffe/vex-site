import type { Prisma } from "@prisma/client";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BusinessApplicationActions } from "@/components/admin/BusinessApplicationActions";
import { listingWhereActive } from "@/lib/prisma-listing-soft-delete-filter";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string }>;
};

type AdminUserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  accountType: string;
  businessStatus: string;
  companyName: string | null;
  isVerified: boolean;
  createdAt: Date;
  _count: { listings: number };
};

type BusinessApplicationRow = {
  id: string;
  status: string;
  companyName: string;
  companyType: string;
  idno: string;
  companyCity: string;
  administratorName: string;
  phone: string;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
};


/** Lista trebuie să reflecte mereu DB-ul (fără cache la build). */
export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  let t: Awaited<ReturnType<typeof getTranslations>>;
  try {
    t = await getTranslations("Admin");
  } catch (error) {
    console.error("[admin/users] translations failed", error);
    return (
      <div>
        <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          Nu am putut încărca această pagină momentan.
        </p>
      </div>
    );
  }

  let users: AdminUserRow[] = [];
  let applications: BusinessApplicationRow[] = [];
  let loadFailed = false;
  try {
    [users, applications] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 400,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          accountType: true,
          businessStatus: true,
          companyName: true,
          isVerified: true,
          createdAt: true,
          _count: { select: { listings: { where: listingWhereActive() } } },
        } as unknown as Prisma.UserSelect,
      }) as unknown as Promise<AdminUserRow[]>,
      prisma.$queryRaw<BusinessApplicationRow[]>`
        SELECT
          ba."id" AS "id",
          ba."status" AS "status",
          ba."company_name" AS "companyName",
          ba."company_type" AS "companyType",
          ba."idno" AS "idno",
          ba."company_city" AS "companyCity",
          ba."administrator_name" AS "administratorName",
          ba."phone" AS "phone",
          ba."created_at" AS "createdAt",
          json_build_object(
            'id', u."id",
            'email', u."email",
            'name', u."name"
          ) AS "user"
        FROM "business_applications" ba
        INNER JOIN "users" u ON u."id" = ba."user_id"
        WHERE ba."status" = 'pending'
        ORDER BY ba."created_at" DESC
        LIMIT 200
      `,
    ]);
  } catch (error) {
    console.error("[admin/users] prisma.user.findMany failed", error);
    loadFailed = true;
  }

  function roleLabel(role: string) {
    if (role === "ADMIN") return t("role_ADMIN");
    if (role === "MODERATOR") return t("role_MODERATOR");
    return t("role_USER");
  }

  function businessStatusLabel(status: string) {
    if (status === "pending") return "În verificare";
    if (status === "approved") return "Aprobat";
    if (status === "rejected") return "Respins";
    return "—";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("usersTitle")}</h1>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">{t("usersSubtitle")}</p>

      {loadFailed ? (
        <p className="mt-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
          Lista utilizatorilor nu poate fi încărcată momentan.
        </p>
      ) : (
        <>
          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Cereri cont firmă (pending)</h2>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
                {applications.length}
              </span>
            </div>
            {applications.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Nu există cereri pending.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                      <th className="px-3 py-2">Companie</th>
                      <th className="px-3 py-2">Tip</th>
                      <th className="px-3 py-2">IDNO</th>
                      <th className="px-3 py-2">Oraș</th>
                      <th className="px-3 py-2">Administrator</th>
                      <th className="px-3 py-2">Telefon</th>
                      <th className="px-3 py-2">User</th>
                      <th className="px-3 py-2">Aplicat</th>
                      <th className="px-3 py-2">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40">
                        <td className="px-3 py-2 font-medium text-zinc-900 dark:text-zinc-100">{app.companyName}</td>
                        <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{app.companyType}</td>
                        <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{app.idno}</td>
                        <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{app.companyCity}</td>
                        <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{app.administratorName}</td>
                        <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{app.phone}</td>
                        <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300">{app.user.email}</td>
                        <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                          {app.createdAt.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-3 py-2">
                          <BusinessApplicationActions applicationId={app.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {users.length === 0 ? (
        <p className="mt-8 text-zinc-600 dark:text-zinc-400">{t("usersEmpty")}</p>
          ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/90 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
                <th className="px-4 py-3">{t("usersColEmail")}</th>
                <th className="px-4 py-3">{t("usersColName")}</th>
                <th className="px-4 py-3">{t("usersColRole")}</th>
                <th className="px-4 py-3">Firmă</th>
                <th className="px-4 py-3">Status business</th>
                <th className="px-4 py-3">{t("usersColListings")}</th>
                <th className="px-4 py-3">{t("usersColJoined")}</th>
                <th className="px-4 py-3">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {users.map((u) => (
                <tr key={u.id} className="transition hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{u.email}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-zinc-600 dark:text-zinc-400">{u.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        u.role === "ADMIN"
                          ? "bg-violet-100 text-violet-900 dark:bg-violet-950/60 dark:text-violet-200"
                          : u.role === "MODERATOR"
                            ? "bg-sky-100 text-sky-900 dark:bg-sky-950/60 dark:text-sky-200"
                            : "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200"
                      }`}
                    >
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {u.companyName ? (
                      <span className="inline-flex items-center gap-2">
                        <span>{u.companyName}</span>
                        {u.accountType === "business" && u.isVerified ? (
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            Verificat
                          </span>
                        ) : null}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{businessStatusLabel(u.businessStatus)}</td>
                  <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">{u._count.listings}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {u.createdAt.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-zinc-400">—</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          )}
        </>
      )}
    </div>
  );
}
