import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { RefreshOnCartSync } from "@/components/checkout/RefreshOnCartSync";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { priceCart } from "@/lib/pricing";
import { requireUser } from "@/lib/session";
import { stripeStatus } from "@/lib/stripe";

export const metadata: Metadata = { title: "Checkout – date de livrare" };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");

  const [addresses, saved] = await Promise.all([
    prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    }),
    prisma.cartItem.findMany({ where: { userId: user.id }, select: { productId: true, quantity: true } }),
  ]);
  const cart = await priceCart(saved);
  const status = stripeStatus();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <RefreshOnCartSync />
      <ol className="mb-6 flex flex-wrap gap-2 text-sm" aria-label="Pașii comenzii">
        <li className="text-gray-500">1. Coș ✓</li>
        <li aria-hidden="true" className="text-gray-400">→</li>
        <li aria-current="step" className="font-semibold text-accent-700">2. Date de livrare</li>
        <li aria-hidden="true" className="text-gray-400">→</li>
        <li className="text-gray-500">3. Plată</li>
        <li aria-hidden="true" className="text-gray-400">→</li>
        <li className="text-gray-500">4. Confirmare</li>
      </ol>
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-gray-900">Date de livrare</h1>

      {!status.ready && (
        <div role="alert" className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Plățile Stripe nu sunt configurate.</p>
          <p className="mt-1">
            {status.reason === "live-key"
              ? "Cheia Stripe din .env nu este o cheie de test. Acest proiect demonstrativ acceptă doar chei sk_test_."
              : "Adaugă STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY și STRIPE_WEBHOOK_SECRET (chei de test) în fișierul .env, apoi repornește serverul."}
          </p>
        </div>
      )}

      {cart.itemCount === 0 ? (
        <div className="rounded-xl bg-section px-6 py-16 text-center">
          <p className="text-lg font-semibold text-gray-900">Coșul tău este gol.</p>
          <Link
            href="/televizoare"
            className="mt-4 inline-block rounded-lg bg-accent-600 px-4 py-2 font-semibold text-white hover:bg-accent-700"
          >
            Vezi televizoarele
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <section aria-label="Formular date de livrare">
            <p className="mb-4 text-sm text-gray-600">
              Comanda va fi trimisă pe adresa de email <strong>{user.email}</strong>.
            </p>
            <CheckoutForm
              addresses={addresses}
              defaultName={user.name}
              paymentsReady={status.ready}
              canPay={!cart.lines.some((l) => l.adjusted)}
            />
          </section>

          <aside aria-labelledby="sumar-checkout" className="h-fit rounded-xl bg-section p-6 lg:sticky lg:top-24">
            <h2 id="sumar-checkout" className="text-lg font-bold text-gray-900">
              Comanda ta
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {cart.lines.map((line) => (
                <li key={line.product.id} className="flex justify-between gap-3">
                  <span className="text-gray-800">
                    {line.quantity} × {line.product.name}
                    {line.adjusted && (
                      <span className="block text-xs text-red-700">
                        Stoc disponibil: {line.maxAllowed} buc. – actualizează coșul.
                      </span>
                    )}
                  </span>
                  <span className="whitespace-nowrap font-medium text-gray-900">{formatPrice(line.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-gray-300 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-700">Subtotal</dt>
                <dd className="font-medium text-gray-900">{formatPrice(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-700">Livrare</dt>
                <dd className="font-medium text-gray-900">
                  {cart.shippingCost === 0 ? <span className="text-green-700">Gratuită</span> : formatPrice(cart.shippingCost)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-3 text-base">
                <dt className="font-bold text-gray-900">Total</dt>
                <dd className="font-extrabold text-gray-900">{formatPrice(cart.total)}</dd>
              </div>
            </dl>
            <p className="mt-1 text-xs text-gray-500">Prețurile includ TVA.</p>
            <Link href="/cos" className="mt-4 block text-center text-sm font-medium text-accent-600 hover:underline">
              Modifică coșul
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
