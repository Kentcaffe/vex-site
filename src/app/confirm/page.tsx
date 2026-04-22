"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tryCreateSupabaseBrowserClient } from "@/lib/supabase";

type ConfirmState = "confirming" | "success" | "error";

function normalizeErrorMessage(input: unknown): string {
  if (input instanceof Error && input.message.trim()) {
    return input.message;
  }
  const raw = String(input ?? "").trim();
  return raw || "Could not confirm your account. Please try again.";
}

export default function ConfirmPage() {
  const router = useRouter();
  const [state, setState] = useState<ConfirmState>("confirming");
  const [message, setMessage] = useState("Confirming your account...");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const supabase = tryCreateSupabaseBrowserClient();
      if (!supabase) {
        if (!cancelled) {
          setState("error");
          setMessage("Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
        }
        return;
      }

      try {
        const fullUrl = window.location.href;
        const url = new URL(fullUrl);
        const code = url.searchParams.get("code");
        const tokenHash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type");

        let confirmed = false;
        let lastError: unknown = null;

        // 1) Try exactly with full URL first (as requested for your flow).
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(fullUrl);
          console.info("[confirm page] exchangeCodeForSession(fullUrl)", { href: fullUrl, data, error });
          if (!error) {
            confirmed = true;
          } else {
            lastError = error;
          }
        } catch (error) {
          console.error("[confirm page] exchangeCodeForSession(fullUrl) threw", error);
          lastError = error;
        }

        // 2) Fallback for SDKs that expect only the `code` value.
        if (!confirmed && code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          console.info("[confirm page] exchangeCodeForSession(code)", { code, data, error });
          if (!error) {
            confirmed = true;
          } else {
            lastError = error;
          }
        }

        // 3) Fallback for token-hash links (`token_hash` + `type`).
        if (!confirmed && tokenHash && type) {
          const normalizedType = type as "signup" | "invite" | "magiclink" | "recovery" | "email_change";
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: normalizedType,
          });
          console.info("[confirm page] verifyOtp(token_hash)", { tokenHash, type: normalizedType, data, error });
          if (!error) {
            confirmed = true;
          } else {
            lastError = error;
          }
        }

        if (!confirmed) {
          throw (lastError ?? new Error("Missing confirmation token."));
        }

        if (!cancelled) {
          setState("success");
          setMessage("Your account is confirmed. Redirecting...");
          router.replace("/");
        }
      } catch (error) {
        console.error("[confirm page] account confirmation failed", error);
        if (!cancelled) {
          setState("error");
          setMessage(normalizeErrorMessage(error));
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-lg items-center justify-center px-4 py-16">
      <section className="w-full rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Account confirmation</h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{message}</p>
        {state === "confirming" ? (
          <div className="mt-5 h-1.5 w-full overflow-hidden rounded bg-zinc-200 dark:bg-zinc-800">
            <div className="h-full w-1/3 animate-pulse rounded bg-emerald-500" />
          </div>
        ) : null}
        {state === "error" ? (
          <button
            type="button"
            onClick={() => router.replace("/cont")}
            className="mt-5 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500"
          >
            Go to login
          </button>
        ) : null}
      </section>
    </main>
  );
}
