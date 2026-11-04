"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TvImage } from "@/components/product/TvImage";
import { MAX_COMPARE, clearCompare, compareHref, removeFromCompare, useCompareItems } from "@/lib/compare-store";

/** Fixed bar at the bottom of the screen with the products selected for comparison. */
export function CompareBar() {
  const items = useCompareItems();
  const pathname = usePathname();

  if (!items.length || pathname === "/compara") return null;

  return (
    <>
      {/* Spacer so the fixed bar never covers the end of the page */}
      <div className="h-28" aria-hidden="true" />
      <section
        aria-label="Produse selectate pentru comparație"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <ul className="flex flex-1 gap-2 overflow-x-auto">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex min-w-0 shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white py-1 pl-1 pr-2"
              >
                <TvImage brand={item.brand} diagonal={item.diagonal} hue={item.colorHue} label="" className="h-10 w-14 rounded" />
                <span className="max-w-36 truncate text-sm font-medium text-gray-900">{item.name}</span>
                <button
                  type="button"
                  onClick={() => removeFromCompare(item.id)}
                  className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                >
                  <span aria-hidden="true">×</span>
                  <span className="sr-only">Elimină {item.name} din comparație</span>
                </button>
              </li>
            ))}
            {Array.from({ length: MAX_COMPARE - items.length }, (_, i) => (
              <li
                key={`empty-${i}`}
                className="hidden w-40 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 sm:flex"
              >
                Adaugă un produs
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <button type="button" onClick={clearCompare} className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Golește
            </button>
            {items.length >= 2 ? (
              <Link
                href={compareHref(items)}
                className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-700"
              >
                Vezi comparația ({items.length})
              </Link>
            ) : (
              <span className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-600">
                Alege încă un produs
              </span>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
