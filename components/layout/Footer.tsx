import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/termeni", label: "Termeni și condiții" },
  { href: "/confidentialitate", label: "Confidențialitate" },
  { href: "/livrare-si-retur", label: "Livrare și retur" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-section">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <p className="text-lg font-extrabold text-gray-900">
            TV <span className="text-accent-600">X</span>
          </p>
          <p className="mt-1 max-w-xs text-sm text-gray-600">
            Televizoare LED, QLED, OLED și Mini LED, de la 32″ la 85″.
          </p>
        </div>
        <nav aria-label="Informații" className="flex flex-col gap-2 text-sm">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-gray-700 hover:text-accent-600">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="border-t border-gray-200 px-4 py-3 text-center text-xs text-gray-600">
        Proiect demonstrativ – nu se efectuează vânzări reale
      </p>
    </footer>
  );
}
