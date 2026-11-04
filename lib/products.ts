import "server-only";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { CatalogFilters, SortValue } from "@/lib/filters";

/** Fields needed to render a product card. */
export const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  brand: true,
  diagonal: true,
  resolution: true,
  panelType: true,
  refreshRate: true,
  price: true,
  oldPrice: true,
  stock: true,
  colorHue: true,
  ratingAvg: true,
  reviewCount: true,
} satisfies Prisma.ProductSelect;

export type ProductCardData = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

export async function getAllProducts() {
  await connection();
  return prisma.product.findMany({ select: productCardSelect, orderBy: { createdAt: "desc" } });
}

export async function getFeaturedProducts(limit = 8) {
  await connection();
  return prisma.product.findMany({
    where: { featured: true },
    select: productCardSelect,
    orderBy: { ratingAvg: "desc" },
    take: limit,
  });
}

export async function getDiscountedProducts(limit = 8) {
  await connection();
  return prisma.product.findMany({
    where: { oldPrice: { not: null } },
    select: productCardSelect,
    orderBy: { price: "asc" },
    take: limit,
  });
}

/** Number of products and lowest price for each diagonal, for the home page categories. */
export async function getDiagonalSummary() {
  await connection();
  const rows = await prisma.product.groupBy({
    by: ["diagonal"],
    _count: true,
    _min: { price: true },
    orderBy: { diagonal: "asc" },
  });
  return rows.map((r) => ({ diagonal: r.diagonal, count: r._count, minPrice: r._min.price ?? 0 }));
}

// ---------------------------------------------------------------------------
// Catalog search and filtering
// ---------------------------------------------------------------------------

function searchWhere(q: string): Prisma.ProductWhereInput[] {
  // Every word must match the name, model or brand (SQLite LIKE is case-insensitive for ASCII).
  return q
    .split(/\s+/)
    .map((term) => term.replace(/["″]/g, "").trim())
    .filter(Boolean)
    .map((term) => ({
      OR: [{ name: { contains: term } }, { model: { contains: term } }, { brand: { contains: term } }],
    }));
}

export function buildProductWhere(filters: CatalogFilters): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = searchWhere(filters.q);
  if (filters.brands.length) and.push({ brand: { in: filters.brands } });
  if (filters.diagonals.length) and.push({ diagonal: { in: filters.diagonals } });
  if (filters.resolutions.length) and.push({ resolution: { in: filters.resolutions } });
  if (filters.panels.length) and.push({ panelType: { in: filters.panels } });
  if (filters.refreshRates.length) and.push({ refreshRate: { in: filters.refreshRates } });
  if (filters.oses.length) and.push({ smartOs: { in: filters.oses } });
  if (filters.minPrice) and.push({ price: { gte: filters.minPrice * 100 } });
  if (filters.maxPrice) and.push({ price: { lte: filters.maxPrice * 100 + 99 } });
  if (filters.minRating) and.push({ ratingAvg: { gte: filters.minRating } });
  return and.length ? { AND: and } : {};
}

const ORDER_BY: Record<SortValue, Prisma.ProductOrderByWithRelationInput[]> = {
  noi: [{ createdAt: "desc" }],
  "pret-asc": [{ price: "asc" }],
  "pret-desc": [{ price: "desc" }],
  rating: [{ ratingAvg: "desc" }, { reviewCount: "desc" }],
};

export async function searchProducts(filters: CatalogFilters) {
  await connection();
  return prisma.product.findMany({
    where: buildProductWhere(filters),
    select: productCardSelect,
    orderBy: [...ORDER_BY[filters.sort], { name: "asc" }],
  });
}

/** Lightweight suggestions for the search box. */
export async function getSearchSuggestions(q: string, limit = 6) {
  if (q.trim().length < 2) return [];
  return prisma.product.findMany({
    where: { AND: searchWhere(q) },
    select: { slug: true, name: true, model: true, price: true, brand: true, diagonal: true, colorHue: true },
    orderBy: [{ ratingAvg: "desc" }],
    take: limit,
  });
}
