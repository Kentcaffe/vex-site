import { getTranslations, setRequestLocale } from "next-intl/server";
import { listingWhereActive } from "@/lib/prisma-listing-soft-delete-filter";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ locale: string }>;
};


/** Lista trebuie să reflecte mereu DB-ul (fără cache la build). */
export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 400,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: { select: { listings: { where: listingWhereActive() } } },
    },
  });

  function roleLabel(role: string) {
    if (role === "ADMIN") return t("role_ADMIN");
    if (role === "MODERATOR") return t("role_MODERATOR");
    return t("role_USER");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{t("usersTitle")}</h1>
      <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">{t("usersSubtitle")}</p>

      {users.length === 0 ? (
        <p className="mt-8 text-zinc-600 dark:text-zinc-400">{t("usersEmpty")}</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/90 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
                <th className="px-4 py-3">{t("usersColEmail")}</th>
                <th className="px-4 py-3">{t("usersColName")}</th>
                <th className="px-4 py-3">{t("usersColRole")}</th>
                <th className="px-4 py-3">{t("usersColListings")}</th>
                <th className="px-4 py-3">{t("usersColJoined")}</th>
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
                  <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">{u._count.listings}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {u.createdAt.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
