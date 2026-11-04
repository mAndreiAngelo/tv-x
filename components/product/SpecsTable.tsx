import type { ProductSpecs } from "@/lib/products";

export function SpecsTable({ specs }: { specs: ProductSpecs }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Object.entries(specs).map(([group, rows]) => (
        <table key={group} className="w-full self-start text-sm">
          <caption className="mb-2 text-left text-base font-semibold text-gray-900">{group}</caption>
          <tbody>
            {Object.entries(rows).map(([label, value]) => (
              <tr key={label} className="border-b border-gray-100 last:border-0">
                <th scope="row" className="w-1/2 py-2 pr-4 text-left font-normal text-gray-600">
                  {label}
                </th>
                <td className="py-2 font-medium text-gray-900">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  );
}
