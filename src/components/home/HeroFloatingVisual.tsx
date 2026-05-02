import Image from "next/image";

/**
 * Artwork hero dreapta — o singură imagine `/hero.png`, integrată în fundal (doar UI).
 */
export function HeroFloatingVisual() {
  return (
    <div
      className="relative flex w-full max-w-[280px] shrink-0 justify-center justify-self-center sm:max-w-[360px] md:max-w-[440px] lg:max-w-[550px] lg:justify-self-end lg:self-center"
      aria-hidden
    >
      {/* Halou verde → alb, legat de fundalul hero */}
      <div
        className="pointer-events-none absolute inset-[-18%] -z-10 rounded-[48px] opacity-[0.95]"
        style={{
          background:
            "radial-gradient(ellipse 70% 65% at 50% 42%, rgba(34,197,94,0.22) 0%, rgba(230,244,234,0.55) 42%, rgba(255,255,255,0.85) 68%, transparent 100%)",
        }}
      />

      <div
        className="relative w-full max-w-[550px] rounded-[28px] p-2 sm:p-3 lg:p-4"
        style={{
          boxShadow: "0 18px 48px -18px rgba(15, 23, 42, 0.1)",
        }}
      >
        {/* Blend margini — fără chenar dur */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-emerald-100/35 via-transparent to-white/75 ring-1 ring-inset ring-white/50"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-[28px] backdrop-blur-[0.5px]"
          aria-hidden
        />

        <div
          className="relative w-full"
          style={{
            WebkitMaskImage: "radial-gradient(ellipse 82% 88% at 50% 50%, #000 58%, transparent 100%)",
            maskImage: "radial-gradient(ellipse 82% 88% at 50% 50%, #000 58%, transparent 100%)",
          }}
        >
          <Image
            src="/hero.png"
            alt=""
            width={1100}
            height={880}
            priority
            className="mx-auto h-auto w-full max-h-[200px] object-contain opacity-[0.97] drop-shadow-[0_14px_40px_rgba(15,23,42,0.09)] sm:max-h-[260px] md:max-h-[320px] lg:max-h-[min(440px,50vh)]"
            sizes="(max-width: 640px) 280px, (max-width: 768px) 360px, 550px"
          />
        </div>
      </div>
    </div>
  );
}
