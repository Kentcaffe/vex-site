import { Heart, Rocket, ShieldCheck, TrendingUp } from "lucide-react";

const PREMIUM_CARDS = [
  {
    title: "Imbunatatiri continue",
    description: "Optimizam performanta si rafinam fiecare detaliu pentru un produs mai rapid si mai stabil.",
    icon: TrendingUp,
  },
  {
    title: "Securitate avansata",
    description: "Consolidam sistemele de protectie pentru date, autentificare si tranzactii in siguranta.",
    icon: ShieldCheck,
  },
  {
    title: "Experienta premium",
    description: "Pregatim o interfata mai fluida, moderna si intuitiva pentru urmatorul nivel VEX.MD.",
    icon: Rocket,
  },
] as const;

export default function MaintenancePage() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#020513] px-6 py-16 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(56rem 34rem at 50% -2%, rgba(37,99,235,0.45), transparent 70%), radial-gradient(26rem 20rem at 85% 16%, rgba(14,165,233,0.22), transparent 72%), radial-gradient(24rem 18rem at 10% 18%, rgba(37,99,235,0.18), transparent 72%), linear-gradient(to bottom, #04091d 0%, #020513 58%, #01030a 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage: "radial-gradient(rgba(148,163,184,0.8) 0.65px, transparent 0.65px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[-2.5rem] h-[42vh]"
        style={{
          background:
            "radial-gradient(70% 85% at 50% 100%, rgba(14,116,255,0.34), transparent 64%), repeating-radial-gradient(closest-side at 50% 100%, rgba(56,189,248,0.22), rgba(56,189,248,0.22) 2px, transparent 10px, transparent 20px)",
          maskImage: "linear-gradient(to top, rgba(0,0,0,0.96), transparent 80%)",
        }}
      />

      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center">
        <header className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex flex-col items-center justify-center">
            <div className="relative mb-4">
              <div className="h-14 w-14 rounded-full bg-gradient-to-b from-sky-300 via-sky-500 to-blue-700 shadow-[0_0_36px_rgba(56,189,248,0.65)]" />
              <div className="absolute inset-[12%] rounded-full border border-sky-100/50" />
              <div className="absolute inset-[27%] rounded-full border border-sky-100/60" />
              <div className="absolute inset-[42%] rounded-full border border-sky-100/70" />
            </div>
            <span className="bg-gradient-to-b from-sky-200 to-blue-500 bg-clip-text text-[2rem] font-extrabold tracking-tight text-transparent drop-shadow-[0_0_18px_rgba(37,99,235,0.6)] sm:text-[2.15rem]">
              VEX.MD
            </span>
            <span className="mt-2 h-px w-20 bg-gradient-to-r from-transparent via-sky-300/80 to-transparent" />
          </div>

          <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-[3.45rem]">
            Site-ul este in <span className="text-sky-300">mentenanta</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
            Lucram la imbunatatiri pentru a-ti oferi cea mai buna experienta. Revenim foarte curand.
          </p>
        </header>

        <div className="mt-12 grid w-full gap-5 sm:mt-14 md:grid-cols-3">
          {PREMIUM_CARDS.map((card) => (
            <article
              key={card.title}
              className="relative rounded-2xl border border-sky-300/20 bg-[#07122e]/65 p-6 text-center shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_18px_46px_-24px_rgba(56,189,248,0.85)] backdrop-blur-xl"
            >
              <div
                aria-hidden
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-sky-300/25 bg-sky-500/10 text-sky-200 shadow-[0_0_28px_rgba(56,189,248,0.45)]"
              >
                <card.icon className="h-8 w-8" strokeWidth={1.9} />
              </div>
              <h2 className="text-[1.08rem] font-semibold tracking-tight text-white">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{card.description}</p>
            </article>
          ))}
        </div>

        <footer className="mt-12 text-center text-sm text-slate-300 sm:mt-14">
          <p className="inline-flex items-center gap-2">
            Iti multumim pentru rabdare
            <Heart className="h-4 w-4 fill-sky-400 text-sky-400" />
          </p>
          <p className="mt-1 text-sky-300/90">- Echipa VEX.MD</p>
        </footer>
      </section>
    </main>
  );
}
