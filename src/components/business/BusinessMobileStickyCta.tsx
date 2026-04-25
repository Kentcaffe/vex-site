"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

type Props = {
  hideWhenVisibleId: string;
};

export function BusinessMobileStickyCta({ hideWhenVisibleId }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const target = document.getElementById(hideWhenVisibleId);
    if (!target) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { root: null, threshold: 0.25 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hideWhenVisibleId]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 p-3 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur md:hidden">
      <Link
        href="/apply-business"
        className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-orange-500 px-4 text-base font-semibold text-white shadow-md transition hover:bg-orange-600"
      >
        Aplică pentru cont firmă
      </Link>
    </div>
  );
}
