"use client";

import { memo, useState } from "react";
import { resolvePublicMediaUrl } from "@/lib/media-url";
import { chatAvatarHue, chatInitials } from "@/lib/chat-ui";

type Props = {
  url: string | null;
  name: string;
  size?: number;
  className?: string;
};

/** Avatar cu URL rezolvat (Supabase / API) și fallback la inițiale dacă imaginea lipsește sau dă eroare. */
export const ChatAvatar = memo(function ChatAvatar({ url, name, size = 44, className }: Props) {
  const [failed, setFailed] = useState(false);
  const resolved = resolvePublicMediaUrl(url);
  const hue = chatAvatarHue(name || "u");
  const dim = { width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.34)) };

  const roundClass = className?.trim() ? className : "rounded-full";

  if (!resolved || failed) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center font-bold text-white shadow-inner ${roundClass}`}
        style={{
          width: dim.width,
          height: dim.height,
          fontSize: dim.fontSize,
          background: `linear-gradient(145deg, hsl(${hue}, 55%, 48%), hsl(${hue}, 60%, 38%))`,
        }}
        aria-hidden={!name}
      >
        {chatInitials(name)}
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 overflow-hidden border border-zinc-200 shadow-sm dark:border-zinc-700 ${roundClass}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- URL dinamic */}
      <img
        src={resolved}
        alt={`${name} avatar`}
        className="h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
});
