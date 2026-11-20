import type { Metadata } from "next";
import "./globals.css";
import { CurrencyProvider } from "@/components/CurrencyContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: "AuraDeals — Fashion, Cosmetics & Beauty Deal Meta-Search Engine",
  description:
    "Google-like shopping meta-search engine aggregating Black Friday offers, multi-brand price comparisons, and promo codes across Clothes, Makeup, Skincare & Fragrance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <CurrencyProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieBanner />
        </CurrencyProvider>
      </body>
    </html>
  );
}
