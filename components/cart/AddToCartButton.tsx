"use client";

type AddToCartButtonProps = {
  productId: string;
  inStock: boolean;
};

/** "Adaugă în coș" button. The cart logic is connected in the cart stage. */
export function AddToCartButton({ inStock }: AddToCartButtonProps) {
  if (!inStock) {
    return (
      <button
        type="button"
        disabled
        className="w-full cursor-not-allowed rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-600"
      >
        Stoc epuizat
      </button>
    );
  }
  return (
    <button
      type="button"
      className="w-full rounded-lg bg-accent-600 px-6 py-3 font-semibold text-white hover:bg-accent-700"
    >
      Adaugă în coș
    </button>
  );
}
