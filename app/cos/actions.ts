"use server";

import { prisma } from "@/lib/prisma";
import { MAX_QUANTITY_PER_PRODUCT, cartLinesSchema, priceCart, type CartLineInput } from "@/lib/pricing";
import { getUserId } from "@/lib/session";

/** Returns the cart priced on the server from product ids and quantities. */
export async function quoteCart(input: unknown) {
  const parsed = cartLinesSchema.safeParse(input);
  if (!parsed.success) return null;
  return priceCart(parsed.data);
}

// ---------------------------------------------------------------------------
// Database cart for signed-in users
// ---------------------------------------------------------------------------

async function readDbCart(userId: string): Promise<CartLineInput[]> {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    select: { productId: true, quantity: true },
    orderBy: { id: "asc" },
  });
  return items;
}

/** Replaces the user's cart, keeping only existing products and valid quantities. */
async function writeDbCart(userId: string, lines: CartLineInput[]) {
  const merged = new Map<string, number>();
  for (const line of lines) merged.set(line.productId, (merged.get(line.productId) ?? 0) + line.quantity);

  const products = await prisma.product.findMany({
    where: { id: { in: [...merged.keys()] } },
    select: { id: true, stock: true },
  });
  const clean = products
    .map((p) => ({
      productId: p.id,
      quantity: Math.min(merged.get(p.id) ?? 0, p.stock, MAX_QUANTITY_PER_PRODUCT),
    }))
    .filter((l) => l.quantity > 0);

  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { userId } }),
    prisma.cartItem.createMany({ data: clean.map((l) => ({ ...l, userId })) }),
  ]);
  // Preserve the order the browser sent
  return [...merged.keys()].flatMap((id) => clean.filter((l) => l.productId === id));
}

/** Loads the saved cart of the signed-in user. */
export async function loadServerCart() {
  const userId = await getUserId();
  if (!userId) return null;
  return readDbCart(userId);
}

/** After sign-in: adds the guest cart to the saved cart and returns the result. */
export async function mergeGuestCart(input: unknown) {
  const userId = await getUserId();
  if (!userId) return null;
  const parsed = cartLinesSchema.safeParse(input);
  const guest = parsed.success ? parsed.data : [];
  const saved = await readDbCart(userId);
  if (!guest.length) return saved;
  return writeDbCart(userId, [...saved, ...guest]);
}

/** Saves the current cart of the signed-in user. */
export async function saveServerCart(input: unknown) {
  const userId = await getUserId();
  if (!userId) return null;
  const parsed = cartLinesSchema.safeParse(input);
  if (!parsed.success) return null;
  return writeDbCart(userId, parsed.data);
}
