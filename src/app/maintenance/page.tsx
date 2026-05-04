const PREMIUM_CARDS = [
  {
    title: "Imbunatatiri continue",
    description: "Optimizam performanta si rafinam fiecare detaliu pentru un produs mai rapid si mai stabil.",
  },
  {
    title: "Securitate avansata",
    description: "Consolidam sistemele de protectie pentru date, autentificare si tranzactii in siguranta.",
  },
  {
    title: "Experienta premium",
    description: "Pregatim o interfata mai fluida, moderna si intuitiva pentru urmatorul nivel VEX.MD.",
  },
] as const;

export default function MaintenancePage() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#050814] via-[#070d1f] to-[#03050d] px-6 py-16 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(42rem 26rem at 16% 18%, rgba(56, 189, 248, 0.22), transparent 66%), radial-gradient(34rem 24rem at 84% 20%, rgba(99, 102, 241, 0.2), transparent 64%), radial-gradient(28rem 22rem at 50% 84%, rgba(14, 165, 233, 0.14), transparent 64%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.08) 0.7px, transparent 0.7px), radial-gradient(rgba(125,211,252,0.12) 0.5px, transparent 0.5px)",
          backgroundSize: "30px 30px, 46px 46px",
          backgroundPosition: "0 0, 12px 18px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(2,6,23,0.14), rgba(2,6,23,0.5)), repeating-linear-gradient(0deg, rgba(255,255,255,0.015), rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px)",
        }}
      />

      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center">
        <header className="mx-auto max-w-3xl text-center">
          <div className="mb-7 inline-flex items-center justify-center">
            <span className="bg-gradient-to-r from-sky-200 via-white to-sky-300 bg-clip-text text-3xl font-extrabold tracking-[0.24em] text-transparent drop-shadow-[0_0_32px_rgba(56,189,248,0.4)] sm:text-4xl">
              VEX.MD
            </span>
          </div>

          <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
            Site-ul este in <span className="text-sky-300">mentenanta</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
            Lucram la imbunatatiri pentru a-ti oferi cea mai buna experienta. Revenim foarte curand.
          </p>
        </header>

        <div className="mt-12 grid w-full gap-5 sm:mt-14 md:grid-cols-3">
          {PREMIUM_CARDS.map((card) => (
            <article
              key={card.title}
              className="relative rounded-2xl border border-white/15 bg-white/[0.06] p-6 shadow-[0_24px_70px_-28px_rgba(14,165,233,0.6)] backdrop-blur-xl"
            >
              <div
                aria-hidden
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-sky-300/30 bg-sky-400/10 text-sky-200 shadow-[0_0_24px_rgba(56,189,248,0.35)]"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-sky-300 shadow-[0_0_14px_rgba(125,211,252,0.95)]" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight text-white">{card.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{card.description}</p>
            </article>
          ))}
        </div>

        <footer className="mt-12 text-center text-sm text-slate-400 sm:mt-14">
          Iti multumim pentru rabdare - Echipa VEX.MD
        </footer>
      </section>
    </main>
  );
}
