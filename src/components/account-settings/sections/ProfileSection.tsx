import { useTranslations } from "next-intl";
import { ProfileSettingsForm } from "@/components/ProfileSettingsForm";
import { SectionShell } from "@/components/account-settings/SectionShell";

export type ProfileUser = {
  email: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

export function ProfileSection({ locale, user }: { locale: string; user: ProfileUser }) {
  const t = useTranslations("AccountSettings");

  return (
    <SectionShell kicker={t("nav.profile")} title={t("profile.heading")} lead={t("profile.lead")}>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400" htmlFor="acc-email-ro">
            Email
          </label>
          <input
            id="acc-email-ro"
            readOnly
            value={user.email}
            className="mt-1 w-full cursor-not-allowed rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400"
          />
          <p className="mt-1 text-xs text-zinc-400">{t("profile.emailReadonly")}</p>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("profile.avatarHint")}</p>
        <ProfileSettingsForm
          locale={locale}
          initial={{
            name: user.name ?? "",
            phone: user.phone ?? "",
            city: user.city ?? "",
            bio: user.bio ?? "",
            avatarUrl: user.avatarUrl ?? "",
          }}
        />
      </div>
    </SectionShell>
  );
}
