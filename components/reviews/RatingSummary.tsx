import { Stars } from "@/components/product/Stars";

type RatingSummaryProps = {
  average: number;
  count: number;
  distribution: Record<number, number>;
};

export function RatingSummary({ average, count, distribution }: RatingSummaryProps) {
  return (
    <div className="rounded-xl bg-section p-6">
      <p className="text-5xl font-extrabold text-gray-900">
        {average.toLocaleString("ro-RO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        <span className="text-lg font-medium text-gray-600"> / 5</span>
      </p>
      <div className="mt-2">
        <Stars rating={average} size="md" />
      </div>
      <p className="mt-1 text-sm text-gray-600">{count === 1 ? "1 recenzie" : `${count} recenzii`}</p>

      <dl className="mt-5 space-y-2">
        {[5, 4, 3, 2, 1].map((stars) => {
          const n = distribution[stars] ?? 0;
          const percent = count ? Math.round((n / count) * 100) : 0;
          return (
            <div key={stars} className="flex items-center gap-3 text-sm">
              <dt className="w-16 shrink-0 text-gray-700">{stars} {stars === 1 ? "stea" : "stele"}</dt>
              <dd className="flex flex-1 items-center gap-3">
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200" aria-hidden="true">
                  <span className="block h-full rounded-full bg-amber-500" style={{ width: `${percent}%` }} />
                </span>
                <span className="w-8 text-right text-gray-600">
                  {n}
                  <span className="sr-only"> {n === 1 ? "recenzie" : "recenzii"} ({percent}%)</span>
                </span>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
