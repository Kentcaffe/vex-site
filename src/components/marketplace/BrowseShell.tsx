"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

type Props = {
  title: string;
  subtitle?: string;
  sidebar: ReactNode;
  filters: ReactNode;
  children: ReactNode;
};

function MobileDrawer({
  title,
  closeLabel,
  open,
  onClose,
  children,
}: {
  title: string;
  closeLabel: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        aria-label={title}
        className="absolute inset-0 bg-zinc-950/60"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-2xl border border-[var(--mp-border)] bg-[var(--mp-surface)] p-4 shadow-[var(--mp-shadow-lg)] dark:bg-[var(--mp-surface)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[#111827] dark:text-[#f9fafb]">{title}</h2>
          <button type="button" className="btn-secondary min-h-[40px] px-3 py-2 text-xs" onClick={onClose}>
            {closeLabel}
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function BrowseShell({ title, subtitle, sidebar, filters, children }: Props) {
  const t = useTranslations("Listings");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="app-shell app-section w-full min-w-0 max-w-full">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="page-heading">{title}</h1>
          {subtitle ? <p className="page-subheading mt-2">{subtitle}</p> : null}
        </div>
        <div className="flex gap-3 md:hidden">
          <button type="button" className="btn-secondary flex-1" onClick={() => setCategoriesOpen(true)}>
            {t("categories")}
          </button>
          <button type="button" className="btn-primary flex-1" onClick={() => setFiltersOpen(true)}>
            {t("filters.openMobile")}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <div className="hidden md:block">{sidebar}</div>
        <div className="min-w-0 space-y-5">
          <div className="hidden md:block">{filters}</div>
          {children}
        </div>
      </div>

      <MobileDrawer
        title={t("categories")}
        closeLabel={t("filters.closeMobile")}
        open={categoriesOpen}
        onClose={() => setCategoriesOpen(false)}
      >
        {sidebar}
      </MobileDrawer>
      <MobileDrawer
        title={t("filters.title")}
        closeLabel={t("filters.closeMobile")}
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
      >
        {filters}
      </MobileDrawer>
    </div>
  );
}
