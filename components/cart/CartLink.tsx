"use client";

import Link from "next/link";
import { useCartCount } from "@/lib/cart-store";

export function CartLink() {
  const count = useCartCount();
  return (
    <Link
      href="/cos"
      className="relative flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-white hover:bg-accent-700"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L21 8H6.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="20" r="1.3" />
        <circle cx="18" cy="20" r="1.3" />
      </svg>
      Coș
      {count > 0 && (
        <span className="rounded-full bg-white px-1.5 text-xs font-bold text-accent-700">
          {count}
          <span className="sr-only"> {count === 1 ? "produs" : "produse"}</span>
        </span>
      )}
    </Link>
  );
}
