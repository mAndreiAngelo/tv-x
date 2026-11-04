import type { ReactNode } from "react";

/** Layout for the short legal pages, clearly marked as demo text. */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p
        role="note"
        className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"
      >
        Text demonstrativ. TV X este un proiect de curs și portofoliu: nu se vând produse reale, nu se încasează bani și
        nu există o firmă care să opereze magazinul.
      </p>
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{title}</h1>
      <div className="mt-6 space-y-6 leading-relaxed text-gray-700 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-gray-900 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
        {children}
      </div>
    </article>
  );
}
