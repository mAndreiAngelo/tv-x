import type { Metadata } from "next";
import Link from "next/link";
import { ClearCartOnce, WaitForPayment } from "@/components/order/OrderClient";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Comandă plasată" };

export default async function OrderSuccessPage({ searchParams }: PageProps<"/comanda/succes">) {
  const raw = (await searchParams).session_id;
  const sessionId = typeof raw === "string" ? raw : "";
  const user = await requireUser(`/comanda/succes?session_id=${encodeURIComponent(sessionId)}`);

  const order = sessionId
    ? await prisma.order.findFirst({ where: { stripeSessionId: sessionId, userId: user.id }, include: { items: true } })
    : null;

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-gray-900">Nu am găsit comanda</h1>
        <p className="mt-2 text-gray-600">Verifică istoricul comenzilor din contul tău.</p>
        <Link href="/cont" className="mt-6 inline-block font-semibold text-accent-600 hover:underline">
          Mergi la contul meu
        </Link>
      </div>
    );
  }

  const paid = order.status !== "PROCESSING";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <ClearCartOnce />
      <div className="rounded-2xl border border-gray-200 p-6 text-center sm:p-10">
        <div
          aria-hidden="true"
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
            paid ? "bg-green-100 text-green-700" : "bg-accent-50 text-accent-700"
          }`}
        >
          {paid ? "✓" : "…"}
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900">
          {paid ? "Mulțumim pentru comandă!" : "Plata se confirmă"}
        </h1>
        <p className="mt-2 text-gray-600">
          Comanda <strong>#{order.number}</strong> – status:{" "}
          <strong className={paid ? "text-green-700" : "text-gray-900"}>{ORDER_STATUS_LABELS[order.status]}</strong>
        </p>
        {paid ? (
          <p className="mt-2 text-sm text-gray-600">
            Ți-am trimis confirmarea pe <strong>{order.email}</strong>. (Demo: emailul apare în consola serverului.)
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-gray-600">
              Stripe a primit plata. Comanda devine „Plătită” imediat ce primim confirmarea securizată (webhook).
            </p>
            <WaitForPayment />
          </>
        )}

        <ul className="mt-8 divide-y divide-gray-200 border-y border-gray-200 text-left text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-3">
              <span>
                {item.quantity} × {item.name}
              </span>
              <span className="whitespace-nowrap font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
          <li className="flex justify-between py-3">
            <span>Livrare</span>
            <span>{order.shippingCost ? formatPrice(order.shippingCost) : "Gratuită"}</span>
          </li>
          <li className="flex justify-between py-3 text-base font-bold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </li>
        </ul>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/cont" className="rounded-lg bg-accent-600 px-5 py-3 font-semibold text-white hover:bg-accent-700">
            Vezi comenzile mele
          </Link>
          <Link href="/televizoare" className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50">
            Continuă cumpărăturile
          </Link>
        </div>
      </div>
    </div>
  );
}
