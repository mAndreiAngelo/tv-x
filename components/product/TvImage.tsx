type TvImageProps = {
  brand: string;
  diagonal: number;
  hue: number;
  label: string;
  view?: "front" | "angle" | "back";
  className?: string;
};

/**
 * Neutral, locally generated placeholder image of a TV.
 * No real product photos or brand logos are used anywhere in the store.
 */
export function TvImage({ brand, diagonal, hue, label, view = "front", className }: TvImageProps) {
  const id = `tv-${brand}-${diagonal}-${hue}-${view}`.replace(/[^a-zA-Z0-9-]/g, "");
  const screenTop = `hsl(${hue} 70% 55%)`;
  const screenBottom = `hsl(${(hue + 40) % 360} 65% 22%)`;

  return (
    <svg viewBox="0 0 400 300" role="img" aria-label={label} className={className}>
      <defs>
        <linearGradient id={`${id}-screen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={screenTop} />
          <stop offset="100%" stopColor={screenBottom} />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.25" />
          <stop offset="60%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="#f5f6f8" />

      {view === "front" && (
        <g>
          <rect x="40" y="40" width="320" height="185" rx="6" fill="#111827" />
          <rect x="46" y="46" width="308" height="173" rx="3" fill={`url(#${id}-screen)`} />
          <path d="M46 46 L230 46 L130 219 L46 219 Z" fill={`url(#${id}-shine)`} />
          <rect x="180" y="225" width="40" height="22" fill="#374151" />
          <rect x="130" y="247" width="140" height="8" rx="4" fill="#1f2937" />
          <text
            x="200"
            y="140"
            textAnchor="middle"
            fill="#fff"
            fontSize="40"
            fontWeight="700"
            fontFamily="sans-serif"
            opacity="0.9"
          >
            {diagonal}″
          </text>
          <text
            x="200"
            y="168"
            textAnchor="middle"
            fill="#fff"
            fontSize="14"
            fontFamily="sans-serif"
            opacity="0.75"
            letterSpacing="3"
          >
            {brand.toUpperCase()}
          </text>
        </g>
      )}

      {view === "angle" && (
        <g>
          <polygon points="70,50 330,30 330,240 70,210" fill="#111827" />
          <polygon points="76,56 324,37 324,233 76,204" fill={`url(#${id}-screen)`} />
          <polygon points="330,30 342,34 342,236 330,240" fill="#374151" />
          <rect x="185" y="222" width="36" height="24" fill="#374151" />
          <ellipse cx="203" cy="252" rx="80" ry="7" fill="#1f2937" />
        </g>
      )}

      {view === "back" && (
        <g>
          <rect x="40" y="40" width="320" height="185" rx="6" fill="#374151" />
          <rect x="140" y="80" width="120" height="100" rx="4" fill="#4b5563" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={300} y={80 + i * 22} width="28" height="12" rx="2" fill="#9ca3af" />
          ))}
          <rect x="180" y="225" width="40" height="22" fill="#1f2937" />
          <rect x="130" y="247" width="140" height="8" rx="4" fill="#111827" />
          <text x="200" y="135" textAnchor="middle" fill="#d1d5db" fontSize="12" fontFamily="sans-serif">
            VESA
          </text>
        </g>
      )}
    </svg>
  );
}
