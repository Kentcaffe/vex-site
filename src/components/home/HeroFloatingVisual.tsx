import Image from "next/image";

/**
 * Decor hero — imagini statice din `/public/seed`, fără logică de business.
 * Mașină, laptop, casă, mobilier + cadru tip telefon.
 */
export function HeroFloatingVisual() {
  return (
    <div className="relative mx-auto hidden h-[min(420px,52vw)] w-full max-w-[520px] select-none lg:block" aria-hidden>
      <div className="absolute left-0 top-[8%] z-[1] w-[32%] overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_rgba(0,0,0,0.1)] ring-1 ring-zinc-200/80 [transform:rotate(-8deg)]">
        <Image src="/seed/cover-1.jpg" alt="" width={200} height={160} className="h-auto w-full object-cover" sizes="200px" />
      </div>
      <div className="absolute right-0 top-[14%] z-[1] w-[30%] overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_rgba(0,0,0,0.1)] ring-1 ring-zinc-200/80 [transform:rotate(7deg)]">
        <Image src="/seed/cover-2.jpg" alt="" width={180} height={140} className="h-auto w-full object-cover" sizes="180px" />
      </div>
      <div className="absolute bottom-[6%] left-[4%] z-[1] w-[30%] overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_rgba(0,0,0,0.1)] ring-1 ring-zinc-200/80 [transform:rotate(5deg)]">
        <Image src="/seed/cover-3.jpg" alt="" width={180} height={140} className="h-auto w-full object-cover" sizes="180px" />
      </div>
      <div className="absolute bottom-[10%] right-[2%] z-[1] w-[28%] overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_rgba(0,0,0,0.1)] ring-1 ring-zinc-200/80 [transform:rotate(-6deg)]">
        <Image src="/seed/cover-4.jpg" alt="" width={170} height={130} className="h-auto w-full object-cover" sizes="170px" />
      </div>

      <div className="absolute left-1/2 top-1/2 z-[2] w-[42%] min-w-[200px] max-w-[240px] -translate-x-1/2 -translate-y-1/2">
        <div className="relative aspect-[9/19] w-full rounded-[2.25rem] border-[10px] border-zinc-900 bg-zinc-900 shadow-[0_24px_48px_-8px_rgba(0,0,0,0.25)] ring-1 ring-zinc-700/50">
          <div className="absolute inset-[8px] overflow-hidden rounded-[1.5rem] bg-zinc-100">
            <Image src="/seed/cover-0.jpg" alt="" fill className="object-cover" sizes="240px" priority />
          </div>
        </div>
      </div>
    </div>
  );
}
