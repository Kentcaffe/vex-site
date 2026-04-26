"use client";

import { useEffect, useMemo } from "react";

const STORAGE_KEY = "vex_presence_sid";
const HEARTBEAT_MS = 25_000;

function browserSid(): string {
  if (typeof window === "undefined") {
    return "";
  }
  const fromStorage = window.localStorage.getItem(STORAGE_KEY);
  if (fromStorage?.trim()) {
    return fromStorage.trim();
  }
  const sid =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(STORAGE_KEY, sid);
  return sid;
}

export function PresenceHeartbeat() {
  const sid = useMemo(() => browserSid(), []);

  useEffect(() => {
    if (!sid) {
      return;
    }
    let cancelled = false;
    const ping = async () => {
      if (cancelled) {
        return;
      }
      try {
        await fetch("/api/metrics/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ sid }),
          keepalive: true,
        });
      } catch {
        // best effort only
      }
    };

    void ping();
    const timer = window.setInterval(() => {
      void ping();
    }, HEARTBEAT_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [sid]);

  return null;
}

