"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const tokenHash = url.searchParams.get("token_hash");
    const type = url.searchParams.get("type");

    if (code) {
      const target = new URL("/api/auth/callback", window.location.origin);
      target.searchParams.set("code", code);
      target.searchParams.set("next", "/");
      window.location.replace(target.toString());
      return;
    }

    if (tokenHash && type) {
      const target = new URL("/api/auth/confirm", window.location.origin);
      target.searchParams.set("token_hash", tokenHash);
      target.searchParams.set("type", type);
      target.searchParams.set("next", "/");
      window.location.replace(target.toString());
      return;
    }

    const timer = window.setTimeout(() => {
      setState("error");
      setMessage(normalizeErrorMessage(new Error("Missing confirmation token in URL.")));
    }, 0);
    return () => window.clearTimeout(timer);
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
