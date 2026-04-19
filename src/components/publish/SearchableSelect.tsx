"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type SearchableSelectOption = { value: string; label: string };

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SearchableSelectOption[];
  placeholder?: string;
  emptyLabel?: string;
  searchPlaceholder?: string;
  noResultsLabel?: string;
  className?: string;
  /** Vizual + aria-invalid pentru erori de validare */
  invalid?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
};

export function SearchableSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Alege…",
  emptyLabel = "—",
  searchPlaceholder = "Caută…",
  noResultsLabel = "Niciun rezultat",
  className = "",
  invalid = false,
  disabled = false,
  "aria-label": ariaLabel,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(n) || o.value.toLowerCase().includes(n),
    );
  }, [options, q]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => searchRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQ("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const pick = useCallback(
    (v: string) => {
      onChange(v);
      setOpen(false);
      setQ("");
    },
    [onChange],
  );

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-invalid={invalid}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`mt-1 flex min-h-[52px] w-full items-center justify-between gap-2 rounded-xl border bg-white px-3 py-3 text-left text-base text-zinc-900 md:min-h-[44px] md:rounded-lg md:py-2.5 md:text-sm ${
          invalid ? "border-red-500 ring-2 ring-red-500/30" : "border-zinc-300"
        }`}
      >
        <span className={selected ? "text-zinc-900" : "text-zinc-500"}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-500 transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open ? (
        <div
          id={listId}
          role="listbox"
          className="absolute z-[80] mt-1 max-h-64 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg"
        >
          <div className="border-b border-zinc-100 p-2">
            <input
              ref={searchRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={searchPlaceholder}
              className="field-input w-full py-2 text-sm"
              autoComplete="off"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto py-1">
            <li role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === ""}
                className="flex w-full px-3 py-2.5 text-left text-sm text-zinc-600 hover:bg-zinc-50"
                onClick={() => pick("")}
              >
                {emptyLabel}
              </button>
            </li>
            {filtered.map((o) => (
              <li key={o.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={value === o.value}
                  className={`flex w-full px-3 py-2.5 text-left text-sm hover:bg-zinc-50 ${
                    value === o.value ? "bg-orange-50 font-medium text-[#9a3412]" : "text-zinc-900"
                  }`}
                  onClick={() => pick(o.value)}
                >
                  {o.label}
                </button>
              </li>
            ))}
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-sm text-zinc-500">{noResultsLabel}</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
