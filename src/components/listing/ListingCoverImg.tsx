"use client";

import { useState } from "react";
import { resolvePublicMediaUrl } from "@/lib/media-url";

const FALLBACK = "/marketplace-image-fallback.svg";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  /** Prima imagine vizibilă (ex. grid acasă) — îmbunătățește LCP. */
  priority?: boolean;
  /** Pentru lazy loading și viewport — ex. `(max-width:640px) 50vw, 25vw` */
  sizes?: string;
};

type InnerProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

/**
 * Imagine anunț: referrer redus (unele CDN-uri blochează altfel) + fallback local dacă URL-ul e mort.
 * `key` pe copil resetează starea la schimbarea sursei (fără effect + setState).
 */
function ListingCoverImgInner({ src, alt, className, priority, sizes }: InnerProps) {
  const [failed, setFailed] = useState(false);
  const url = failed ? FALLBACK : src;

  return (
    // URL-uri externe din anunțuri — next/image cere domenii cunoscute; păstrăm <img>.
    // eslint-disable-next-line @next/next/no-img-element -- imagini dinamice, referrerPolicy no-referrer
    <img
      src={url}
      alt={alt}
      className={className}
      sizes={sizes ?? "(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 320px"}
      referrerPolicy="no-referrer"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      onError={() => {
        if (!failed) setFailed(true);
      }}
    />
  );
}

export function ListingCoverImg({ src, alt, className, priority, sizes }: Props) {
  const resolved = resolvePublicMediaUrl(src?.trim() || null);
  const normalized = resolved || FALLBACK;
  return (
    <ListingCoverImgInner
      key={normalized}
      src={normalized}
      alt={alt}
      className={className}
      priority={priority}
      sizes={sizes}
    />
  );
}
