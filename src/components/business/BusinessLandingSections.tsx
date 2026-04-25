import {
  BadgeCheck,
  BarChart3,
  Building2,
  CircleCheckBig,
  FileCheck2,
  Megaphone,
  ShieldCheck,
  Star,
  Store,
  TrendingUp,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

const logoStripCompanies = [
  "AutoNord",
  "CasaPlus",
  "TechZone",
  "AgroMax",
  "Mobila.md",
  "ConstructPro",
  "ElectroHub",
  "CityRent",
];

const benefits = [
  { icon: BadgeCheck, title: 'Badge "Firmă" și "Verificat"', body: "Clientul vede imediat că reprezinți o companie reală." },
  { icon: ShieldCheck, title: "Mai multă încredere", body: "Verificarea manuală reduce fraudele și crește rata de răspuns." },
  { icon: TrendingUp, title: "Vizibilitate mai mare", body: "Anunțurile business sunt percepute ca mai serioase de cumpărători." },
  { icon: Megaphone, title: "Promovare anunțuri", body: "Poți scala mai rapid campaniile și volumul de lead-uri." },
  { icon: Store, title: "Pagină dedicată firmă", body: "Ai profil public cu logo, date companie și toate anunțurile active." },
  { icon: BarChart3, title: "Statistici anunțuri", body: "Monitorizezi interesul și optimizezi anunțurile în funcție de rezultate." },
];

const steps = [
  { icon: FileCheck2, title: "Completezi formularul", body: "Introduci datele firmei și încarci documentele necesare." },
  { icon: Building2, title: "Echipa verifică datele", body: "Facem verificare manuală pentru autenticitate și siguranță." },
  { icon: CircleCheckBig, title: "Primești cont firmă verificat", body: 'După aprobare, primești badge-urile "Firmă" și "Verificat".' },
];

export function BusinessLandingSections() {
  return (
    <div className="app-shell app-section pb-24 md:pb-10">
      <section className="relative overflow-hidden rounded-3xl border border-orange-200/60 bg-gradient-to-br from-orange-50 via-amber-50 to-white px-6 py-10 shadow-sm sm:px-10 sm:py-14">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-orange-200/35 blur-3xl" aria-hidden />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-800">
            <Star className="h-3.5 w-3.5" aria-hidden />
            Business VEX
          </p>
          <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Creează cont de firmă pe VEX
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600">
            Crește-ți vânzările și ajungi la mii de clienți
          </p>
          <div className="mt-8">
            <Link
              href="/apply-business"
              className="inline-flex min-h-[50px] items-center justify-center rounded-xl bg-orange-500 px-7 text-base font-semibold text-white shadow-md transition hover:bg-orange-600"
            >
              Aplică acum
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Firme care folosesc VEX
        </p>
        <div className="mt-4 -mx-2 flex gap-2 overflow-x-auto px-2 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {logoStripCompanies.map((name) => (
            <div
              key={name}
              className="inline-flex min-w-[122px] shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-700"
            >
              {name}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
              Exemplu profil business
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900">Lead magnet vizual</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Așa arată pentru clienți un cont de firmă verificat: logo, badge-uri de încredere, profil clar și anunțuri
              grupate într-o pagină dedicată.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-700">
              <li className="flex items-start gap-2">
                <CircleCheckBig className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                Identitate de firmă vizibilă instant
              </li>
              <li className="flex items-start gap-2">
                <CircleCheckBig className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                Mai multă încredere în fiecare anunț
              </li>
              <li className="flex items-start gap-2">
                <CircleCheckBig className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                Conversie mai bună din vizualizări în lead-uri
              </li>
            </ul>
          </div>

          <div className="mx-auto w-full max-w-sm rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
                <Building2 className="h-6 w-6" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-zinc-900">AutoNord SRL</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    Firmă
                  </span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    ✔ Verificat
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Pagina firmei</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-xs text-zinc-700">Anunțuri active: 24</div>
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-xs text-zinc-700">Răspuns rapid în chat</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Beneficii pentru firme</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item) => (
            <article key={item.title} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <item.icon className="h-6 w-6 text-orange-600" aria-hidden />
              <h3 className="mt-3 text-base font-semibold text-zinc-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Cum funcționează</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {steps.map((step, idx) => (
            <article key={step.title} className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-800">
                {idx + 1}
              </div>
              <div className="flex items-center gap-2">
                <step.icon className="h-5 w-5 text-emerald-700" aria-hidden />
                <h3 className="text-sm font-semibold text-zinc-900">{step.title}</h3>
              </div>
              <p className="mt-2 text-sm text-zinc-600">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-emerald-900">Încredere și siguranță</h2>
        <p className="mt-3 text-sm leading-relaxed text-emerald-900/90">
          Verificăm manual fiecare firmă pentru a preveni fraudele și a menține platforma sigură.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-6 text-center sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Pregătit să crești vânzările?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-600">
          Trimite cererea acum și echipa VEX o va verifica manual cât mai rapid.
        </p>
        <Link
          href="/apply-business"
          className="mt-6 inline-flex min-h-[52px] items-center justify-center rounded-xl bg-orange-500 px-8 text-base font-semibold text-white shadow-md transition hover:bg-orange-600"
        >
          Aplică pentru cont firmă
        </Link>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 p-3 shadow-[0_-8px_24px_rgba(15,23,42,0.12)] backdrop-blur md:hidden">
        <Link
          href="/apply-business"
          className="inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-orange-500 px-4 text-base font-semibold text-white shadow-md transition hover:bg-orange-600"
        >
          Aplică pentru cont firmă
        </Link>
      </div>
    </div>
  );
}
