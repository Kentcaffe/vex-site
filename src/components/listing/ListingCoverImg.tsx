"use client";

import { useEffect, useState } from "react";

const FALLBACK = "/marketplace-image-fallback.svg";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
};

/**
 * Imagine anunț: referrer redus (unele CDN-uri blochează altfel) + fallback local dacă URL-ul e mort.
 */
export function ListingCoverImg({ src, alt, className }: Props) {
  const initial = src?.trim() || FALLBACK;
  const [url, setUrl] = useState(initial);

  useEffect(() => {
    setUrl(src?.trim() || FALLBACK);
  }, [src]);

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      loading="lazy"
      decoding="async"
      onError={() => {
        if (url !== FALLBACK) setUrl(FALLBACK);
      }}
    />
  );
}
