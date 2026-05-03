"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AUTOTURISME_CATEGORY_SLUG } from "@/lib/category-slugs";
import { getModelsForBrand } from "@/lib/vehicle-models-by-brand";
import {
  ELECTRONICS_CONDITION,
  ELECTRONICS_PRODUCT_ALL,
  ENGINE_LITER_OPTIONS,
  RE_FURNISHED_VALUES,
  RE_PROPERTY_CONDITION,
  RE_PROPERTY_TYPE_FILTER,
  RE_ROOM_COUNTS,
  STORAGE_GB_FILTER_VALUES,
  VEHICLE_BODY_TYPE_KEYS,
  VEHICLE_COLOR_KEYS,
  VEHICLE_DOOR_KEYS,
  VEHICLE_DRIVETRAIN_KEYS,
  VEHICLE_FUEL_KEYS,
  VEHICLE_SEAT_OPTIONS,
  VEHICLE_TRANSMISSION_KEYS,
} from "@/lib/listing-form-options";
import { MOLDOVA_CITIES, VEHICLE_BRANDS } from "@/lib/vehicle-taxonomy";

type Props = {
  defaultCity?: string;
  defaultMin?: string;
  defaultMax?: string;
  defaultSearch?: string;
  /** "" = toate monedele; MDL / EUR = filtrează anunțurile cu acea monedă (împreună cu min/max pe acel preț) */
  defaultCurrency?: "" | "MDL" | "EUR";
  defaultBrand?: string;
  defaultModel?: string;
  defaultFuel?: string;
  defaultTransmission?: string;
  defaultBodyType?: string;
  defaultDrivetrain?: string;
  defaultDoors?: string;
  defaultSeats?: string;
  defaultEngineL?: string;
  defaultColor?: string;
  defaultRooms?: string;
  defaultAreaMin?: string;
  defaultAreaMax?: string;
  defaultPropertyType?: string;
  defaultFurnished?: string;
  defaultPropertyCondition?: string;
  defaultProductType?: string;
  defaultElectronicsCondition?: string;
  defaultStorageGb?: string;
  defaultCondition?: string;
  defaultDistrict?: string;
  defaultYearMin?: string;
  defaultYearMax?: string;
  defaultMileageMax?: string;
  category?: string;
};

export function AnunturiFilters({
  defaultCity = "",
  defaultMin = "",
  defaultMax = "",
  defaultSearch = "",
  defaultCurrency = "",
  defaultBrand = "",
  defaultModel = "",
  defaultFuel = "",
  defaultTransmission = "",
  defaultBodyType = "",
  defaultDrivetrain = "",
  defaultDoors = "",
  defaultSeats = "",
  defaultEngineL = "",
  defaultColor = "",
  defaultRooms = "",
  defaultAreaMin = "",
  defaultAreaMax = "",
  defaultPropertyType = "",
  defaultFurnished = "",
  defaultPropertyCondition = "",
  defaultProductType = "",
  defaultElectronicsCondition = "",
  defaultStorageGb = "",
  defaultCondition = "",
  defaultDistrict = "",
  defaultYearMin = "",
  defaultYearMax = "",
  defaultMileageMax = "",
  category,
}: Props) {
  const t = useTranslations("Listings.filters");
  const tForm = useTranslations("ListingForm");
  const cur = defaultCurrency === "EUR" || defaultCurrency === "MDL" ? defaultCurrency : null;
  const isVehicleCategory = (category ?? "").startsWith("transport");
  const isAutoturismeCategory = category === AUTOTURISME_CATEGORY_SLUG;
  const [brand, setBrand] = useState(defaultBrand);
  const modelOptions = useMemo(() => getModelsForBrand(brand), [brand]);
  const isReCategory = (category ?? "").startsWith("imobiliare");
  const isElectronicsCategory = (category ?? "").startsWith("electronice");

  return (
    <form method="get" className="surface-card space-y-4 p-4 sm:p-5">
      {category ? <input type="hidden" name="category" value={category} /> : null}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{t("title")}</h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{t("search")}</p>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-search">
          {t("search")}
        </label>
        <input
          id="flt-search"
          name="search"
          type="search"
          defaultValue={defaultSearch}
          className="field-input mt-1"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-currency">
          {t("currency")}
        </label>
        <select
          id="flt-currency"
          name="currency"
          defaultValue={defaultCurrency || ""}
          className="field-input mt-1"
        >
          <option value="">{t("currencyAll")}</option>
          <option value="MDL">{t("currencyMdl")}</option>
          <option value="EUR">{t("currencyEur")}</option>
        </select>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-city">
            {t("city")}
          </label>
          <input
            id="flt-city"
            name="city"
            list="flt-city-list"
            defaultValue={defaultCity}
            className="field-input mt-1"
            placeholder={t("cityPlaceholder")}
          />
          <datalist id="flt-city-list">
            {MOLDOVA_CITIES.map((cityName) => (
              <option key={cityName} value={cityName} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-district">
            {t("district")}
          </label>
          <input
            id="flt-district"
            name="district"
            defaultValue={defaultDistrict}
            className="field-input mt-1"
            placeholder={t("districtPlaceholder")}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-min">
            {cur ? t("minWithCurrency", { currency: cur }) : t("minPlain")}
          </label>
          <input
            id="flt-min"
            name="min"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={defaultMin}
            className="field-input mt-1"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-max">
            {cur ? t("maxWithCurrency", { currency: cur }) : t("maxPlain")}
          </label>
          <input
            id="flt-max"
            name="max"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={defaultMax}
            className="field-input mt-1"
          />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-condition-global">
            {t("condition")}
          </label>
          <select
            id="flt-condition-global"
            name="condition"
            defaultValue={defaultCondition}
            className="field-input mt-1"
          >
            <option value="">{t("all")}</option>
            <option value="used">{t("conditionUsed")}</option>
            <option value="new">{t("conditionNew")}</option>
          </select>
        </div>
      </div>
      {isAutoturismeCategory ? (
        <details open className="rounded-xl border border-zinc-200/90 bg-zinc-50/60 p-3">
          <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-900">{t("vehicleBrandSection")}</summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-brand">
                {t("brand")}
              </label>
              <input
                id="flt-brand"
                name="brand"
                list="flt-brand-list"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="field-input mt-1"
                placeholder={t("brandPlaceholder")}
              />
              <datalist id="flt-brand-list">
                {VEHICLE_BRANDS.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-model">
                {t("model")}
              </label>
              <input
                id="flt-model"
                name="model"
                list="flt-model-list"
                defaultValue={defaultModel}
                className="field-input mt-1"
                placeholder={t("modelPlaceholder")}
              />
              <datalist id="flt-model-list">
                {modelOptions.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-fuel">
                {t("fuel")}
              </label>
              <select id="flt-fuel" name="fuel" defaultValue={defaultFuel} className="field-input mt-1">
                <option value="">{t("all")}</option>
                {VEHICLE_FUEL_KEYS.map((v) => (
                  <option key={v} value={v}>
                    {tForm(`fuel.${v}` as never)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </details>
      ) : null}

      {isVehicleCategory ? (
        <>
          <details open className="rounded-xl border border-zinc-200/90 bg-zinc-50/60 p-3">
            <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-900">{t("vehicleSpecsSection")}</summary>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-year-min">
                  {t("yearMin")}
                </label>
                <input
                  id="flt-year-min"
                  name="yearMin"
                  type="number"
                  inputMode="numeric"
                  min={1900}
                  defaultValue={defaultYearMin}
                  className="field-input mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-year-max">
                  {t("yearMax")}
                </label>
                <input
                  id="flt-year-max"
                  name="yearMax"
                  type="number"
                  inputMode="numeric"
                  min={1900}
                  defaultValue={defaultYearMax}
                  className="field-input mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-km-max">
                  {t("mileageMax")}
                </label>
                <input
                  id="flt-km-max"
                  name="mileageMax"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  defaultValue={defaultMileageMax}
                  className="field-input mt-1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-transmission">
                  {t("transmission")}
                </label>
                <select id="flt-transmission" name="transmission" defaultValue={defaultTransmission} className="field-input mt-1">
                  <option value="">{t("all")}</option>
                  {VEHICLE_TRANSMISSION_KEYS.map((v) => (
                    <option key={v} value={v}>
                      {tForm(`transmission.${v}` as never)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-body-type">
                  {t("bodyType")}
                </label>
                <select id="flt-body-type" name="bodyType" defaultValue={defaultBodyType} className="field-input mt-1">
                  <option value="">{t("all")}</option>
                  {VEHICLE_BODY_TYPE_KEYS.map((v) => (
                    <option key={v} value={v}>
                      {tForm(`body_type.${v}` as never)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-drivetrain">
                  {t("drivetrain")}
                </label>
                <select id="flt-drivetrain" name="drivetrain" defaultValue={defaultDrivetrain} className="field-input mt-1">
                  <option value="">{t("all")}</option>
                  {VEHICLE_DRIVETRAIN_KEYS.map((v) => (
                    <option key={v} value={v}>
                      {tForm(`drivetrain.${v}` as never)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-doors">
                  {t("doors")}
                </label>
                <select id="flt-doors" name="doors" defaultValue={defaultDoors} className="field-input mt-1">
                  <option value="">{t("all")}</option>
                  {VEHICLE_DOOR_KEYS.map((v) => (
                    <option key={v} value={v}>
                      {tForm(`doors.${v}` as never)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </details>

          <details open className="rounded-xl border border-zinc-200/90 bg-zinc-50/60 p-3">
            <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t("vehicleExtraSection")}
            </summary>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-engine-l">
                  {t("engineL")}
                </label>
                <select id="flt-engine-l" name="engineL" defaultValue={defaultEngineL} className="field-input mt-1">
                  <option value="">{t("all")}</option>
                  {ENGINE_LITER_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {tForm(`engine_l.${v.replace(/\./g, "_")}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-seats">
                  {t("seats")}
                </label>
                <select id="flt-seats" name="seats" defaultValue={defaultSeats} className="field-input mt-1">
                  <option value="">{t("all")}</option>
                  {VEHICLE_SEAT_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {tForm(`seats.${v}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-color-veh">
                  {t("color")}
                </label>
                <select id="flt-color-veh" name="color" defaultValue={defaultColor} className="field-input mt-1">
                  <option value="">{t("all")}</option>
                  {VEHICLE_COLOR_KEYS.map((v) => (
                    <option key={v} value={v}>
                      {tForm(`color.${v}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </details>
        </>
      ) : null}

      {isReCategory ? (
        <details open className="rounded-xl border border-zinc-200/90 bg-zinc-50/60 p-3 dark:border-zinc-700/80 dark:bg-zinc-900/40">
          <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {t("realEstateSection")}
          </summary>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-rooms">
                {t("rooms")}
              </label>
              <select id="flt-rooms" name="rooms" defaultValue={defaultRooms} className="field-input mt-1">
                <option value="">{t("all")}</option>
                {RE_ROOM_COUNTS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-area-min">
                {t("areaMin")}
              </label>
              <input
                id="flt-area-min"
                name="areaMin"
                type="number"
                inputMode="numeric"
                min={0}
                defaultValue={defaultAreaMin}
                className="field-input mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-area-max">
                {t("areaMax")}
              </label>
              <input
                id="flt-area-max"
                name="areaMax"
                type="number"
                inputMode="numeric"
                min={0}
                defaultValue={defaultAreaMax}
                className="field-input mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-property-type">
                {t("propertyType")}
              </label>
              <select id="flt-property-type" name="propertyType" defaultValue={defaultPropertyType} className="field-input mt-1">
                <option value="">{t("all")}</option>
                {RE_PROPERTY_TYPE_FILTER.map((v) => (
                  <option key={v} value={v}>
                    {tForm(`property_type.${v}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-furnished">
                {t("furnished")}
              </label>
              <select id="flt-furnished" name="furnished" defaultValue={defaultFurnished} className="field-input mt-1">
                <option value="">{t("all")}</option>
                {RE_FURNISHED_VALUES.map((v) => (
                  <option key={v} value={v}>
                    {tForm(`furnished.${v}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-property-condition">
                {t("propertyCondition")}
              </label>
              <select
                id="flt-property-condition"
                name="propertyCondition"
                defaultValue={defaultPropertyCondition}
                className="field-input mt-1"
              >
                <option value="">{t("all")}</option>
                {RE_PROPERTY_CONDITION.map((v) => (
                  <option key={v} value={v}>
                    {tForm(`property_condition.${v}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </details>
      ) : null}

      {isElectronicsCategory ? (
        <details open className="rounded-xl border border-zinc-200/90 bg-zinc-50/60 p-3 dark:border-zinc-700/80 dark:bg-zinc-900/40">
          <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {t("electronicsSection")}
          </summary>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-product-type">
                {t("productType")}
              </label>
              <select id="flt-product-type" name="productType" defaultValue={defaultProductType} className="field-input mt-1">
                <option value="">{t("all")}</option>
                {ELECTRONICS_PRODUCT_ALL.map((v) => (
                  <option key={v} value={v}>
                    {tForm(`product_type.${v}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-electronics-condition">
                {t("electronicsCondition")}
              </label>
              <select
                id="flt-electronics-condition"
                name="electronicsCondition"
                defaultValue={defaultElectronicsCondition}
                className="field-input mt-1"
              >
                <option value="">{t("all")}</option>
                {ELECTRONICS_CONDITION.map((v) => (
                  <option key={v} value={v}>
                    {tForm(`electronics_condition.${v}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-storage-gb">
                {t("storageGb")}
              </label>
              <select id="flt-storage-gb" name="storageGb" defaultValue={defaultStorageGb} className="field-input mt-1">
                <option value="">{t("all")}</option>
                {STORAGE_GB_FILTER_VALUES.map((v) => (
                  <option key={v} value={v}>
                    {`${v} GB`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500" htmlFor="flt-color-el">
                {t("color")}
              </label>
              <select id="flt-color-el" name="color" defaultValue={defaultColor} className="field-input mt-1">
                <option value="">{t("all")}</option>
                {VEHICLE_COLOR_KEYS.map((v) => (
                  <option key={v} value={v}>
                    {tForm(`color.${v}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </details>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="submit" className="btn-primary flex-1 sm:flex-none">
          {t("apply")}
        </button>
        <Link
          href={category ? `/anunturi?category=${encodeURIComponent(category)}` : "/anunturi"}
          className="btn-secondary flex-1 sm:flex-none"
        >
          {t("reset")}
        </Link>
      </div>
    </form>
  );
}
