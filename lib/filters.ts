// Catalog filters: URL search params <-> typed filter object <-> Prisma query.
// Pure module, safe to import from both server and client components.
import {
  BRANDS,
  DIAGONALS,
  PANEL_TYPES,
  REFRESH_RATES,
  RESOLUTIONS,
  SMART_OSES,
  type PanelType,
  type Resolution,
} from "./catalog";

export const SORT_OPTIONS = [
  { value: "noi", label: "Cele mai noi" },
  { value: "pret-asc", label: "Preț crescător" },
  { value: "pret-desc", label: "Preț descrescător" },
  { value: "rating", label: "Cele mai bine evaluate" },
] as const;
export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
export const DEFAULT_SORT: SortValue = "noi";

export const MIN_RATING_OPTIONS = [4, 3, 2] as const;

export type CatalogFilters = {
  q: string;
  brands: string[];
  diagonals: number[];
  resolutions: Resolution[];
  panels: PanelType[];
  refreshRates: number[];
  oses: string[];
  minPrice: number | null; // lei
  maxPrice: number | null; // lei
  minRating: number | null;
  sort: SortValue;
};

/** URL parameter names (Romanian, so shared links read naturally). */
export const PARAM = {
  q: "q",
  brand: "brand",
  diagonal: "diagonala",
  resolution: "rezolutie",
  panel: "panou",
  refresh: "refresh",
  os: "os",
  minPrice: "pret_min",
  maxPrice: "pret_max",
  minRating: "rating",
  sort: "sortare",
} as const;

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams;

function getAll(params: RawParams, key: string): string[] {
  const raw = params instanceof URLSearchParams ? params.getAll(key) : params[key];
  const values = raw === undefined ? [] : Array.isArray(raw) ? raw : [raw];
  // Accept both repeated params (?brand=a&brand=b) and comma lists (?brand=a,b)
  return values.flatMap((v) => v.split(",")).map((v) => v.trim()).filter(Boolean);
}

function getOne(params: RawParams, key: string) {
  return getAll(params, key)[0] ?? "";
}

function allowed<T extends string | number>(values: string[], options: readonly T[]): T[] {
  return options.filter((option) => values.includes(String(option)));
}

function positiveNumber(value: string) {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

export function parseFilters(params: RawParams): CatalogFilters {
  const sort = getOne(params, PARAM.sort);
  const rating = Number(getOne(params, PARAM.minRating));
  let minPrice = positiveNumber(getOne(params, PARAM.minPrice));
  let maxPrice = positiveNumber(getOne(params, PARAM.maxPrice));
  if (minPrice && maxPrice && minPrice > maxPrice) [minPrice, maxPrice] = [maxPrice, minPrice];

  return {
    q: getOne(params, PARAM.q).slice(0, 80),
    brands: allowed(getAll(params, PARAM.brand), BRANDS),
    diagonals: allowed(getAll(params, PARAM.diagonal), DIAGONALS),
    resolutions: allowed(getAll(params, PARAM.resolution), RESOLUTIONS),
    panels: allowed(getAll(params, PARAM.panel), PANEL_TYPES),
    refreshRates: allowed(getAll(params, PARAM.refresh), REFRESH_RATES),
    oses: allowed(getAll(params, PARAM.os), SMART_OSES),
    minPrice,
    maxPrice,
    minRating: (MIN_RATING_OPTIONS as readonly number[]).includes(rating) ? rating : null,
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? (sort as SortValue) : DEFAULT_SORT,
  };
}

/** Builds a clean query string: no empty values, default sort omitted, lists comma-separated. */
export function filtersToSearchParams(filters: CatalogFilters) {
  const params = new URLSearchParams();
  if (filters.q) params.set(PARAM.q, filters.q);
  const lists: [string, (string | number)[]][] = [
    [PARAM.brand, filters.brands],
    [PARAM.diagonal, filters.diagonals],
    [PARAM.resolution, filters.resolutions],
    [PARAM.panel, filters.panels],
    [PARAM.refresh, filters.refreshRates],
    [PARAM.os, filters.oses],
  ];
  for (const [key, values] of lists) {
    if (values.length) params.set(key, values.join(","));
  }
  if (filters.minPrice) params.set(PARAM.minPrice, String(filters.minPrice));
  if (filters.maxPrice) params.set(PARAM.maxPrice, String(filters.maxPrice));
  if (filters.minRating) params.set(PARAM.minRating, String(filters.minRating));
  if (filters.sort !== DEFAULT_SORT) params.set(PARAM.sort, filters.sort);
  return params;
}

export function catalogHref(filters: CatalogFilters) {
  // Keep commas readable in shared links (?diagonala=55,65)
  const query = filtersToSearchParams(filters).toString().replace(/%2C/g, ",");
  return query ? `/televizoare?${query}` : "/televizoare";
}

export function hasActiveFilters(filters: CatalogFilters) {
  return (
    filters.brands.length > 0 ||
    filters.diagonals.length > 0 ||
    filters.resolutions.length > 0 ||
    filters.panels.length > 0 ||
    filters.refreshRates.length > 0 ||
    filters.oses.length > 0 ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.minRating !== null
  );
}

export const EMPTY_FILTERS: CatalogFilters = parseFilters({});
