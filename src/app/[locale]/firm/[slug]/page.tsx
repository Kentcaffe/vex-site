import type { Prisma } from "@prisma/client";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/formatPrice";
import type { PriceCurrencyCode } from "@/lib/currency";
import { parseStoredListingImages } from "@/lib/listing-form-schema";
import { listingWhereActive } from "@/lib/prisma-listing-soft-delete-filter";
import { prisma } from "@/lib/prisma";
import { listingSeoPath } from "@/lib/seo";
import { slugifyCompanyName } from "@/lib/company-slug";
import { resolvePublicMediaUrl } from "@/lib/media-url";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function FirmPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  type BusinessPublicRow = {
    id: string;
    companyName: string | null;
    companyLogo: string | null;
    isVerified: boolean;
  };
  const businesses = await prisma.user.findMany({
    where: { accountType: "business", companyName: { not: null } } as unknown as Prisma.UserWhereInput,
    select: { id: true, companyName: true, companyLogo: true, isVerified: true } as unknown as Prisma.UserSelect,
  }) as unknown as BusinessPublicRow[];
  const company = businesses.find((u) => (u.companyName ? slugifyCompanyName(u.companyName) : "") === slug);
  if (!company) {
    notFound();
  }

  const listings = await prisma.listing.findMany({
    where: { userId: company.id, ...listingWhereActive() },
    orderBy: { createdAt: "desc" },
    take: 80,
    select: {
      id: true,
      title: true,
      city: true,
      district: true,
      price: true,
      priceCurrency: true,
      images: true,
    },
  });

  return (
    <div className="app-shell app-section">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          {company.companyLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolvePublicMediaUrl(company.companyLogo) ?? company.companyLogo}
              alt={company.companyName ?? "Firma"}
              className="h-14 w-14 rounded-lg border border-zinc-200 object-cover"
            />
          ) : null}
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">{company.companyName}</h1>
            <p className="mt-1 text-sm text-zinc-600">{company.isVerified ? "Firma verificata" : "Firma"}</p>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-zinc-900">Anunturile firmei</h2>
      {listings.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-600">Aceasta firma nu are inca anunturi active.</p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((item) => {
            const image = parseStoredListingImages(item.images)[0] ?? null;
            return (
              <li key={item.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                <Link href={listingSeoPath({ id: item.id, title: item.title, city: item.city })} className="block">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt={item.title} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="h-40 w-full bg-zinc-100" />
                  )}
                  <div className="p-3">
                    <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900">{item.title}</h3>
                    <p className="mt-1 text-sm font-bold text-emerald-700">
                      {formatPrice(item.price, locale, item.priceCurrency as PriceCurrencyCode)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">
                      {item.city}
                      {item.district ? ` · ${item.district}` : ""}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
