"use server";

import { deleteUnpaidOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getStripe } from "@/lib/stripe";

/** Cancelled on Stripe: expire the checkout session and remove the unpaid order. */
export async function cancelPendingOrder(orderId: unknown) {
  const user = await getCurrentUser();
  if (!user || typeof orderId !== "string") return;

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id, status: "PROCESSING" },
    select: { id: true, stripeSessionId: true },
  });
  if (!order) return;

  const stripe = getStripe();
  if (stripe && order.stripeSessionId) {
    try {
      await stripe.checkout.sessions.expire(order.stripeSessionId);
    } catch {
      // already expired or completed – the webhook keeps the final say
    }
  }
  // Only removes it if it is still unpaid
  await deleteUnpaidOrder({ id: order.id, userId: user.id });
}
