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

// ---------------------------------------------------------------------------
// Product page
// ---------------------------------------------------------------------------

/** Order statuses that prove a purchase (used for the "Cumpărător verificat" badge). */
export const PURCHASED_STATUSES = ["PAID", "SHIPPED", "DELIVERED"] as const;

export type ProductSpecs = Record<string, Record<string, string>>;

export async function getProductBySlug(slug: string) {
  await connection();
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return null;
  return { ...product, specs: product.specs as ProductSpecs };
}

export async function getRatingDistribution(productId: string) {
  const rows = await prisma.review.groupBy({
    by: ["rating"],
    where: { productId },
    _count: true,
  });
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of rows) distribution[row.rating] = row._count;
  return distribution;
}

export type ReviewSort = "noi" | "utile";

export async function getProductReviews(productId: string, sort: ReviewSort = "noi") {
  const [reviews, buyers] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      include: { user: { select: { name: true } } },
      orderBy: sort === "utile" ? [{ helpfulCount: "desc" }, { createdAt: "desc" }] : [{ createdAt: "desc" }],
    }),
    prisma.order.findMany({
      where: { status: { in: [...PURCHASED_STATUSES] }, items: { some: { productId } } },
      select: { userId: true },
      distinct: ["userId"],
    }),
  ]);
  const buyerIds = new Set(buyers.map((b) => b.userId));
  return reviews.map((review) => ({ ...review, verified: buyerIds.has(review.userId) }));
}

/** Products similar in size, panel type and price. */
export async function getSimilarProducts(
  product: { id: string; diagonal: number; panelType: string; price: number },
  limit = 4,
) {
  const candidates = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      OR: [
        { diagonal: product.diagonal },
        { panelType: product.panelType },
        { price: { gte: Math.round(product.price * 0.7), lte: Math.round(product.price * 1.3) } },
      ],
    },
    select: productCardSelect,
  });
  const score = (c: ProductCardData) =>
    (c.diagonal === product.diagonal ? 3 : Math.abs(c.diagonal - product.diagonal) <= 10 ? 1 : 0) +
    (c.panelType === product.panelType ? 2 : 0) +
    (Math.abs(c.price - product.price) / product.price <= 0.3 ? 2 : 0) +
    (c.stock > 0 ? 1 : 0);
  return candidates
    .map((c) => ({ c, s: score(c) }))
    .sort((a, b) => b.s - a.s || b.c.ratingAvg - a.c.ratingAvg)
    .slice(0, limit)
    .map(({ c }) => c);
}

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------

export async function getProductsForComparison(slugs: string[]) {
  await connection();
  const products = await prisma.product.findMany({ where: { slug: { in: slugs.slice(0, 3) } } });
  // Keep the order chosen by the user
  return slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({ ...p, specs: p.specs as ProductSpecs }));
}
