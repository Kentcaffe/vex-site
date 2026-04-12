"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useTranslations } from "next-intl";
import { createListing, type CreateListingState } from "@/app/actions/listings";
import { Link, useRouter } from "@/i18n/navigation";
import {
  getDetailFieldsForSlug,
  getDetailFormName,
  type DetailField,
} from "@/lib/listing-detail-config";
import {
  liveValidateField,
  validateListingFormClient,
  type ListingFormFieldId,
  type ListingLiveValues,
} from "@/lib/listing-form-client-validation";
import { IconMapPin, IconPhone, IconPrice } from "@/components/listing-form-icons";
import { LISTING_MAX_IMAGES, parseImageLines } from "@/lib/listing-form-schema";

const initial: CreateListingState | undefined = undefined;

function RequiredMark({ label }: { label: string }) {
  return (
    <span className="text-red-600 dark:text-red-400" aria-label={label}>
      *
    </span>
  );
}

function DetailFieldControl({
  field,
  label,
  inputClass,
}: {
  field: DetailField;
  label: string;
  inputClass: string;
}) {
  const tForm = useTranslations("ListingForm");
  const name = getDetailFormName(field);

  if (field.input === "select") {
    const g = field.selectGroup ?? "";
    return (
      <div>
        <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400" htmlFor={name}>
          {label}
        </label>
        <select id={name} name={name} className={inputClass}>
          <option value="">{tForm("detailOptional")}</option>
          {(field.selectValues ?? []).map((v) => (
            <option key={v} value={v}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {tForm(`detailSelect.${g}.${v}` as any)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.input === "number") {
    return (
      <div>
        <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400" htmlFor={name}>
          {label}
        </label>
        <input
          id={name}
          name={name}
          type="number"
          min={field.min}
          max={field.max}
          step={field.numberStep ?? "any"}
          className={inputClass}
        />
      </div>
    );
  }

  return (
    <div>
      <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        maxLength={field.maxLength ?? 200}
        className={inputClass}
      />
    </div>
  );
}

type Props = {
  locale: string;
  categoryOptions: { id: string; slug: string; path: string }[];
};

const fieldBase =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition-colors focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-500/20";

const fieldError = "border-red-400 focus:border-red-500 focus:ring-red-400/30 dark:border-red-600";

export function ListingForm({ locale, categoryOptions }: Props) {
  const t = useTranslations("Listings");
  const tForm = useTranslations("ListingForm");
  const tCond = useTranslations("Condition");
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, formAction, actionPending] = useActionState(createListing, initial);
  const [isPending, startTransition] = useTransition();

  const draftKey = useMemo(() => `anunturi-listing-draft:${locale}`, [locale]);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [phone, setPhone] = useState("");
  const [condition, setCondition] = useState("not_applicable");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [photoDragActive, setPhotoDragActive] = useState(false);
  const photoDragDepth = useRef(0);
  const [negotiable, setNegotiable] = useState(false);

  const imagesRaw = useMemo(() => imageUrls.join("\n"), [imageUrls]);

  const [errors, setErrors] = useState<Partial<Record<ListingFormFieldId, string>>>({});
  const [draftBanner, setDraftBanner] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const selectedSlug = useMemo(
    () => categoryOptions.find((o) => o.id === selectedCategoryId)?.slug ?? "",
    [selectedCategoryId, categoryOptions],
  );

  const detailFields = useMemo(() => getDetailFieldsForSlug(selectedSlug), [selectedSlug]);

  const validationMsg = useMemo(
    () => ({
      errCategory: tForm("errCategory"),
      errTitle: tForm("errTitle"),
      errDescription: tForm("errDescription"),
      errPrice: tForm("errPrice"),
      errCity: tForm("errCity"),
      errCondition: tForm("errCondition"),
      errImages: tForm("errImages"),
      errImagesRequired: tForm("errImagesRequired"),
    }),
    [tForm],
  );

  const liveValues: ListingLiveValues = useMemo(
    () => ({
      categoryId: selectedCategoryId,
      title,
      description,
      price,
      city,
      condition,
      imagesRaw,
    }),
    [selectedCategoryId, title, description, price, city, condition, imagesRaw],
  );

  const scrollToField = useCallback((field: ListingFormFieldId) => {
    const wrap = document.getElementById(`field-${field}`);
    wrap?.scrollIntoView({ behavior: "smooth", block: "center" });
    const focusable = wrap?.querySelector<HTMLElement>("input, textarea, select, button");
    focusable?.focus();
  }, []);

  const clearFieldError = useCallback((field: ListingFormFieldId) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handlePickPhotos = useCallback(() => {
    setUploadError(null);
    fileInputRef.current?.click();
  }, []);

  const uploadImageFiles = useCallback(
    async (fileList: File[]) => {
      const imageFiles = fileList.filter((f) => f.type.startsWith("image/"));
      const remaining = LISTING_MAX_IMAGES - imageUrls.length;
      if (remaining <= 0 || imageFiles.length === 0) {
        return;
      }
      const toUpload = imageFiles.slice(0, remaining);
      setUploading(true);
      setUploadError(null);
      try {
        const fd = new FormData();
        toUpload.forEach((f) => fd.append("files", f));
        const res = await fetch("/api/listings/upload-images", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) {
          throw new Error("upload_failed");
        }
        const data = (await res.json()) as { urls?: string[] };
        setImageUrls((prev) => [...prev, ...(data.urls ?? [])].slice(0, LISTING_MAX_IMAGES));
        clearFieldError("imagesRaw");
      } catch {
        setUploadError(tForm("uploadError"));
      } finally {
        setUploading(false);
      }
    },
    [imageUrls.length, tForm, clearFieldError],
  );

  const handlePhotoFiles = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) {
        return;
      }
      await uploadImageFiles(Array.from(files));
      e.target.value = "";
    },
    [uploadImageFiles],
  );

  const handlePhotoDragEnter = useCallback((ev: React.DragEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    photoDragDepth.current += 1;
    if (photoDragDepth.current === 1) {
      setPhotoDragActive(true);
    }
  }, []);

  const handlePhotoDragLeave = useCallback((ev: React.DragEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    photoDragDepth.current -= 1;
    if (photoDragDepth.current <= 0) {
      photoDragDepth.current = 0;
      setPhotoDragActive(false);
    }
  }, []);

  const handlePhotoDragOver = useCallback((ev: React.DragEvent) => {
    ev.preventDefault();
    ev.stopPropagation();
    ev.dataTransfer.dropEffect = "copy";
  }, []);

  const handlePhotoDrop = useCallback(
    async (ev: React.DragEvent) => {
      ev.preventDefault();
      ev.stopPropagation();
      photoDragDepth.current = 0;
      setPhotoDragActive(false);
      await uploadImageFiles(Array.from(ev.dataTransfer.files));
    },
    [uploadImageFiles],
  );

  const removePhotoAt = useCallback(
    (index: number) => {
      setImageUrls((prev) => prev.filter((_, i) => i !== index));
      clearFieldError("imagesRaw");
    },
    [clearFieldError],
  );

  const runLiveBlur = useCallback(
    (field: ListingFormFieldId) => {
      const err = liveValidateField(field, liveValues, validationMsg);
      setErrors((prev) => {
        const next = { ...prev };
        if (err) {
          next[field] = err;
        } else {
          delete next[field];
        }
        return next;
      });
    },
    [liveValues, validationMsg],
  );

  useEffect(() => {
    if (state?.ok) {
      try {
        localStorage.removeItem(draftKey);
      } catch {
        /* ignore */
      }
      router.push("/anunturi");
    }
  }, [state, router, draftKey]);

  useEffect(() => {
    if (state?.ok === false && state.error === "validation") {
      scrollToField("title");
    }
  }, [state, scrollToField]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) {
        setDraftLoaded(true);
        return;
      }
      const o = JSON.parse(raw) as Record<string, unknown>;
      if (typeof o.title === "string") {
        setTitle(o.title);
      }
      if (typeof o.description === "string") {
        setDescription(o.description);
      }
      if (typeof o.price === "string") {
        setPrice(o.price);
      }
      if (typeof o.city === "string") {
        setCity(o.city);
      }
      if (typeof o.district === "string") {
        setDistrict(o.district);
      }
      if (typeof o.phone === "string") {
        setPhone(o.phone);
      }
      if (typeof o.condition === "string") {
        setCondition(o.condition);
      }
      if (typeof o.imagesRaw === "string") {
        setImageUrls(parseImageLines(o.imagesRaw));
      }
      if (o.__negotiable === true) {
        setNegotiable(true);
      }
      if (typeof o.categoryId === "string") {
        setSelectedCategoryId(o.categoryId);
      }
      setDraftBanner(true);
      setDraftLoaded(true);
      requestAnimationFrame(() => {
        const form = formRef.current;
        if (!form) {
          return;
        }
        for (const [k, v] of Object.entries(o)) {
          if (k === "__negotiable" || k === "locale" || k === "imagesRaw") {
            continue;
          }
          const el = form.elements.namedItem(k);
          if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
            el.value = String(v ?? "");
          }
        }
      });
    } catch {
      setDraftLoaded(true);
    }
  }, [draftKey]);

  useEffect(() => {
    if (!draftLoaded) {
      return;
    }
    const t = window.setTimeout(() => {
      const form = formRef.current;
      if (!form) {
        return;
      }
      try {
        const fd = new FormData(form);
        const o: Record<string, unknown> = {};
        fd.forEach((val, key) => {
          if (typeof val === "string") {
            o[key] = val;
          }
        });
        o.__negotiable = fd.get("negotiable") === "on";
        o.locale = locale;
        localStorage.setItem(draftKey, JSON.stringify(o));
      } catch {
        /* ignore */
      }
    }, 550);
    return () => clearTimeout(t);
  }, [
    draftLoaded,
    draftKey,
    locale,
    title,
    description,
    price,
    city,
    district,
    phone,
    condition,
    imageUrls,
    negotiable,
    selectedCategoryId,
    selectedSlug,
  ]);

  const pending = actionPending || isPending;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const result = validateListingFormClient(fd, validationMsg);
    if (!result.ok) {
      setErrors(result.errors);
      scrollToField(result.firstField);
      return;
    }
    setErrors({});
    startTransition(() => {
      formAction(fd);
    });
  };

  const inputClass = (field: ListingFormFieldId) =>
    `${fieldBase} ${errors[field] ? fieldError : ""}`;

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mx-auto max-w-4xl space-y-6">
      <input type="hidden" name="locale" value={locale} />

      {draftBanner ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100"
          role="status"
        >
          <span>{tForm("draftRestored")}</span>
          <button
            type="button"
            className="rounded-lg bg-sky-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-800 dark:bg-sky-700 dark:hover:bg-sky-600"
            onClick={() => {
              try {
                localStorage.removeItem(draftKey);
              } catch {
                /* ignore */
              }
              setDraftBanner(false);
              setSelectedCategoryId("");
              setTitle("");
              setDescription("");
              setPrice("");
              setCity("");
              setDistrict("");
              setPhone("");
              setCondition("not_applicable");
              setImageUrls([]);
              setUploadError(null);
              setNegotiable(false);
              setErrors({});
            }}
          >
            {tForm("draftDismiss")}
          </button>
        </div>
      ) : null}

      {state?.ok === false && state.error === "unauthorized" ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {t("unauthorized")}
        </p>
      ) : null}
      {state?.ok === false && state.error === "session" ? (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
          role="alert"
        >
          <p>{t("staleSession")}</p>
          <Link href="/cont" className="mt-2 inline-block font-medium underline">
            {t("goToAccount")}
          </Link>
        </div>
      ) : null}
      {state?.ok === false && state.error === "validation" ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {t("validationError")}
        </p>
      ) : null}
      {state?.ok === false && state.error === "category" ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {t("categoryLeafOnly")}
        </p>
      ) : null}

      <fieldset className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <legend className="px-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{tForm("sectionCategory")}</legend>
        <div id="field-categoryId" className="md:col-span-2">
          <label className="mb-1 flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400" htmlFor="categoryId">
            {t("category")} <RequiredMark label={tForm("requiredAria")} />
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            value={selectedCategoryId}
            onChange={(e) => {
              setSelectedCategoryId(e.target.value);
              clearFieldError("categoryId");
            }}
            onBlur={() => runLiveBlur("categoryId")}
            className={inputClass("categoryId")}
          >
            <option value="">{t("selectCategory")}</option>
            {categoryOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.path}
              </option>
            ))}
          </select>
          {errors.categoryId ? (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.categoryId}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-zinc-500">{tForm("categoryHint")}</p>
        </div>
      </fieldset>

      <fieldset className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6 md:grid-cols-2">
        <legend className="px-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200 md:col-span-2">
          {tForm("sectionBasic")}
        </legend>
        <div id="field-title" className="md:col-span-2">
          <label className="mb-1 flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400" htmlFor="title">
            {t("listingTitle")} <RequiredMark label={tForm("requiredAria")} />
          </label>
          <input
            id="title"
            name="title"
            required
            minLength={3}
            maxLength={160}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              clearFieldError("title");
            }}
            onBlur={() => runLiveBlur("title")}
            className={inputClass("title")}
          />
          {errors.title ? (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.title}
            </p>
          ) : null}
        </div>
        <div id="field-description" className="md:col-span-2">
          <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400" htmlFor="description">
            {t("description")}{" "}
            <span className="font-normal text-zinc-400">{tForm("optionalSuffix")}</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              clearFieldError("description");
            }}
            onBlur={() => runLiveBlur("description")}
            placeholder={tForm("descriptionPlaceholder")}
            className={inputClass("description")}
          />
          {errors.description ? (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.description}
            </p>
          ) : null}
        </div>
      </fieldset>

      <fieldset className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6 md:grid-cols-2">
        <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200 md:col-span-2">
          <IconPrice />
          {tForm("sectionPrice")}
        </legend>
        <div id="field-price">
          <label className="mb-1 flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400" htmlFor="price">
            {t("price")} <RequiredMark label={tForm("requiredAria")} />
          </label>
          <input
            id="price"
            name="price"
            type="number"
            required
            min={0}
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              clearFieldError("price");
            }}
            onBlur={() => runLiveBlur("price")}
            className={inputClass("price")}
          />
          {errors.price ? (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.price}
            </p>
          ) : null}
        </div>
        <div className="flex items-end pb-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              name="negotiable"
              checked={negotiable}
              onChange={(e) => setNegotiable(e.target.checked)}
              className="rounded border-zinc-400"
            />
            {t("negotiable")}
          </label>
        </div>
      </fieldset>

      <fieldset className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6 md:grid-cols-2">
        <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200 md:col-span-2">
          <IconMapPin />
          {tForm("sectionLocation")}
        </legend>
        <div id="field-city">
          <label className="mb-1 flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400" htmlFor="city">
            {t("city")} <RequiredMark label={tForm("requiredAria")} />
          </label>
          <input
            id="city"
            name="city"
            required
            minLength={2}
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              clearFieldError("city");
            }}
            onBlur={() => runLiveBlur("city")}
            className={inputClass("city")}
          />
          {errors.city ? (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.city}
            </p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400" htmlFor="district">
            {t("district")}{" "}
            <span className="font-normal text-zinc-400">{tForm("optionalSuffix")}</span>
          </label>
          <input
            id="district"
            name="district"
            maxLength={80}
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className={fieldBase}
          />
        </div>
      </fieldset>

      <fieldset className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6 md:grid-cols-2">
        <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200 md:col-span-2">
          <IconPhone />
          {tForm("sectionContact")}
        </legend>
        <div>
          <label className="mb-1 block text-sm text-zinc-600 dark:text-zinc-400" htmlFor="phone">
            {t("phone")}{" "}
            <span className="font-normal text-zinc-400">{tForm("optionalSuffix")}</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            maxLength={30}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={fieldBase}
          />
        </div>
        <div id="field-condition">
          <label className="mb-1 flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400" htmlFor="condition">
            {t("condition")} <RequiredMark label={tForm("requiredAria")} />
          </label>
          <select
            id="condition"
            name="condition"
            required
            value={condition}
            onChange={(e) => {
              setCondition(e.target.value);
              clearFieldError("condition");
            }}
            onBlur={() => runLiveBlur("condition")}
            className={inputClass("condition")}
          >
            <option value="not_applicable">{tCond("not_applicable")}</option>
            <option value="new">{tCond("new")}</option>
            <option value="used">{tCond("used")}</option>
          </select>
          {errors.condition ? (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.condition}
            </p>
          ) : null}
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <legend className="px-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{tForm("sectionDetails")}</legend>
        {!selectedCategoryId ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{tForm("detailsPickCategory")}</p>
        ) : detailFields.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{tForm("detailsMinimalHint")}</p>
        ) : (
          <>
            <p className="text-xs text-zinc-500">{tForm("detailsHint")}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {detailFields.map((field) => (
                <DetailFieldControl
                  key={`${selectedSlug}-${field.id}`}
                  field={field}
                  label={tForm(`details.${field.id}` as "details.brand")}
                  inputClass={fieldBase}
                />
              ))}
            </div>
          </>
        )}
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <legend className="px-1 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{tForm("sectionPhotos")}</legend>
        <input type="hidden" name="imagesRaw" value={imagesRaw} aria-hidden />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="sr-only"
          tabIndex={-1}
          onChange={handlePhotoFiles}
        />
        <div id="field-imagesRaw">
          <label className="mb-1 flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
            {tForm("photosLabel")} <RequiredMark label={tForm("requiredAria")} />
          </label>
          <div
            className={`mt-2 rounded-xl border-2 border-dashed p-4 transition-colors ${
              errors.imagesRaw
                ? "border-red-400 bg-red-50/40 dark:border-red-600 dark:bg-red-950/20"
                : photoDragActive
                  ? "border-sky-500 bg-sky-50/80 dark:border-sky-400 dark:bg-sky-950/30"
                  : "border-zinc-200 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-900/40"
            }`}
            onDragEnter={handlePhotoDragEnter}
            onDragLeave={handlePhotoDragLeave}
            onDragOver={handlePhotoDragOver}
            onDrop={handlePhotoDrop}
          >
            <p className="mb-3 text-center text-sm text-zinc-600 dark:text-zinc-400">{tForm("photosDragDrop")}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handlePickPhotos}
                disabled={uploading || imageUrls.length >= LISTING_MAX_IMAGES}
                className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                {uploading ? tForm("uploading") : tForm("uploadPickPhotos")}
              </button>
              <span className="text-xs text-zinc-500">
                {tForm("photoCount", { count: imageUrls.length })}
              </span>
            </div>
          </div>
          {uploadError ? (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {uploadError}
            </p>
          ) : null}
          {errors.imagesRaw ? (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.imagesRaw}
            </p>
          ) : null}
          {imageUrls.length > 0 ? (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {imageUrls.map((url, i) => (
                <li key={`${url}-${i}`} className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                  {i === 0 ? (
                    <span className="absolute left-1 top-1 z-10 rounded bg-black/65 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      {tForm("photoCover")}
                    </span>
                  ) : null}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhotoAt(i)}
                    className="absolute right-1 top-1 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
                  >
                    {tForm("removePhoto")}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mt-3 text-xs text-zinc-500">{tForm("photosHint")}</p>
        </div>
      </fieldset>

      <p className="text-xs text-zinc-500">
        <RequiredMark label={tForm("requiredAria")} /> {tForm("requiredLegend")}
      </p>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? "…" : t("submit")}
      </button>
    </form>
  );
}
