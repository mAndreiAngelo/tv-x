import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { TvImage } from "@/components/product/TvImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatPrice } from "@/lib/format";
import { getDiagonalSummary, getDiscountedProducts, getFeaturedProducts } from "@/lib/products";

export default async function HomePage() {
  const [featured, discounted, diagonals] = await Promise.all([
    getFeaturedProducts(8),
    getDiscountedProducts(4),
    getDiagonalSummary(),
  ]);

  return (
    <>
      {/* Hero banner */}
      <section className="bg-gradient-to-br from-accent-700 to-accent-800 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent-100">Noua colecție</p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Televizorul potrivit pentru fiecare cameră
            </h1>
            <p className="mt-4 max-w-md text-lg text-accent-100">
              LED, QLED, OLED și Mini LED, de la 32″ la 85″. Livrare gratuită pentru comenzile de peste 1.000 lei.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/televizoare"
                className="rounded-lg bg-white px-5 py-3 font-semibold text-accent-700 hover:bg-accent-50"
              >
                Vezi toate televizoarele
              </Link>
              <Link
                href="/televizoare?panou=OLED"
                className="rounded-lg border border-white/60 px-5 py-3 font-semibold text-white hover:bg-white/10"
              >
                Descoperă OLED
              </Link>
            </div>
          </div>
          <TvImage
            brand="TV X"
            diagonal={65}
            hue={205}
            label="Ilustrație televizor"
            className="hidden w-full rounded-2xl md:block"
          />
        </div>
      </section>

      {/* Categories by diagonal */}
      <section aria-labelledby="diagonale" className="bg-section">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <SectionHeading id="diagonale" title="Alege după diagonală" />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {diagonals.map((d) => (
              <li key={d.diagonal}>
                <Link
                  href={`/televizoare?diagonala=${d.diagonal}`}
                  className="flex h-full flex-col items-center rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:border-accent-600 hover:shadow-md"
                >
                  <span className="text-3xl font-extrabold text-gray-900">{d.diagonal}″</span>
                  <span className="text-sm text-gray-600">{Math.round(d.diagonal * 2.54)} cm</span>
                  <span className="mt-2 text-xs text-gray-600">
                    {d.count} {d.count === 1 ? "model" : "modele"}
                  </span>
                  <span className="text-xs text-gray-600">de la</span>
                  <span className="whitespace-nowrap text-xs font-semibold text-accent-700">
                    {formatPrice(d.minPrice)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Featured */}
      <section aria-labelledby="recomandate" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionHeading
          id="recomandate"
          title="Recomandate"
          link={{ href: "/televizoare?sortare=rating", label: "Cele mai bine evaluate" }}
        />
        <ProductGrid products={featured} />
      </section>

      {/* Discounts */}
      <section aria-labelledby="reduceri" className="bg-section">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <SectionHeading id="reduceri" title="La reducere" />
          <ProductGrid products={discounted} />
        </div>
      </section>
    </>
  );
}
