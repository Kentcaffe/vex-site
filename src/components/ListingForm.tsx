"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createListing, type CreateListingState } from "@/app/actions/listings";
import { CategorySelector } from "@/components/publish/CategorySelector";
import { useToast } from "@/components/ui/SimpleToast";
import { localizedHref } from "@/lib/paths";
import {
  getDetailFieldsForSlug,
  getDetailFormName,
  getListingFormFlags,
  type DetailField,
} from "@/lib/listing-detail-config";
import { type CategoryTreeNode, findLeafSlugById, isLeafCategoryNode } from "@/lib/category-tree";
import { LISTING_MAX_IMAGES, parseImageLines } from "@/lib/listing-form-schema";
import {
  validateListingFormClient,
  type ListingFormFieldId,
  type ListingFormValidationMessages,
} from "@/lib/listing-form-client-validation";
import {
  applyListingDraftPartial,
  clearListingDraftStorage,
  collectListingFormDraft,
  isListingDraftEffectivelyEmpty,
  legacyListingDraftSessionKey,
  loadListingDraftFromStorage,
  listingDraftStorageKey,
  saveListingDraftToStorage,
  type ListingFormDraftV1,
} from "@/lib/listing-form-draft-storage";

type Props = {
  locale: string;
  /** Ciorna e salvată per cont (localStorage). */
  userId: string;
  categoryTree: CategoryTreeNode[];
};

export function ListingForm({ locale, userId, categoryTree }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("ListingForm");
  const tVal = useTranslations("ListingForm.validation");

  const msg: ListingFormValidationMessages = useMemo(
    () => ({
      errCategory: tVal("errCategory"),
      errTitle: tVal("errTitle"),
      errDescription: tVal("errDescription"),
      errPrice: tVal("errPrice"),
      errCity: tVal("errCity"),
      errCondition: tVal("errCondition"),
      errImages: tVal("errImages"),
      errImagesRequired: tVal("errImagesRequired"),
    }),
    [tVal],
  );

  const [state, formAction, isPending] = useActionState(
    createListing,
    undefined as CreateListingState | undefined,
  );
  const [categoryId, setCategoryId] = useState("");
  const [imagesRaw, setImagesRaw] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [clientErrors, setClientErrors] = useState<Partial<Record<ListingFormFieldId, string>>>({});

  const formRef = useRef<HTMLFormElement>(null);
  const listingDetailsRef = useRef<HTMLDivElement | null>(null);
  const prevCategoryIdRef = useRef<string>("");
  const publishRedirectDoneRef = useRef(false);
  const draftRemainderRef = useRef<ListingFormDraftV1 | null>(null);
  const skipDraftSaveRef = useRef(false);
  const saveDraftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storageKey = useMemo(() => listingDraftStorageKey(locale, userId), [locale, userId]);
  const legacyDraftSessionKey = useMemo(() => legacyListingDraftSessionKey(locale), [locale]);

  const selectedSlug = useMemo(
    () => findLeafSlugById(categoryTree, categoryId) ?? "",
    [categoryId, categoryTree],
  );

  const { isVeh, isRe, isBrandish } = getListingFormFlags(selectedSlug);
  const detailFields = useMemo(() => getDetailFieldsForSlug(selectedSlug), [selectedSlug]);

  useEffect(() => {
    const loaded = loadListingDraftFromStorage(storageKey, {
      migrateLegacySessionKey: legacyDraftSessionKey,
    });
    if (!loaded) {
      return;
    }
    draftRemainderRef.current = loaded;
    skipDraftSaveRef.current = true;
    setCategoryId(loaded.categoryId);
    setImagesRaw(loaded.imagesRaw);
  }, [storageKey, legacyDraftSessionKey]);

  useLayoutEffect(() => {
    const form = formRef.current;
    const remainder = draftRemainderRef.current;
    if (!form || !remainder) {
      skipDraftSaveRef.current = false;
      return;
    }
    const { next } = applyListingDraftPartial(form, remainder);
    draftRemainderRef.current = next;
    skipDraftSaveRef.current = false;
  }, [selectedSlug, categoryId]);

  const scheduleDraftPersist = useCallback(() => {
    if (saveDraftTimerRef.current) {
      clearTimeout(saveDraftTimerRef.current);
    }
    saveDraftTimerRef.current = setTimeout(() => {
      saveDraftTimerRef.current = null;
      if (skipDraftSaveRef.current) {
        return;
      }
      const form = formRef.current;
      if (!form) {
        return;
      }
      const draft = collectListingFormDraft(form);
      if (isListingDraftEffectivelyEmpty(draft)) {
        clearListingDraftStorage(storageKey, legacyDraftSessionKey);
        return;
      }
      saveListingDraftToStorage(storageKey, draft);
    }, 450);
  }, [storageKey, legacyDraftSessionKey]);

  useEffect(() => {
    return () => {
      if (saveDraftTimerRef.current) {
        clearTimeout(saveDraftTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!state || state.ok !== true || !state.listingId || publishRedirectDoneRef.current) {
      return;
    }
    publishRedirectDoneRef.current = true;
    clearListingDraftStorage(storageKey, legacyDraftSessionKey);
    skipDraftSaveRef.current = true;
    draftRemainderRef.current = null;
    toast("success", t("success"));
    router.push(localizedHref(locale, `/anunturi/${state.listingId}`));
  }, [state, storageKey, legacyDraftSessionKey, router, toast, t, locale]);

  useEffect(() => {
    if (state?.ok === false && state.error === "server") {
      toast("error", t("serverPublishError"));
    }
  }, [state, toast, t]);

  useEffect(() => {
    if (
      categoryId &&
      categoryId !== prevCategoryIdRef.current &&
      isLeafCategoryNode(categoryTree, categoryId)
    ) {
      queueMicrotask(() => {
        listingDetailsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    prevCategoryIdRef.current = categoryId;
  }, [categoryId, categoryTree]);

  function detailLabel(field: DetailField): string {
    return t(`detail.${field.id}.label`);
  }

  function selectOptionLabel(field: DetailField, value: string): string {
    if (field.id === "fuel") {
      return t(`fuel.${value}` as never);
    }
    if (field.id === "transmission") {
      return t(`transmission.${value}` as never);
    }
    const groupKeys = [
      "body_type",
      "drivetrain",
      "doors",
      "furnished",
      "building_type",
      "employment_type",
      "vaccinated",
    ] as const;
    if ((groupKeys as readonly string[]).includes(field.id)) {
      return t(`${field.id}.${value}` as never);
    }
    return value;
  }

  function handleSubmit(formData: FormData) {
    formData.set("imagesRaw", imagesRaw);
    formData.set("locale", locale);
    const v = validateListingFormClient(formData, msg);
    if (!v.ok) {
      setClientErrors(v.errors);
      const fieldId =
        v.firstField === "categoryId" ? "field-categoryId" : `field-${v.firstField}`;
      queueMicrotask(() => {
        document.getElementById(fieldId)?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    setClientErrors({});
    formAction(formData);
  }

  async function onPickImages(files: FileList | null) {
    if (!files?.length) {
      return;
    }
    setUploadError(null);
    const fd = new FormData();
    for (const f of Array.from(files)) {
      fd.append("files", f);
    }
    const lines = parseImageLines(imagesRaw);
    if (lines.length + files.length > LISTING_MAX_IMAGES) {
      setUploadError(t("uploadTooMany"));
      return;
    }
    const res = await fetch("/api/listings/upload-images", {
      method: "POST",
      body: fd,
    });
    const data = (await res.json()) as { urls?: string[]; error?: string };
    if (!res.ok) {
      setUploadError(data.error ?? "upload");
      return;
    }
    const urls = data.urls ?? [];
    const next = [...lines, ...urls].join("\n");
    setImagesRaw(next);
    queueMicrotask(() => {
      scheduleDraftPersist();
    });
  }

  const serverMsg =
    state?.ok === false && state.error !== "server"
      ? state.error === "unauthorized"
        ? t("serverUnauthorized")
        : state.error === "category"
          ? t("serverCategory")
          : state.error === "session"
            ? t("serverSession")
            : t("serverValidation")
      : null;

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      onInput={() => {
        scheduleDraftPersist();
      }}
      className="mx-auto max-w-3xl space-y-8 rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
    >
      <input type="hidden" name="locale" value={locale} />

      <section id="field-categoryId" className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{t("formSectionCategory")}</h2>
        </div>
        <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-950/40">
          <CategorySelector
            tree={categoryTree}
            value={categoryId}
            onChange={(id) => {
              setCategoryId(id);
              scheduleDraftPersist();
            }}
            error={clientErrors.categoryId}
          />
        </div>
      </section>

      <section
        ref={listingDetailsRef}
        id="publish-listing-details"
        className="scroll-mt-6 space-y-5 border-t border-zinc-200 pt-8 dark:border-zinc-800"
      >
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{t("formSectionListing")}</h2>
      <div id="field-title">
        <label className="block text-sm font-medium" htmlFor="title">
          {t("title")}
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={160}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
        {clientErrors.title ? <p className="mt-1 text-sm text-red-600">{clientErrors.title}</p> : null}
      </div>

      <div id="field-description">
        <label className="block text-sm font-medium" htmlFor="description">
          {t("description")}
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
        {clientErrors.description ? <p className="mt-1 text-sm text-red-600">{clientErrors.description}</p> : null}
      </div>

      <div className="space-y-4" id="field-price">
        <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
          <div>
            <label className="block text-sm font-medium" htmlFor="price">
              {t("priceAmount")}
            </label>
            <input
              id="price"
              name="price"
              type="number"
              inputMode="numeric"
              min={1}
              required
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
            {clientErrors.price ? <p className="mt-1 text-sm text-red-600">{clientErrors.price}</p> : null}
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="priceCurrency">
              {t("priceCurrencyLabel")}
            </label>
            <select
              id="priceCurrency"
              name="priceCurrency"
              defaultValue="MDL"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            >
              <option value="MDL">{t("priceCurrencyMdl")}</option>
              <option value="EUR">{t("priceCurrencyEur")}</option>
            </select>
          </div>
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm">
            <input name="negotiable" type="checkbox" className="rounded border-zinc-400" />
            {t("negotiable")}
          </label>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div id="field-city">
          <label className="block text-sm font-medium" htmlFor="city">
            {t("city")}
          </label>
          <input
            id="city"
            name="city"
            required
            maxLength={80}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          />
          {clientErrors.city ? <p className="mt-1 text-sm text-red-600">{clientErrors.city}</p> : null}
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="district">
            {t("district")}
          </label>
          <input
            id="district"
            name="district"
            maxLength={80}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium" htmlFor="phone">
          {t("phone")}
        </label>
        <input
          id="phone"
          name="phone"
          maxLength={30}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        />
      </div>

      <div id="field-condition">
        <label className="block text-sm font-medium" htmlFor="condition">
          {t("condition")}
        </label>
        <select
          id="condition"
          name="condition"
          required
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
        >
          <option value="new">{t("conditionNew")}</option>
          <option value="used">{t("conditionUsed")}</option>
          <option value="not_applicable">{t("conditionNA")}</option>
        </select>
        {clientErrors.condition ? <p className="mt-1 text-sm text-red-600">{clientErrors.condition}</p> : null}
      </div>
      </section>

      {isVeh || isRe || (isBrandish && !isVeh) || detailFields.length > 0 ? (
      <section className="space-y-5 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{t("formSectionSpecs")}</h2>
        </div>

      {isVeh ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium" htmlFor="brand">
              {t("brand")}
            </label>
            <input
              id="brand"
              name="brand"
              maxLength={80}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="modelName">
              {t("model")}
            </label>
            <input
              id="modelName"
              name="modelName"
              maxLength={80}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="year">
              {t("year")}
            </label>
            <input
              id="year"
              name="year"
              type="number"
              inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="mileageKm">
              {t("mileage")}
            </label>
            <input
              id="mileageKm"
              name="mileageKm"
              type="number"
              inputMode="numeric"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
          </div>
        </div>
      ) : null}

      {isRe ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium" htmlFor="rooms">
              {t("rooms")}
            </label>
            <input
              id="rooms"
              name="rooms"
              maxLength={40}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="areaSqm">
              {t("areaSqm")}
            </label>
            <input
              id="areaSqm"
              name="areaSqm"
              type="number"
              inputMode="numeric"
              min={1}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
          </div>
        </div>
      ) : null}

      {isBrandish && !isVeh ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium" htmlFor="brand2">
              {t("brand")}
            </label>
            <input
              id="brand2"
              name="brand"
              maxLength={80}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="modelName2">
              {t("model")}
            </label>
            <input
              id="modelName2"
              name="modelName"
              maxLength={80}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            />
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
      {detailFields.map((field) => {
        const fname = getDetailFormName(field);
        return (
          <div key={field.id} className="sm:col-span-1">
            <label className="block text-sm font-medium" htmlFor={fname}>
              {detailLabel(field)}
            </label>
            {field.input === "select" && field.selectValues ? (
              <select
                id={fname}
                name={fname}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
              >
                <option value="">{t("detailOptional")}</option>
                {field.selectValues.map((v) => (
                  <option key={v} value={v}>
                    {selectOptionLabel(field, v)}
                  </option>
                ))}
              </select>
            ) : null}
            {field.input === "text" ? (
              <input
                id={fname}
                name={fname}
                maxLength={field.maxLength ?? 80}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
              />
            ) : null}
            {field.input === "number" ? (
              <input
                id={fname}
                name={fname}
                type="number"
                inputMode="numeric"
                min={field.min}
                max={field.max}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-950"
              />
            ) : null}
          </div>
        );
      })}
      </div>

      </section>
      ) : null}

      <section className="space-y-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{t("formSectionMedia")}</h2>
      <div id="field-imagesRaw">
        <label className="block text-sm font-medium" htmlFor="imagesRaw">
          {t("images")}
        </label>
        <p className="mt-1 text-xs text-zinc-500">{t("imagesHint")}</p>
        <textarea
          id="imagesRaw"
          name="imagesRaw"
          value={imagesRaw}
          onChange={(e) => setImagesRaw(e.target.value)}
          rows={4}
          className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-xs dark:border-zinc-600 dark:bg-zinc-950"
          placeholder="https://..."
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <label className="cursor-pointer rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800">
            {t("upload")}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => void onPickImages(e.target.files)}
            />
          </label>
          <span className="text-xs text-zinc-500">
            {t("imageCount", { count: parseImageLines(imagesRaw).length, max: LISTING_MAX_IMAGES })}
          </span>
        </div>
        {uploadError ? <p className="mt-1 text-sm text-red-600">{uploadError}</p> : null}
        {clientErrors.imagesRaw ? <p className="mt-1 text-sm text-red-600">{clientErrors.imagesRaw}</p> : null}
      </div>
      </section>

      {serverMsg ? <p className="text-sm font-medium text-red-600 dark:text-red-400">{serverMsg}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-60"
      >
        {isPending ? (
          <>
            <svg
              className="h-5 w-5 shrink-0 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {t("submitting")}
          </>
        ) : (
          t("submit")
        )}
      </button>
    </form>
  );
}
