"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { compareHref, removeFromCompare, useCompareItems } from "@/lib/compare-store";

/** On /compara without products in the URL, loads the selection saved in localStorage. */
export function CompareFromStorage() {
  const items = useCompareItems();
  const router = useRouter();

  useEffect(() => {
    if (items.length) router.replace(compareHref(items));
  }, [items, router]);

  if (items.length) return <p className="text-gray-600">Se încarcă selecția…</p>;

  return (
    <div className="rounded-xl bg-section px-6 py-16 text-center">
      <p className="text-lg font-semibold text-gray-900">Nu ai ales niciun televizor pentru comparație.</p>
      <p className="mt-1 text-gray-600">
        Bifează „Compară” pe cel mult 3 produse din catalog, apoi apasă „Vezi comparația”.
      </p>
      <Link
        href="/televizoare"
        className="mt-4 inline-block rounded-lg bg-accent-600 px-4 py-2 font-semibold text-white hover:bg-accent-700"
      >
        Mergi la catalog
      </Link>
    </div>
  );
}

/** Removes a product from the comparison (localStorage + URL). */
export function RemoveFromCompareButton({
  id,
  name,
  remainingSlugs,
}: {
  id: string;
  name: string;
  remainingSlugs: string[];
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        removeFromCompare(id);
        router.replace(remainingSlugs.length ? compareHref(remainingSlugs.map((slug) => ({ slug }))) : "/compara");
      }}
      className="text-sm font-medium text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline"
    >
      Elimină<span className="sr-only"> {name} din comparație</span>
    </button>
  );
}
