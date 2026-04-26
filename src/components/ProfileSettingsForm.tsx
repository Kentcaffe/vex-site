"use client";

import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  const router = useRouter();
  const [state, action, pending] = useActionState(updateProfile, undefined as UpdateProfileState | undefined);
  const [isRefreshing, startRefresh] = useTransition();
  const [nameValue, setNameValue] = useState(initial.name);
  const [avatarUrlValue, setAvatarUrlValue] = useState(initial.avatarUrl);
  const [avatarPreview, setAvatarPreview] = useState(initial.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!state?.ok) return;
    startRefresh(() => {
      router.refresh();
    });
  }, [router, startRefresh, state?.ok]);

  const isBusy = pending || isRefreshing;
  const saveButtonLabel = useMemo(() => (isBusy ? t("profileSaving") : t("profileSave")), [isBusy, t]);

  return (
    <form
      action={action}
      encType="multipart/form-data"
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
          <input
            id="acc-name"
            name="name"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            maxLength={80}
            className={accountInputClass}
          />
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
        {avatarPreview ? (
          <div className="mb-2">
            <Image
              src={avatarPreview}
              alt={nameValue || "avatar"}
              className="h-14 w-14 rounded-full border border-zinc-200 object-cover"
              width={56}
              height={56}
            />
          </div>
        ) : null}
        <input
          id="acc-avatar"
          name="avatarUrl"
          type="url"
          placeholder="https://..."
          value={avatarUrlValue}
          onChange={(e) => {
            setAvatarUrlValue(e.target.value);
            setAvatarPreview(e.target.value);
          }}
          maxLength={500}
          className={accountInputClass}
        />
        <input
          ref={fileInputRef}
          type="file"
          name="avatarFile"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="mt-2 block w-full text-sm text-zinc-700 file:mr-3 file:rounded-md file:border file:border-zinc-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-800"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="submit"
            name="intent"
            value="save_profile"
            disabled={isBusy}
            className="rounded-lg bg-[#0b57d0] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0842a0] disabled:opacity-60"
          >
            {saveButtonLabel}
          </button>
          <button
            type="submit"
            name="intent"
            value="delete_avatar"
            disabled={isBusy}
            onClick={() => {
              setAvatarUrlValue("");
              setAvatarPreview("");
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            Șterge avatar
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="acc-bio" className={accountLabelClass}>
          {t("profileBio")}
        </label>
        <textarea id="acc-bio" name="bio" defaultValue={initial.bio} maxLength={500} rows={4} className={accountTextareaClass} />
      </div>

      {state?.ok === false ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.message ??
            (state.error === "validation"
              ? t("profileValidation")
              : state.error === "unauthorized"
                ? t("profileUnauthorized")
                : t("profileUnknown"))}
        </p>
      ) : null}
      {state?.ok === true ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
          {state.message ?? t("profileSuccess")}
        </p>
      ) : null}
    </form>
  );
}
