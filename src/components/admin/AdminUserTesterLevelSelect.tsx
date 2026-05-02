"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { updateUserTesterLevel } from "@/app/actions/admin-tester-level";
import {
  normalizeTesterLevel,
  TESTER_LEVEL_VALUES,
  testerLevelBadgeClasses,
  testerLevelLabelRo,
  type TesterLevel,
} from "@/lib/tester-level";

function SaveButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("Admin");
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
    >
      {pending ? "…" : t("testerLevelSave")}
    </button>
  );
}

type State = { ok: boolean; error?: string };

const initialState: State = { ok: false };

export function AdminUserTesterLevelBadge({ level }: { level: string }) {
  const v = normalizeTesterLevel(level);
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${testerLevelBadgeClasses(v)}`}
    >
      {testerLevelLabelRo(v)}
    </span>
  );
}

export function AdminUserTesterLevelSelect({
  userId,
  currentLevel,
}: {
  userId: string;
  currentLevel: string;
}) {
  const t = useTranslations("Admin");
  const [state, formAction] = useFormState(updateUserTesterLevel, initialState);
  const level = normalizeTesterLevel(currentLevel);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <select
        name="testerLevel"
        defaultValue={level}
        className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
        aria-label={t("testerLevelSelectAria")}
      >
        {(TESTER_LEVEL_VALUES as readonly TesterLevel[]).map((v) => (
          <option key={v} value={v}>
            {testerLevelLabelRo(v)}
          </option>
        ))}
      </select>
      <SaveButton />
      {state.ok ? (
        <span className="text-xs font-medium text-emerald-600">{t("testerLevelSaved")}</span>
      ) : null}
      {state.error === "forbidden" ? (
        <span className="text-xs text-rose-600">{t("testerLevelForbidden")}</span>
      ) : null}
      {state.error && state.error !== "forbidden" ? (
        <span className="text-xs text-rose-600">{t("testerLevelError")}</span>
      ) : null}
    </form>
  );
}
