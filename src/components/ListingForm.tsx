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
import { useTranslations } from "next-intl";
import { createListing, type CreateListingState } from "@/app/actions/listings";
import {
  getDetailFieldsForSlug,
  getDetailFormName,
  getListingFormFlags,
  type DetailField,
} from "@/lib/listing-detail-config";
import {
  type CategoryTreeNode,
  findAncestorStackForLeaf,
  findLeafSlugById,
  getPathLabelsForLeaf,
} from "@/lib/category-tree";
import { emojiForCategorySlug } from "@/lib/category-icons";
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

type CategoryPickerProps = {
  tree: CategoryTreeNode[];
  value: string;
  onChange: (categoryId: string) => void;
  name?: string;
  error?: string | null;
};

function ListingCategoryPicker({ tree, value, onChange, name = "categoryId", error }: CategoryPickerProps) {
  const tCat = useTranslations("ListingForm");
  const [stack, setStack] = useState<CategoryTreeNode[]>(() =>
    value ? (findAncestorStackForLeaf(tree, value) ?? []) : [],
  );
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!value) {
      return;
    }
    setStack(findAncestorStackForLeaf(tree, value) ?? []);
  }, [value, tree]);

  const currentNodes = useMemo(() => {
    if (stack.length === 0) {
      return tree;
    }
    const last = stack[stack.length - 1];
    return last.children ?? [];
  }, [tree, stack]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return currentNodes;
    }
    return currentNodes.filter((n) => n.label.toLowerCase().includes(q));
  }, [currentNodes, query]);

  const selectedPath = value ? getPathLabelsForLeaf(tree, value) : "";

  function onPickNode(n: CategoryTreeNode) {
    if (n.children && n.children.length > 0) {
      onChange("");
      setStack((s) => [...s, n]);
      setQuery("");
      return;
    }
    onChange(n.id);
    setStack(findAncestorStackForLeaf(tree, n.id) ?? []);
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={value} />

      {selectedPath ? (
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-3 py-2 text-sm dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <span className="font-medium text-emerald-900 dark:text-emerald-100">{tCat("categorySelectedLabel")}: </span>
          <span className="text-emerald-800 dark:text-emerald-200">{selectedPath}</span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-1 text-sm text-zinc-600 dark:text-zinc-300">
        <button
          type="button"
          className="rounded-md px-2 py-1 font-medium text-[#0b57d0] hover:bg-zinc-100 dark:text-blue-400 dark:hover:bg-zinc-800"
          onClick={() => {
            onChange("");
            setStack([]);
            setQuery("");
          }}
        >
          {tCat("categoryBreadcrumbRoot")}
        </button>
        {stack.map((n, i) => (
          <span key={n.id} className="inline-flex items-center gap-1">
            <span className="text-zinc-400" aria-hidden>
              ›
            </span>
            <button
              type="button"
              disabled={i === stack.length - 1}
              className="rounded-md px-2 py-1 font-medium text-[#0b57d0] hover:bg-zinc-100 disabled:cursor-default disabled:text-zinc-700 disabled:hover:bg-transparent dark:text-blue-400 dark:disabled:text-zinc-300 dark:hover:bg-zinc-800 dark:disabled:hover:bg-transparent"
              onClick={() => {
                onChange("");
                setStack(stack.slice(0, i + 1));
                setQuery("");
              }}
            >
              {n.label}
            </button>
          </span>
        ))}
        {stack.length > 0 ? (
          <button
            type="button"
            className="ml-1 rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
            onClick={() => {
              onChange("");
              setStack((s) => s.slice(0, -1));
              setQuery("");
            }}
          >
            {tCat("categoryBack")}
          </button>
        ) : null}
      </div>

      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tCat("categorySearchPlaceholder")}
          className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-3 pr-3 text-sm dark:border-zinc-600 dark:bg-zinc-950"
          autoComplete="off"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">{tCat("categoryEmptyFilter")}</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((n) => {
            const isFolder = !!(n.children && n.children.length > 0);
            const isLeafSelected = !isFolder && n.id === value;
            const emoji = emojiForCategorySlug(n.slug);
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => onPickNode(n)}
                  className={`flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left text-sm transition ${
                    isLeafSelected
                      ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/30 dark:border-emerald-700 dark:bg-emerald-950/40"
                      : "border-zinc-200 bg-white hover:border-[#0b57d0]/40 hover:bg-sky-50/60 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-blue-500/40 dark:hover:bg-zinc-800/80"
                  }`}
                >
                  <span className="text-xl leading-none" aria-hidden>
                    {emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">{n.label}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export function ListingForm({ locale, userId, categoryTree }: Props) {
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
  /** După publicare reușită, remontăm formularul ca toate câmpurile să fie goale pentru următorul anunț. */
  const [formInstanceKey, setFormInstanceKey] = useState(0);

  const formRef = useRef<HTMLFormElement>(null);
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
    if (state?.ok !== true) {
      return;
    }
    clearListingDraftStorage(storageKey, legacyDraftSessionKey);
    skipDraftSaveRef.current = true;
    draftRemainderRef.current = null;
    setCategoryId("");
    setImagesRaw("");
    setClientErrors({});
    setUploadError(null);
    setFormInstanceKey((k) => k + 1);
    queueMicrotask(() => {
      skipDraftSaveRef.current = false;
    });
  }, [state, storageKey, legacyDraftSessionKey]);

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
    state?.ok === false
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
      key={formInstanceKey}
      ref={formRef}
      action={handleSubmit}
      onInput={() => {
        scheduleDraftPersist();
      }}
      className="mx-auto max-w-3xl space-y-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
    >
      <input type="hidden" name="locale" value={locale} />

      <section id="field-categoryId" className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{t("formSectionCategory")}</h2>
        </div>
        <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-950/40">
          <ListingCategoryPicker
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

      <section className="space-y-5 border-t border-zinc-200 pt-8 dark:border-zinc-800">
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
              min={0}
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

      {serverMsg ? <p className="text-sm text-red-600">{serverMsg}</p> : null}
      {state?.ok === true ? <p className="text-sm text-emerald-700 dark:text-emerald-400">{t("success")}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {isPending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
