import Link from "next/link";
import { CartLink } from "@/components/cart/CartLink";
import { SearchBox } from "./SearchBox";

const NAV_LINKS = [
  { href: "/televizoare", label: "Televizoare" },
  { href: "/compara", label: "Compară" },
];

export function Header({ user }: { user: { id: string; name: string } | null }) {
  const firstName = user?.name.split(" ")[0];
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 px-4 md:h-16 md:flex-nowrap md:px-6">
        <Link href="/" className="py-3 text-xl font-extrabold tracking-tight text-gray-900 md:py-0">
          TV <span className="text-accent-600">X</span>
        </Link>

        <nav
          aria-label="Navigare principală"
          className="order-last flex w-full gap-5 border-t border-gray-100 py-2 text-sm font-medium md:order-none md:w-auto md:border-0 md:py-0"
        >
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-gray-700 hover:text-accent-600">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="order-last w-full pb-3 md:order-none md:w-auto md:max-w-md md:flex-1 md:pb-0">
          <SearchBox />
        </div>

        <div className="ml-auto flex items-center gap-4 text-sm font-medium">
          {user ? (
            <Link href="/cont" className="text-gray-700 hover:text-accent-600">
              <span className="hidden sm:inline">Salut, {firstName} · </span>Contul meu
            </Link>
          ) : (
            <Link href="/autentificare" className="text-gray-700 hover:text-accent-600">
              Intră în cont
            </Link>
          )}
          <CartLink />
        </div>
      </div>
    </header>
  );
}
