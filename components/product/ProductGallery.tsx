"use client";

import { useState } from "react";
import { TvImage } from "./TvImage";

const VIEWS = [
  { view: "front", label: "vedere din față" },
  { view: "angle", label: "vedere laterală" },
  { view: "back", label: "vedere din spate" },
] as const;

type ProductGalleryProps = { name: string; brand: string; diagonal: number; hue: number };

export function ProductGallery({ name, brand, diagonal, hue }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const current = VIEWS[active];

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <TvImage
          brand={brand}
          diagonal={diagonal}
          hue={hue}
          view={current.view}
          label={`${name}, ${current.label} (imagine ilustrativă)`}
          className="aspect-[4/3] w-full"
        />
      </div>
      <ul className="mt-3 grid grid-cols-3 gap-3" aria-label="Galerie imagini">
        {VIEWS.map((item, index) => (
          <li key={item.view}>
            <button
              type="button"
              onClick={() => setActive(index)}
              aria-pressed={index === active}
              aria-label={`Arată ${item.label}`}
              className={`block w-full overflow-hidden rounded-lg border-2 transition ${
                index === active ? "border-accent-600" : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <TvImage brand={brand} diagonal={diagonal} hue={hue} view={item.view} label="" className="aspect-[4/3] w-full" />
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-gray-500">Imaginile sunt ilustrative și generate local.</p>
    </div>
  );
}
