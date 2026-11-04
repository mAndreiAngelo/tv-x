import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = { title: "Coș de cumpărături" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-gray-900">Coșul meu</h1>
      <CartView />
    </div>
  );
}
