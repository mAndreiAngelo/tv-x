import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { deleteUnpaidOrder, markOrderPaid } from "@/lib/orders";
import { webhookSecret } from "@/lib/stripe";

/**
 * Stripe webhook. This is the ONLY place where an order becomes "Plătită".
 * Local testing: stripe listen --forward-to localhost:3000/api/webhooks/stripe
 */
export async function POST(request: NextRequest) {
  const secret = webhookSecret();
  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    // Signature verification needs no API key, only the webhook secret
    event = Stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.warn("Stripe webhook signature verification failed:", (error as Error).message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.livemode) {
    // This demo never processes live payments
    return NextResponse.json({ error: "Live mode events are not accepted" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      if (session.payment_status === "paid") await markOrderPaid(session.id);
      break;
    }
    case "checkout.session.expired": {
      await deleteUnpaidOrder({ stripeSessionId: event.data.object.id });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
