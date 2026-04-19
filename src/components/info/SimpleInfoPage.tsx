import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

/** Pagini ajutor / siguranță — layout minimalist, aliniat cu restul site-ului. */
export function SimpleInfoPage({ title, children }: Props) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:py-20">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-950">{title}</h1>
      <div className="mt-8 space-y-4 text-base leading-relaxed text-zinc-800">{children}</div>
    </div>
  );
}
