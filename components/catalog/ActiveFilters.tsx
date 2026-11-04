import Link from "next/link";
import { panelLabel, resolutionLabel } from "@/lib/catalog";
import { catalogHref, type CatalogFilters } from "@/lib/filters";

type Chip = { label: string; next: CatalogFilters };

function without<T>(list: T[], value: T) {
  return list.filter((item) => item !== value);
}

/** Removable chips for every active filter; each chip is a plain link to the URL without it. */
export function ActiveFilters({ filters }: { filters: CatalogFilters }) {
  const chips: Chip[] = [
    ...(filters.q ? [{ label: `„${filters.q}”`, next: { ...filters, q: "" } }] : []),
    ...filters.brands.map((b) => ({ label: b, next: { ...filters, brands: without(filters.brands, b) } })),
    ...filters.diagonals.map((d) => ({
      label: `${d}″`,
      next: { ...filters, diagonals: without(filters.diagonals, d) },
    })),
    ...filters.resolutions.map((r) => ({
      label: resolutionLabel(r),
      next: { ...filters, resolutions: without(filters.resolutions, r) },
    })),
    ...filters.panels.map((p) => ({ label: panelLabel(p), next: { ...filters, panels: without(filters.panels, p) } })),
    ...filters.refreshRates.map((r) => ({
      label: `${r} Hz`,
      next: { ...filters, refreshRates: without(filters.refreshRates, r) },
    })),
    ...filters.oses.map((o) => ({ label: o, next: { ...filters, oses: without(filters.oses, o) } })),
  ];
  if (filters.minPrice || filters.maxPrice) {
    const label =
      filters.minPrice && filters.maxPrice
        ? `${filters.minPrice}–${filters.maxPrice} lei`
        : filters.minPrice
          ? `peste ${filters.minPrice} lei`
          : `sub ${filters.maxPrice} lei`;
    chips.push({ label, next: { ...filters, minPrice: null, maxPrice: null } });
  }
  if (filters.minRating) {
    chips.push({ label: `${filters.minRating}★ și peste`, next: { ...filters, minRating: null } });
  }

  if (!chips.length) return null;

  return (
    <ul className="mb-4 flex flex-wrap gap-2" aria-label="Filtre active">
      {chips.map((chip) => (
        <li key={chip.label}>
          <Link
            href={catalogHref(chip.next)}
            scroll={false}
            className="flex items-center gap-1.5 rounded-full border border-accent-100 bg-accent-50 px-3 py-1 text-sm font-medium text-accent-800 hover:border-accent-600"
          >
            {chip.label}
            <span aria-hidden="true">×</span>
            <span className="sr-only">(elimină filtrul)</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
