"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";
import {
  BRANDS,
  DIAGONALS,
  PANEL_LABELS,
  PANEL_TYPES,
  REFRESH_RATES,
  RESOLUTION_LABELS,
  RESOLUTIONS,
  SMART_OSES,
} from "@/lib/catalog";
import {
  MIN_RATING_OPTIONS,
  PARAM,
  catalogHref,
  hasActiveFilters,
  parseFilters,
  type CatalogFilters,
} from "@/lib/filters";

type Option = { value: string; label: string };

const GROUPS: { param: string; title: string; key: keyof CatalogFilters; options: Option[] }[] = [
  { param: PARAM.brand, title: "Brand", key: "brands", options: BRANDS.map((b) => ({ value: b, label: b })) },
  {
    param: PARAM.diagonal,
    title: "Diagonală",
    key: "diagonals",
    options: DIAGONALS.map((d) => ({ value: String(d), label: `${d}″ (${Math.round(d * 2.54)} cm)` })),
  },
  {
    param: PARAM.resolution,
    title: "Rezoluție",
    key: "resolutions",
    options: RESOLUTIONS.map((r) => ({ value: r, label: RESOLUTION_LABELS[r] })),
  },
  {
    param: PARAM.panel,
    title: "Tip panou",
    key: "panels",
    options: PANEL_TYPES.map((p) => ({ value: p, label: PANEL_LABELS[p] })),
  },
  {
    param: PARAM.refresh,
    title: "Rată de refresh",
    key: "refreshRates",
    options: REFRESH_RATES.map((r) => ({ value: String(r), label: `${r} Hz` })),
  },
  {
    param: PARAM.os,
    title: "Smart TV / sistem de operare",
    key: "oses",
    options: SMART_OSES.map((o) => ({ value: o, label: o })),
  },
];

export function FilterPanel({ filters }: { filters: CatalogFilters }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCount =
    filters.brands.length +
    filters.diagonals.length +
    filters.resolutions.length +
    filters.panels.length +
    filters.refreshRates.length +
    filters.oses.length +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.minRating ? 1 : 0);

  function apply(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    const params = new URLSearchParams();
    for (const [key, value] of data.entries()) params.append(key, String(value));
    const next = parseFilters(params);
    startTransition(() => router.push(catalogHref(next), { scroll: false }));
  }

  const submitOnChange = () => formRef.current?.requestSubmit();

  return (
    <div>
      <button
        type="button"
        onClick={() => setMobileOpen((open) => !open)}
        aria-expanded={mobileOpen}
        aria-controls="filtre-catalog"
        className="mb-4 flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 lg:hidden"
      >
        <span>Filtre{activeCount ? ` (${activeCount})` : ""}</span>
        <span aria-hidden="true">{mobileOpen ? "−" : "+"}</span>
      </button>

      {/* Plain GET form: works without JavaScript, enhanced with instant client-side navigation. */}
      <form
        id="filtre-catalog"
        ref={formRef}
        key={catalogHref(filters)}
        method="get"
        action="/televizoare"
        onSubmit={apply}
        aria-label="Filtre produse"
        aria-busy={isPending}
        className={`${mobileOpen ? "block" : "hidden"} space-y-1 lg:block ${isPending ? "opacity-70" : ""}`}
      >
        {filters.q && <input type="hidden" name={PARAM.q} value={filters.q} />}
        {filters.sort && <input type="hidden" name={PARAM.sort} value={filters.sort} />}

        {GROUPS.map((group) => {
          const selected = (filters[group.key] as (string | number)[]).map(String);
          return (
            <FilterGroup key={group.param} title={group.title} defaultOpen={group.key !== "oses" || selected.length > 0}>
              {group.options.map((option) => (
                <label key={option.value} className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    name={group.param}
                    value={option.value}
                    defaultChecked={selected.includes(option.value)}
                    onChange={submitOnChange}
                    className="h-4 w-4 rounded border-gray-300 accent-accent-600"
                  />
                  {option.label}
                </label>
              ))}
            </FilterGroup>
          );
        })}

        <FilterGroup title="Preț (lei)" defaultOpen>
          <div className="flex items-end gap-2">
            <label className="flex-1 text-xs text-gray-600">
              Minim
              <input
                type="number"
                inputMode="numeric"
                min={0}
                name={PARAM.minPrice}
                defaultValue={filters.minPrice ?? ""}
                placeholder="900"
                className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900"
              />
            </label>
            <label className="flex-1 text-xs text-gray-600">
              Maxim
              <input
                type="number"
                inputMode="numeric"
                min={0}
                name={PARAM.maxPrice}
                defaultValue={filters.maxPrice ?? ""}
                placeholder="15000"
                className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm text-gray-900"
              />
            </label>
            <button
              type="submit"
              className="rounded-md bg-accent-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-accent-700"
            >
              Aplică
            </button>
          </div>
        </FilterGroup>

        <FilterGroup title="Rating minim" defaultOpen>
          {[...MIN_RATING_OPTIONS, null].map((value) => (
            <label key={value ?? "oricare"} className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-gray-800">
              <input
                type="radio"
                name={PARAM.minRating}
                value={value ?? ""}
                defaultChecked={filters.minRating === value}
                onChange={submitOnChange}
                className="h-4 w-4 border-gray-300 accent-accent-600"
              />
              {value === null ? "Oricare" : `${value} stele și peste`}
            </label>
          ))}
        </FilterGroup>

        <noscript>
          <button type="submit" className="mt-3 w-full rounded-lg bg-accent-600 py-2 font-semibold text-white">
            Aplică filtrele
          </button>
        </noscript>

        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={() =>
              startTransition(() =>
                router.push(catalogHref({ ...parseFilters({}), q: filters.q, sort: filters.sort }), { scroll: false }),
              )
            }
            className="mt-3 text-sm font-semibold text-accent-600 hover:underline"
          >
            Șterge toate filtrele
          </button>
        )}
      </form>
    </div>
  );
}

function FilterGroup({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  return (
    <details open={defaultOpen} className="group border-b border-gray-200 py-3">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-gray-900">
        {title}
        <span aria-hidden="true" className="text-gray-600 transition group-open:rotate-180">
          ▾
        </span>
      </summary>
      <fieldset className="mt-2">
        <legend className="sr-only">{title}</legend>
        {children}
      </fieldset>
    </details>
  );
}
