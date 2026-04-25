"use client";

import { useActionState, useState } from "react";
import { upgradeToBusiness, type UpgradeBusinessState } from "@/app/actions/business";

type Props = {
  locale: string;
  initial: {
    companyName: string;
    vatNumber: string;
    companyAddress: string;
    phone: string;
    companyLogo: string;
  };
};

export function UpgradeBusinessForm({ locale, initial }: Props) {
  const [state, action, pending] = useActionState(upgradeToBusiness, undefined as UpgradeBusinessState | undefined);
  const [logoUrl, setLogoUrl] = useState(initial.companyLogo);
  const [uploadPending, setUploadPending] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function onPickLogo(file: File | null) {
    if (!file) return;
    setUploadPending(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/business/upload-logo", { method: "POST", body: fd });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !data.url) {
        setUploadError(data.error ?? "Nu am putut încărca logo-ul.");
        return;
      }
      setLogoUrl(data.url);
    } catch {
      setUploadError("Nu am putut încărca logo-ul.");
    } finally {
      setUploadPending(false);
    }
  }

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="company_logo" value={logoUrl} />

      <div>
        <label htmlFor="company_name" className="mb-1 block text-sm font-medium text-zinc-800">
          Nume companie
        </label>
        <input
          id="company_name"
          name="company_name"
          defaultValue={initial.companyName}
          maxLength={120}
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="vat_number" className="mb-1 block text-sm font-medium text-zinc-800">
          Cod fiscal (VAT)
        </label>
        <input
          id="vat_number"
          name="vat_number"
          defaultValue={initial.vatNumber}
          maxLength={64}
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="company_address" className="mb-1 block text-sm font-medium text-zinc-800">
          Adresa firmei
        </label>
        <input
          id="company_address"
          name="company_address"
          defaultValue={initial.companyAddress}
          maxLength={220}
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-zinc-800">
          Telefon
        </label>
        <input
          id="phone"
          name="phone"
          defaultValue={initial.phone}
          maxLength={32}
          required
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-800">Logo firmă</label>
        <label className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50">
          {uploadPending ? "Se încarcă..." : "Upload logo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={uploadPending}
            onChange={(e) => void onPickLogo(e.target.files?.[0] ?? null)}
          />
        </label>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Logo firmă" className="mt-3 h-16 w-16 rounded-lg border border-zinc-200 object-cover" />
        ) : null}
        {uploadError ? <p className="mt-1 text-sm text-red-600">{uploadError}</p> : null}
      </div>

      {state?.ok === false ? (
        <p className="text-sm text-red-600">
          {state.error === "validation"
            ? "Completează corect toate câmpurile."
            : state.error === "unauthorized"
              ? "Trebuie să fii autentificat."
              : "A apărut o eroare. Încearcă din nou."}
        </p>
      ) : null}
      {state?.ok === true ? <p className="text-sm text-emerald-700">Contul a fost actualizat la tip firmă.</p> : null}

      <button
        type="submit"
        disabled={pending || uploadPending}
        className="rounded-lg bg-[#0b57d0] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0842a0] disabled:opacity-60"
      >
        {pending ? "Se salvează..." : "Upgrade la cont firmă"}
      </button>
    </form>
  );
}
