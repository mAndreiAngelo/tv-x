"use server";

import { redirect } from "next/navigation";
import { fieldErrors, type FieldErrors } from "@/lib/validation/auth";
import { createPendingOrder, deleteUnpaidOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { priceCart } from "@/lib/pricing";
import { getCurrentUser } from "@/lib/session";
import { getStripe, siteUrl } from "@/lib/stripe";
import { shippingSchema } from "@/lib/validation/checkout";

export type CheckoutState = {
  error?: string;
  fields?: FieldErrors;
  values?: Record<string, string>;
};

const FIELDS = ["fullName", "phone", "street", "city", "county", "postalCode"] as const;

/**
 * Validates the shipping details, creates the order from the SAVED cart
 * (prices read from the database) and redirects to Stripe Checkout.
 * The order stays "În procesare" until the Stripe webhook confirms the payment.
 */
export async function startCheckoutAction(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const user = await getCurrentUser();
  if (!user) redirect("/autentificare?next=/checkout");

  const values = Object.fromEntries(FIELDS.map((f) => [f, String(formData.get(f) ?? "")]));
  const parsed = shippingSchema.safeParse(values);
  if (!parsed.success) return { fields: fieldErrors(parsed.error), values };

  const stripe = getStripe();
  if (!stripe) {
    return { error: "Plățile nu sunt configurate încă (lipsesc cheile de test Stripe).", values };
  }

  // Source of truth: the cart saved in the database, priced on the server
  const saved = await prisma.cartItem.findMany({
    where: { userId: user.id },
    select: { productId: true, quantity: true },
  });
  const cart = await priceCart(saved);
  if (!cart.lines.length || cart.itemCount === 0) {
    return { error: "Coșul este gol sau produsele nu mai sunt în stoc.", values };
  }
  if (cart.lines.some((l) => l.adjusted)) {
    return {
      error: "Stocul s-a modificat pentru unele produse. Verifică din nou coșul înainte de plată.",
      values,
    };
  }

  const order = await createPendingOrder({ userId: user.id, email: user.email, shipping: parsed.data, cart });

  let checkoutUrl: string | null = null;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "ro",
      currency: "ron",
      customer_email: user.email,
      client_reference_id: order.id,
      metadata: { orderId: order.id, orderNumber: String(order.number) },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      line_items: [
        ...cart.lines.map((line) => ({
          quantity: line.quantity,
          price_data: {
            currency: "ron",
            unit_amount: line.product.price,
            product_data: { name: line.product.name },
          },
        })),
        ...(cart.shippingCost > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: "ron",
                  unit_amount: cart.shippingCost,
                  product_data: { name: "Livrare prin curier" },
                },
              },
            ]
          : []),
      ],
      success_url: `${siteUrl()}/comanda/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/comanda/anulata?comanda=${order.id}`,
    });
    await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
    checkoutUrl = session.url;
  } catch (error) {
    console.error("Stripe Checkout error:", error);
    await deleteUnpaidOrder({ id: order.id });
    return { error: "Nu am putut iniția plata. Încearcă din nou în câteva momente.", values };
  }

  if (!checkoutUrl) {
    await deleteUnpaidOrder({ id: order.id });
    return { error: "Nu am putut iniția plata.", values };
  }
  redirect(checkoutUrl);
}
