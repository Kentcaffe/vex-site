"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppSession } from "@/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";
type SupabaseSessionContextValue = {
  data: AppSession | null;
  status: SessionStatus;
  refresh: () => Promise<void>;
};

const SupabaseSessionContext = createContext<SupabaseSessionContextValue | null>(null);

async function readServerSession(): Promise<AppSession | null> {
  try {
    const res = await fetch("/api/auth/session", { credentials: "include" });
    if (!res.ok) return null;
    const payload = (await res.json()) as { session?: AppSession | null };
    return payload.session ?? null;
  } catch {
    return null;
  }
}

export function SupabaseSessionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppSession | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

  async function refresh() {
    setStatus((prev) => (prev === "loading" ? prev : "loading"));
    const session = await readServerSession();
    setData(session);
    setStatus(session?.user?.id ? "authenticated" : "unauthenticated");
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });
    return () => {
      window.clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      data,
      status,
      refresh,
    }),
    [data, status],
  );

  return <SupabaseSessionContext.Provider value={value}>{children}</SupabaseSessionContext.Provider>;
}

export function useAuthSession() {
  const ctx = useContext(SupabaseSessionContext);
  if (!ctx) {
    throw new Error("useAuthSession must be used within SupabaseSessionProvider");
  }
  return ctx;
}
