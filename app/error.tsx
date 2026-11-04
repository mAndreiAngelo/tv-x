"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-semibold text-red-700">A apărut o eroare</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">Ceva nu a funcționat</h1>
      <p className="mt-3 text-gray-600">Încearcă din nou. Dacă problema persistă, revino mai târziu.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-accent-600 px-5 py-3 font-semibold text-white hover:bg-accent-700"
        >
          Încearcă din nou
        </button>
        <Link href="/" className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-800 hover:bg-gray-50">
          Mergi la pagina principală
        </Link>
      </div>
    </div>
  );
}
