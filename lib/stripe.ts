import "server-only";
import Stripe from "stripe";

export type StripeStatus =
  | { ready: true }
  | { ready: false; reason: "missing" | "live-key" | "missing-webhook-secret" };

function isPlaceholder(value: string | undefined) {
  return !value || value.endsWith("...") || value.trim() === "";
}

/** Checks the configuration. This demo refuses live keys on purpose. */
export function stripeStatus(): StripeStatus {
  const key = process.env.STRIPE_SECRET_KEY;
  if (isPlaceholder(key)) return { ready: false, reason: "missing" };
  if (!key!.startsWith("sk_test_")) return { ready: false, reason: "live-key" };
  return { ready: true };
}

let client: Stripe | null = null;

/** Lazily created Stripe client (test mode only). Returns null when not configured. */
export function getStripe() {
  if (!stripeStatus().ready) return null;
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY!);
  return client;
}

export function webhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  return isPlaceholder(secret) ? null : secret!;
}

export function siteUrl() {
  return (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
