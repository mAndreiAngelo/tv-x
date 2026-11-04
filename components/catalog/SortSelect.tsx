"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { SORT_OPTIONS, catalogHref, type CatalogFilters, type SortValue } from "@/lib/filters";

export function SortSelect({ filters }: { filters: CatalogFilters }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      Sortează:
      <select
        value={filters.sort}
        disabled={isPending}
        onChange={(event) => {
          const sort = event.target.value as SortValue;
          startTransition(() => router.push(catalogHref({ ...filters, sort }), { scroll: false }));
        }}
        className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm font-medium text-gray-900"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
