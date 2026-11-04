import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ro" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#continut"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:shadow"
        >
          Sari la conținut
        </a>
        <Header />
        <main id="continut" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
