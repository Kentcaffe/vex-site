"use client";

import { useState } from "react";

const FALLBACK = "/marketplace-image-fallback.svg";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
};

type InnerProps = {
  src: string;
  alt: string;
  className?: string;
};

/**
 * Imagine anunț: referrer redus (unele CDN-uri blochează altfel) + fallback local dacă URL-ul e mort.
 * `key` pe copil resetează starea la schimbarea sursei (fără effect + setState).
 */
function ListingCoverImgInner({ src, alt, className }: InnerProps) {
  const [failed, setFailed] = useState(false);
  const url = failed ? FALLBACK : src;

  return (
    // URL-uri externe din anunțuri — next/image cere domenii cunoscute; păstrăm <img>.
    // eslint-disable-next-line @next/next/no-img-element -- imagini dinamice, referrerPolicy no-referrer
    <img
      src={url}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      loading="lazy"
      decoding="async"
      onError={() => {
        if (!failed) setFailed(true);
      }}
    />
  );
}

export function ListingCoverImg({ src, alt, className }: Props) {
  const normalized = src?.trim() || FALLBACK;
  return <ListingCoverImgInner key={normalized} src={normalized} alt={alt} className={className} />;
}
