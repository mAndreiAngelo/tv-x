export function StockStatus({ stock }: { stock: number }) {
  if (stock <= 0) {
    return <p className="text-sm font-medium text-gray-600">Stoc epuizat</p>;
  }
  return (
    <p className="flex items-center gap-1.5 text-sm font-medium text-green-700">
      <span className="h-2 w-2 rounded-full bg-green-600" aria-hidden="true" />
      {stock === 1 ? "În stoc – ultima bucată" : stock <= 4 ? `În stoc – ultimele ${stock} bucăți` : "În stoc"}
    </p>
  );
}
