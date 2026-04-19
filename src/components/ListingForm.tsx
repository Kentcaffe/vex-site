"use client";

import { startTransition, useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createListing, type CreateListingState } from "@/app/actions/listings";
import { CategorySelector } from "@/components/publish/CategorySelector";
import { useToast } from "@/components/ui/SimpleToast";
import { localizedHref } from "@/lib/paths";
import { listingSeoPath } from "@/lib/seo";
import {
  getDetailFieldsForSlug,
  getDetailFormName,
  getListingFormFlags,
  type DetailField,
} from "@/lib/listing-detail-config";
import {
  type CategoryTreeNode,
  findCategoryNodeById,
  findLeafSlugById,
  getPathLabelsForLeaf,
  isLeafCategoryNode,
  normalizeLeafCategoryId,
} from "@/lib/category-tree";
import { LISTING_MAX_IMAGES, parseImageLines } from "@/lib/listing-form-schema";
import {
  liveValidateField,
  validateListingFormClient,
  type ListingFormFieldId,
  type ListingFormValidationMessages,
} from "@/lib/listing-form-client-validation";
import {
  clearListingDraftStorage,
  isListingDraftEffectivelyEmpty,
  legacyListingDraftSessionKey,
  LISTING_DRAFT_STORAGE_VERSION,
  loadListingDraftFromStorage,
  listingDraftStorageKey,
  saveListingDraftToStorage,
  type ListingFormDraftV1,
} from "@/lib/listing-form-draft-storage";
import {
  buildFormDataFromPublishValues,
  clearDraftAdMirror,
  draftAdStorageKey,
  emptyPublishFormValues,
  listingDraftFromPublishValues,
  publishValuesFromDraftValues,
  saveDraftAdMirror,
  type PublishFormValues,
} from "@/lib/listing-publish-form-data";
import { VEHICLE_BRANDS } from "@/lib/vehicle-taxonomy";

type Props = {
  locale: string;
  /** Ciorna e salvată per cont (localStorage). */
  userId: string;
  categoryTree: CategoryTreeNode[];
};

/** Culori explicite — pe mobil (Safari) fără ele, textul poate fi invizibil în input/textarea. */
const baseInputClass =
  "mt-1 min-h-[52px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-base leading-normal text-zinc-900 caret-zinc-900 placeholder:text-zinc-500 [color-scheme:light] md:min-h-[44px] md:rounded-lg md:py-2.5 md:text-sm";
const labelClass = "block text-sm font-medium text-zinc-900";
const labelClassInline = "flex items-center gap-2 text-sm font-medium text-zinc-900";
const errBorder = "input-error border-red-500 ring-2 ring-red-500/30";
const LIVE_REQUIRED_FIELDS: ListingFormFieldId[] = [
  "title",
  "description",
  "price",
  "city",
  "condition",
  "imagesRaw",
];

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
  const [publishValues, setPublishValues] = useState<PublishFormValues>(emptyPublishFormValues);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [clientErrors, setClientErrors] = useState<Partial<Record<ListingFormFieldId, string>>>({});
  const [liveValidateEnabled, setLiveValidateEnabled] = useState(false);
  /** După eroare server „category”, ascundem mesajul dacă user a schimbat categoria. */
  const [dismissServerCategoryError, setDismissServerCategoryError] = useState(false);

  const formRef = useRef<HTMLFormElement | null>(null);
  const publishRedirectDoneRef = useRef(false);
  const skipDraftSaveRef = useRef(false);
  const [draftHydrated, setDraftHydrated] = useState(false);
  const saveDraftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storageKey = useMemo(() => listingDraftStorageKey(locale, userId), [locale, userId]);
  const legacyDraftSessionKey = useMemo(() => legacyListingDraftSessionKey(locale), [locale]);
  const draftAdKey = useMemo(() => draftAdStorageKey(userId, locale), [userId, locale]);

  const selectedSlug = useMemo(
    () => findLeafSlugById(categoryTree, categoryId) ?? "",
    [categoryId, categoryTree],
  );

  const { isVeh, isRe, isBrandish } = getListingFormFlags(selectedSlug);
  const detailFields = useMemo(() => getDetailFieldsForSlug(selectedSlug), [selectedSlug]);

  function ring(field: ListingFormFieldId): string {
    return clientErrors[field] ? errBorder : "";
  }

  function clearFieldError(field: ListingFormFieldId) {
    setClientErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function scrollAndFocusField(field?: ListingFormFieldId) {
    const root = formRef.current;
    if (!root) {
      return;
    }
    const fieldId = field ? (field === "categoryId" ? "field-categoryId" : `field-${field}`) : null;
    const preferred = fieldId ? root.querySelector<HTMLElement>(`#${fieldId}`) : null;
    const firstInvalid = root.querySelector<HTMLElement>(".input-error, [data-error='true']");
    const container = preferred ?? firstInvalid;
    if (!container) {
      return;
    }
    const focusTarget =
      container.matches("input, textarea, select, button, [tabindex]:not([tabindex='-1'])")
        ? container
        : container.querySelector<HTMLElement>(
            "input:not([type='hidden']), textarea, select, button, [tabindex]:not([tabindex='-1'])",
          );
    container.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      focusTarget?.focus({ preventScroll: true });
    }, 220);
  }

  function debugFormData(fd: FormData): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of fd.entries()) {
      out[k] = typeof v === "string" && v.length > 300 ? `${v.slice(0, 300)}…` : v;
    }
    return out;
  }

  useEffect(() => {
    const loaded = loadListingDraftFromStorage(storageKey, {
      migrateLegacySessionKey: legacyDraftSessionKey,
    });
    if (loaded) {
      skipDraftSaveRef.current = true;
      setCategoryId(normalizeLeafCategoryId(categoryTree, loaded.categoryId));
      setImagesRaw(loaded.imagesRaw);
      setPublishValues(publishValuesFromDraftValues(loaded.values));
      queueMicrotask(() => {
        skipDraftSaveRef.current = false;
      });
      setDraftHydrated(true);
      return;
    }
    try {
      const raw = localStorage.getItem(draftAdKey);
      if (!raw) {
        setDraftHydrated(true);
        return;
      }
      const alt = JSON.parse(raw) as ListingFormDraftV1;
      if (
        alt?.v !== LISTING_DRAFT_STORAGE_VERSION ||
        typeof alt.categoryId !== "string" ||
        typeof alt.imagesRaw !== "string"
      ) {
        setDraftHydrated(true);
        return;
      }
      if (!alt.values || typeof alt.values !== "object") {
        setDraftHydrated(true);
        return;
      }
      skipDraftSaveRef.current = true;
      setCategoryId(normalizeLeafCategoryId(categoryTree, alt.categoryId));
      setImagesRaw(alt.imagesRaw);
      setPublishValues(publishValuesFromDraftValues(alt.values));
      saveListingDraftToStorage(storageKey, alt);
      queueMicrotask(() => {
        skipDraftSaveRef.current = false;
      });
    } catch {
      /* ignore */
    }
    setDraftHydrated(true);
    // categoryTree vine din server o dată; nu reîncărca ciorna la fiecare rerandare.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- doar la mount / chei storage
  }, [storageKey, legacyDraftSessionKey, draftAdKey]);

  const scheduleDraftPersist = useCallback(() => {
    if (saveDraftTimerRef.current) {
      clearTimeout(saveDraftTimerRef.current);
    }
    saveDraftTimerRef.current = setTimeout(() => {
      saveDraftTimerRef.current = null;
      if (skipDraftSaveRef.current) {
        return;
      }
      const draft = listingDraftFromPublishValues(categoryId, imagesRaw, publishValues);
      if (isListingDraftEffectivelyEmpty(draft)) {
        clearListingDraftStorage(storageKey, legacyDraftSessionKey);
        clearDraftAdMirror(draftAdKey);
        return;
      }
      saveListingDraftToStorage(storageKey, draft);
      saveDraftAdMirror(draftAdKey, draft);
    }, 450);
  }, [categoryId, imagesRaw, publishValues, storageKey, legacyDraftSessionKey, draftAdKey]);

  useEffect(() => {
    if (!draftHydrated) {
      return;
    }
    scheduleDraftPersist();
  }, [draftHydrated, scheduleDraftPersist]);

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
    clearDraftAdMirror(draftAdKey);
    skipDraftSaveRef.current = true;
    toast("success", t("success"));
    const city = typeof publishValues.city === "string" ? publishValues.city : "";
    const title = typeof publishValues.title === "string" ? publishValues.title : "";
    router.push(localizedHref(locale, listingSeoPath({ id: state.listingId, title, city })));
  }, [state, storageKey, legacyDraftSessionKey, draftAdKey, router, toast, t, locale]);

  useEffect(() => {
    if (state?.ok === false && state.error === "server") {
      toast("error", t("serverPublishError"));
    }
  }, [state, toast, t]);

  useEffect(() => {
    if (!state) {
      return;
    }
    console.warn("[publish] response state:", state);
    if (state.ok === false) {
      console.warn("ERROR:", state);
      alert(state.details ?? "Eroare la publicare");
    } else {
      console.warn("SUCCESS");
    }
  }, [state]);

  useEffect(() => {
    if (state?.ok === false && state.error === "category") {
      setDismissServerCategoryError(false);
    }
  }, [state]);

  useEffect(() => {
    if (!liveValidateEnabled) {
      return;
    }
    const cid = categoryId.trim();
    const nextErrors: Partial<Record<ListingFormFieldId, string>> = {};
    if (!cid) {
      nextErrors.categoryId = msg.errCategory;
    } else if (!isLeafCategoryNode(categoryTree, cid)) {
      nextErrors.categoryId = tVal("errCategoryLeaf");
    }
    const liveValues = {
      categoryId: cid,
      title: publishValues.title,
      description: publishValues.description,
      price: publishValues.price,
      city: publishValues.city,
      condition: publishValues.condition,
      imagesRaw,
    };
    for (const field of LIVE_REQUIRED_FIELDS) {
      const e = liveValidateField(field, liveValues, msg);
      if (e) {
        nextErrors[field] = e;
      }
    }
    setClientErrors((prev) => {
      const merged = { ...prev };
      delete merged.categoryId;
      for (const field of LIVE_REQUIRED_FIELDS) {
        delete merged[field];
      }
      return { ...merged, ...nextErrors };
    });
  }, [
    liveValidateEnabled,
    categoryId,
    categoryTree,
    imagesRaw,
    msg,
    publishValues.city,
    publishValues.condition,
    publishValues.description,
    publishValues.price,
    publishValues.title,
    tVal,
  ]);

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

  function setExtra(name: string, value: string) {
    setPublishValues((p) => ({ ...p, extra: { ...p.extra, [name]: value } }));
  }

  function handleSubmit() {
    console.warn("handleSubmit() START");
    setLiveValidateEnabled(true);
    const cid = categoryId.trim();
    const selectedPath = cid ? getPathLabelsForLeaf(categoryTree, cid) : "";
    console.warn("[publish] categoryId payload", {
      categoryId: cid,
      selectedPath,
      isLeaf: cid ? isLeafCategoryNode(categoryTree, cid) : false,
    });

    if (!cid) {
      console.warn("[publish] blocked: missing subcategory_id");
      setClientErrors({ categoryId: msg.errCategory });
      alert(msg.errCategory);
      queueMicrotask(() => {
        scrollAndFocusField("categoryId");
      });
      return;
    }
    if (!isLeafCategoryNode(categoryTree, cid)) {
      console.warn("[publish] blocked: selected category is not a leaf", { subcategory_id: cid });
      setClientErrors({ categoryId: tVal("errCategoryLeaf") });
      alert(tVal("errCategoryLeaf"));
      queueMicrotask(() => {
        scrollAndFocusField("categoryId");
      });
      return;
    }

    const payload = {
      subcategory_id: cid,
      category_id: cid,
      categorySlug: selectedSlug,
    };
    console.warn("Submitting payload:", payload);
    const fd = buildFormDataFromPublishValues(
      locale,
      cid,
      selectedSlug,
      imagesRaw,
      publishValues,
      detailFields,
    );
    console.warn("Form data:", debugFormData(fd));
    console.warn("[publish] request body check", {
      title: fd.get("title"),
      price: fd.get("price"),
      category_id: fd.get("category_id"),
      images: fd.get("images"),
    });
    console.warn("[publish] formData.categoryId", fd.get("categoryId"));
    console.warn("[publish] formData.subcategory_id", fd.get("subcategory_id"));
    const v = validateListingFormClient(fd, msg);
    if (!v.ok) {
      console.warn("[publish] validation errors:", v.errors, "firstField:", v.firstField);
      const firstErrorText =
        v.errors[v.firstField] ??
        Object.values(v.errors).find((e): e is string => typeof e === "string") ??
        "Formular invalid.";
      setClientErrors(v.errors);
      alert(firstErrorText);
      queueMicrotask(() => {
        scrollAndFocusField(v.firstField);
      });
      return;
    }
    console.warn("[publish] validation passed");
    setClientErrors({});
    console.warn("[publish] request transport: serverAction:createListing");
    startTransition(() => {
      formAction(fd);
      console.warn("[publish] request dispatched");
    });
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
  }

  const serverMsg =
    state?.ok === false && state.error !== "server" && state.error !== "category"
      ? (state.details ??
        (state.error === "unauthorized"
        ? t("serverUnauthorized")
        : state.error === "session"
          ? t("serverSession")
          : t("serverValidation")))
      : null;

  const categoryFieldError =
    clientErrors.categoryId ??
    (!dismissServerCategoryError &&
    state?.ok === false &&
    state.error === "category" &&
    (!categoryId.trim() || !isLeafCategoryNode(categoryTree, categoryId))
      ? (state.details ?? t("serverCategory"))
      : null);

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        console.warn("SUBMIT TRIGGERED");
        handleSubmit();
      }}
      className="mx-auto w-full max-w-3xl space-y-6 rounded-2xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-sm [color-scheme:light] md:space-y-8 md:p-8"
    >
      <section
        id="field-categoryId"
        data-error={categoryFieldError ? "true" : undefined}
        className={`space-y-3 ${categoryFieldError ? "input-error" : ""}`}
      >
        <div>
          <h2 className="text-base font-semibold text-zinc-900">{t("formSectionCategory")}</h2>
        </div>
        <div
          className={`rounded-2xl border border-zinc-200 bg-zinc-50 p-4 ${
            categoryFieldError ? "ring-2 ring-red-500/35" : ""
          }`}
        >
          <CategorySelector
            tree={categoryTree}
            value={categoryId}
            onCategoryIdAction={(id) => {
              const nextId = id.trim();
              const nextSelected = nextId ? findCategoryNodeById(categoryTree, nextId) : null;
              console.log("Selected:", nextSelected);
              console.log("Subcategory ID:", nextId);
              setCategoryId(nextId);
              setDismissServerCategoryError(true);
              const nextCategoryError =
                !nextId ? msg.errCategory : isLeafCategoryNode(categoryTree, nextId) ? undefined : tVal("errCategoryLeaf");
              if (nextCategoryError) {
                setClientErrors((prev) => ({ ...prev, categoryId: nextCategoryError }));
              } else {
                clearFieldError("categoryId");
              }
            }}
            error={categoryFieldError}
          />
        </div>
      </section>

      <section
        id="publish-listing-details"
        className="scroll-mt-6 space-y-6 border-t border-zinc-200 pt-6 text-zinc-900 md:pt-8"
      >
        <h2 className="text-base font-semibold text-zinc-900">{t("formSectionListing")}</h2>
        <div id="field-title">
          <label className={labelClass} htmlFor="title">
            {t("title")}
          </label>
          <input
            id="title"
            name="title"
            data-error={clientErrors.title ? "true" : undefined}
            maxLength={160}
            value={publishValues.title}
            onChange={(e) => {
              setPublishValues((p) => ({ ...p, title: e.target.value }));
            }}
            aria-invalid={Boolean(clientErrors.title)}
            className={`${baseInputClass} ${ring("title")}`}
          />
          {clientErrors.title ? <p className="mt-1 text-sm text-red-600">{clientErrors.title}</p> : null}
        </div>

        <div id="field-description">
          <label className={labelClass} htmlFor="description">
            {t("description")}
          </label>
          <textarea
            id="description"
            name="description"
            data-error={clientErrors.description ? "true" : undefined}
            rows={6}
            value={publishValues.description}
            onChange={(e) => {
              setPublishValues((p) => ({ ...p, description: e.target.value }));
            }}
            aria-invalid={Boolean(clientErrors.description)}
            className={`${baseInputClass} ${ring("description")}`}
          />
          {clientErrors.description ? (
            <p className="mt-1 text-sm text-red-600">{clientErrors.description}</p>
          ) : null}
        </div>

        <div className="space-y-5" id="field-price">
          <div className="grid gap-5 md:grid-cols-2 md:items-end">
            <div>
              <label className={labelClass} htmlFor="price">
                {t("priceAmount")}
              </label>
              <input
                id="price"
                name="price"
                data-error={clientErrors.price ? "true" : undefined}
                type="number"
                inputMode="numeric"
                min={1}
                value={publishValues.price}
                onChange={(e) => {
                  setPublishValues((p) => ({ ...p, price: e.target.value }));
                }}
                aria-invalid={Boolean(clientErrors.price)}
                className={`${baseInputClass} ${ring("price")}`}
              />
              {clientErrors.price ? <p className="mt-1 text-sm text-red-600">{clientErrors.price}</p> : null}
            </div>
            <div>
              <label className={labelClass} htmlFor="priceCurrency">
                {t("priceCurrencyLabel")}
              </label>
              <select
                id="priceCurrency"
                name="priceCurrency"
                value={publishValues.priceCurrency}
                onChange={(e) =>
                  setPublishValues((p) => ({
                    ...p,
                    priceCurrency: e.target.value === "EUR" ? "EUR" : "MDL",
                  }))
                }
                className={`${baseInputClass}`}
              >
                <option value="MDL">{t("priceCurrencyMdl")}</option>
                <option value="EUR">{t("priceCurrencyEur")}</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClassInline}>
              <input
                name="negotiable"
                type="checkbox"
                checked={publishValues.negotiable}
                onChange={(e) => setPublishValues((p) => ({ ...p, negotiable: e.target.checked }))}
                className="rounded border-zinc-400"
              />
              {t("negotiable")}
            </label>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div id="field-city">
            <label className={labelClass} htmlFor="city">
              {t("city")}
            </label>
            <input
              id="city"
              name="city"
              data-error={clientErrors.city ? "true" : undefined}
              maxLength={80}
              value={publishValues.city}
              onChange={(e) => {
                setPublishValues((p) => ({ ...p, city: e.target.value }));
              }}
              aria-invalid={Boolean(clientErrors.city)}
              className={`${baseInputClass} ${ring("city")}`}
            />
            {clientErrors.city ? <p className="mt-1 text-sm text-red-600">{clientErrors.city}</p> : null}
          </div>
          <div>
            <label className={labelClass} htmlFor="district">
              {t("district")}
            </label>
            <input
              id="district"
              name="district"
              maxLength={80}
              value={publishValues.district}
              onChange={(e) => setPublishValues((p) => ({ ...p, district: e.target.value }))}
              className={`${baseInputClass}`}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="phone">
            {t("phone")}
          </label>
          <input
            id="phone"
            name="phone"
            maxLength={30}
            value={publishValues.phone}
            onChange={(e) => setPublishValues((p) => ({ ...p, phone: e.target.value }))}
            className={`${baseInputClass}`}
          />
        </div>

        <div id="field-condition">
          <label className={labelClass} htmlFor="condition">
            {t("condition")}
          </label>
          <select
            id="condition"
            name="condition"
            data-error={clientErrors.condition ? "true" : undefined}
            value={publishValues.condition}
            onChange={(e) => {
              setPublishValues((p) => ({ ...p, condition: e.target.value }));
            }}
            aria-invalid={Boolean(clientErrors.condition)}
            className={`${baseInputClass} ${ring("condition")}`}
          >
            <option value="new">{t("conditionNew")}</option>
            <option value="used">{t("conditionUsed")}</option>
            <option value="not_applicable">{t("conditionNA")}</option>
          </select>
          {clientErrors.condition ? (
            <p className="mt-1 text-sm text-red-600">{clientErrors.condition}</p>
          ) : null}
        </div>
      </section>

      {isVeh || isRe || (isBrandish && !isVeh) || detailFields.length > 0 ? (
        <section className="space-y-6 border-t border-zinc-200 pt-6 text-zinc-900 md:pt-8">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">{t("formSectionSpecs")}</h2>
          </div>

          {isVeh ? (
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="brand">
                  {t("brand")}
                </label>
                <input
                  id="brand"
                  name="brand"
                  list="vehicle-brand-suggestions"
                  maxLength={80}
                  value={publishValues.brand}
                  onChange={(e) => setPublishValues((p) => ({ ...p, brand: e.target.value }))}
                  className={`${baseInputClass}`}
                />
                <datalist id="vehicle-brand-suggestions">
                  {VEHICLE_BRANDS.map((brandName) => (
                    <option key={brandName} value={brandName} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className={labelClass} htmlFor="modelName">
                  {t("model")}
                </label>
                <input
                  id="modelName"
                  name="modelName"
                  maxLength={80}
                  value={publishValues.modelName}
                  onChange={(e) => setPublishValues((p) => ({ ...p, modelName: e.target.value }))}
                  className={`${baseInputClass}`}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="year">
                  {t("year")}
                </label>
                <input
                  id="year"
                  name="year"
                  type="number"
                  inputMode="numeric"
                  value={publishValues.year}
                  onChange={(e) => setPublishValues((p) => ({ ...p, year: e.target.value }))}
                  className={`${baseInputClass}`}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="mileageKm">
                  {t("mileage")}
                </label>
                <input
                  id="mileageKm"
                  name="mileageKm"
                  type="number"
                  inputMode="numeric"
                  value={publishValues.mileageKm}
                  onChange={(e) => setPublishValues((p) => ({ ...p, mileageKm: e.target.value }))}
                  className={`${baseInputClass}`}
                />
              </div>
            </div>
          ) : null}

          {isRe ? (
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="rooms">
                  {t("rooms")}
                </label>
                <input
                  id="rooms"
                  name="rooms"
                  maxLength={40}
                  value={publishValues.rooms}
                  onChange={(e) => setPublishValues((p) => ({ ...p, rooms: e.target.value }))}
                  className={`${baseInputClass}`}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="areaSqm">
                  {t("areaSqm")}
                </label>
                <input
                  id="areaSqm"
                  name="areaSqm"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={publishValues.areaSqm}
                  onChange={(e) => setPublishValues((p) => ({ ...p, areaSqm: e.target.value }))}
                  className={`${baseInputClass}`}
                />
              </div>
            </div>
          ) : null}

          {isBrandish && !isVeh ? (
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="brand2">
                  {t("brand")}
                </label>
                <input
                  id="brand2"
                  name="brand"
                  maxLength={80}
                  value={publishValues.brand}
                  onChange={(e) => setPublishValues((p) => ({ ...p, brand: e.target.value }))}
                  className={`${baseInputClass}`}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="modelName2">
                  {t("model")}
                </label>
                <input
                  id="modelName2"
                  name="modelName"
                  maxLength={80}
                  value={publishValues.modelName}
                  onChange={(e) => setPublishValues((p) => ({ ...p, modelName: e.target.value }))}
                  className={`${baseInputClass}`}
                />
              </div>
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            {detailFields.map((field) => {
              const fname = getDetailFormName(field);
              const val = publishValues.extra[fname] ?? "";
              return (
                <div key={field.id}>
                  <label className={labelClass} htmlFor={fname}>
                    {detailLabel(field)}
                  </label>
                  {field.input === "select" && field.selectValues ? (
                    <select
                      id={fname}
                      name={fname}
                      value={val}
                      onChange={(e) => setExtra(fname, e.target.value)}
                      className={`${baseInputClass}`}
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
                      value={val}
                      onChange={(e) => setExtra(fname, e.target.value)}
                      className={`${baseInputClass}`}
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
                      value={val}
                      onChange={(e) => setExtra(fname, e.target.value)}
                      className={`${baseInputClass}`}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="space-y-5 border-t border-zinc-200 pt-6 md:pt-8">
        <h2 className="text-base font-semibold text-zinc-900">{t("formSectionMedia")}</h2>
        <div id="field-imagesRaw">
          <label className={labelClass} htmlFor="imagesRaw">
            {t("images")}
          </label>
          <p className="mt-1 text-xs text-zinc-500">{t("imagesHint")}</p>
          <textarea
            id="imagesRaw"
            name="imagesRaw"
            data-error={clientErrors.imagesRaw ? "true" : undefined}
            value={imagesRaw}
            onChange={(e) => {
              setImagesRaw(e.target.value);
            }}
            rows={4}
            aria-invalid={Boolean(clientErrors.imagesRaw)}
            className={`mt-2 w-full min-h-[52px] rounded-lg border border-zinc-300 bg-white px-3 py-3 font-mono text-xs leading-normal text-zinc-900 caret-zinc-900 placeholder:text-zinc-500 [color-scheme:light] md:min-h-[44px] md:py-2.5 ${ring("imagesRaw")}`}
            placeholder="https://..."
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50">
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

      {serverMsg ? <p className="text-sm font-medium text-red-600">{serverMsg}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        onClick={(e) => {
          e.preventDefault();
          console.warn("SUBMIT BUTTON CLICKED");
          handleSubmit();
        }}
        className="inline-flex min-h-[52px] w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-base font-semibold text-white shadow-sm transition active:bg-emerald-700 disabled:pointer-events-none disabled:opacity-60 lg:hover:bg-emerald-700"
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
