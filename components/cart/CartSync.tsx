"use client";

import { useEffect, useRef } from "react";
import { loadServerCart, mergeGuestCart, saveServerCart } from "@/app/cos/actions";
import { clearCart, getCartSnapshot, markCartSynced, replaceCart, useCartLines } from "@/lib/cart-store";

const OWNER_KEY = "tvx-cart-owner";

/**
 * Keeps the browser cart in sync with the database for signed-in users.
 * - guest → signs in: the guest cart is merged into the saved cart
 * - signed-in: every change is saved on the server (debounced)
 * - signs out: the local copy is cleared so the next visitor starts empty
 */
export function CartSync({ userId }: { userId: string | null }) {
  const lines = useCartLines();
  const ready = useRef(false);

  useEffect(() => {
    ready.current = false;
    const owner = localStorage.getItem(OWNER_KEY);

    if (!userId) {
      if (owner) {
        clearCart();
        localStorage.removeItem(OWNER_KEY);
      }
      return;
    }

    let cancelled = false;
    (async () => {
      // Local cart belongs to this user → reload it from the database (may have changed elsewhere).
      // Local cart is a guest cart → merge it. Belongs to someone else → ignore it.
      const result =
        owner === userId
          ? await loadServerCart()
          : await mergeGuestCart(owner ? [] : getCartSnapshot());
      if (cancelled || !result) return;
      replaceCart(result);
      localStorage.setItem(OWNER_KEY, userId);
      ready.current = true;
      markCartSynced();
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !ready.current) return;
    const timer = setTimeout(async () => {
      await saveServerCart(lines);
      markCartSynced();
    }, 400);
    return () => clearTimeout(timer);
  }, [lines, userId]);

  return null;
}
