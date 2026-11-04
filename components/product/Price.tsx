import { discountPercent, formatPrice } from "@/lib/format";

type PriceProps = {
  price: number;
  oldPrice?: number | null;
  size?: "md" | "lg";
};

export function Price({ price, oldPrice, size = "md" }: PriceProps) {
  const discount = discountPercent(price, oldPrice);
  return (
    <div className="flex flex-col">
      {discount > 0 && oldPrice ? (
        <p className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 line-through">
            <span className="sr-only">Preț vechi: </span>
            {formatPrice(oldPrice)}
          </span>
          <span className="rounded bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">-{discount}%</span>
        </p>
      ) : null}
      <p
        className={`font-extrabold tracking-tight ${discount > 0 ? "text-red-700" : "text-gray-900"} ${
          size === "lg" ? "text-3xl" : "text-xl"
        }`}
      >
        <span className="sr-only">Preț: </span>
        {formatPrice(price)}
      </p>
    </div>
  );
}
