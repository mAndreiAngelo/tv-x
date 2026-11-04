import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CompareBar } from "@/components/compare/CompareBar";
import { CartSync } from "@/components/cart/CartSync";
import { getCurrentUser } from "@/lib/session";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "TV X – magazin online de televizoare",
    template: "%s | TV X",
  },
  description:
    "TV X – magazin demonstrativ de televizoare: LED, QLED, OLED și Mini LED, de la 32″ la 85″.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const current = await getCurrentUser();
  const user = current ? { id: current.id, name: current.name } : null;

  return (
    <html lang="ro" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#continut"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:shadow"
        >
          Sari la conținut
        </a>
        <Header user={user} />
        <main id="continut" className="flex-1">
          {children}
        </main>
        <Footer />
        <CompareBar />
        <CartSync userId={user?.id ?? null} />
      </body>
    </html>
  );
}
