"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { updateProfile, type UpdateProfileState } from "@/app/actions/profile";
import {
  accountInputClass,
  accountLabelClass,
  accountTextareaClass,
} from "@/components/account-settings/account-ui-classes";

type Props = {
  locale: string;
  initial: {
    name: string;
    phone: string;
    city: string;
    bio: string;
    avatarUrl: string;
  };
};

export function ProfileSettingsForm({ locale, initial }: Props) {
  const t = useTranslations("Account");
  const [state, action, pending] = useActionState(updateProfile, undefined as UpdateProfileState | undefined);

  return (
    <form
      action={action}
      className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 text-zinc-900 shadow-sm [color-scheme:light] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:[color-scheme:dark]"
    >
      <input type="hidden" name="locale" value={locale} />
      <div>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{t("profileTitle")}</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t("profileSubtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="acc-name" className={accountLabelClass}>
            {t("profileName")}
          </label>
          <input id="acc-name" name="name" defaultValue={initial.name} maxLength={80} className={accountInputClass} />
        </div>
        <div>
          <label htmlFor="acc-phone" className={accountLabelClass}>
            {t("profilePhone")}
          </label>
          <input id="acc-phone" name="phone" defaultValue={initial.phone} maxLength={32} className={accountInputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="acc-city" className={accountLabelClass}>
          {t("profileCity")}
        </label>
        <input id="acc-city" name="city" defaultValue={initial.city} maxLength={80} className={accountInputClass} />
      </div>

      <div>
        <label htmlFor="acc-avatar" className={accountLabelClass}>
          {t("profileAvatarUrl")}
        </label>
        <input
          id="acc-avatar"
          name="avatarUrl"
          type="url"
          placeholder="https://..."
          defaultValue={initial.avatarUrl}
          maxLength={500}
          className={accountInputClass}
        />
      </div>

      <div>
        <label htmlFor="acc-bio" className={accountLabelClass}>
          {t("profileBio")}
        </label>
        <textarea id="acc-bio" name="bio" defaultValue={initial.bio} maxLength={500} rows={4} className={accountTextareaClass} />
      </div>

      {state?.ok === false ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error === "validation"
            ? t("profileValidation")
            : state.error === "unauthorized"
              ? t("profileUnauthorized")
              : t("profileUnknown")}
        </p>
      ) : null}
      {state?.ok === true ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
          {t("profileSuccess")}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[#0b57d0] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0842a0] disabled:opacity-60"
      >
        {pending ? t("profileSaving") : t("profileSave")}
      </button>
    </form>
  );
}
