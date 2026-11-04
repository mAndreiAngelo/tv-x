import { useId } from "react";

type StarsProps = {
  rating: number;
  count?: number;
  size?: "sm" | "md" | "lg";
};

const SIZES = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };

export function Stars({ rating, count, size = "sm" }: StarsProps) {
  const gradientId = useId();
  const rounded = Math.round(rating * 2) / 2;
  return (
    <div className="flex items-center gap-1">
      <span className="sr-only">
        Rating {rating.toLocaleString("ro-RO")} din 5{count !== undefined ? `, ${count} recenzii` : ""}
      </span>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId}>
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#d1d5db" />
          </linearGradient>
        </defs>
      </svg>
      <span className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = rounded >= i ? "#f59e0b" : rounded >= i - 0.5 ? `url(#${gradientId})` : "#d1d5db";
          return (
            <svg key={i} viewBox="0 0 20 20" className={SIZES[size]}>
              <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9z" fill={fill} />
            </svg>
          );
        })}
      </span>
      {count !== undefined && (
        <span className="text-sm text-gray-600" aria-hidden="true">
          {rating.toLocaleString("ro-RO", { minimumFractionDigits: 1 })} ({count})
        </span>
      )}
    </div>
  );
}
