"use client";

import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Clock,
  Copy,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Shield,
  Smartphone,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { updateProfile, type UpdateProfileState } from "@/app/actions/profile";
import { useToast } from "@/components/ui/SimpleToast";
import { resolvePublicMediaUrl } from "@/lib/media-url";
import {
  computeSellerProfileCompletionScore,
  defaultSellerContactPrefs,
  type SellerContactPrefs,
  type SellerContactWindow,
} from "@/lib/seller-contact-preferences";
const R = "rounded-2xl";
const GREEN = "#16a34a";

const BUYER_NOTE_MAX = 320;

function inputShell(focused: boolean): string {
  return [
    "relative flex min-h-[52px] w-full items-center",
    R,
    "border bg-white transition duration-200",
    focused
      ? "border-[#16a34a] shadow-[0_0_0_3px_rgba(22,163,74,0.22)]"
      : "border-slate-200/90 shadow-[inset_0_1px_0_rgb(255_255_255/0.65)]",
  ].join(" ");
}

const HOUR_OPTS = (() => {
  const out: string[] = [];
  for (let h = 6; h <= 23; h++) {
    for (const m of [0, 30]) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      out.push(`${hh}:${mm}`);
    }
  }
  return out;
})();

export type SellerDetailsUser = {
  email: string;
  name: string | null;
  phone: string | null;
  city: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  listingsCount: number;
};

type Props = {
  locale: string;
  user: SellerDetailsUser;
  sellerContact: SellerContactPrefs;
  publicProfileUrl: string;
};

export function SellerDetailsView({ locale, user, sellerContact: initialSeller, publicProfileUrl }: Props) {
  const t = useTranslations("AccountSettings.seller");
  const tShell = useTranslations("AccountSettings.shell");
  const tAcc = useTranslations("Account");
  const { toast } = useToast();
  const router = useRouter();
  const [state, action, pending] = useActionState(updateProfile, undefined as UpdateProfileState | undefined);
  const [isRefreshing, startRefresh] = useTransition();

  const [nameValue, setNameValue] = useState(user.name ?? "");
  const [phoneValue, setPhoneValue] = useState(user.phone ?? "");
  const [cityValue, setCityValue] = useState(user.city ?? "");
  const [bioValue, setBioValue] = useState(user.bio ?? "");
  const [avatarUrlValue, setAvatarUrlValue] = useState(user.avatarUrl ?? "");
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl ?? "");
  const [seller, setSeller] = useState<SellerContactPrefs>(initialSeller ?? defaultSellerContactPrefs());
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!state?.ok) return;
    startRefresh(() => {
      router.refresh();
    });
  }, [router, startRefresh, state?.ok]);

  const isBusy = pending || isRefreshing;
  const saveLabel = useMemo(() => (isBusy ? tAcc("profileSaving") : tAcc("profileSave")), [isBusy, tAcc]);

  const avatarResolved = useMemo(() => resolvePublicMediaUrl(avatarPreview || null), [avatarPreview]);

  const completion = useMemo(
    () =>
      computeSellerProfileCompletionScore({
        name: nameValue,
        phone: phoneValue,
        city: cityValue,
        bio: bioValue,
        avatarUrl: avatarUrlValue,
        seller,
      }),
    [nameValue, phoneValue, cityValue, bioValue, avatarUrlValue, seller],
  );

  const phoneVerified = Boolean(phoneValue.trim().length >= 8);
  const progressPct = Math.min(100, Math.round((completion.score / Math.max(completion.max, 1)) * 100));
  const daysSinceActive =
    (Date.now() - new Date(user.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
  const showActiveBadge = daysSinceActive <= 14;

  function setWindow(w: SellerContactWindow) {
    setSeller((p) => ({ ...p, contactWindow: w }));
  }

  function toggleChannel<K extends keyof SellerContactPrefs["channels"]>(key: K) {
    setSeller((p) => ({
      ...p,
      channels: { ...p.channels, [key]: !p.channels[key] },
    }));
  }

  return (
    <div className="space-y-6 text-slate-900 motion-safe:animate-account-section" data-seller-details-root>
      <form action={action} encType="multipart/form-data" className="min-w-0 space-y-6">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="channelPhone" value={seller.channels.phone ? "1" : "0"} />
          <input type="hidden" name="channelSite" value={seller.channels.siteMessages ? "1" : "0"} />
          <input type="hidden" name="channelWhatsapp" value={seller.channels.whatsapp ? "1" : "0"} />
          <input type="hidden" name="channelViber" value={seller.channels.viber ? "1" : "0"} />
          <input type="hidden" name="channelTelegram" value={seller.channels.telegram ? "1" : "0"} />

          <section
            className={`space-y-3 border border-slate-200/90 bg-white p-5 shadow-[0_2px_20px_-8px_rgb(15_23_42/0.08)] transition hover:shadow-[0_8px_28px_-10px_rgb(15_23_42/0.1)] sm:p-6 ${R}`}
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-base font-semibold tracking-tight text-slate-900">{tShell("profileProgressTitle")}</h3>
                <p className="text-sm text-slate-500">{tShell("profileProgressHint")}</p>
              </div>
              <p className="text-lg font-bold tabular-nums text-[#16a34a]">{tShell("profileProgressPct", { pct: progressPct })}</p>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#16a34a] to-emerald-400 transition-[width] duration-700 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </section>

          <section
            className={`space-y-4 border border-slate-200/90 bg-white p-5 shadow-[0_2px_20px_-8px_rgb(15_23_42/0.08)] transition hover:shadow-[0_8px_28px_-10px_rgb(15_23_42/0.1)] sm:p-6 ${R}`}
          >
            <h3 className="text-base font-semibold text-slate-900">{tShell("publicProfileTitle")}</h3>
            <div className="grid gap-4 lg:grid-cols-[1fr_200px]">
              <div className="flex min-w-0 flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">{tShell("publicProfileLink")}</label>
                <div className="flex min-w-0 gap-2">
                  <input
                    readOnly
                    value={publicProfileUrl}
                    className={`min-w-0 flex-1 truncate border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none ${R}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(publicProfileUrl).then(() => {
                        toast("success", tShell("copySuccess"));
                      });
                    }}
                    className={`inline-flex shrink-0 items-center gap-2 border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:scale-[1.02] hover:border-[#16a34a]/40 hover:text-[#16a34a] active:scale-[0.98] ${R}`}
                  >
                    <Copy className="h-4 w-4" aria-hidden />
                    {tShell("copyAction")}
                  </button>
                </div>
              </div>
              <div className={`flex flex-col gap-2 border border-slate-100 bg-slate-50/80 p-4 ${R}`}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{tShell("previewLabel")}</p>
                <div className="flex items-center gap-3">
                  {avatarResolved ? (
                    <Image src={avatarResolved} alt="" width={44} height={44} className="h-11 w-11 rounded-xl object-cover ring-1 ring-slate-200/80" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-semibold text-slate-500 ring-1 ring-slate-200">
                      {(nameValue || user.email).slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{nameValue.trim() || t("fallbackName")}</p>
                    <p className="truncate text-xs text-slate-500">{cityValue.trim() || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className={`space-y-3 border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/90 p-4 shadow-sm sm:p-5 ${R}`}
          >
            <div className="flex flex-wrap gap-2">
              {showActiveBadge ? (
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                  {tShell("badgeActive")}
                </span>
              ) : null}
              <span className="inline-flex items-center rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900">
                {tShell("badgeQuick")}
              </span>
              {user.isVerified || phoneVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm">
                  <BadgeCheck className="h-3.5 w-3.5 text-[#16a34a]" aria-hidden />
                  {tShell("badgeTrusted")}
                </span>
              ) : null}
            </div>
            <p className="text-sm leading-relaxed text-slate-600">{tShell("trustInspire")}</p>
          </section>

          <section className={`space-y-5 border border-slate-200/90 bg-white p-5 shadow-[0_2px_20px_-8px_rgb(15_23_42/0.08)] transition hover:shadow-[0_8px_28px_-10px_rgb(15_23_42/0.1)] sm:p-6 ${R}`}>
            <div>
              <h3 className="text-base font-semibold tracking-tight text-slate-900">{tShell("basicInfoTitle")}</h3>
              <p className="mt-1 text-sm text-slate-500">{tShell("basicInfoLead")}</p>
            </div>

            <div className={inputShell(focusedField === "name")}>
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-slate-400" aria-hidden />
              <div className="min-w-0 flex-1 py-3 pl-10 pr-3">
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500" htmlFor="sd-name">
                  {t("fieldName")}
                </label>
                <input
                  id="sd-name"
                  name="name"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  maxLength={80}
                  className="mt-0.5 w-full border-0 bg-transparent p-0 text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  autoComplete="name"
                />
              </div>
            </div>

            <div className={inputShell(focusedField === "phone")}>
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-slate-400" aria-hidden />
              <div className="min-w-0 flex-1 py-3 pl-10 pr-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500" htmlFor="sd-phone">
                    {t("fieldPhone")}
                  </label>
                  {phoneVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#16a34a] ring-1 ring-[#16a34a]/25">
                      <BadgeCheck className="h-3 w-3" aria-hidden />
                      {t("phoneVerified")}
                    </span>
                  ) : null}
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-lg leading-none" aria-hidden>
                    🇲🇩
                  </span>
                  <input
                    id="sd-phone"
                    name="phone"
                    value={phoneValue}
                    onChange={(e) => setPhoneValue(e.target.value)}
                    onFocus={() => setFocusedField("phone")}
                    onBlur={() => setFocusedField(null)}
                    maxLength={32}
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    autoComplete="tel"
                  />
                </div>
              </div>
            </div>

            <div className={inputShell(focusedField === "email")}>
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-slate-400" aria-hidden />
              <div className="min-w-0 flex-1 py-3 pl-10 pr-3">
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500" htmlFor="sd-email">
                  {t("fieldEmail")}
                </label>
                <input
                  id="sd-email"
                  readOnly
                  value={user.email}
                  className="mt-0.5 w-full cursor-default border-0 bg-transparent p-0 text-[15px] font-medium text-slate-700 outline-none"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className={inputShell(focusedField === "city")}>
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-slate-400" aria-hidden />
                <div className="min-w-0 flex-1 py-3 pl-10 pr-3">
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500" htmlFor="sd-city">
                    {t("fieldCity")}
                  </label>
                  <input
                    id="sd-city"
                    name="city"
                    value={cityValue}
                    onChange={(e) => setCityValue(e.target.value)}
                    onFocus={() => setFocusedField("city")}
                    onBlur={() => setFocusedField(null)}
                    maxLength={80}
                    className="mt-0.5 w-full border-0 bg-transparent p-0 text-[15px] font-medium text-slate-900 outline-none"
                    autoComplete="address-level2"
                  />
                </div>
              </div>
              <div className={inputShell(focusedField === "district")}>
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-[1.125rem] w-[1.125rem] -translate-y-1/2 text-slate-400 opacity-60" aria-hidden />
                <div className="min-w-0 flex-1 py-3 pl-10 pr-3">
                  <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500" htmlFor="sd-district">
                    {t("fieldDistrict")}
                  </label>
                  <input
                    id="sd-district"
                    name="district"
                    value={seller.district}
                    onChange={(e) => setSeller((p) => ({ ...p, district: e.target.value.slice(0, 80) }))}
                    onFocus={() => setFocusedField("district")}
                    onBlur={() => setFocusedField(null)}
                    maxLength={80}
                    className="mt-0.5 w-full border-0 bg-transparent p-0 text-[15px] font-medium text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className={inputShell(focusedField === "bio")}>
              <FileText className="pointer-events-none absolute left-3.5 top-5 h-[1.125rem] w-[1.125rem] text-slate-400" aria-hidden />
              <div className="min-w-0 flex-1 py-3 pl-10 pr-3">
                <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500" htmlFor="sd-bio">
                  {tAcc("profileBio")}
                </label>
                <textarea
                  id="sd-bio"
                  name="bio"
                  value={bioValue}
                  onChange={(e) => setBioValue(e.target.value.slice(0, 500))}
                  onFocus={() => setFocusedField("bio")}
                  onBlur={() => setFocusedField(null)}
                  rows={3}
                  maxLength={500}
                  className="mt-1 w-full resize-y border-0 bg-transparent p-0 text-[15px] leading-relaxed text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <p className="flex items-start gap-2 rounded-[12px] border border-slate-200/80 bg-slate-50/90 px-3 py-2.5 text-xs leading-relaxed text-slate-600">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#16a34a]" aria-hidden />
              {t("trustEncryption")}
            </p>
          </section>

          <section className={`space-y-4 border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 ${R}`}>
            <h3 className="text-base font-semibold text-slate-900">{t("prefsTitle")}</h3>
            <p className="text-sm text-slate-500">{t("prefsLead")}</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["phone", t("chipPhone"), Phone, seller.channels.phone],
                  ["site", t("chipSite"), MessageCircle, seller.channels.siteMessages],
                  ["whatsapp", t("chipWhatsapp"), Smartphone, seller.channels.whatsapp],
                  ["viber", t("chipViber"), MessageCircle, seller.channels.viber],
                  ["telegram", t("chipTelegram"), MessageCircle, seller.channels.telegram],
                ] as const
              ).map(([key, label, Icon, on]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    toggleChannel(
                      key === "phone"
                        ? "phone"
                        : key === "site"
                          ? "siteMessages"
                          : key === "whatsapp"
                            ? "whatsapp"
                            : key === "viber"
                              ? "viber"
                              : "telegram",
                    )
                  }
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition duration-200 will-change-transform hover:scale-[1.02] active:scale-[0.98] ${
                    on
                      ? "border-[#16a34a]/40 bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-[#16a34a]/20"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${on ? "text-[#16a34a]" : "text-slate-400"}`} aria-hidden />
                  {label}
                </button>
              ))}
            </div>
          </section>

          <section className={`space-y-4 border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 ${R}`}>
            <h3 className="text-base font-semibold text-slate-900">{t("windowTitle")}</h3>
            <div className="space-y-3">
              {(
                [
                  ["anytime", t("windowAnytime")] as const,
                  ["hours", t("windowHours")] as const,
                  ["no_calls", t("windowNoCalls")] as const,
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-center gap-3 rounded-[12px] border px-4 py-3 transition duration-200 hover:border-slate-300 ${
                    seller.contactWindow === value
                      ? "border-[#16a34a]/45 bg-emerald-50/60 ring-1 ring-[#16a34a]/20"
                      : "border-slate-200 bg-slate-50/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="contactWindow"
                    value={value}
                    checked={seller.contactWindow === value}
                    onChange={() => setWindow(value)}
                    className="h-4 w-4 border-slate-300 text-[#16a34a] focus:ring-[#16a34a]/30"
                  />
                  <span className="text-sm font-medium text-slate-800">{label}</span>
                </label>
              ))}
            </div>

            {seller.contactWindow === "hours" ? (
              <div className={`flex flex-wrap items-end gap-3 border border-slate-200/90 bg-slate-50/80 p-4 ${R}`}>
                <Clock className="h-5 w-5 text-slate-400" aria-hidden />
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-500" htmlFor="sd-from">
                      {t("windowFrom")}
                    </label>
                    <select
                      id="sd-from"
                      name="contactHourFrom"
                      value={seller.contactHourFrom}
                      onChange={(e) => setSeller((p) => ({ ...p, contactHourFrom: e.target.value }))}
                      className={`mt-1 w-full ${R} border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-[#16a34a] focus:ring-[3px] focus:ring-[#16a34a]/22`}
                    >
                      {HOUR_OPTS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500" htmlFor="sd-to">
                      {t("windowTo")}
                    </label>
                    <select
                      id="sd-to"
                      name="contactHourTo"
                      value={seller.contactHourTo}
                      onChange={(e) => setSeller((p) => ({ ...p, contactHourTo: e.target.value }))}
                      className={`mt-1 w-full ${R} border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-[#16a34a] focus:ring-[3px] focus:ring-[#16a34a]/22`}
                    >
                      {HOUR_OPTS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <section className={`space-y-3 border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 ${R}`}>
            <div className="flex items-end justify-between gap-2">
              <h3 className="text-base font-semibold text-slate-900">{t("buyerNoteTitle")}</h3>
              <span className="text-xs tabular-nums text-slate-400">
                {seller.buyerNote.length}/{BUYER_NOTE_MAX}
              </span>
            </div>
            <textarea
              name="buyerNote"
              value={seller.buyerNote}
              onChange={(e) => setSeller((p) => ({ ...p, buyerNote: e.target.value.slice(0, BUYER_NOTE_MAX) }))}
              maxLength={BUYER_NOTE_MAX}
              rows={4}
              placeholder={t("buyerNotePlaceholder")}
              className={`w-full resize-y border border-slate-200/90 bg-slate-50/80 px-4 py-3 text-[15px] leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 ${R} focus:border-[#16a34a] focus:bg-white focus:ring-[3px] focus:ring-[#16a34a]/22`}
            />
          </section>

          <section className={`space-y-4 border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 ${R}`}>
            <h3 className="text-base font-semibold text-slate-900">{tAcc("profileAvatarUrl")}</h3>
            <input type="hidden" name="avatarUrl" value={avatarUrlValue} readOnly />
            <input
              id="sd-avatar"
              type="url"
              placeholder="https://..."
              value={avatarUrlValue}
              onChange={(e) => {
                setAvatarUrlValue(e.target.value);
                setAvatarPreview(e.target.value);
              }}
              maxLength={500}
              className={`w-full min-h-[48px] border border-slate-200/90 bg-white px-4 py-3 text-sm outline-none transition ${R} focus:border-[#16a34a] focus:ring-[3px] focus:ring-[#16a34a]/22`}
            />
            <input
              ref={fileInputRef}
              type="file"
              name="avatarFile"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-[10px] file:border file:border-slate-200 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-800 hover:file:bg-slate-50"
            />
          </section>

          {state?.ok === false ? (
            <p className="text-sm text-red-600" role="alert">
              {state.message ??
                (state.error === "validation"
                  ? tAcc("profileValidation")
                  : state.error === "unauthorized"
                    ? tAcc("profileUnauthorized")
                    : tAcc("profileUnknown"))}
            </p>
          ) : null}
          {state?.ok === true ? (
            <p className="text-sm font-medium text-[#16a34a]" role="status">
              {state.message ?? tAcc("profileSuccess")}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              name="intent"
              value="save_profile"
              disabled={isBusy}
              className={`inline-flex min-h-[48px] items-center justify-center px-6 text-sm font-semibold text-white shadow-md transition duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 ${R}`}
              style={{ backgroundColor: GREEN }}
            >
              {saveLabel}
            </button>
            <button
              type="submit"
              name="intent"
              value="delete_avatar"
              disabled={isBusy}
              onClick={() => {
                setAvatarUrlValue("");
                setAvatarPreview("");
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className={`inline-flex min-h-[48px] items-center justify-center border border-red-200 bg-white px-5 text-sm font-semibold text-red-700 transition duration-200 hover:scale-[1.02] hover:bg-red-50 active:scale-[0.98] disabled:opacity-60 ${R}`}
            >
              {t("deleteAvatar")}
            </button>
          </div>
      </form>
    </div>
  );
}
