"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Search,
  BarChart3,
  ShieldCheck,
  Flame,
  Globe,
} from "lucide-react";
import { useCurrency } from "./CurrencyContext";
import { CurrencyCode } from "@/lib/currency";

export function Navbar() {
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      {/* Top FTC & Black Friday Commercial Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 px-4 py-1.5 text-xs text-slate-200">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2 py-0.5 font-semibold text-rose-300 ring-1 ring-rose-500/40">
              <Flame className="h-3 w-3 text-rose-400" />
              BLACK FRIDAY & CYBER WEEK LIVE
            </span>
            <span className="hidden sm:inline text-slate-300">
              Comparing real-time Fashion, Makeup & Skincare deals across 8+ partner networks.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>
               FTC Disclosure: We may earn a commission via partner links.{" "}
              <Link
                href="/legal/affiliate-disclosure"
                className="text-rose-300 underline hover:text-white"
              >
                Learn more
              </Link>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 text-white shadow-md shadow-rose-500/20 transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Velora<span className="text-rose-600">Scout</span>
              </span>
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Meta-Search
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Fashion, Cosmetics & Beauty Offer Engine
            </p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/"
                ? "bg-rose-50 text-rose-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Search className="h-4 w-4" />
            <span>Deal Search</span>
          </Link>

          <Link
            href="/admin"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname?.startsWith("/admin")
                ? "bg-rose-50 text-rose-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Merchant & Feed Analytics</span>
          </Link>

          <Link
            href="/legal/affiliate-disclosure"
            className={`hidden md:flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname?.startsWith("/legal")
                ? "bg-rose-50 text-rose-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Commercial & Legal</span>
          </Link>
        </nav>

        {/* Right Currency Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <Globe className="ml-2 mr-1 h-3.5 w-3.5 text-slate-400 hidden sm:inline" />
            {(["USD", "EUR", "GBP"] as CurrencyCode[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setCurrency(code)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
                  currency === code
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {code === "USD" ? "$ USD" : code === "EUR" ? "€ EUR" : "£ GBP"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
