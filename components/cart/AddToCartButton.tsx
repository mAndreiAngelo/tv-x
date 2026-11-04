"use client";

import Link from "next/link";
import { useState } from "react";
import { addToCart, useCartLines } from "@/lib/cart-store";

type AddToCartButtonProps = {
  productId: string;
  stock: number;
};

const MAX_PER_PRODUCT = 10;

export function AddToCartButton({ productId, stock }: AddToCartButtonProps) {
  const lines = useCartLines();
  const [added, setAdded] = useState(false);
  const inCart = lines.find((l) => l.productId === productId)?.quantity ?? 0;
  const limit = Math.min(stock, MAX_PER_PRODUCT);

  if (stock <= 0) {
    return (
      <button
        type="button"
        disabled
        className="w-full cursor-not-allowed rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-600"
      >
        Stoc epuizat
      </button>
    );
  }

  const atLimit = inCart >= limit;

  return (
    <div>
      <button
        type="button"
        disabled={atLimit}
        onClick={() => {
          addToCart(productId);
          setAdded(true);
        }}
        className="w-full rounded-lg bg-accent-600 px-6 py-3 font-semibold text-white hover:bg-accent-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
      >
        {atLimit ? "Cantitatea maximă este deja în coș" : "Adaugă în coș"}
      </button>
      <p role="status" className="mt-2 min-h-5 text-sm text-green-800">
        {added && inCart > 0 && (
          <>
            Produsul a fost adăugat în coș ({inCart} buc.).{" "}
            <Link href="/cos" className="font-semibold text-accent-600 hover:underline">
              Vezi coșul
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
