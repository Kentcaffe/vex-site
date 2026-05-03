"use client";

import { startTransition, useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { saveListing, type CreateListingState } from "@/app/actions/listings";
import { devLog, devWarn } from "@/lib/dev-log";
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
import { SearchableSelect } from "@/components/publish/SearchableSelect";
import { needsCoreConditionSlug } from "@/lib/listing-profiles";
import {
  type CategoryTreeNode,
  findCategoryNodeById,
  findLeafSlugById,
  getPathLabelsForLeaf,
  isLeafCategoryNode,
  normalizeLeafCategoryId,
} from "@/lib/category-tree";
import { useListingCatalogOptions } from "@/hooks/useListingCatalogOptions";
import { LISTING_MAX_IMAGES, parseImageLines, parseListingImageUrlsStrict } from "@/lib/listing-form-schema";
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
import { MOLDOVA_CITY_SET, moldovaCitySelectOptions } from "@/lib/moldova-cities";
import {
  categoryConfig,
  getCategoryBrands,
  getCategoryFieldsForSlug,
  getLocalizedFieldLabel,
  getLocalizedFieldOptionLabel,
  getModelsForCategoryBrand,
  isBrandAllowedForCategory,
  isModelAllowedForCategoryBrand,
  resolveCategoryConfigKey,
  type ListingFieldConfig,
  type ListingFieldId,
} from "@/lib/listing-category-config";
import { evaluateListingFraudRisk } from "@/lib/listing-fraud";
import { PUBLISH_WIZARD_DESC_MAX, PUBLISH_WIZARD_TITLE_MAX } from "@/components/publish/publish-wizard-constants";
import {
  PublishFormSectionCard,
  PublishLivePreviewPanel,
  PublishMobileBenefits,
  PublishWizardGrid,
  PublishWizardSidebar,
} from "@/components/publish/publish-wizard-ui";
import { Car, FileText, ImageIcon, Megaphone, MessageCircle, Phone, Rocket, ShieldCheck, Sparkles } from "lucide-react";

/** Opțiune „alt model” în catalogul dinamic (valoare internă, nu se salvează ca nume anunț). */
const MODEL_CATALOG_OTHER = "__catalog_other__";

type Props = {
  locale: string;
  /** Ciorna e salvată per cont (localStorage). */
  userId: string;
  categoryTree: CategoryTreeNode[];
  /** Editare anunț existent (proprietar). */
  editListingId?: string | null;
  initialEditSnapshot?: {
    categoryId: string;
    imagesRaw: string;
    publishValues: PublishFormValues;
  } | null;
  /** Layout premium cu pași + previzualizare (doar publicare nouă). */
  publishUX?: "standard" | "premium";
};

/** Culori explicite — pe mobil (Safari) fără ele, textul poate fi invizibil în input/textarea. */
const baseInputClass =
  "mt-1 min-h-[52px] w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-base leading-normal text-zinc-900 caret-zinc-900 placeholder:text-zinc-500 [color-scheme:light] md:min-h-[44px] md:rounded-lg md:py-2.5 md:text-sm";
const labelClass = "block text-sm font-medium text-zinc-900";
const labelClassInline = "flex items-center gap-2 text-sm font-medium text-zinc-900";
const errBorder = "input-error border-red-500 ring-2 ring-red-500/30";
export function ListingForm({
  locale,
  userId,
  categoryTree,
  editListingId = null,
  initialEditSnapshot = null,
  publishUX = "standard",
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("ListingForm");
  const tVal = useTranslations("ListingForm.validation");
  const tW = useTranslations("PublishWizard");
  const uiLocale = useLocale();

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
    saveListing,
    undefined as CreateListingState | undefined,
  );
  const isEditMode = Boolean(editListingId);
  const isPremium = publishUX === "premium" && !isEditMode;
  const [categoryId, setCategoryId] = useState("");
  const [imagesRaw, setImagesRaw] = useState("");
  const [publishValues, setPublishValues] = useState<PublishFormValues>(emptyPublishFormValues);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [modelManualOther, setModelManualOther] = useState(false);
  const [clientErrors, setClientErrors] = useState<Partial<Record<ListingFormFieldId, string>>>({});
  const [liveValidateEnabled, setLiveValidateEnabled] = useState(false);
  /** După eroare server „category”, ascundem mesajul dacă user a schimbat categoria. */
  const [dismissServerCategoryError, setDismissServerCategoryError] = useState(false);

  const formRef = useRef<HTMLFormElement | null>(null);
  const publishRedirectDoneRef = useRef(false);
  const skipDraftSaveRef = useRef(false);
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [activeWizardStep, setActiveWizardStep] = useState(1);
  const saveDraftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storageKey = useMemo(() => listingDraftStorageKey(locale, userId), [locale, userId]);
  const legacyDraftSessionKey = useMemo(() => legacyListingDraftSessionKey(locale), [locale]);
  const draftAdKey = useMemo(() => draftAdStorageKey(userId, locale), [userId, locale]);

  const selectedSlug = useMemo(
    () => findLeafSlugById(categoryTree, categoryId) ?? "",
    [categoryId, categoryTree],
  );

  const {
    catalogBrands,
    catalogModels,
    useServerCatalog,
    catalogBrandsStale,
    catalogModelsStale,
  } = useListingCatalogOptions(
    categoryId.trim() || undefined,
    publishValues.catalogBrandId.trim() || undefined,
  );

  const { isVeh, isRe, isBrandish } = getListingFormFlags(selectedSlug);
  const needsCoreCondition = needsCoreConditionSlug(selectedSlug);
  const selectedCategoryKey = useMemo(() => resolveCategoryConfigKey(selectedSlug), [selectedSlug]);
  const selectedCategoryDynamicConfig = useMemo(
    () => (selectedCategoryKey ? categoryConfig[selectedCategoryKey] : null),
    [selectedCategoryKey],
  );
  const selectedCategoryFields = useMemo(
    () => getCategoryFieldsForSlug(selectedSlug),
    [selectedSlug],
  );
  const liveRequiredFields = useMemo((): ListingFormFieldId[] => {
    const fields: ListingFormFieldId[] = ["title", "description", "price", "city"];
    if (needsCoreCondition) {
      fields.push("condition");
    }
    fields.push("imagesRaw");
    return fields;
  }, [needsCoreCondition]);
  const liveValidateOpts = useMemo(
    () => ({
      needsCoreCondition,
      ...(isPremium
        ? { titleMax: PUBLISH_WIZARD_TITLE_MAX, descriptionMax: PUBLISH_WIZARD_DESC_MAX }
        : {}),
    }),
    [needsCoreCondition, isPremium],
  );
  const detailFields = useMemo(
    () => getDetailFieldsForSlug(selectedSlug, { brand: publishValues.brand, model: publishValues.modelName }),
    [selectedSlug, publishValues.brand, publishValues.modelName],
  );
  const modelOtherOption = useMemo(
    () => ({ value: MODEL_CATALOG_OTHER, label: tW("modelOther") }),
    [tW],
  );

  const dynamicBrandOptions = useMemo(() => {
    if (categoryId.trim() && catalogBrandsStale) {
      return [];
    }
    if (useServerCatalog) {
      return catalogBrands.map((b) => ({ value: b.id, label: b.name }));
    }
    if (!selectedCategoryKey) {
      return [];
    }
    return getCategoryBrands(selectedCategoryKey).map((value) => ({ value, label: value }));
  }, [categoryId, catalogBrandsStale, useServerCatalog, catalogBrands, selectedCategoryKey]);

  const dynamicModelOptions = useMemo(() => {
    const bid = publishValues.catalogBrandId.trim();
    if (useServerCatalog && bid && catalogModelsStale) {
      return [];
    }
    if (useServerCatalog && bid) {
      const base = catalogModels.map((m) => ({ value: m.name, label: m.name }));
      return [...base, modelOtherOption];
    }
    if (useServerCatalog) {
      return [];
    }
    if (!selectedCategoryKey) {
      return [];
    }
    const base = getModelsForCategoryBrand(selectedCategoryKey, publishValues.brand).map((value) => ({
      value,
      label: value,
    }));
    return base;
  }, [
    useServerCatalog,
    catalogModels,
    catalogModelsStale,
    publishValues.catalogBrandId,
    publishValues.brand,
    selectedCategoryKey,
    modelOtherOption,
  ]);
  const hasDynamicCategoryConfig = selectedCategoryFields.length > 0;

  useEffect(() => {
    if (useServerCatalog) {
      return;
    }
    if (isBrandAllowedForCategory(selectedCategoryKey, publishValues.brand)) {
      return;
    }
    setPublishValues((prev) => ({ ...prev, brand: "", catalogBrandId: "", modelName: "" }));
    setModelManualOther(false);
  }, [useServerCatalog, selectedCategoryKey, publishValues.brand]);

  useEffect(() => {
    if (useServerCatalog) {
      return;
    }
    if (
      isModelAllowedForCategoryBrand(
        selectedCategoryKey,
        publishValues.brand,
        publishValues.modelName,
      )
    ) {
      return;
    }
    setPublishValues((prev) => ({ ...prev, modelName: "" }));
    setModelManualOther(false);
  }, [useServerCatalog, selectedCategoryKey, publishValues.brand, publishValues.modelName]);

  const citySelectOptions = useMemo(() => {
    const base = moldovaCitySelectOptions();
    const cur = publishValues.city.trim();
    if (cur && !MOLDOVA_CITY_SET.has(cur)) {
      return [{ value: cur, label: cur }, ...base];
    }
    return base;
  }, [publishValues.city]);

  function ring(field: ListingFormFieldId): string {
    return clientErrors[field] ? errBorder : "";
  }

  const goodFieldOutline = "border-emerald-500 ring-2 ring-emerald-500/25";
  const premiumInputClass = `${baseInputClass} border-slate-200 text-slate-900 caret-slate-900 placeholder:text-slate-400 focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 focus:outline-none`;

  function compositeFieldOutline(field: ListingFormFieldId): string {
    if (clientErrors[field]) {
      return errBorder;
    }
    if (!isPremium || !liveValidateEnabled) {
      return "";
    }
    if (field === "title") {
      const x = publishValues.title.trim();
      return x.length >= 5 && publishValues.title.length <= PUBLISH_WIZARD_TITLE_MAX ? goodFieldOutline : "";
    }
    if (field === "description") {
      const x = publishValues.description.trim();
      return x.length >= 20 && publishValues.description.length <= PUBLISH_WIZARD_DESC_MAX
        ? goodFieldOutline
        : "";
    }
    if (field === "price") {
      const p = publishValues.price.trim();
      if (!p) return "";
      const n = Number(p);
      return Number.isFinite(n) && Number.isInteger(n) && n >= 1 ? goodFieldOutline : "";
    }
    if (field === "city") {
      return publishValues.city.trim().length >= 2 ? goodFieldOutline : "";
    }
    if (field === "condition") {
      return needsCoreCondition && ["new", "used"].includes(publishValues.condition) ? goodFieldOutline : "";
    }
    if (field === "imagesRaw") {
      return parseListingImageUrlsStrict(imagesRaw) ? goodFieldOutline : "";
    }
    return "";
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
    if (isEditMode && initialEditSnapshot) {
      skipDraftSaveRef.current = true;
      setCategoryId(normalizeLeafCategoryId(categoryTree, initialEditSnapshot.categoryId));
      setImagesRaw(initialEditSnapshot.imagesRaw);
      setPublishValues(initialEditSnapshot.publishValues);
      queueMicrotask(() => {
        skipDraftSaveRef.current = false;
      });
      setDraftHydrated(true);
      return;
    }
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
  }, [storageKey, legacyDraftSessionKey, draftAdKey, isEditMode, initialEditSnapshot, categoryTree]);

  const flushDraftToStorage = useCallback(() => {
    if (isEditMode) {
      return;
    }
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
  }, [categoryId, imagesRaw, publishValues, storageKey, legacyDraftSessionKey, draftAdKey, isEditMode]);

  const scheduleDraftPersist = useCallback(() => {
    if (saveDraftTimerRef.current) {
      clearTimeout(saveDraftTimerRef.current);
    }
    saveDraftTimerRef.current = setTimeout(() => {
      saveDraftTimerRef.current = null;
      flushDraftToStorage();
    }, 450);
  }, [flushDraftToStorage]);

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
    if (!isEditMode) {
      clearListingDraftStorage(storageKey, legacyDraftSessionKey);
      clearDraftAdMirror(draftAdKey);
    }
    skipDraftSaveRef.current = true;
    toast("success", isEditMode ? t("successUpdated") : t("success"));
    const city = typeof publishValues.city === "string" ? publishValues.city : "";
    const title = typeof publishValues.title === "string" ? publishValues.title : "";
    router.push(localizedHref(locale, listingSeoPath({ id: state.listingId, title, city })));
  }, [
    state,
    storageKey,
    legacyDraftSessionKey,
    draftAdKey,
    router,
    toast,
    t,
    locale,
    isEditMode,
    publishValues.city,
    publishValues.title,
  ]);

  useEffect(() => {
    if (state?.ok === false && state.error === "server") {
      toast("error", t("serverPublishError"));
    }
  }, [state, toast, t]);

  useEffect(() => {
    if (state?.ok === false && state.error === "category") {
      setDismissServerCategoryError(false);
    }
  }, [state]);

  /** Imobiliare / joburi / servicii: fără „nou/folosit”; restul: new/used obligatoriu când e vizibil. */
  useEffect(() => {
    if (!needsCoreCondition) {
      setPublishValues((p) => ({ ...p, condition: "not_applicable" }));
    } else {
      setPublishValues((p) =>
        p.condition === "not_applicable" ? { ...p, condition: "used" } : p,
      );
    }
    setClientErrors((prev) => {
      if (!prev.condition) {
        return prev;
      }
      const next = { ...prev };
      delete next.condition;
      return next;
    });
  }, [needsCoreCondition]);

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
    for (const field of liveRequiredFields) {
      const e = liveValidateField(field, liveValues, msg, liveValidateOpts);
      if (e) {
        nextErrors[field] = e;
      }
    }
    setClientErrors((prev) => {
      const merged = { ...prev };
      delete merged.categoryId;
      for (const field of liveRequiredFields) {
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
    liveRequiredFields,
    needsCoreCondition,
    liveValidateOpts,
  ]);

  useEffect(() => {
    if (!isPremium) {
      return;
    }
    const onScroll = () => {
      const root = formRef.current;
      if (!root) {
        return;
      }
      const nodes = root.querySelectorAll<HTMLElement>("[data-publish-step]");
      const anchorY = window.innerHeight * 0.2;
      let best = 1;
      let bestScore = Number.POSITIVE_INFINITY;
      nodes.forEach((el) => {
        const step = Number(el.dataset.publishStep);
        if (!Number.isFinite(step)) {
          return;
        }
        const r = el.getBoundingClientRect();
        if (r.bottom < 96 || r.top > window.innerHeight - 40) {
          return;
        }
        const score = Math.abs(r.top - anchorY);
        if (score < bestScore) {
          bestScore = score;
          best = step;
        }
      });
      setActiveWizardStep(best);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isPremium]);

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
      "seats",
      "furnished",
      "building_type",
      "employment_type",
      "vaccinated",
      "property_type",
      "property_condition",
      "electronics_condition",
      "product_type",
      "floor",
      "total_floors",
      "color",
      "seats",
      "engine_l",
    ] as const;
    if ((groupKeys as readonly string[]).includes(field.id)) {
      const normalizedValue = field.id === "engine_l" ? value.replace(/\./g, "_") : value;
      return t(`${field.id}.${normalizedValue}` as never);
    }
    if (field.id === "generation" && value === "n_a") {
      return t("generationNA" as never);
    }
    if (field.id === "screen_inch") {
      return `${value}"`;
    }
    return value;
  }

  function setExtra(name: string, value: string) {
    setPublishValues((p) => ({ ...p, extra: { ...p.extra, [name]: value } }));
  }

  function dynamicExtraStorageKey(fieldId: ListingFieldId): string {
    if (fieldId === "fuel") return "d_fuel";
    if (fieldId === "transmission") return "d_transmission";
    if (fieldId === "engineCc") return "d_engine_cc";
    if (fieldId === "propertyType") return "d_property_type";
    if (fieldId === "floor") return "d_floor";
    if (fieldId === "furnished") return "d_furnished";
    if (fieldId === "condition") return "d_electronics_condition";
    if (fieldId === "sizeLabel") return "d_size_label";
    if (fieldId === "jobType") return "d_employment_type";
    if (fieldId === "experienceYears") return "d_experience_years";
    if (fieldId === "salary") return "d_salary_from";
    return `cfg_${fieldId}`;
  }

  function getDynamicFieldValue(fieldId: ListingFieldId): string {
    if (fieldId === "brand") {
      if (useServerCatalog) {
        return publishValues.catalogBrandId;
      }
      return publishValues.brand;
    }
    if (fieldId === "modelName") {
      if (useServerCatalog && modelManualOther) {
        return MODEL_CATALOG_OTHER;
      }
      return publishValues.modelName;
    }
    if (fieldId === "year") return publishValues.year;
    if (fieldId === "mileageKm") return publishValues.mileageKm;
    if (fieldId === "rooms") return publishValues.rooms;
    if (fieldId === "areaSqm") return publishValues.areaSqm;
    if (fieldId === "condition") return publishValues.condition;
    return publishValues.extra[dynamicExtraStorageKey(fieldId)] ?? "";
  }

  function setDynamicFieldValue(fieldId: ListingFieldId, value: string) {
    if (fieldId === "brand" && useServerCatalog) {
      setModelManualOther(false);
      const row = catalogBrands.find((b) => b.id === value);
      setPublishValues((prev) => ({
        ...prev,
        catalogBrandId: value,
        brand: row?.name ?? "",
        modelName: "",
      }));
      return;
    }
    if (fieldId === "brand" && !useServerCatalog) {
      setModelManualOther(false);
    }
    if (fieldId === "modelName" && useServerCatalog && value === MODEL_CATALOG_OTHER) {
      setModelManualOther(true);
      setPublishValues((prev) => ({ ...prev, modelName: "" }));
      return;
    }
    if (fieldId === "modelName" && useServerCatalog) {
      setModelManualOther(false);
    }
    setPublishValues((prev) => {
      if (fieldId === "brand") {
        return { ...prev, brand: value, catalogBrandId: "", modelName: "" };
      }
      if (fieldId === "modelName") {
        return { ...prev, modelName: value };
      }
      if (fieldId === "year") {
        return { ...prev, year: value };
      }
      if (fieldId === "mileageKm") {
        return { ...prev, mileageKm: value };
      }
      if (fieldId === "rooms") {
        return { ...prev, rooms: value };
      }
      if (fieldId === "areaSqm") {
        return { ...prev, areaSqm: value };
      }
      if (fieldId === "condition") {
        return { ...prev, extra: { ...prev.extra, [dynamicExtraStorageKey(fieldId)]: value } };
      }
      return { ...prev, extra: { ...prev.extra, [dynamicExtraStorageKey(fieldId)]: value } };
    });
  }

  function renderDynamicField(field: ListingFieldConfig) {
    const value = getDynamicFieldValue(field.id);
    const isBrandField = field.id === "brand";
    const isModelField = field.id === "modelName";
    const options = isBrandField
      ? dynamicBrandOptions
      : isModelField
        ? dynamicModelOptions
        : (field.options ?? []).map((option) => ({
            value: option,
            label: getLocalizedFieldOptionLabel(field.id, option, uiLocale),
          }));

    if (field.input === "select") {
      const showBrandLoading = isBrandField && Boolean(categoryId.trim()) && catalogBrandsStale;
      const showModelLoading =
        isModelField && useServerCatalog && Boolean(publishValues.catalogBrandId.trim()) && catalogModelsStale;
      const modelManual = isModelField && useServerCatalog && modelManualOther;
      const brandSelectDisabled = isBrandField && Boolean(categoryId.trim()) && catalogBrandsStale;
      const modelSelectDisabled =
        isModelField &&
        (useServerCatalog
          ? !publishValues.catalogBrandId.trim() || catalogModelsStale
          : !publishValues.brand.trim());
      return (
        <div className="space-y-2">
          {showBrandLoading ? (
            <p className="text-xs text-slate-500">{tW("catalogLoadingBrands")}</p>
          ) : null}
          {showModelLoading ? (
            <p className="text-xs text-slate-500">{tW("catalogLoadingModels")}</p>
          ) : null}
          <SearchableSelect
            id={`cfg-${field.id}`}
            value={value}
            onValueChangeAction={(nextValue) => setDynamicFieldValue(field.id, nextValue)}
            options={options}
            placeholder={t("detailOptional")}
            emptyLabel={t("detailOptional")}
            searchPlaceholder={t("searchableSearch")}
            noResultsLabel={t("searchableEmpty")}
            disabled={brandSelectDisabled || modelSelectDisabled}
          />
          {modelManual ? (
            <input
              type="text"
              id={`cfg-${field.id}-manual`}
              value={publishValues.modelName}
              onChange={(e) => setPublishValues((p) => ({ ...p, modelName: e.target.value }))}
              placeholder={tW("modelManualPlaceholder")}
              className={baseInputClass}
              maxLength={120}
              autoComplete="off"
            />
          ) : null}
        </div>
      );
    }

    return (
      <input
        id={`cfg-${field.id}`}
        type="number"
        inputMode="numeric"
        min={field.min}
        max={field.max}
        value={value}
        onChange={(e) => setDynamicFieldValue(field.id, e.target.value)}
        className={`${baseInputClass}`}
      />
    );
  }

  function handleSubmit() {
    devWarn("handleSubmit() START");
    setLiveValidateEnabled(true);
    const cid = categoryId.trim();
    const selectedPath = cid ? getPathLabelsForLeaf(categoryTree, cid) : "";
    devWarn("[publish] categoryId payload", {
      categoryId: cid,
      selectedPath,
      isLeaf: cid ? isLeafCategoryNode(categoryTree, cid) : false,
    });

    if (!cid) {
      devWarn("[publish] blocked: missing subcategory_id");
      setClientErrors({ categoryId: msg.errCategory });
      toast("error", msg.errCategory);
      queueMicrotask(() => {
        scrollAndFocusField("categoryId");
      });
      return;
    }
    if (!isLeafCategoryNode(categoryTree, cid)) {
      devWarn("[publish] blocked: selected category is not a leaf", { subcategory_id: cid });
      setClientErrors({ categoryId: tVal("errCategoryLeaf") });
      toast("error", tVal("errCategoryLeaf"));
      queueMicrotask(() => {
        scrollAndFocusField("categoryId");
      });
      return;
    }

    if (useServerCatalog) {
      const bn = publishValues.brand.trim();
      if (bn) {
        const okBrand = catalogBrands.some(
          (b) => b.id === publishValues.catalogBrandId && b.name === bn,
        );
        if (!okBrand) {
          toast("error", tW("catalogBrandInvalid"));
          return;
        }
      }
      const mn = publishValues.modelName.trim();
      if (mn) {
        const inList = catalogModels.some((m) => m.name === mn);
        if (!inList && (mn.length < 2 || mn.length > 120)) {
          toast("error", tW("catalogModelInvalid"));
          return;
        }
      }
      if (modelManualOther && !publishValues.modelName.trim()) {
        toast("error", tW("catalogModelManualEmpty"));
        return;
      }
    } else {
      if (!isBrandAllowedForCategory(selectedCategoryKey, publishValues.brand)) {
        toast("error", "Marca selectată nu aparține categoriei curente.");
        return;
      }
      if (
        !isModelAllowedForCategoryBrand(
          selectedCategoryKey,
          publishValues.brand,
          publishValues.modelName,
        )
      ) {
        toast("error", "Modelul selectat nu aparține mărcii curente.");
        return;
      }
    }

    const fraud = evaluateListingFraudRisk({
      title: publishValues.title,
      description: publishValues.description,
      price: Number(publishValues.price || 0),
      brand: publishValues.brand,
      modelName: publishValues.modelName,
      city: publishValues.city,
      phone: publishValues.phone,
    });
    if (fraud.level === "high") {
      toast("error", "Anunțul pare suspect (anti-fraudă). Revizuiește descrierea, prețul și contactul.");
      return;
    }
    if (fraud.level === "medium") {
      toast("error", "Atenție: anunțul are semnale de risc. Completează mai clar detaliile înainte de publicare.");
    }

    const payload = {
      subcategory_id: cid,
      category_id: cid,
      categorySlug: selectedSlug,
    };
    devWarn("Submitting payload:", payload);
    const fd = buildFormDataFromPublishValues(
      locale,
      cid,
      selectedSlug,
      imagesRaw,
      publishValues,
      detailFields,
      editListingId,
    );
    devWarn("Form data:", debugFormData(fd));
    devWarn("[publish] request body check", {
      title: fd.get("title"),
      price: fd.get("price"),
      category_id: fd.get("category_id"),
      images: fd.get("images"),
    });
    devWarn("[publish] formData.categoryId", fd.get("categoryId"));
    devWarn("[publish] formData.subcategory_id", fd.get("subcategory_id"));
    const v = validateListingFormClient(fd, msg);
    if (!v.ok) {
      devWarn("[publish] validation errors:", v.errors, "firstField:", v.firstField);
      const firstErrorText =
        v.errors[v.firstField] ??
        Object.values(v.errors).find((e): e is string => typeof e === "string") ??
        "Formular invalid.";
      setClientErrors(v.errors);
      toast("error", firstErrorText);
      queueMicrotask(() => {
        scrollAndFocusField(v.firstField);
      });
      return;
    }
    devWarn("[publish] validation passed");
    setClientErrors({});
    devWarn("[publish] request transport: serverAction:saveListing");
    startTransition(() => {
      formAction(fd);
      devWarn("[publish] request dispatched");
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

  function scrollToWizardStep(step: number) {
    formRef.current
      ?.querySelector<HTMLElement>(`[data-publish-step="${step}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const previewTags = useMemo(() => {
    const tags: string[] = [];
    const y = publishValues.year.trim();
    if (y) {
      tags.push(y);
    }
    const fuelF = detailFields.find((f) => f.id === "fuel");
    if (fuelF) {
      const v = publishValues.extra[getDetailFormName(fuelF)] ?? "";
      if (v) {
        tags.push(selectOptionLabel(fuelF, v));
      }
    }
    const trF = detailFields.find((f) => f.id === "transmission");
    if (trF) {
      const v = publishValues.extra[getDetailFormName(trF)] ?? "";
      if (v) {
        tags.push(selectOptionLabel(trF, v));
      }
    }
    return tags.slice(0, 5);
  }, [detailFields, publishValues.extra, publishValues.year]); // eslint-disable-line react-hooks/exhaustive-deps -- selectOptionLabel

  const previewImageSrc = useMemo(() => parseImageLines(imagesRaw)[0] ?? null, [imagesRaw]);

  const showCompetitivePriceBadge = useMemo(() => {
    if (!isPremium) {
      return false;
    }
    const raw = publishValues.price.trim();
    if (!raw || clientErrors.price) {
      return false;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 1) {
      return false;
    }
    const eur = publishValues.priceCurrency === "EUR";
    const min = eur ? 400 : 8000;
    const max = eur ? 120_000 : 2_200_000;
    return n >= min && n <= max;
  }, [isPremium, publishValues.price, publishValues.priceCurrency, clientErrors.price]);

  const wizardStepsDef = useMemo(
    () => [
      { step: 1, icon: FileText, title: tW("step1Title"), description: tW("step1Desc") },
      { step: 2, icon: Car, title: tW("step2Title"), description: tW("step2Desc") },
      { step: 3, icon: Phone, title: tW("step3Title"), description: tW("step3Desc") },
      { step: 4, icon: ImageIcon, title: tW("step4Title"), description: tW("step4Desc") },
      { step: 5, icon: Rocket, title: tW("step5Title"), description: tW("step5Desc") },
    ],
    [tW],
  );

  const wizardBenefits = useMemo(
    () => [
      { icon: Megaphone, title: tW("benefitFreeTitle"), body: tW("benefitFreeBody") },
      { icon: Sparkles, title: tW("benefitTopTitle"), body: tW("benefitTopBody") },
      { icon: MessageCircle, title: tW("benefitMsgTitle"), body: tW("benefitMsgBody") },
      { icon: ShieldCheck, title: tW("benefitSecTitle"), body: tW("benefitSecBody") },
    ],
    [tW],
  );

  function handlePremiumPrimaryAction() {
    if (activeWizardStep < 5) {
      scrollToWizardStep(activeWizardStep + 1);
      return;
    }
    handleSubmit();
  }

  function handleSaveDraftClick() {
    flushDraftToStorage();
    toast("success", tW("draftSaved"));
  }

  const livePreviewProps = {
    imageSrc: previewImageSrc,
    title: publishValues.title,
    priceLine: publishValues.price.trim()
      ? `${new Intl.NumberFormat(uiLocale, { maximumFractionDigits: 0 }).format(Number(publishValues.price))} ${publishValues.priceCurrency === "EUR" ? "€" : "MDL"}`
      : "—",
    tags: previewTags,
    locationLine: publishValues.city.trim()
      ? `${publishValues.city}${publishValues.district.trim() ? `, ${publishValues.district.trim()}` : ""}`
      : tW("previewNoLocation"),
    timeLabel: tW("previewJustNow"),
    infoText: tW("previewInfo"),
    previewLabel: tW("previewLabel"),
    negotiableLabel: tW("negotiablePreview"),
    negotiable: publishValues.negotiable,
  };

  const hasSpecsStep =
    hasDynamicCategoryConfig || isVeh || isRe || isBrandish || detailFields.length > 0;

  const standardFormClass =
    "mx-auto w-full max-w-3xl space-y-6 rounded-2xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-sm [color-scheme:light] md:space-y-8 md:p-8";
  const premiumFormClass = "w-full max-w-none space-y-0 bg-transparent p-0 text-slate-900 shadow-none [color-scheme:light]";

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className={isPremium ? premiumFormClass : standardFormClass}
    >
      {isPremium ? (
        <div className="rounded-2xl border border-slate-200/80 bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
          <PublishWizardGrid
            sidebar={
              <PublishWizardSidebar
                steps={wizardStepsDef}
                activeStep={activeWizardStep}
                onStepClickAction={scrollToWizardStep}
                benefitsTitle={tW("benefitsTitle")}
                benefits={wizardBenefits}
              />
            }
            preview={<PublishLivePreviewPanel {...livePreviewProps} />}
            main={
              <div className="flex flex-col gap-6">
                <PublishMobileBenefits title={tW("benefitsTitle")} benefits={wizardBenefits} />
                <PublishFormSectionCard
                  dataStep={1}
                  title={tW("cardMainTitle")}
                  subtitle={tW("cardMainSubtitle")}
                >
                  <div
                    id="field-categoryId"
                    data-error={categoryFieldError ? "true" : undefined}
                    className={`space-y-3 ${categoryFieldError ? "input-error" : ""}`}
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">{t("formSectionCategory")}</h3>
                    </div>
                    <div
                      className={`rounded-xl border border-slate-200 bg-slate-50/80 p-4 ${
                        categoryFieldError ? "ring-2 ring-red-500/35" : ""
                      }`}
                    >
                      <CategorySelector
                        tree={categoryTree}
                        value={categoryId}
                        onCategoryIdAction={(id) => {
                          const nextId = id.trim();
                          const prevId = categoryId.trim();
                          const nextSelected = nextId ? findCategoryNodeById(categoryTree, nextId) : null;
                          devLog("Category selected:", nextSelected, "id:", nextId);
                          setCategoryId(nextId);
                          if (nextId !== prevId) {
                            setModelManualOther(false);
                            setPublishValues((p) => ({
                              ...p,
                              extra: {},
                              brand: "",
                              catalogBrandId: "",
                              modelName: "",
                              year: "",
                              mileageKm: "",
                              rooms: "",
                              areaSqm: "",
                            }));
                          }
                          setDismissServerCategoryError(true);
                          const nextCategoryError =
                            !nextId
                              ? msg.errCategory
                              : isLeafCategoryNode(categoryTree, nextId)
                                ? undefined
                                : tVal("errCategoryLeaf");
                          if (nextCategoryError) {
                            setClientErrors((prev) => ({ ...prev, categoryId: nextCategoryError }));
                          } else {
                            clearFieldError("categoryId");
                          }
                        }}
                        error={categoryFieldError}
                      />
                    </div>
                  </div>

                  <div id="field-title" className="space-y-1.5">
                    <div className="flex items-end justify-between gap-2">
                      <label className={labelClass} htmlFor="title">
                        {t("title")}
                      </label>
                      <span className="text-xs tabular-nums text-slate-400">
                        {publishValues.title.length}/{PUBLISH_WIZARD_TITLE_MAX}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#16a34a]">{tW("titleHint")}</p>
                    <input
                      id="title"
                      name="title"
                      data-error={clientErrors.title ? "true" : undefined}
                      maxLength={PUBLISH_WIZARD_TITLE_MAX}
                      value={publishValues.title}
                      onChange={(e) => {
                        setPublishValues((p) => ({ ...p, title: e.target.value }));
                      }}
                      aria-invalid={Boolean(clientErrors.title)}
                      className={`${premiumInputClass} ${compositeFieldOutline("title")}`}
                    />
                    <p className="text-xs text-slate-500">{tW("titleHelper")}</p>
                    {clientErrors.title ? <p className="text-sm text-red-600">{clientErrors.title}</p> : null}
                  </div>

                  <div id="field-description" className="space-y-1.5">
                    <div className="flex items-end justify-between gap-2">
                      <label className={labelClass} htmlFor="description">
                        {t("description")}
                      </label>
                      <span className="text-xs tabular-nums text-slate-400">
                        {publishValues.description.length}/{PUBLISH_WIZARD_DESC_MAX}
                      </span>
                    </div>
                    <textarea
                      id="description"
                      name="description"
                      data-error={clientErrors.description ? "true" : undefined}
                      rows={6}
                      maxLength={PUBLISH_WIZARD_DESC_MAX}
                      value={publishValues.description}
                      onChange={(e) => {
                        setPublishValues((p) => ({ ...p, description: e.target.value }));
                      }}
                      aria-invalid={Boolean(clientErrors.description)}
                      className={`${premiumInputClass} ${compositeFieldOutline("description")}`}
                    />
                    <p className="text-xs text-slate-500">{tW("descriptionHelper")}</p>
                    {clientErrors.description ? (
                      <p className="text-sm text-red-600">{clientErrors.description}</p>
                    ) : null}
                  </div>

                  <div className="space-y-3" id="field-price">
                    <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
                      <div className="space-y-1.5">
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
                          className={`${premiumInputClass} ${compositeFieldOutline("price")}`}
                        />
                        {clientErrors.price ? <p className="text-sm text-red-600">{clientErrors.price}</p> : null}
                        {showCompetitivePriceBadge ? (
                          <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-[#16a34a] ring-1 ring-[#16a34a]/25">
                            {tW("priceCompetitive")}
                          </span>
                        ) : null}
                      </div>
                      <div className="space-y-1.5">
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
                          className={premiumInputClass}
                        >
                          <option value="MDL">{t("priceCurrencyMdl")}</option>
                          <option value="EUR">{t("priceCurrencyEur")}</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">{tW("priceHelper")}</p>
                    <label className={labelClassInline}>
                      <input
                        name="negotiable"
                        type="checkbox"
                        checked={publishValues.negotiable}
                        onChange={(e) => setPublishValues((p) => ({ ...p, negotiable: e.target.checked }))}
                        className="rounded border-slate-400 text-[#16a34a] focus:ring-[#16a34a]/30"
                      />
                      {t("negotiable")}
                    </label>
                  </div>

                  {needsCoreCondition ? (
                    <div id="field-condition" className="space-y-1.5">
                      <label className={labelClass} htmlFor="condition">
                        {t("condition")}
                      </label>
                      <select
                        id="condition"
                        name="condition"
                        data-error={clientErrors.condition ? "true" : undefined}
                        value={["new", "used"].includes(publishValues.condition) ? publishValues.condition : "used"}
                        onChange={(e) => {
                          setPublishValues((p) => ({ ...p, condition: e.target.value }));
                          clearFieldError("condition");
                        }}
                        aria-invalid={Boolean(clientErrors.condition)}
                        className={`${premiumInputClass} ${compositeFieldOutline("condition")}`}
                      >
                        <option value="new">{t("conditionNew")}</option>
                        <option value="used">{t("conditionUsed")}</option>
                      </select>
                      {clientErrors.condition ? (
                        <p className="text-sm text-red-600">{clientErrors.condition}</p>
                      ) : null}
                    </div>
                  ) : null}
                </PublishFormSectionCard>

                <PublishFormSectionCard
                  dataStep={2}
                  title={tW("cardSpecsTitle")}
                  subtitle={tW("cardSpecsSubtitle")}
                >
                  {hasSpecsStep ? (
                    <>
                      {selectedCategoryDynamicConfig ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {selectedCategoryFields.map((field) => (
                            <div key={field.id}>
                              <label className={labelClass} htmlFor={`cfg-${field.id}`}>
                                {getLocalizedFieldLabel(field.id, uiLocale)}
                              </label>
                              {renderDynamicField(field)}
                            </div>
                          ))}
                        </div>
                      ) : null}
                      {!selectedCategoryDynamicConfig ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {detailFields.map((field) => {
                            const fname = getDetailFormName(field);
                            const val = publishValues.extra[fname] ?? "";
                            const searchOpts =
                              field.selectValues?.map((v) => ({
                                value: v,
                                label: selectOptionLabel(field, v),
                              })) ?? [];
                            return (
                              <div key={field.id}>
                                <label className={labelClass} htmlFor={fname}>
                                  {detailLabel(field)}
                                </label>
                                {field.input === "select" && field.selectValues && field.searchable ? (
                                  <SearchableSelect
                                    id={fname}
                                    value={val}
                                    onValueChangeAction={(v) => setExtra(fname, v)}
                                    options={searchOpts}
                                    placeholder={t("detailOptional")}
                                    emptyLabel={t("detailOptional")}
                                    searchPlaceholder={t("searchableSearch")}
                                    noResultsLabel={t("searchableEmpty")}
                                  />
                                ) : null}
                                {field.input === "select" && field.selectValues && !field.searchable ? (
                                  <select
                                    id={fname}
                                    name={fname}
                                    value={val}
                                    onChange={(e) => setExtra(fname, e.target.value)}
                                    className={premiumInputClass}
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
                                    className={premiumInputClass}
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
                                    className={premiumInputClass}
                                  />
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">{tW("specsEmpty")}</p>
                  )}
                </PublishFormSectionCard>

                <PublishFormSectionCard
                  dataStep={3}
                  title={tW("cardContactTitle")}
                  subtitle={tW("cardContactSubtitle")}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div id="field-city" data-error={clientErrors.city ? "true" : undefined} className="space-y-1.5">
                      <label className={labelClass} htmlFor="city">
                        {t("city")}
                      </label>
                      <SearchableSelect
                        id="city"
                        value={publishValues.city}
                        onValueChangeAction={(v) => {
                          setPublishValues((p) => ({ ...p, city: v }));
                          clearFieldError("city");
                        }}
                        options={citySelectOptions}
                        placeholder={t("citySelectPlaceholder")}
                        searchPlaceholder={t("citySearchPlaceholder")}
                        emptyLabel={t("cityEmptyOption")}
                        noResultsLabel={t("cityNoResults")}
                        invalid={Boolean(clientErrors.city)}
                        aria-label={t("city")}
                      />
                      {clientErrors.city ? <p className="text-sm text-red-600">{clientErrors.city}</p> : null}
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass} htmlFor="district">
                        {t("district")}
                      </label>
                      <input
                        id="district"
                        name="district"
                        maxLength={80}
                        value={publishValues.district}
                        onChange={(e) => setPublishValues((p) => ({ ...p, district: e.target.value }))}
                        className={premiumInputClass}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass} htmlFor="phone">
                      {t("phone")}
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      maxLength={30}
                      value={publishValues.phone}
                      onChange={(e) => setPublishValues((p) => ({ ...p, phone: e.target.value }))}
                      className={premiumInputClass}
                    />
                  </div>
                </PublishFormSectionCard>

                <PublishFormSectionCard dataStep={4} title={tW("cardMediaTitle")} subtitle={tW("cardMediaSubtitle")}>
                  <div id="field-imagesRaw" className="space-y-1.5">
                    <label className={labelClass} htmlFor="imagesRaw">
                      {t("images")}
                    </label>
                    <p className="text-xs text-slate-500">{t("imagesHint")}</p>
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
                      className={`mt-1 w-full min-h-[52px] rounded-xl border border-slate-200 bg-white px-3 py-3 font-mono text-xs leading-normal text-slate-900 caret-slate-900 placeholder:text-slate-400 [color-scheme:light] focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 md:min-h-[44px] md:py-2.5 ${compositeFieldOutline("imagesRaw")}`}
                      placeholder="https://..."
                    />
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50">
                        {t("upload")}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          multiple
                          className="hidden"
                          onChange={(e) => void onPickImages(e.target.files)}
                        />
                      </label>
                      <span className="text-xs text-slate-500">
                        {t("imageCount", { count: parseImageLines(imagesRaw).length, max: LISTING_MAX_IMAGES })}
                      </span>
                    </div>
                    {uploadError ? <p className="text-sm text-red-600">{uploadError}</p> : null}
                    {clientErrors.imagesRaw ? (
                      <p className="text-sm text-red-600">{clientErrors.imagesRaw}</p>
                    ) : null}
                  </div>
                </PublishFormSectionCard>

                <PublishFormSectionCard
                  dataStep={5}
                  title={tW("cardPublishTitle")}
                  subtitle={tW("cardPublishSubtitle")}
                >
                  {serverMsg ? <p className="text-sm font-medium text-red-600">{serverMsg}</p> : null}
                  <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-end">
                    <button
                      type="button"
                      onClick={handleSaveDraftClick}
                      className="order-2 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 sm:order-1 sm:w-auto"
                    >
                      {tW("saveDraft")}
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={handlePremiumPrimaryAction}
                      className="order-1 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#16a34a] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-60 sm:order-2 sm:min-w-[200px]"
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
                      ) : activeWizardStep < 5 ? (
                        tW("continue")
                      ) : (
                        t("submit")
                      )}
                    </button>
                  </div>
                </PublishFormSectionCard>

                <div className="mt-2 md:hidden">
                  <PublishLivePreviewPanel {...livePreviewProps} />
                </div>
              </div>
            }
          />
        </div>
      ) : null}

      {!isPremium ? (
        <>
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
              const prevId = categoryId.trim();
              const nextSelected = nextId ? findCategoryNodeById(categoryTree, nextId) : null;
              devLog("Category selected:", nextSelected, "id:", nextId);
              setCategoryId(nextId);
              if (nextId !== prevId) {
                setModelManualOther(false);
                setPublishValues((p) => ({
                  ...p,
                  extra: {},
                  brand: "",
                  catalogBrandId: "",
                  modelName: "",
                  year: "",
                  mileageKm: "",
                  rooms: "",
                  areaSqm: "",
                }));
              }
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
          <div id="field-city" data-error={clientErrors.city ? "true" : undefined}>
            <label className={labelClass} htmlFor="city">
              {t("city")}
            </label>
            <SearchableSelect
              id="city"
              value={publishValues.city}
              onValueChangeAction={(v) => {
                setPublishValues((p) => ({ ...p, city: v }));
                clearFieldError("city");
              }}
              options={citySelectOptions}
              placeholder={t("citySelectPlaceholder")}
              searchPlaceholder={t("citySearchPlaceholder")}
              emptyLabel={t("cityEmptyOption")}
              noResultsLabel={t("cityNoResults")}
              invalid={Boolean(clientErrors.city)}
              aria-label={t("city")}
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

        {needsCoreCondition ? (
          <div id="field-condition">
            <label className={labelClass} htmlFor="condition">
              {t("condition")}
            </label>
            <select
              id="condition"
              name="condition"
              data-error={clientErrors.condition ? "true" : undefined}
              value={["new", "used"].includes(publishValues.condition) ? publishValues.condition : "used"}
              onChange={(e) => {
                setPublishValues((p) => ({ ...p, condition: e.target.value }));
                clearFieldError("condition");
              }}
              aria-invalid={Boolean(clientErrors.condition)}
              className={`${baseInputClass} ${ring("condition")}`}
            >
              <option value="new">{t("conditionNew")}</option>
              <option value="used">{t("conditionUsed")}</option>
            </select>
            {clientErrors.condition ? (
              <p className="mt-1 text-sm text-red-600">{clientErrors.condition}</p>
            ) : null}
          </div>
        ) : null}
      </section>

      {hasDynamicCategoryConfig || isVeh || isRe || isBrandish || detailFields.length > 0 ? (
        <section className="space-y-6 border-t border-zinc-200 pt-6 text-zinc-900 md:pt-8">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">{t("formSectionSpecs")}</h2>
          </div>

          {selectedCategoryDynamicConfig ? (
            <div className="grid gap-5 md:grid-cols-2">
              {selectedCategoryFields.map((field) => (
                <div key={field.id}>
                  <label className={labelClass} htmlFor={`cfg-${field.id}`}>
                    {getLocalizedFieldLabel(field.id, uiLocale)}
                  </label>
                  {renderDynamicField(field)}
                </div>
              ))}
            </div>
          ) : null}

          {!selectedCategoryDynamicConfig ? (
            <div className="grid gap-5 md:grid-cols-2">
              {detailFields.map((field) => {
              const fname = getDetailFormName(field);
              const val = publishValues.extra[fname] ?? "";
              const searchOpts =
                field.selectValues?.map((v) => ({
                  value: v,
                  label: selectOptionLabel(field, v),
                })) ?? [];
                return (
                  <div key={field.id}>
                    <label className={labelClass} htmlFor={fname}>
                      {detailLabel(field)}
                    </label>
                    {field.input === "select" && field.selectValues && field.searchable ? (
                      <SearchableSelect
                        id={fname}
                        value={val}
                        onValueChangeAction={(v) => setExtra(fname, v)}
                        options={searchOpts}
                        placeholder={t("detailOptional")}
                        emptyLabel={t("detailOptional")}
                        searchPlaceholder={t("searchableSearch")}
                        noResultsLabel={t("searchableEmpty")}
                      />
                    ) : null}
                    {field.input === "select" && field.selectValues && !field.searchable ? (
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
          ) : null}
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
        className="inline-flex min-h-[52px] w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-base font-semibold text-white shadow-sm transition active:bg-emerald-700 disabled:opacity-60 lg:hover:bg-emerald-700"
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
            {isEditMode ? t("submittingUpdate") : t("submitting")}
          </>
        ) : isEditMode ? (
          t("submitUpdate")
        ) : (
          t("submit")
        )}
      </button>
        </>
      ) : null}
    </form>
  );
}
