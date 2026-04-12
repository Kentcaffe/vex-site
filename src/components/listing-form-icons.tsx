import type { SVGProps } from "react";

const iconClass = "h-5 w-5 shrink-0 text-zinc-500 dark:text-zinc-400";

export function IconPrice(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className={iconClass} aria-hidden {...props}>
      <rect x="3" y="6" width="18" height="12" rx="2" strokeLinejoin="round" />
      <path d="M7 10h10M7 14h6" strokeLinecap="round" />
    </svg>
  );
}

export function IconMapPin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconClass} aria-hidden {...props}>
      <path d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

export function IconPhone(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={iconClass} aria-hidden {...props}>
      <path
        d="M6.5 4.5h3l1.5 4-2 1.5a11 11 0 005 5l1.5-2 4 1.5v3a2 2 0 01-2.1 2 17 17 0 01-9.45-4.35A17 17 0 014.5 6.6a2 2 0 012-2.1z"
        strokeLinejoin="round"
      />
    </svg>
  );
}
