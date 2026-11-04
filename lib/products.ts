import "server-only";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

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
