import "server-only";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import type { PricedCart } from "@/lib/pricing";
import type { ShippingInput } from "@/lib/validation/checkout";

export const ORDER_STATUS_LABELS = {
  PROCESSING: "În procesare",
  PAID: "Plătită",
  SHIPPED: "Expediată",
  DELIVERED: "Livrată",
} as const;

/** Creates an unpaid order from a cart that was priced on the server. */
export async function createPendingOrder(opts: {
  userId: string;
  email: string;
  shipping: ShippingInput;
  cart: PricedCart;
}) {
  const { cart } = opts;
  return prisma.$transaction(async (tx) => {
    const last = await tx.order.findFirst({ orderBy: { number: "desc" }, select: { number: true } });
    return tx.order.create({
      data: {
        number: (last?.number ?? 100000) + 1,
        userId: opts.userId,
        email: opts.email,
        ...opts.shipping,
        subtotal: cart.subtotal,
        shippingCost: cart.shippingCost,
        total: cart.total,
        items: {
          create: cart.lines.map((line) => ({
            productId: line.product.id,
            name: line.product.name,
            unitPrice: line.product.price,
            quantity: line.quantity,
          })),
        },
      },
      include: { items: true },
    });
  });
}

/**
 * Marks an order as paid. Called ONLY from the verified Stripe webhook.
 * Idempotent: Stripe may deliver the same event more than once.
 */
export async function markOrderPaid(stripeSessionId: string) {
  const order = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: { stripeSessionId, status: "PROCESSING" },
      data: { status: "PAID", paidAt: new Date() },
    });
    if (updated.count === 0) return null; // unknown session or already processed

    const order = await tx.order.findUniqueOrThrow({
      where: { stripeSessionId },
      include: { items: true },
    });
    for (const item of order.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId }, select: { stock: true } });
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: Math.max(0, (product?.stock ?? 0) - item.quantity) },
      });
    }
    // The purchased products leave the saved cart
    await tx.cartItem.deleteMany({
      where: { userId: order.userId, productId: { in: order.items.map((i) => i.productId) } },
    });
    return order;
  });

  if (order) logConfirmationEmail(order);
  return order;
}

/** Simulated confirmation email: printed in the server console, never sent. */
function logConfirmationEmail(order: {
  number: number;
  email: string;
  fullName: string;
  street: string;
  city: string;
  county: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  items: { name: string; quantity: number; unitPrice: number }[];
}) {
  console.log(
    [
      "",
      "──────── EMAIL SIMULAT ────────",
      `Către: ${order.email}`,
      `Subiect: Confirmare comandă TV X #${order.number}`,
      "",
      `Bună, ${order.fullName}! Plata comenzii #${order.number} a fost confirmată.`,
      "",
      ...order.items.map((i) => `  ${i.quantity} × ${i.name} – ${formatPrice(i.unitPrice * i.quantity)}`),
      "",
      `  Subtotal: ${formatPrice(order.subtotal)}`,
      `  Livrare:  ${order.shippingCost ? formatPrice(order.shippingCost) : "gratuită"}`,
      `  Total:    ${formatPrice(order.total)}`,
      "",
      `Livrare la: ${order.street}, ${order.city}, ${order.county}`,
      "(Proiect demonstrativ – nu se efectuează vânzări reale)",
      "───────────────────────────────",
      "",
    ].join("\n"),
  );
}

/** Removes an order that was never paid (checkout cancelled or expired). */
export async function deleteUnpaidOrder(where: { id?: string; stripeSessionId?: string; userId?: string }) {
  return prisma.order.deleteMany({ where: { ...where, status: "PROCESSING" } });
}
