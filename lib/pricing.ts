import "server-only";
import { z } from "zod";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";

/** Maximum units of one product per order (demo limit). */
export const MAX_QUANTITY_PER_PRODUCT = 10;

/** What the browser is allowed to send: product ids and quantities, never prices. */
export const cartLinesSchema = z
  .array(
    z.object({
      productId: z.string().min(1).max(50),
      quantity: z.number().int().min(1).max(99),
    }),
  )
  .max(50);

export type CartLineInput = z.infer<typeof cartLinesSchema>[number];

export function shippingFor(subtotal: number) {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
}

/**
 * Prices a cart using only data from the database.
 * Unknown products are dropped; quantities are clamped to the available stock.
 */
export async function priceCart(input: CartLineInput[]) {
  // Merge duplicate lines
  const merged = new Map<string, number>();
  for (const line of input) merged.set(line.productId, (merged.get(line.productId) ?? 0) + line.quantity);

  const products = await prisma.product.findMany({
    where: { id: { in: [...merged.keys()] } },
    select: {
      id: true,
      slug: true,
      name: true,
      brand: true,
      diagonal: true,
      colorHue: true,
      price: true,
      oldPrice: true,
      stock: true,
    },
  });

  const lines = products.map((product) => {
    const requested = merged.get(product.id) ?? 0;
    const maxAllowed = Math.min(product.stock, MAX_QUANTITY_PER_PRODUCT);
    const quantity = Math.min(requested, maxAllowed);
    return {
      product,
      requested,
      quantity,
      maxAllowed,
      adjusted: quantity !== requested,
      lineTotal: product.price * quantity,
    };
  });

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const shippingCost = shippingFor(subtotal);

  return {
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal,
    shippingCost,
    total: subtotal + shippingCost,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    missingProductIds: [...merged.keys()].filter((id) => !products.some((p) => p.id === id)),
  };
}

export type PricedCart = Awaited<ReturnType<typeof priceCart>>;
