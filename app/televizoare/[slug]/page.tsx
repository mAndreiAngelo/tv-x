import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { Price } from "@/components/product/Price";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SpecsTable } from "@/components/product/SpecsTable";
import { Stars } from "@/components/product/Stars";
import { StockStatus } from "@/components/product/StockStatus";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST, panelLabel, resolutionLabel } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { getProductBySlug, getSimilarProducts } from "@/lib/products";
import { getCurrentUser } from "@/lib/session";

export async function generateMetadata({ params }: PageProps<"/televizoare/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produs inexistent" };
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params, searchParams }: PageProps<"/televizoare/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const reviewSort = (await searchParams).recenzii === "utile" ? "utile" : "noi";
  const [similar, user] = await Promise.all([getSimilarProducts(product), getCurrentUser()]);

  const highlights = [
    `Diagonală ${product.diagonal}″ (${Math.round(product.diagonal * 2.54)} cm)`,
    `Rezoluție ${resolutionLabel(product.resolution)}`,
    `Panou ${panelLabel(product.panelType)}`,
    `Rată de refresh ${product.refreshRate} Hz`,
    product.smartOs === "Fără Smart TV" ? "Fără Smart TV" : `Smart TV cu ${product.smartOs}`,
  ];
  const freeShipping = product.price >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-600">
        <ol className="flex flex-wrap gap-1.5">
          <li>
            <Link href="/" className="hover:text-accent-600">Acasă</Link> /
          </li>
          <li>
            <Link href="/televizoare" className="hover:text-accent-600">Televizoare</Link> /
          </li>
          <li>
            <Link href={`/televizoare?brand=${product.brand}`} className="hover:text-accent-600">
              {product.brand}
            </Link>{" "}
            /
          </li>
          <li aria-current="page" className="text-gray-900">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery name={product.name} brand={product.brand} diagonal={product.diagonal} hue={product.colorHue} />

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent-600">{product.brand}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
          <p className="mt-1 text-sm text-gray-600">Model: {product.model}</p>

          <a href="#recenzii" className="mt-3 inline-flex hover:underline">
            <Stars rating={product.ratingAvg} count={product.reviewCount} size="md" />
          </a>

          <ul className="mt-5 space-y-1.5 text-sm text-gray-800">
            {highlights.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-accent-600">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-xl border border-gray-200 p-5">
            <Price price={product.price} oldPrice={product.oldPrice} size="lg" />
            <p className="mt-1 text-xs text-gray-600">Prețul include TVA.</p>
            <div className="mt-3">
              <StockStatus stock={product.stock} />
            </div>
            <div className="mt-4">
              <AddToCartButton productId={product.id} stock={product.stock} />
            </div>
            <p className="mt-3 text-sm text-gray-600">
              {freeShipping
                ? "Livrare gratuită pentru acest produs."
                : `Livrare ${formatPrice(SHIPPING_COST)}, gratuită pentru comenzi de peste ${formatPrice(FREE_SHIPPING_THRESHOLD)}.`}
            </p>
          </div>

          <p className="mt-6 leading-relaxed text-gray-700">{product.description}</p>
        </div>
      </div>

      <section aria-labelledby="specificatii" className="mt-14">
        <SectionHeading id="specificatii" title="Specificații tehnice" />
        <SpecsTable specs={product.specs} />
      </section>

      <ReviewsSection product={product} sort={reviewSort} user={user} />

      {similar.length > 0 && (
        <section aria-labelledby="similare" className="mt-14">
          <SectionHeading id="similare" title="Produse similare" />
          <ProductGrid products={similar} />
        </section>
      )}
    </div>
  );
}
