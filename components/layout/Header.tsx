import Link from "next/link";

const NAV_LINKS = [
  { href: "/televizoare", label: "Televizoare" },
  { href: "/compara", label: "Compară" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 px-4 sm:h-16 sm:flex-nowrap sm:px-6">
        <Link href="/" className="py-3 text-xl font-extrabold tracking-tight text-gray-900 sm:py-0">
          TV <span className="text-accent-600">X</span>
        </Link>

        <nav
          aria-label="Navigare principală"
          className="order-last flex w-full gap-5 border-t border-gray-100 py-2 text-sm font-medium sm:order-none sm:w-auto sm:border-0 sm:py-0"
        >
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
