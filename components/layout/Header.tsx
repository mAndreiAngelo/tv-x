import Link from "next/link";

const NAV_LINKS = [
  { href: "/televizoare", label: "Televizoare" },
  { href: "/compara", label: "Compară" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-gray-900">
          TV <span className="text-accent-600">X</span>
        </Link>

        <nav aria-label="Navigare principală" className="hidden gap-5 text-sm font-medium sm:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-gray-700 hover:text-accent-600">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4 text-sm font-medium">
          <Link href="/cont" className="text-gray-700 hover:text-accent-600">
            Contul meu
          </Link>
          <Link
            href="/cos"
            className="rounded-lg bg-accent-600 px-4 py-2 text-white hover:bg-accent-700"
          >
            Coș
          </Link>
        </div>
      </div>
    </header>
  );
}
