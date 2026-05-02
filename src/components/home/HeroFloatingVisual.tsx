import Image from "next/image";

const PRODUCT_SHADOW = "0 15px 40px rgba(0,0,0,0.1)";
const PHONE_SHADOW = "0 30px 60px rgba(0,0,0,0.15)";

/**
 * Decor hero dreapta — imagini locale `/public/hero/*` (doar UI, fără logică).
 * Pe ecrane < `lg` nu ocupă spațiu (ascuns).
 */
export function HeroFloatingVisual() {
  return (
    <div
      className="relative mx-auto hidden h-[min(460px,50vh)] w-full max-w-[560px] select-none overflow-visible lg:block"
      aria-hidden
    >
      {/* Mașină — stânga sus */}
      <div
        className="absolute left-0 top-[10%] z-[5] w-[30%] max-w-[200px] rounded-[20px] bg-transparent"
        style={{ boxShadow: PRODUCT_SHADOW, transform: "rotate(-5deg)" }}
      >
        <Image
          src="/hero/car.png"
          alt=""
          width={200}
          height={150}
          className="h-auto w-full rounded-[20px] object-contain"
          sizes="200px"
        />
      </div>

      {/* Laptop — dreapta sus */}
      <div
        className="absolute right-0 top-[8%] z-[5] w-[30%] max-w-[200px] rounded-[20px] bg-transparent"
        style={{ boxShadow: PRODUCT_SHADOW, transform: "rotate(5deg)" }}
      >
        <Image
          src="/hero/laptop.png"
          alt=""
          width={200}
          height={150}
          className="h-auto w-full rounded-[20px] object-contain"
          sizes="200px"
        />
      </div>

      {/* Casă — stânga jos */}
      <div
        className="absolute bottom-[8%] left-[4%] z-[5] w-[28%] max-w-[190px] rounded-[20px] bg-transparent"
        style={{ boxShadow: PRODUCT_SHADOW, transform: "rotate(5deg)" }}
      >
        <Image
          src="/hero/house.png"
          alt=""
          width={190}
          height={140}
          className="h-auto w-full rounded-[20px] object-contain"
          sizes="190px"
        />
      </div>

      {/* Canapea — dreapta jos */}
      <div
        className="absolute bottom-[10%] right-[2%] z-[5] w-[30%] max-w-[200px] rounded-[20px] bg-transparent"
        style={{ boxShadow: PRODUCT_SHADOW, transform: "rotate(-5deg)" }}
      >
        <Image
          src="/hero/sofa.png"
          alt=""
          width={200}
          height={150}
          className="h-auto w-full rounded-[20px] object-contain"
          sizes="200px"
        />
      </div>

      {/* Telefon — centru zona dreaptă, cel mai mare, deasupra produselor */}
      <div
        className="absolute left-1/2 top-1/2 z-[20] w-[min(52%,300px)] -translate-x-1/2 -translate-y-1/2 rounded-[20px] bg-transparent"
        style={{ boxShadow: PHONE_SHADOW }}
      >
        <Image
          src="/hero/phone.png"
          alt=""
          width={300}
          height={560}
          priority
          className="h-auto w-full rounded-[20px] object-contain"
          sizes="(min-width: 1024px) 300px, 0px"
        />
      </div>
    </div>
  );
}
