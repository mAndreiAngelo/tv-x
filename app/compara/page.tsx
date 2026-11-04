import type { Metadata } from "next";
import Link from "next/link";
import { CompareFromStorage, RemoveFromCompareButton } from "@/components/compare/CompareClient";
import { Price } from "@/components/product/Price";
import { Stars } from "@/components/product/Stars";
import { StockStatus } from "@/components/product/StockStatus";
import { TvImage } from "@/components/product/TvImage";
import { getProductsForComparison } from "@/lib/products";

export const metadata: Metadata = { title: "Compară televizoare" };

type Row = { label: string; values: string[] };
type Group = { title: string; rows: Row[] };

export default async function ComparePage({ searchParams }: PageProps<"/compara">) {
  const raw = (await searchParams).produse;
  const slugs = (Array.isArray(raw) ? raw.join(",") : (raw ?? ""))
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const products = slugs.length ? await getProductsForComparison(slugs) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-gray-900">Compară televizoare</h1>

      {products.length === 0 ? (
        <CompareFromStorage />
      ) : (
        <CompareTable products={products} />
      )}
    </div>
  );
}

function CompareTable({ products }: { products: Awaited<ReturnType<typeof getProductsForComparison>> }) {
  // Union of all spec groups/rows, in the order they appear on the first product
  const groups: Group[] = [];
  for (const product of products) {
    for (const [title, rows] of Object.entries(product.specs)) {
      let group = groups.find((g) => g.title === title);
      if (!group) groups.push((group = { title, rows: [] }));
      for (const label of Object.keys(rows)) {
        if (!group.rows.some((r) => r.label === label)) group.rows.push({ label, values: [] });
      }
    }
  }
  for (const group of groups) {
    for (const row of group.rows) {
      row.values = products.map((p) => p.specs[group.title]?.[row.label] ?? "–");
    }
  }

  const differs = (values: string[]) => products.length > 1 && new Set(values).size > 1;
  const colWidth = products.length === 3 ? "w-[27%]" : products.length === 2 ? "w-[38%]" : "w-[60%]";

  return (
    <>
      <p className="mb-4 flex items-center gap-2 text-sm text-gray-600">
        <span className="inline-block h-3 w-6 rounded-sm border border-amber-300 bg-amber-50" aria-hidden="true" />
        Rândurile evidențiate au valori diferite între produse.
      </p>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[640px] table-fixed text-sm">
          <caption className="sr-only">
            Comparație între {products.map((p) => p.name).join(", ")}. Rândurile marcate „diferit” au valori diferite.
          </caption>
          <thead>
            <tr className="align-top">
              <td className="w-[19%] bg-section p-4" />
              {products.map((product) => (
                <th key={product.id} scope="col" className={`${colWidth} p-4 text-left font-normal`}>
                  <TvImage
                    brand={product.brand}
                    diagonal={product.diagonal}
                    hue={product.colorHue}
                    label=""
                    className="aspect-[4/3] w-full rounded-lg"
                  />
                  <Link
                    href={`/televizoare/${product.slug}`}
                    className="mt-3 block text-base font-semibold text-gray-900 hover:text-accent-600"
                  >
                    {product.name}
                  </Link>
                  <div className="mt-2">
                    <Price price={product.price} oldPrice={product.oldPrice} />
                  </div>
                  <div className="mt-1">
                    <Stars rating={product.ratingAvg} count={product.reviewCount} />
                  </div>
                  <div className="mt-1">
                    <StockStatus stock={product.stock} />
                  </div>
                  <div className="mt-3">
                    <RemoveFromCompareButton
                      id={product.id}
                      name={product.name}
                      remainingSlugs={products.filter((p) => p.id !== product.id).map((p) => p.slug)}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          {groups.map((group) => (
            <tbody key={group.title}>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={products.length + 1}
                  className="border-t border-gray-200 bg-section px-4 py-2 text-left text-sm font-semibold text-gray-900"
                >
                  {group.title}
                </th>
              </tr>
              {group.rows.map((row) => {
                const isDifferent = differs(row.values);
                return (
                  <tr key={row.label} className={`border-t border-gray-100 ${isDifferent ? "bg-amber-50" : ""}`}>
                    <th scope="row" className="px-4 py-2 text-left font-normal text-gray-600">
                      {row.label}
                      {isDifferent && <span className="sr-only"> (diferit)</span>}
                    </th>
                    {row.values.map((value, i) => (
                      <td key={products[i].id} className={`px-4 py-2 text-gray-900 ${isDifferent ? "font-semibold" : ""}`}>
                        {value}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      </div>
      {products.length < 3 && (
        <p className="mt-4 text-sm text-gray-600">
          Poți adăuga până la 3 televizoare.{" "}
          <Link href="/televizoare" className="font-semibold text-accent-600 hover:underline">
            Alege din catalog
          </Link>
        </p>
      )}
    </>
  );
}
