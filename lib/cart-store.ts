"use client";

// Guest cart kept in localStorage. It only stores product ids and quantities;
// prices and totals are always calculated on the server.
import { useSyncExternalStore } from "react";

export type CartLine = { productId: string; quantity: number };

const STORAGE_KEY = "tvx-cart";
const EMPTY: CartLine[] = [];
let cache: CartLine[] | null = null;
const listeners = new Set<() => void>();

function read(): CartLine[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    cache = Array.isArray(parsed)
      ? parsed
          .filter(
            (l): l is CartLine =>
              typeof l?.productId === "string" && Number.isInteger(l?.quantity) && l.quantity > 0,
          )
          .map((l) => ({ productId: l.productId, quantity: l.quantity }))
      : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(lines: CartLine[]) {
  cache = lines;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCartLines() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function useCartCount() {
  const lines = useCartLines();
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function addToCart(productId: string, quantity = 1) {
  const lines = read();
  const existing = lines.find((l) => l.productId === productId);
  write(
    existing
      ? lines.map((l) => (l.productId === productId ? { ...l, quantity: l.quantity + quantity } : l))
      : [...lines, { productId, quantity }],
  );
}

export function setCartQuantity(productId: string, quantity: number) {
  if (quantity <= 0) return removeFromCart(productId);
  write(read().map((l) => (l.productId === productId ? { ...l, quantity } : l)));
}

export function removeFromCart(productId: string) {
  write(read().filter((l) => l.productId !== productId));
}

/** Replaces the whole cart (used to apply server-side corrections, e.g. stock limits). */
export function replaceCart(lines: CartLine[]) {
  const current = read();
  const same =
    current.length === lines.length &&
    current.every((l, i) => l.productId === lines[i].productId && l.quantity === lines[i].quantity);
  if (!same) write(lines);
}

export function clearCart() {
  write([]);
}

/** Current cart outside React (e.g. to send it to the server). */
export function getCartSnapshot() {
  return read();
}

// ---------------------------------------------------------------------------
// "Saved on the server" signal, used by pages that read the database cart
// ---------------------------------------------------------------------------

let syncVersion = 0;
const syncListeners = new Set<() => void>();

export function markCartSynced() {
  syncVersion++;
  syncListeners.forEach((listener) => listener());
}

export function useCartSyncVersion() {
  return useSyncExternalStore(
    (listener) => {
      syncListeners.add(listener);
      return () => syncListeners.delete(listener);
    },
    () => syncVersion,
    () => 0,
  );
}
