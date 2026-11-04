"use client";

import { useState } from "react";
import { MAX_COMPARE, addToCompare, removeFromCompare, useCompareItems, type CompareItem } from "@/lib/compare-store";

export function CompareButton({ item }: { item: CompareItem }) {
  const items = useCompareItems();
  const [message, setMessage] = useState("");
  const selected = items.some((i) => i.id === item.id);

  function toggle() {
    if (selected) {
      removeFromCompare(item.id);
      setMessage("");
    } else if (!addToCompare(item)) {
      setMessage(`Poți compara maximum ${MAX_COMPARE} televizoare.`);
    } else {
      setMessage("");
    }
  }

  return (
    <div className="relative z-10">
      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 hover:text-accent-600">
        <input
          type="checkbox"
          checked={selected}
          onChange={toggle}
          className="h-4 w-4 rounded border-gray-300 accent-accent-600"
        />
        Compară
      </label>
      <p role="status" className="text-xs text-red-700">
        {message}
      </p>
    </div>
  );
}
