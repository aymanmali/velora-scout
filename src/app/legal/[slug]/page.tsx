import React from "react";
import Link from "next/link";
import { ShieldCheck, Scale, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";

interface LegalContent {
  title: string;
  subtitle: string;
  lastUpdated: string;
  badge: string;
  sections: { heading: string; body: string }[];
}

const LEGAL_PAGES: Record<string, LegalContent> = {
  "affiliate-disclosure": {
    title: "FTC & EU Commercial Affiliate Disclosure",
    subtitle:
      "Transparency regarding how VeloraScout monetizes brand referrals and maintains editorial and search ranking independence.",
    lastUpdated: "November 2026",
    badge: "FTC 16 CFR Part 255 & EU Directive 2005/29/EC Compliant",
    sections: [
      {
        heading: "1. Commercial Affiliate Relationship Disclosure",
        body: "VeloraScout operates as a meta-search and price comparison platform for Fashion, Clothes, Cosmetics, Makeup, Skincare, and Beauty products. In compliance with the US Federal Trade Commission (FTC) guidelines (16 CFR Part 255), the UK ASA CAP Code, and the European Union Unfair Commercial Practices Directive, please be advised that VeloraScout participates in commercial affiliate marketing programs.",
      },
      {
        heading: "2. How Affiliate Links & Commissions Work",
        body: "When you search for a product on VeloraScout and click on a 'View Best Deal', 'Get Deal', or retailer comparison link (routed via /api/redirect), you are redirected to the official website of the third-party brand or authorized retailer (such as Sephora, Cult Beauty, ASOS, Nordstrom, Ulta Beauty, Selfridges, Zalando, or Farfetch). If you complete a qualifying purchase on the merchant's site, VeloraScout may earn a referral commission (typically 5% to 12% CPA) from the merchant or their affiliate network (Awin, Rakuten Advertising, CJ Affiliate, Impact, or Partnerize) at zero additional cost to you.",
      },
      {
        heading: "3. Algorithmic Search & Price Comparison Independence",
        body: "Our search engine indexes and sorts offers strictly based on consumer-selected criteria (such as Lowest Price, Biggest Discount Percentage, Verified Promo Codes, or Customer Rating). No brand or retailer can pay to artificially alter the mathematical price ranking when a user sorts by Lowest Price or Biggest Discount.",
      },
      {
        heading: "4. Intellectual Property & Authorized Product Data Feeds",
        body: "All brand logos, product titles, and product photographs displayed on VeloraScout are the property of their respective trademark and copyright holders. Product metadata is ingested via official publisher product data feeds solely to identify and promote the merchants' genuine products.",
      },
    ],
  },
  terms: {
    title: "Terms of Service & Price Accuracy Disclaimer",
    subtitle:
      "Legal terms governing your use of the VeloraScout meta-search engine and third-party retailer redirects.",
    lastUpdated: "November 2026",
    badge: "Meta-Search Intermediary Terms",
    sections: [
      {
        heading: "1. Role as a Meta-Search Intermediary (Not a Direct Seller)",
        body: "VeloraScout is an information discovery and price comparison service. We do not carry inventory, process customer payments, ship merchandise, or handle product returns. All sales contracts are formed exclusively between you (the shopper) and the destination retailer on their checkout page.",
      },
      {
        heading: "2. Real-Time Price, Black Friday Discount & Stock Disclaimer",
        body: "While our feed ingestion engine syncs product feeds frequently to reflect accurate Black Friday discounts, flash sales, and promo codes, retailers may update prices or exhaust stock at any moment. If a discrepancy exists between the price displayed on VeloraScout and the price shown on the merchant's checkout page, the price on the merchant's checkout page always governs.",
      },
      {
        heading: "3. Promo Codes & Coupon Eligibility",
        body: "Promo codes displayed on VeloraScout are provided by affiliate networks and merchant feeds. Certain exclusions (such as minimum spend thresholds, regional shipping restrictions, or one-per-customer limits) may apply on the retailer's site.",
      },
      {
        heading: "4. Customer Support, Returns & Warranties",
        body: "Any inquiries regarding order tracking, shipping delays, cosmetic authenticity, or refunds must be directed to the customer service department of the retailer from whom you purchased the product.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy & Affiliate Cookie Notice (GDPR / CCPA)",
    subtitle:
      "How VeloraScout handles search queries, local currency preferences, and third-party affiliate attribution cookies.",
    lastUpdated: "November 2026",
    badge: "GDPR & CCPA Privacy Architecture",
    sections: [
      {
        heading: "1. Minimal Data Collection Principle",
        body: "VeloraScout allows you to search and compare Fashion, Cosmetics, and Beauty offers without creating an account or submitting personal identification details (such as your name, home address, or credit card number).",
      },
      {
        heading: "2. Local Storage & Essential Preferences",
        body: "We store your selected display currency (USD, EUR, or GBP) and cookie consent choice in your browser's local storage solely to preserve your user experience across page loads.",
      },
      {
        heading: "3. Outbound Affiliate Click Attribution & Tracking Cookies",
        body: "When you click an outbound deal link (/api/redirect/[offerId]), our server records an anonymized click telemetry event (timestamp, offer ID, currency, and estimated commission) and appends standard affiliate parameters (such as click_id and network attribution tokens) to the destination URL. The destination merchant or affiliate network (e.g., Awin, Rakuten, CJ) places an attribution cookie on your browser (typically valid for 7 to 30 days) solely to recognize that VeloraScout referred your visit.",
      },
      {
        heading: "4. Your GDPR & CCPA Rights",
        body: "You may clear your browser cookies or select 'Essential Only' in our Cookie Consent banner at any time. Because we do not collect personal user accounts or sell personal data to data brokers, no personal profile exists to be sold or shared.",
      },
    ],
  },
};

export function generateStaticParams() {
  return [
    { slug: "affiliate-disclosure" },
    { slug: "terms" },
    { slug: "privacy" },
  ];
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = LEGAL_PAGES[slug] || LEGAL_PAGES["affiliate-disclosure"];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Top navigation tabs across all 3 legal documents */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Deal Search
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/legal/affiliate-disclosure"
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
              slug === "affiliate-disclosure"
                ? "bg-rose-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Affiliate Disclosure
          </Link>
          <Link
            href="/legal/terms"
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
              slug === "terms"
                ? "bg-rose-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            Terms of Service
          </Link>
          <Link
            href="/legal/privacy"
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
              slug === "privacy"
                ? "bg-rose-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            Privacy & Cookies
          </Link>
        </div>
      </div>

      {/* Document Card */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{page.badge}</span>
        </div>

        <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          {page.title}
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">{page.subtitle}</p>
        <p className="mt-2 text-xs font-semibold text-slate-400">
          Last Updated: {page.lastUpdated}
        </p>

        <div className="mt-8 space-y-6 border-t border-slate-100 pt-6">
          {page.sections.map((sec) => (
            <div key={sec.heading}>
              <h2 className="text-base font-extrabold text-slate-900">
                {sec.heading}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {sec.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
