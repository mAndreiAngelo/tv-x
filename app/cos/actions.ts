"use server";

import { cartLinesSchema, priceCart } from "@/lib/pricing";

/** Returns the cart priced on the server from product ids and quantities. */
export async function quoteCart(input: unknown) {
  const parsed = cartLinesSchema.safeParse(input);
  if (!parsed.success) return null;
  return priceCart(parsed.data);
}
