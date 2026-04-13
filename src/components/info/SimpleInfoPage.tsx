import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

/** Pagini ajutor / siguranță — layout minimalist, aliniat cu restul site-ului. */
export function SimpleInfoPage({ title, children }: Props) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:py-20">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h1>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{children}</div>
    </div>
  );
}
