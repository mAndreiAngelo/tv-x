import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-semibold text-accent-600">Eroare 404</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900">Pagina nu a fost găsită</h1>
      <p className="mt-3 text-gray-600">Este posibil ca produsul să nu mai existe sau ca adresa să fie greșită.</p>
      <Link
        href="/televizoare"
        className="mt-6 inline-block rounded-lg bg-accent-600 px-5 py-3 font-semibold text-white hover:bg-accent-700"
      >
        Vezi toate televizoarele
      </Link>
    </div>
  );
}
