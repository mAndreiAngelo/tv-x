import type { Metadata } from "next";
import Link from "next/link";
import { CancelPendingOrder } from "@/components/order/OrderClient";

export const metadata: Metadata = { title: "Plată anulată" };

export default async function OrderCancelledPage({ searchParams }: PageProps<"/comanda/anulata">) {
  const raw = (await searchParams).comanda;
  const orderId = typeof raw === "string" ? raw : null;

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      {orderId && <CancelPendingOrder orderId={orderId} />}
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Plata a fost anulată</h1>
      <p className="mt-3 text-gray-600">
        Nu a fost efectuată nicio plată. Produsele au rămas în coș, așa că poți reveni oricând la comandă.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/cos" className="rounded-lg bg-accent-600 px-5 py-3 font-semibold text-white hover:bg-accent-700">
          Înapoi la coș
        </Link>
        <Link href="/televizoare" className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50">
          Continuă cumpărăturile
        </Link>
      </div>
    </div>
  );
}
