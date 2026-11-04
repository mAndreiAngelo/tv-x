import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/app/autentificare/actions";
import { AddressBook } from "@/components/account/AddressBook";
import { Stars } from "@/components/product/Stars";
import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { MAX_ADDRESSES } from "@/lib/validation/checkout";
import type { OrderStatus } from "@/lib/generated/prisma/client";

export const metadata: Metadata = { title: "Contul meu" };

const STATUS_STYLES: Record<OrderStatus, string> = {
  PROCESSING: "bg-gray-100 text-gray-800",
  PAID: "bg-accent-50 text-accent-800",
  SHIPPED: "bg-amber-50 text-amber-900",
  DELIVERED: "bg-green-50 text-green-800",
};

const SECTIONS = [
  { id: "comenzi", label: "Comenzile mele" },
  { id: "adrese", label: "Adrese salvate" },
  { id: "recenzii", label: "Recenziile mele" },
];

export default async function AccountPage() {
  const user = await requireUser("/cont");

  const [orders, addresses, reviews] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      include: { items: { include: { product: { select: { slug: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    }),
    prisma.review.findMany({
      where: { userId: user.id },
      include: { product: { select: { name: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Contul meu</h1>
          <p className="mt-1 text-gray-600">
            {user.name} · {user.email}
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Ieși din cont
          </button>
        </form>
      </header>

      <nav aria-label="Secțiuni cont" className="mt-6 flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-800 hover:border-accent-600 hover:text-accent-700"
          >
            {s.label}
          </a>
        ))}
      </nav>

      {/* Orders */}
      <section id="comenzi" aria-labelledby="comenzi-titlu" className="mt-8 scroll-mt-24">
        <h2 id="comenzi-titlu" className="text-xl font-bold text-gray-900">
          Comenzile mele
        </h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-gray-600">
            Nu ai plasat încă nicio comandă.{" "}
            <Link href="/televizoare" className="font-semibold text-accent-600 hover:underline">
              Vezi televizoarele
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {orders.map((order) => {
              const count = order.items.reduce((sum, i) => sum + i.quantity, 0);
              return (
                <li key={order.id}>
                  <details className="group rounded-xl border border-gray-200">
                    <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-6 gap-y-2 p-4">
                      <span className="font-semibold text-gray-900">Comanda #{order.number}</span>
                      <span className="text-sm text-gray-600">
                        <time dateTime={order.createdAt.toISOString()}>{formatDate(order.createdAt)}</time>
                      </span>
                      <span className="text-sm text-gray-600">
                        {count} {count === 1 ? "produs" : "produse"}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                      <span className="ml-auto font-bold text-gray-900">{formatPrice(order.total)}</span>
                      <span aria-hidden="true" className="text-gray-600 transition group-open:rotate-180">
                        ▾
                      </span>
                    </summary>
                    <div className="border-t border-gray-200 p-4 text-sm">
                      <ul className="space-y-2">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex justify-between gap-4">
                            <Link
                              href={`/televizoare/${item.product.slug}`}
                              className="text-gray-800 hover:text-accent-600 hover:underline"
                            >
                              {item.quantity} × {item.name}
                            </Link>
                            <span className="whitespace-nowrap">{formatPrice(item.unitPrice * item.quantity)}</span>
                          </li>
                        ))}
                        <li className="flex justify-between gap-4 text-gray-600">
                          <span>Livrare</span>
                          <span>{order.shippingCost ? formatPrice(order.shippingCost) : "Gratuită"}</span>
                        </li>
                      </ul>
                      <p className="mt-3 text-gray-600">
                        Livrare la: {order.fullName}, {order.street}, {order.city}, jud. {order.county}
                      </p>
                      {order.status === "PROCESSING" && (
                        <p className="mt-2 text-gray-600">Așteptăm confirmarea plății de la Stripe.</p>
                      )}
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Addresses */}
      <section id="adrese" aria-labelledby="adrese-titlu" className="mt-12 scroll-mt-24">
        <h2 id="adrese-titlu" className="mb-4 text-xl font-bold text-gray-900">
          Adrese salvate
        </h2>
        <AddressBook addresses={addresses} max={MAX_ADDRESSES} />
      </section>

      {/* Reviews */}
      <section id="recenzii" aria-labelledby="recenzii-cont-titlu" className="mt-12 scroll-mt-24">
        <h2 id="recenzii-cont-titlu" className="text-xl font-bold text-gray-900">
          Recenziile mele
        </h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-gray-600">Nu ai scris încă nicio recenzie.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Link
                    href={`/televizoare/${review.product.slug}#recenzii`}
                    className="font-semibold text-gray-900 hover:text-accent-600 hover:underline"
                  >
                    {review.product.name}
                  </Link>
                  <Stars rating={review.rating} />
                  <time dateTime={review.createdAt.toISOString()} className="text-sm text-gray-600">
                    {formatDate(review.createdAt)}
                  </time>
                </div>
                <p className="mt-2 text-gray-800">{review.text}</p>
                {review.helpfulCount > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {review.helpfulCount === 1
                      ? "O persoană a găsit-o utilă"
                      : `${review.helpfulCount} persoane au găsit-o utilă`}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
