"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { quoteCart } from "@/app/cos/actions";
import { Price } from "@/components/product/Price";
import { TvImage } from "@/components/product/TvImage";
import { removeFromCart, replaceCart, setCartQuantity, useCartLines } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";

type Quote = NonNullable<Awaited<ReturnType<typeof quoteCart>>>;

export function CartView() {
  const hydrated = useHydrated();
  const lines = useCartLines();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [notice, setNotice] = useState("");
  const [isPending, startTransition] = useTransition();

  // Re-price on the server every time the cart changes
  useEffect(() => {
    if (!lines.length) return;
    let cancelled = false;
    startTransition(async () => {
      const result = await quoteCart(lines);
      if (cancelled || !result) return;
      setQuote(result);

      // Apply server corrections (removed products, quantities above stock)
      if (result.missingProductIds.length || result.lines.some((l) => l.adjusted)) {
        setNotice("Am actualizat coșul în funcție de stocul disponibil.");
        replaceCart(
          lines
            .map((line) => {
              const priced = result.lines.find((l) => l.product.id === line.productId);
              return priced ? { productId: line.productId, quantity: priced.quantity } : null;
            })
            .filter((l): l is NonNullable<typeof l> => l !== null && l.quantity > 0),
        );
      }
    });
    return () => {
      cancelled = true;
    };
  }, [lines]);

  if (!hydrated || (lines.length > 0 && !quote)) {
    return <p className="py-16 text-center text-gray-600">Se încarcă coșul…</p>;
  }

  if (!lines.length) {
    return (
      <div className="rounded-xl bg-section px-6 py-16 text-center">
        <p className="text-lg font-semibold text-gray-900">Coșul tău este gol.</p>
        <p className="mt-1 text-gray-600">Descoperă televizoarele noastre și adaugă-le în coș.</p>
        <Link
          href="/televizoare"
          className="mt-4 inline-block rounded-lg bg-accent-600 px-4 py-2 font-semibold text-white hover:bg-accent-700"
        >
          Vezi televizoarele
        </Link>
      </div>
    );
  }

  const q = quote!;
  // Keep the order in which products were added
  const ordered = lines
    .map((line) => q.lines.find((l) => l.product.id === line.productId))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));
  const remainingForFree = q.freeShippingThreshold - q.subtotal;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]" aria-busy={isPending}>
      <section aria-label="Produse în coș">
        {notice && (
          <p role="status" className="mb-4 rounded-lg bg-accent-50 px-4 py-3 text-sm text-accent-800">
            {notice}
          </p>
        )}
        <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200">
          {ordered.map(({ product, quantity, maxAllowed, lineTotal }) => (
            <li key={product.id} className="flex gap-4 p-4">
              <Link href={`/televizoare/${product.slug}`} className="shrink-0">
                <TvImage
                  brand={product.brand}
                  diagonal={product.diagonal}
                  hue={product.colorHue}
                  label=""
                  className="h-20 w-28 rounded-lg sm:h-24 sm:w-32"
                />
              </Link>
              <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Link href={`/televizoare/${product.slug}`} className="font-semibold text-gray-900 hover:text-accent-600">
                    {product.name}
                  </Link>
                  <div className="mt-1 text-sm">
                    <Price price={product.price} oldPrice={product.oldPrice} />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    className="mt-2 text-sm font-medium text-gray-600 hover:text-red-700 hover:underline"
                  >
                    Șterge<span className="sr-only"> {product.name} din coș</span>
                  </button>
                </div>
                <div className="flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <QuantityControl
                    name={product.name}
                    quantity={quantity}
                    max={maxAllowed}
                    onChange={(value) => setCartQuantity(product.id, value)}
                  />
                  <p className="font-bold text-gray-900">
                    <span className="sr-only">Total produs: </span>
                    {formatPrice(lineTotal)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <aside
        aria-labelledby="sumar-comanda"
        className={`h-fit rounded-xl bg-section p-6 transition-opacity lg:sticky lg:top-24 ${isPending ? "opacity-60" : ""}`}
      >
        <h2 id="sumar-comanda" className="text-lg font-bold text-gray-900">
          Sumar comandă
        </h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-700">Subtotal ({q.itemCount} {q.itemCount === 1 ? "produs" : "produse"})</dt>
            <dd className="font-medium text-gray-900">{formatPrice(q.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-700">Livrare</dt>
            <dd className="font-medium text-gray-900">
              {q.shippingCost === 0 ? <span className="text-green-700">Gratuită</span> : formatPrice(q.shippingCost)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-gray-300 pt-3 text-base">
            <dt className="font-bold text-gray-900">Total</dt>
            <dd className="font-extrabold text-gray-900">{formatPrice(q.total)}</dd>
          </div>
        </dl>
        <p className="mt-1 text-xs text-gray-600">Prețurile includ TVA.</p>

        {remainingForFree > 0 && (
          <p className="mt-4 rounded-lg bg-white px-3 py-2 text-sm text-gray-700">
            Mai adaugă produse de <strong>{formatPrice(remainingForFree)}</strong> pentru livrare gratuită.
          </p>
        )}

        <Link
          href="/checkout"
          className="mt-6 block rounded-lg bg-accent-600 px-4 py-3 text-center font-semibold text-white hover:bg-accent-700"
        >
          Continuă spre checkout
        </Link>
        <Link href="/televizoare" className="mt-3 block text-center text-sm font-medium text-accent-600 hover:underline">
          Continuă cumpărăturile
        </Link>
      </aside>
    </div>
  );
}

function QuantityControl({
  name,
  quantity,
  max,
  onChange,
}: {
  name: string;
  quantity: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center rounded-lg border border-gray-300" role="group" aria-label={`Cantitate ${name}`}>
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= 1}
        className="h-9 w-9 text-lg text-gray-700 hover:bg-gray-100 disabled:text-gray-300"
      >
        <span aria-hidden="true">−</span>
        <span className="sr-only">Scade cantitatea</span>
      </button>
      <input
        type="number"
        min={1}
        max={max}
        value={quantity}
        onChange={(event) => {
          const value = Number(event.target.value);
          if (Number.isInteger(value) && value >= 1) onChange(Math.min(value, max));
        }}
        aria-label={`Cantitate ${name}`}
        className="h-9 w-12 border-x border-gray-300 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= max}
        className="h-9 w-9 text-lg text-gray-700 hover:bg-gray-100 disabled:text-gray-300"
      >
        <span aria-hidden="true">+</span>
        <span className="sr-only">Crește cantitatea</span>
      </button>
    </div>
  );
}
