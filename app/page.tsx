import Link from "next/link";

export default function HomePage() {
  return (
    <section className="bg-section">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">TV X</h1>
        <p className="mt-3 max-w-xl text-lg text-gray-600">
          Magazinul demonstrativ de televizoare este în construcție.
        </p>
        <Link
          href="/televizoare"
          className="mt-6 inline-block rounded-lg bg-accent-600 px-5 py-3 font-semibold text-white hover:bg-accent-700"
        >
          Vezi televizoarele
        </Link>
      </div>
    </section>
  );
}
