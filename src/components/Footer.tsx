import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, ExternalLink, Scale, Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Col 1: Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-purple-700 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg font-extrabold text-slate-900">
                Aura<span className="text-rose-600">Deals</span>
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Google-style meta-search engine aggregating real-time prices, Black Friday discounts, and verified promo codes across global Fashion, Makeup, Skincare & Fragrance retailers.
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Pluggable Affiliate Feed Engine v1.0
            </div>
          </div>

          {/* Col 2: Verticals */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Indexed Verticals
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-500">
              <li>Clothes, Coats & Designer Outerwear</li>
              <li>Makeup, Lip Vaults & Complexion Sets</li>
              <li>Dermatologist & Korean Skincare (K-Beauty)</li>
              <li>Luxury Eau de Parfum & Gift Coffrets</li>
              <li>Beauty Tech & Hair Styling Tools</li>
            </ul>
          </div>

          {/* Col 3: Supported Networks */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Affiliate & Feed Adapters
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-500">
              <li>Awin Product Datafeed Adapter</li>
              <li>Rakuten Advertising REST Adapter</li>
              <li>CJ Affiliate (Commission Junction) Feed</li>
              <li>Impact & Partnerize Brand Connectors</li>
              <li>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:underline"
                >
                  Open Live Feed & Click Analytics
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Commercial Compliance */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Commercial & Legal Compliance
            </h3>
            <ul className="mt-3 space-y-2.5 text-xs">
              <li>
                <Link
                  href="/legal/affiliate-disclosure"
                  className="flex items-center gap-1.5 text-slate-600 hover:text-rose-600"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-rose-500" />
                  FTC & EU Affiliate Disclosure
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="flex items-center gap-1.5 text-slate-600 hover:text-rose-600"
                >
                  <Scale className="h-3.5 w-3.5 text-slate-400" />
                  Terms of Service & Price Disclaimer
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacy"
                  className="flex items-center gap-1.5 text-slate-600 hover:text-rose-600"
                >
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  Privacy Policy & Affiliate Cookies (GDPR)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Disclaimer Box */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-[11px] leading-relaxed text-slate-500">
          <p className="font-semibold text-slate-700">
            Mandatory Commercial & Intellectual Property Notice:
          </p>
          <p className="mt-1">
            AuraDeals operates as an independent meta-search and price comparison platform. We do not sell, ship, or warehouse products directly. All brand names, trademarks, product titles, and imagery belong to their respective owners and are displayed under publisher promotional licenses via authorized affiliate data feeds. Prices, promo codes, and Black Friday stock availability are subject to change on the merchant&apos;s checkout page.
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} AuraDeals Meta-Search Engine. Portfolio & Commercial Architecture.</p>
          <p>Built with Next.js App Router, TypeScript, Tailwind CSS & Prisma Schema.</p>
        </div>
      </div>
    </footer>
  );
}
