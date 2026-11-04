import type { Metadata } from "next";
import Link from "next/link";
import { ActiveFilters } from "@/components/catalog/ActiveFilters";
import { FilterPanel } from "@/components/catalog/FilterPanel";
import { SortSelect } from "@/components/catalog/SortSelect";
import { ProductGrid } from "@/components/product/ProductGrid";
import { parseFilters } from "@/lib/filters";
import { searchProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Televizoare",
  description: "Toate televizoarele TV X: LED, QLED, OLED și Mini LED, de la 32″ la 85″.",
};

export default async function CatalogPage({ searchParams }: PageProps<"/televizoare">) {
  const filters = parseFilters(await searchParams);
  const products = await searchProducts(filters);
  const count = products.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          {filters.q ? `Rezultate pentru „${filters.q}”` : "Televizoare"}
        </h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <FilterPanel filters={filters} />
        </aside>

        <section aria-labelledby="lista-produse">
          <h2 id="lista-produse" className="sr-only">
            Lista de produse
          </h2>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600" role="status">
              {count === 1 ? "1 produs" : `${count} produse`}
            </p>
            <SortSelect filters={filters} />
          </div>
          <ActiveFilters filters={filters} />

          {count > 0 ? (
            <ProductGrid products={products} columns={3} />
          ) : (
            <div className="rounded-xl bg-section px-6 py-16 text-center">
              <p className="text-lg font-semibold text-gray-900">Niciun televizor nu corespunde filtrelor alese.</p>
              <p className="mt-1 text-gray-600">Încearcă să elimini câteva filtre sau să cauți alt termen.</p>
              <Link
                href="/televizoare"
                className="mt-4 inline-block rounded-lg bg-accent-600 px-4 py-2 font-semibold text-white hover:bg-accent-700"
              >
                Vezi toate televizoarele
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
