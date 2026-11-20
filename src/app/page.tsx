"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Sparkles,
  Flame,
  Tag,
  Truck,
  Star,
  Copy,
  Check,
  Layers,
  ExternalLink,
  SlidersHorizontal,
  X,
  RotateCcw,
  ShoppingBag,
  ArrowUpDown,
  Store,
  CheckCircle2,
} from "lucide-react";
import {
  EnrichedProduct,
  ParsedSearchIntent,
  SearchQueryOptions,
} from "@/lib/db";
import {
  searchCatalogClient,
  recordClickClient,
} from "@/lib/client-engine";
import {
  BrandRecord,
  MerchantRecord,
  MerchantOfferRecord,
} from "@/lib/adapters/types";
import { useCurrency } from "@/components/CurrencyContext";
import { CompareModal } from "@/components/CompareModal";
import { RedirectModal, RedirectReceipt } from "@/components/RedirectModal";

const CATEGORY_TABS = [
  { id: "ALL", label: "All Deals" },
  { id: "CLOTHES", label: "Clothes & Fashion" },
  { id: "MAKEUP", label: "Makeup & Cosmetics" },
  { id: "SKINCARE", label: "Skincare & K-Beauty" },
  { id: "FRAGRANCE", label: "Luxury Fragrance" },
  { id: "ACCESSORIES", label: "Beauty Tech & Hair" },
];

const TRENDING_SEARCHES = [
  "MAC lipstick 40% off",
  "Waterproof mascara under $30",
  "Korean skincare",
  "Winter wool coat 50% off",
  "Charlotte Tilbury",
  "Fenty gloss",
  "Dyson Airwrap",
  "Nike Tech Fleece",
];

interface SearchApiResponse {
  products: EnrichedProduct[];
  totalProducts: number;
  totalOffersCount: number;
  parsedIntent: ParsedSearchIntent;
  facets: {
    categories: Record<string, number>;
    brands: BrandRecord[];
    merchants: MerchantRecord[];
  };
}

export default function HomePage() {
  const { currency, format } = useCurrency();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search & Filter states
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [brand, setBrand] = useState("ALL");
  const [merchant, setMerchant] = useState("ALL");
  const [minDiscount, setMinDiscount] = useState(0);
  const [onlyBlackFriday, setOnlyBlackFriday] = useState(false);
  const [onlyPromoCode, setOnlyPromoCode] = useState(false);
  const [onlyFreeShipping, setOnlyFreeShipping] = useState(false);
  const [sort, setSort] = useState("best_deal");

  // Data states
  const [data, setData] = useState<SearchApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Modal states
  const [compareProduct, setCompareProduct] = useState<EnrichedProduct | null>(
    null
  );
  const [redirectReceipt, setRedirectReceipt] =
    useState<RedirectReceipt | null>(null);
  const [redirectLoading, setRedirectLoading] = useState(false);

  // Keyboard shortcut "/" to focus Google-style search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 180);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search results from REST API
  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (category !== "ALL") params.set("category", category);
      if (brand !== "ALL") params.set("brand", brand);
      if (merchant !== "ALL") params.set("merchant", merchant);
      if (minDiscount > 0) params.set("minDiscount", String(minDiscount));
      if (onlyBlackFriday) params.set("blackFriday", "true");
      if (onlyPromoCode) params.set("hasPromo", "true");
      if (onlyFreeShipping) params.set("freeShipping", "true");
      params.set("sort", sort);

      const res = await fetch(`/api/search?${params.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as SearchApiResponse;
        setData(json);
        return;
      }
      throw new Error("Fallback to client engine");
    } catch {
      const fallback = searchCatalogClient({
        q: debouncedQuery,
        category,
        brand,
        merchant,
        minDiscount,
        onlyBlackFriday,
        onlyPromoCode,
        onlyFreeShipping,
        sort: sort as SearchQueryOptions["sort"],
      });
      setData(fallback);
    } finally {
      setLoading(false);
    }
  }, [
    debouncedQuery,
    category,
    brand,
    merchant,
    minDiscount,
    onlyBlackFriday,
    onlyPromoCode,
    onlyFreeShipping,
    sort,
  ]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleResetFilters = () => {
    setQuery("");
    setDebouncedQuery("");
    setCategory("ALL");
    setBrand("ALL");
    setMerchant("ALL");
    setMinDiscount(0);
    setOnlyBlackFriday(false);
    setOnlyPromoCode(false);
    setOnlyFreeShipping(false);
    setSort("best_deal");
  };

  const handleCopyPromo = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
    } catch {
      // ignore
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTriggerOfferRedirect = async (offer: MerchantOfferRecord) => {
    setCompareProduct(null);
    setRedirectLoading(true);
    setRedirectReceipt(null);
    try {
      const res = await fetch(
        `/api/redirect/${offer.id}?currency=${currency}&mode=json`
      );
      if (res.ok) {
        const receipt = (await res.json()) as RedirectReceipt;
        setRedirectReceipt(receipt);
        return;
      }
      throw new Error("Fallback to client attribution");
    } catch {
      const fallbackReceipt = recordClickClient(offer.id, currency);
      if (fallbackReceipt) {
        setRedirectReceipt(fallbackReceipt);
      }
    } finally {
      setRedirectLoading(false);
    }
  };

  const activeFiltersCount = [
    category !== "ALL",
    brand !== "ALL",
    merchant !== "ALL",
    minDiscount > 0,
    onlyBlackFriday,
    onlyPromoCode,
    onlyFreeShipping,
    Boolean(query.trim()),
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen pb-16">
      {/* ===================== GOOGLE-STYLE HERO SEARCH SECTION ===================== */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-rose-50/30 to-white pt-8 pb-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* Headline */}
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-rose-600" />
              <span>Multi-Brand Fashion, Cosmetics & Beauty Search Engine</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Search once. Compare every{" "}
              <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Black Friday & Brand Offer
              </span>
              .
            </h1>
            <p className="mx-auto mt-2.5 max-w-2xl text-sm text-slate-600">
              Real-time price & promo code comparison across{" "}
              <span className="font-semibold text-slate-800">
                Sephora, Cult Beauty, ASOS, Nordstrom, Ulta, Selfridges, Zalando & Farfetch
              </span>
              .
            </p>
          </div>

          {/* Google-Style Omnibox Search Bar */}
          <div className="mx-auto mt-6 max-w-3xl">
            <div className="relative flex items-center rounded-2xl border-2 border-slate-200 bg-white p-1.5 shadow-lg shadow-rose-500/5 transition-all focus-within:border-rose-500 focus-within:ring-4 focus-within:ring-rose-500/10">
              <Search className="ml-3.5 h-5 w-5 shrink-0 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search brands, products, or smart deals (e.g. "MAC lipstick 40% off", "waterproof mascara under $30")...'
                className="w-full bg-transparent px-3 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none sm:text-base"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mr-1 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <div className="hidden sm:flex items-center gap-1.5 pr-2">
                <kbd className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-400">
                  /
                </kbd>
              </div>
              <button
                type="button"
                onClick={() => fetchResults()}
                className="shrink-0 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:from-rose-700 hover:to-pink-700 sm:text-sm"
              >
                Search Deals
              </button>
            </div>

            {/* Smart Natural Language Query Intent Badges */}
            {data?.parsedIntent?.summaryBadges &&
              data.parsedIntent.summaryBadges.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 font-bold text-rose-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    Smart Filter Intent Applied:
                  </span>
                  {data.parsedIntent.summaryBadges.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 font-semibold text-rose-800"
                    >
                      <CheckCircle2 className="h-3 w-3 text-rose-600" />
                      {badge}
                    </span>
                  ))}
                </div>
              )}

            {/* Trending Quick Search Pills */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5">
              <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Trending:
              </span>
              {TRENDING_SEARCHES.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setQuery(pill)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                    query.toLowerCase() === pill.toLowerCase()
                      ? "border-rose-500 bg-rose-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                  }`}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          {/* Category Vertical Tabs */}
          <div className="mt-6 flex items-center justify-start gap-2 overflow-x-auto pb-1 sm:justify-center">
            {CATEGORY_TABS.map((tab) => {
              const count = data?.facets?.categories?.[tab.id] ?? 0;
              const active = category === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategory(tab.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all sm:text-sm ${
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      active
                        ? "bg-rose-500 text-white"
                        : "bg-white text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== MAIN CONTENT: FILTERS & RESULTS ===================== */}
      <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
        {/* Top Filter & Sort Control Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            {/* Left Quick Deal Toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="mr-1 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <SlidersHorizontal className="h-4 w-4 text-rose-600" />
                <span>Filters:</span>
              </div>

              {/* Black Friday Toggle */}
              <button
                type="button"
                onClick={() => setOnlyBlackFriday(!onlyBlackFriday)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                  onlyBlackFriday
                    ? "border-rose-600 bg-rose-600 text-white shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Flame className="h-3.5 w-3.5" />
                <span>Black Friday Only</span>
              </button>

              {/* Promo Code Toggle */}
              <button
                type="button"
                onClick={() => setOnlyPromoCode(!onlyPromoCode)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                  onlyPromoCode
                    ? "border-rose-600 bg-rose-600 text-white shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Tag className="h-3.5 w-3.5" />
                <span>Has Promo Code</span>
              </button>

              {/* Free Shipping Toggle */}
              <button
                type="button"
                onClick={() => setOnlyFreeShipping(!onlyFreeShipping)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                  onlyFreeShipping
                    ? "border-rose-600 bg-rose-600 text-white shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Truck className="h-3.5 w-3.5" />
                <span>Free Shipping</span>
              </button>

              {/* Minimum Discount Pills */}
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
                {[0, 30, 40, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setMinDiscount(pct)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      minDiscount === pct
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {pct === 0 ? "Any % Off" : `${pct}%+ Off`}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Dropdowns: Brand, Merchant, Sort */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Brand Select */}
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                aria-label="Filter by Brand"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-rose-500 focus:outline-none"
              >
                <option value="ALL">All Brands ({data?.facets?.brands?.length || 18})</option>
                {data?.facets?.brands?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              {/* Merchant Select */}
              <select
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                aria-label="Filter by Store / Platform"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-rose-500 focus:outline-none"
              >
                <option value="ALL">
                  All Retailers ({data?.facets?.merchants?.length || 8})
                </option>
                {data?.facets?.merchants?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.domain})
                  </option>
                ))}
              </select>

              {/* Sort Select */}
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1">
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort deals"
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="best_deal">Sort: Biggest Discount %</option>
                  <option value="price_asc">Sort: Lowest Price First</option>
                  <option value="price_desc">Sort: Highest Price First</option>
                  <option value="rating">Sort: Highest Rated</option>
                  <option value="most_compared">Sort: Most Stores Compared</option>
                </select>
              </div>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset ({activeFiltersCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Search Status Summary Bar */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <div>
              Showing{" "}
              <span className="font-bold text-slate-900">
                {data?.totalProducts ?? 0} products
              </span>{" "}
              with{" "}
              <span className="font-bold text-rose-600">
                {data?.totalOffersCount ?? 0} live merchant offers
              </span>{" "}
              compared across partner platforms
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Affiliate Feed Index Active
              </span>
            </div>
          </div>
        </div>

        {/* ===================== PRODUCT DEAL CARDS GRID ===================== */}
        {loading && !data ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
              />
            ))}
          </div>
        ) : data && data.products.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-lg font-extrabold text-slate-900">
              No matching deals found for your current filters
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
              Try clearing some filters or searching for broader terms like &quot;lipstick&quot;, &quot;skincare&quot;, &quot;coat&quot;, or &quot;40% off&quot;.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset All Search Filters
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data?.products.map((product) => {
              const best = product.bestOffer;
              const imgFailed = imageErrors[product.id];

              return (
                <article
                  key={product.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-xl"
                >
                  <div>
                    {/* Card Image Header */}
                    <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                      {!imgFailed ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          onError={() =>
                            setImageErrors((prev) => ({
                              ...prev,
                              [product.id]: true,
                            }))
                          }
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${product.accentGradient} p-6 text-center text-white`}
                        >
                          <Sparkles className="h-8 w-8 opacity-80" />
                          <span className="mt-2 text-sm font-extrabold uppercase tracking-wider">
                            {product.brandName}
                          </span>
                          <span className="mt-1 text-xs opacity-90">
                            {product.subcategory}
                          </span>
                        </div>
                      )}

                      {/* Top-left Discount & Black Friday Badges */}
                      <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-extrabold text-white shadow-md">
                          -{product.maxDiscountPercent}% OFF
                        </span>
                        {product.hasBlackFriday && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-900/90 px-2.5 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-sm">
                            <Flame className="h-3 w-3 fill-amber-400 text-amber-400" />
                            BLACK FRIDAY
                          </span>
                        )}
                      </div>

                      {/* Top-right Multi-Store Count Badge */}
                      <button
                        type="button"
                        onClick={() => setCompareProduct(product)}
                        className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-md backdrop-blur-sm hover:bg-rose-50 hover:text-rose-700"
                      >
                        <Layers className="h-3 w-3 text-rose-600" />
                        <span>{product.offerCount} Stores</span>
                      </button>

                      {/* Bottom Category & Rating Overlay */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                        <span className="rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-800 shadow-sm backdrop-blur-sm">
                          {product.brandName}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-900/85 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {product.rating} ({product.reviewCount.toLocaleString()})
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">
                        {product.category} • {product.subcategory}
                      </div>
                      <h2 className="mt-1 line-clamp-2 text-base font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors">
                        {product.title}
                      </h2>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                        {product.description}
                      </p>

                      {/* Winning Offer Highlight Box */}
                      {best && (
                        <div className="mt-4 rounded-xl border border-rose-200/80 bg-gradient-to-br from-rose-50/70 via-white to-pink-50/40 p-3.5">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-bold text-slate-500">
                                  Lowest Price at
                                </span>
                                <span className="inline-flex items-center gap-1 rounded bg-slate-900 px-1.5 py-0.5 text-[11px] font-bold text-white">
                                  <Store className="h-2.5 w-2.5" />
                                  {best.merchantName}
                                </span>
                              </div>
                              <div className="mt-1 flex items-baseline gap-2">
                                <span className="text-2xl font-extrabold text-slate-900">
                                  {format(best.salePriceUsd)}
                                </span>
                                <span className="text-xs font-medium text-slate-400 line-through">
                                  {format(best.originalPriceUsd)}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-extrabold text-emerald-800">
                                Save {format(product.savingsUsd)}
                              </span>
                              <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-slate-500">
                                <Truck className="h-3 w-3 text-emerald-600" />
                                <span>
                                  {best.freeShipping
                                    ? "Free Shipping"
                                    : "Standard Ship"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Promo Code Copy Bar if available */}
                          {best.promoCode && (
                            <div className="mt-2.5 flex items-center justify-between border-t border-rose-200/60 pt-2">
                              <span className="text-[11px] font-medium text-rose-800 truncate pr-2">
                                {best.promoDescription || "Use code at checkout:"}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyPromo(best.promoCode!)}
                                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-dashed border-rose-400 bg-white px-2 py-0.5 text-[11px] font-extrabold text-rose-700 hover:bg-rose-50"
                                title="Copy Promo Code"
                              >
                                <Tag className="h-3 w-3" />
                                <span>{best.promoCode}</span>
                                {copiedCode === best.promoCode ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3 text-slate-400" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Mini Multi-Store Price Comparison Strip */}
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                          <span>Price Comparison Across Platforms:</span>
                          <span>{product.offerCount} offers</span>
                        </div>
                        {product.offers.slice(0, 3).map((offer, idx) => (
                          <div
                            key={offer.id}
                            onClick={() => handleTriggerOfferRedirect(offer)}
                            className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-1.5 text-xs transition-colors hover:border-rose-200 hover:bg-rose-50/40"
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  idx === 0 ? "bg-emerald-500" : "bg-slate-400"
                                }`}
                              />
                              <span className="font-bold text-slate-800">
                                {offer.merchantName}
                              </span>
                              {offer.promoCode && (
                                <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[10px] font-semibold text-rose-700">
                                  {offer.promoCode}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400 line-through">
                                {format(offer.originalPriceUsd)}
                              </span>
                              <span className="font-extrabold text-slate-900">
                                {format(offer.salePriceUsd)}
                              </span>
                              <ExternalLink className="h-3 w-3 text-slate-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer CTAs */}
                  <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => setCompareProduct(product)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50"
                    >
                      <Layers className="h-3.5 w-3.5 text-rose-600" />
                      <span>Compare ({product.offerCount})</span>
                    </button>

                    {best && (
                      <button
                        type="button"
                        onClick={() => handleTriggerOfferRedirect(best)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-3 py-2.5 text-xs font-bold text-white shadow-sm hover:from-rose-700 hover:to-pink-700"
                      >
                        <span>View Best Deal</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Multi-Brand Price Comparison Modal */}
      <CompareModal
        product={compareProduct}
        onClose={() => setCompareProduct(null)}
        onSelectOffer={(offer) => handleTriggerOfferRedirect(offer)}
      />

      {/* Affiliate Click Attribution & Redirect Modal */}
      <RedirectModal
        receipt={redirectReceipt}
        loading={redirectLoading}
        onClose={() => {
          setRedirectReceipt(null);
          setRedirectLoading(false);
        }}
      />
    </div>
  );
}
