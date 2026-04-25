"use client";

import { useActionState, useMemo, useState } from "react";
import { applyForBusiness, type ApplyBusinessState } from "@/app/actions/business";

const companyTypeOptions = ["SRL", "SA", "II", "PFA", "GOSPODARIE", "ALTELE"] as const;

type Props = {
  locale: string;
  initial: {
    companyName: string;
    companyType: string;
    idno: string;
    vatNumber: string;
    administratorName: string;
    companyAddress: string;
    companyCity: string;
    phone: string;
    companyEmail: string;
    companyLogo: string;
    registrationNumber: string;
    registrationDate: string;
    companyDocument: string;
  };
};

export function ApplyBusinessForm({ locale, initial }: Props) {
  const [state, action, pending] = useActionState(applyForBusiness, undefined as ApplyBusinessState | undefined);
  const [logoUrl, setLogoUrl] = useState(initial.companyLogo);
  const [docUrl, setDocUrl] = useState(initial.companyDocument);
  const [uploadPending, setUploadPending] = useState<"logo" | "doc" | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [idno, setIdno] = useState(initial.idno);

  const idnoError = useMemo(() => {
    if (!idno) return null;
    return /^\d{13}$/.test(idno) ? null : "IDNO trebuie să conțină exact 13 cifre.";
  }, [idno]);

  async function uploadFile(endpoint: "/api/business/upload-logo" | "/api/business/upload-document", file: File | null) {
    if (!file) return;
    setUploadError(null);
    setUploadPending(endpoint === "/api/business/upload-logo" ? "logo" : "doc");
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch(endpoint, { method: "POST", body: fd });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !data.url) {
        setUploadError(data.error ?? "Upload eșuat.");
        return;
      }
      if (endpoint === "/api/business/upload-logo") {
        setLogoUrl(data.url);
      } else {
        setDocUrl(data.url);
      }
    } catch {
      setUploadError("Upload eșuat.");
    } finally {
      setUploadPending(null);
    }
  }

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="company_logo" value={logoUrl} />
      <input type="hidden" name="company_document" value={docUrl} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="company_name" className="mb-1 block text-sm font-medium text-zinc-800">
            Nume companie
          </label>
          <input id="company_name" name="company_name" required maxLength={120} defaultValue={initial.companyName} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="company_type" className="mb-1 block text-sm font-medium text-zinc-800">
            Tip companie
          </label>
          <select id="company_type" name="company_type" defaultValue={initial.companyType || "SRL"} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            {companyTypeOptions.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="idno" className="mb-1 block text-sm font-medium text-zinc-800">
            IDNO (13 cifre)
          </label>
          <input
            id="idno"
            name="idno"
            required
            maxLength={13}
            value={idno}
            onChange={(e) => setIdno(e.target.value.replace(/\D+/g, "").slice(0, 13))}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          {idnoError ? <p className="mt-1 text-xs text-red-600">{idnoError}</p> : null}
        </div>
        <div>
          <label htmlFor="vat_number" className="mb-1 block text-sm font-medium text-zinc-800">
            TVA (opțional)
          </label>
          <input id="vat_number" name="vat_number" maxLength={64} defaultValue={initial.vatNumber} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="administrator_name" className="mb-1 block text-sm font-medium text-zinc-800">
            Administrator
          </label>
          <input id="administrator_name" name="administrator_name" required maxLength={120} defaultValue={initial.administratorName} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="company_address" className="mb-1 block text-sm font-medium text-zinc-800">
            Adresă companie
          </label>
          <input id="company_address" name="company_address" required maxLength={220} defaultValue={initial.companyAddress} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="company_city" className="mb-1 block text-sm font-medium text-zinc-800">
            Oraș
          </label>
          <input id="company_city" name="company_city" required maxLength={80} defaultValue={initial.companyCity} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-zinc-800">
            Telefon
          </label>
          <input id="phone" name="phone" required maxLength={32} defaultValue={initial.phone} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="company_email" className="mb-1 block text-sm font-medium text-zinc-800">
            Email companie
          </label>
          <input id="company_email" type="email" name="company_email" required maxLength={160} defaultValue={initial.companyEmail} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="registration_number" className="mb-1 block text-sm font-medium text-zinc-800">
            Nr. înregistrare
          </label>
          <input id="registration_number" name="registration_number" required maxLength={64} defaultValue={initial.registrationNumber} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="registration_date" className="mb-1 block text-sm font-medium text-zinc-800">
            Data înregistrării
          </label>
          <input id="registration_date" type="date" name="registration_date" required defaultValue={initial.registrationDate} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-800">Logo companie</label>
          <label className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50">
            {uploadPending === "logo" ? "Se încarcă..." : "Încarcă logo"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" disabled={uploadPending !== null} onChange={(e) => void uploadFile("/api/business/upload-logo", e.target.files?.[0] ?? null)} />
          </label>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-800">Certificat firmă (poză)</label>
          <label className="inline-flex cursor-pointer items-center rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50">
            {uploadPending === "doc" ? "Se încarcă..." : "Încarcă document"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" disabled={uploadPending !== null} onChange={(e) => void uploadFile("/api/business/upload-document", e.target.files?.[0] ?? null)} />
          </label>
          {docUrl ? <p className="mt-1 text-xs text-emerald-700">Document încărcat.</p> : null}
        </div>
      </div>

      {uploadError ? <p className="text-sm text-red-600">{uploadError}</p> : null}
      {state?.ok === false ? (
        <p className="text-sm text-red-600">
          {state.error === "validation"
            ? "Date invalide. Verifică IDNO (13 cifre) și câmpurile obligatorii."
            : state.error === "unauthorized"
              ? "Trebuie să fii autentificat."
              : "A apărut o eroare. Încearcă din nou."}
        </p>
      ) : null}
      {state?.ok === true ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Cererea ta este în curs de verificare.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || uploadPending !== null || !docUrl || Boolean(idnoError)}
        className="rounded-lg bg-[#0b57d0] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0842a0] disabled:opacity-60"
      >
        {pending ? "Se trimite..." : "Aplică pentru cont firmă"}
      </button>
    </form>
  );
}
