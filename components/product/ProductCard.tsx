import Link from "next/link";
import { panelLabel, resolutionLabel } from "@/lib/catalog";
import { discountPercent } from "@/lib/format";
import type { ProductCardData } from "@/lib/products";
import { Price } from "./Price";
import { Stars } from "./Stars";
import { StockStatus } from "./StockStatus";
import { TvImage } from "./TvImage";

export function ProductCard({ product }: { product: ProductCardData }) {
  const discount = discountPercent(product.price, product.oldPrice);
  const href = `/televizoare/${product.slug}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative">
        <TvImage
          brand={product.brand}
          diagonal={product.diagonal}
          hue={product.colorHue}
          label={`Imagine ilustrativă ${product.name}`}
          className={`aspect-[4/3] w-full ${product.stock <= 0 ? "opacity-60" : ""}`}
        />
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-md bg-red-600 px-2 py-1 text-xs font-bold text-white">
            -{discount}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base font-semibold leading-snug text-gray-900">
          <Link href={href} className="after:absolute after:inset-0 hover:text-accent-600">
            {product.name}
          </Link>
        </h3>
        <p className="text-sm text-gray-600">
          {product.diagonal}″ ({Math.round(product.diagonal * 2.54)} cm) · {resolutionLabel(product.resolution)} ·{" "}
          {panelLabel(product.panelType)}
        </p>
        <Stars rating={product.ratingAvg} count={product.reviewCount} />
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <Price price={product.price} oldPrice={product.oldPrice} />
        </div>
        <StockStatus stock={product.stock} />
      </div>
    </article>
  );
}
