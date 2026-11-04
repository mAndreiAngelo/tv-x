import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getAllProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Televizoare",
  description: "Toate televizoarele TV X: LED, QLED, OLED și Mini LED, de la 32″ la 85″.",
};

export default async function CatalogPage() {
  const products = await getAllProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Televizoare</h1>
        <p className="mt-1 text-gray-600">{products.length} produse</p>
      </header>
      <ProductGrid products={products} />
    </div>
  );
}
