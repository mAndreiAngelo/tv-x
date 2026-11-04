"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cancelPendingOrder } from "@/app/comanda/actions";
import { clearCart } from "@/lib/cart-store";

/** Empties the browser cart once, after a successful payment. */
export function ClearCartOnce() {
  const done = useRef(false);
  useEffect(() => {
    if (!done.current) {
      done.current = true;
      clearCart();
    }
  }, []);
  return null;
}

/** Re-checks the order status while waiting for the Stripe webhook. */
export function WaitForPayment({ intervalMs = 2000, maxAttempts = 20 }) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  useEffect(() => {
    if (attempts >= maxAttempts) return;
    const timer = setTimeout(() => {
      router.refresh();
      setAttempts((a) => a + 1);
    }, intervalMs);
    return () => clearTimeout(timer);
  }, [attempts, intervalMs, maxAttempts, router]);

  return attempts >= maxAttempts ? (
    <p className="mt-3 text-sm text-gray-600">
      Confirmarea durează mai mult decât de obicei. Verifică mai târziu statusul în contul tău. (Demo: rulează{" "}
      <code>stripe listen</code> ca webhook-ul să ajungă la server.)
    </p>
  ) : (
    <p className="mt-3 text-sm text-gray-600" aria-live="polite">
      Se verifică statusul plății…
    </p>
  );
}

/** Runs the cancellation once when the customer returns from Stripe without paying. */
export function CancelPendingOrder({ orderId }: { orderId: string }) {
  const done = useRef(false);
  useEffect(() => {
    if (!done.current) {
      done.current = true;
      void cancelPendingOrder(orderId);
    }
  }, [orderId]);
  return null;
}
