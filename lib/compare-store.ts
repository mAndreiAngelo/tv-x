"use client";

// Compare selection kept in localStorage (max 3 products), shared by every
// component through useSyncExternalStore and synced across browser tabs.
import { useSyncExternalStore } from "react";

export const MAX_COMPARE = 3;
const STORAGE_KEY = "tvx-compare";

export type CompareItem = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  diagonal: number;
  colorHue: number;
};

const EMPTY: CompareItem[] = [];
let cache: CompareItem[] | null = null;
const listeners = new Set<() => void>();

function read(): CompareItem[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    cache = Array.isArray(parsed) ? (parsed as CompareItem[]).slice(0, MAX_COMPARE) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(items: CompareItem[]) {
  cache = items;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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

export function useCompareItems() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

/** Adds a product; returns false when the selection is already full. */
export function addToCompare(item: CompareItem) {
  const items = read();
  if (items.some((i) => i.id === item.id)) return true;
  if (items.length >= MAX_COMPARE) return false;
  write([...items, item]);
  return true;
}

export function removeFromCompare(id: string) {
  write(read().filter((i) => i.id !== id));
}

export function clearCompare() {
  write([]);
}

export function compareHref(items: Pick<CompareItem, "slug">[]) {
  return items.length ? `/compara?produse=${items.map((i) => i.slug).join(",")}` : "/compara";
}
