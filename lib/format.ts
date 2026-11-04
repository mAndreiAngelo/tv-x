const priceFormatter = new Intl.NumberFormat("ro-RO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: "always",
});

/** Formats an amount in bani as "2.499,99 lei". */
export function formatPrice(bani: number) {
  return `${priceFormatter.format(bani / 100)} lei`;
}

/** Discount percentage between an old and a current price, rounded. */
export function discountPercent(price: number, oldPrice: number | null | undefined) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round((1 - price / oldPrice) * 100);
}

const dateFormatter = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(date: Date) {
  return dateFormatter.format(date);
}
