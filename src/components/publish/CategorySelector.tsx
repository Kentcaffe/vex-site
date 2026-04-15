"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { emojiForCategorySlug } from "@/lib/category-icons";
import {
  type CategoryTreeNode,
  findAncestorStackForLeaf,
  getPathLabelsForLeaf,
  isLeafCategoryNode,
} from "@/lib/category-tree";

type Props = {
  tree: CategoryTreeNode[];
  value: string;
  /** Callback client (nume cu sufix Action = convenție Next.js ts(71007) pentru props serializabile). */
  onCategoryIdAction: (categoryId: string) => void;
  name?: string;
  error?: string | null;
};

export function CategorySelector({ tree, value, onCategoryIdAction, name = "categoryId", error }: Props) {
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

  const collapsed = Boolean(value && isLeafCategoryNode(tree, value));

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
  const pathParts = selectedPath ? selectedPath.split(" › ").filter(Boolean) : [];

  function onPickNode(n: CategoryTreeNode) {
    if (n.children && n.children.length > 0) {
      onCategoryIdAction("");
      setStack((s) => [...s, n]);
      setQuery("");
      return;
    }
    onCategoryIdAction(n.id);
    setStack(findAncestorStackForLeaf(tree, n.id) ?? []);
  }

  function clearCategory() {
    onCategoryIdAction("");
    setStack([]);
    setQuery("");
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name={name} value={value} />

      {collapsed ? (
        <div className="transition-opacity duration-300">
          <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/95 to-white p-4 shadow-sm dark:border-emerald-900/50 dark:from-emerald-950/40 dark:to-zinc-900 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-800/90 dark:text-emerald-200/90">
                {tCat("categorySelectedLabel")}
              </p>
              <nav aria-label={tCat("categorySelectedLabel")} className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-zinc-800 dark:text-zinc-100">
                {pathParts.map((part, i) => (
                  <span key={`${part}-${i}`} className="inline-flex items-center gap-1.5">
                    {i > 0 ? (
                      <span className="text-zinc-400" aria-hidden>
                        /
                      </span>
                    ) : null}
                    <span className={i === pathParts.length - 1 ? "font-semibold text-emerald-900 dark:text-emerald-100" : ""}>
                      {part}
                    </span>
                  </span>
                ))}
              </nav>
            </div>
            <button
              type="button"
              onClick={clearCategory}
              className="shrink-0 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-emerald-500 hover:bg-emerald-50/80 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/50"
            >
              {tCat("categoryChangeCategory")}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 transition-opacity duration-300">
          <div className="flex flex-wrap items-center gap-1 text-sm text-zinc-600 dark:text-zinc-300">
            <button
              type="button"
              className="rounded-md px-2 py-1 font-medium text-[#0b57d0] hover:bg-zinc-100 dark:text-blue-400 dark:hover:bg-zinc-800"
              onClick={clearCategory}
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
                    onCategoryIdAction("");
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
                  onCategoryIdAction("");
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
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-3 pr-3 text-sm shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-950 dark:focus:border-emerald-600"
              autoComplete="off"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-zinc-500">{tCat("categoryEmptyFilter")}</p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((n) => {
                const isFolder = !!(n.children && n.children.length > 0);
                const isLeafSelected = !isFolder && n.id === value;
                const emoji = emojiForCategorySlug(n.slug);
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => onPickNode(n)}
                      className={`group flex w-full items-start gap-3 rounded-2xl border p-4 text-left text-sm shadow-sm transition duration-200 ${
                        isLeafSelected
                          ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/25 dark:border-emerald-600 dark:bg-emerald-950/50"
                          : "border-zinc-200/90 bg-white hover:-translate-y-0.5 hover:border-emerald-400/60 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900/80 dark:hover:border-emerald-600/50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-2xl leading-none transition group-hover:bg-emerald-100/80 dark:bg-zinc-800 dark:group-hover:bg-emerald-950/60"
                        aria-hidden
                      >
                        {emoji}
                      </span>
                      <span className="min-w-0 flex-1 pt-0.5">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-50">{n.label}</span>
                        {isFolder ? (
                          <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">Subcategorii →</span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {error ? <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
