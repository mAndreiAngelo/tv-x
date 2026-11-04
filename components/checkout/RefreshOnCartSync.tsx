"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCartSyncVersion } from "@/lib/cart-store";

/** Re-renders a server page that reads the saved cart whenever the cart is saved on the server. */
export function RefreshOnCartSync() {
  const router = useRouter();
  const syncVersion = useCartSyncVersion();
  useEffect(() => {
    if (syncVersion > 0) router.refresh();
  }, [syncVersion, router]);
  return null;
}
