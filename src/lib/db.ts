import fs from "fs";
import path from "path";
import {
  BrandRecord,
  MerchantRecord,
  ProductRecord,
  MerchantOfferRecord,
  ProductCategory,
  FeedSyncResult,
} from "./adapters/types";

export type { MerchantOfferRecord };
import { getSeedCatalog } from "./seed-data";
import { DemoFeedAdapter } from "./adapters/demo-adapter";
import { AffiliateCsvFeedAdapter } from "./adapters/affiliate-csv-adapter";

export interface ClickEventRecord {
  id: string;
  offerId: string;
  productId: string;
  productTitle: string;
  brandName: string;
  merchantId: string;
  merchantName: string;
  affiliateNetwork: string;
  salePriceUsd: number;
  currency: string;
  commissionRate: number;
  estimatedCommissionUsd: number;
  promoCodeApplied: string | null;
  timestamp: string;
}

export interface EnrichedProduct extends ProductRecord {
  bestOffer: MerchantOfferRecord;
  lowestPriceUsd: number;
  highestPriceUsd: number;
  highestOriginalPriceUsd: number;
  maxDiscountPercent: number;
  savingsUsd: number;
  offerCount: number;
  hasBlackFriday: boolean;
  hasPromoCode: boolean;
  hasFreeShipping: boolean;
}

export interface ParsedSearchIntent {
  rawQuery: string;
  cleanKeywords: string[];
  detectedMaxPriceUsd: number | null;
  detectedMinDiscount: number | null;
  detectedCategory: ProductCategory | null;
  detectedBlackFriday: boolean;
  detectedFreeShipping: boolean;
  summaryBadges: string[];
}

export interface SearchQueryOptions {
  q?: string;
  category?: string;
  brand?: string;
  merchant?: string;
  minDiscount?: number;
  onlyBlackFriday?: boolean;
  onlyPromoCode?: boolean;
  onlyFreeShipping?: boolean;
  maxPrice?: number;
  sort?: "best_deal" | "price_asc" | "price_desc" | "rating" | "most_compared";
}

interface StoreState {
  brands: BrandRecord[];
  merchants: MerchantRecord[];
  products: ProductRecord[];
  clickEvents: ClickEventRecord[];
  syncLogs: FeedSyncResult[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "store.json");

let memoryStore: StoreState | null = null;

function createInitialBaselineClicks(products: ProductRecord[]): ClickEventRecord[] {
  const events: ClickEventRecord[] = [];
  const sampleProducts = products.slice(0, 8);
  const now = Date.now();

  sampleProducts.forEach((prod, idx) => {
    const offer = prod.offers[0];
    if (!offer) return;
    const estCommission = Number((offer.salePriceUsd * offer.commissionRate).toFixed(2));
    events.push({
      id: `clk-seed-${idx + 1}`,
      offerId: offer.id,
      productId: prod.id,
      productTitle: prod.title,
      brandName: prod.brandName,
      merchantId: offer.merchantId,
      merchantName: offer.merchantName,
      affiliateNetwork: offer.affiliateNetwork,
      salePriceUsd: offer.salePriceUsd,
      currency: "USD",
      commissionRate: offer.commissionRate,
      estimatedCommissionUsd: estCommission,
      promoCodeApplied: offer.promoCode,
      timestamp: new Date(now - (idx + 1) * 14 * 60 * 1000).toISOString(),
    });
  });

  return events;
}

function createInitialStore(): StoreState {
  const seed = getSeedCatalog();
  const totalOffers = seed.products.reduce((acc, p) => acc + p.offers.length, 0);
  const bfOffers = seed.products.reduce(
    (acc, p) => acc + p.offers.filter((o) => o.isBlackFriday).length,
    0
  );

  return {
    brands: seed.brands,
    merchants: seed.merchants,
    products: seed.products,
    clickEvents: createInitialBaselineClicks(seed.products),
    syncLogs: [
      {
        id: "sync-init-1",
        adapterName: "DemoMultiNetworkFeedAdapter",
        network: "Awin + Rakuten + CJ + Impact + Partnerize",
        status: "SUCCESS",
        productsSynced: seed.products.length,
        offersUpdated: totalOffers,
        blackFridayDeals: bfOffers,
        durationMs: 142,
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        notes: "Initial multi-brand Black Friday catalog indexed",
      },
    ],
  };
}

function loadStore(): StoreState {
  if (memoryStore) {
    return memoryStore;
  }

  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(raw) as StoreState;
      if (parsed && Array.isArray(parsed.products) && parsed.products.length > 0) {
        memoryStore = parsed;
        return memoryStore;
      }
    }
  } catch {
    // Fallback to in-memory store (e.g., on serverless read-only filesystem)
  }

  memoryStore = createInitialStore();
  saveStore(memoryStore);
  return memoryStore;
}

function saveStore(state: StoreState): void {
  memoryStore = state;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(state, null, 2), "utf-8");
  } catch {
    // Ignore filesystem write errors in serverless read-only environments
  }
}

export function enrichProduct(product: ProductRecord): EnrichedProduct {
  const sortedOffers = [...product.offers].sort(
    (a, b) => a.salePriceUsd - b.salePriceUsd
  );
  const bestOffer = sortedOffers[0];
  const lowestPriceUsd = bestOffer ? bestOffer.salePriceUsd : 0;
  const highestPriceUsd =
    sortedOffers.length > 0
      ? sortedOffers[sortedOffers.length - 1].salePriceUsd
      : 0;
  const highestOriginalPriceUsd = product.offers.reduce(
    (max, o) => Math.max(max, o.originalPriceUsd),
    0
  );
  const maxDiscountPercent = product.offers.reduce(
    (max, o) => Math.max(max, o.discountPercent),
    0
  );
  const savingsUsd = Number(
    Math.max(0, highestOriginalPriceUsd - lowestPriceUsd).toFixed(2)
  );

  return {
    ...product,
    offers: sortedOffers,
    bestOffer,
    lowestPriceUsd,
    highestPriceUsd,
    highestOriginalPriceUsd,
    maxDiscountPercent,
    savingsUsd,
    offerCount: sortedOffers.length,
    hasBlackFriday: sortedOffers.some((o) => o.isBlackFriday),
    hasPromoCode: sortedOffers.some((o) => Boolean(o.promoCode)),
    hasFreeShipping: sortedOffers.some((o) => o.freeShipping),
  };
}

export function parseSearchIntent(rawQuery: string = ""): ParsedSearchIntent {
  let working = rawQuery.toLowerCase().trim();
  const summaryBadges: string[] = [];

  let detectedMaxPriceUsd: number | null = null;
  let detectedMinDiscount: number | null = null;
  let detectedCategory: ProductCategory | null = null;
  let detectedBlackFriday = false;
  let detectedFreeShipping = false;

  // Detect "under $50" or "below 40" or "< $100"
  const priceMatch = working.match(/(?:under|below|less than|<)\s*[$€£]?\s*(\d+(?:\.\d+)?)/i);
  if (priceMatch) {
    detectedMaxPriceUsd = parseFloat(priceMatch[1]);
    summaryBadges.push(`Max Price: $${detectedMaxPriceUsd}`);
    working = working.replace(priceMatch[0], " ");
  }

  // Detect "40% off" or "30%+ off"
  const discountMatch = working.match(/(\d{2})\s*%\+?\s*(?:off|discount)?/i);
  if (discountMatch) {
    detectedMinDiscount = parseInt(discountMatch[1], 10);
    summaryBadges.push(`${detectedMinDiscount}%+ Off`);
    working = working.replace(discountMatch[0], " ");
  }

  // Detect "black friday"
  if (working.includes("black friday") || working.includes("cyber")) {
    detectedBlackFriday = true;
    summaryBadges.push("Black Friday Deal");
    working = working.replace(/black friday|cyber monday|cyber/gi, " ");
  }

  // Detect "free shipping"
  if (working.includes("free shipping")) {
    detectedFreeShipping = true;
    summaryBadges.push("Free Shipping");
    working = working.replace(/free shipping/gi, " ");
  }

  const stopWords = new Set(["at", "with", "for", "and", "or", "the", "in", "on", "deals", "deal", "offers", "offer", "sale"]);
  const cleanKeywords = working
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9-]/g, ""))
    .filter((w) => w.length > 1 && !stopWords.has(w));

  return {
    rawQuery,
    cleanKeywords,
    detectedMaxPriceUsd,
    detectedMinDiscount,
    detectedCategory,
    detectedBlackFriday,
    detectedFreeShipping,
    summaryBadges,
  };
}

export function searchCatalog(options: SearchQueryOptions = {}) {
  const store = loadStore();
  const intent = parseSearchIntent(options.q || "");

  const effectiveMaxPrice =
    options.maxPrice && options.maxPrice > 0
      ? options.maxPrice
      : intent.detectedMaxPriceUsd;

  const effectiveMinDiscount =
    options.minDiscount && options.minDiscount > 0
      ? options.minDiscount
      : intent.detectedMinDiscount || 0;

  const effectiveBlackFriday =
    Boolean(options.onlyBlackFriday) || intent.detectedBlackFriday;

  const effectiveFreeShipping =
    Boolean(options.onlyFreeShipping) || intent.detectedFreeShipping;

  const allEnriched = store.products.map(enrichProduct);

  const filtered = allEnriched.filter((product) => {
    // Category filter
    if (options.category && options.category !== "ALL") {
      if (product.category !== options.category) return false;
    }

    // Brand filter
    if (options.brand && options.brand !== "ALL") {
      if (
        product.brandId !== options.brand &&
        product.brandName.toLowerCase() !== options.brand.toLowerCase()
      ) {
        return false;
      }
    }

    // Merchant filter
    if (options.merchant && options.merchant !== "ALL") {
      const hasMerchant = product.offers.some(
        (o) =>
          o.merchantId === options.merchant ||
          o.merchantName.toLowerCase() === options.merchant?.toLowerCase()
      );
      if (!hasMerchant) return false;
    }

    // Min discount filter
    if (effectiveMinDiscount > 0) {
      if (product.maxDiscountPercent < effectiveMinDiscount) return false;
    }

    // Black Friday filter
    if (effectiveBlackFriday && !product.hasBlackFriday) {
      return false;
    }

    // Promo code filter
    if (options.onlyPromoCode && !product.hasPromoCode) {
      return false;
    }

    // Free shipping filter
    if (effectiveFreeShipping && !product.hasFreeShipping) {
      return false;
    }

    // Max price filter
    if (effectiveMaxPrice && effectiveMaxPrice > 0) {
      if (product.lowestPriceUsd > effectiveMaxPrice) return false;
    }

    // Full-text keyword matching
    if (intent.cleanKeywords.length > 0) {
      const searchableBlob = [
        product.title,
        product.brandName,
        product.category,
        product.subcategory,
        product.description,
        ...product.tags,
        ...product.offers.map((o) => `${o.merchantName} ${o.promoCode || ""}`),
      ]
        .join(" ")
        .toLowerCase();

      const matchesAll = intent.cleanKeywords.every((kw) =>
        searchableBlob.includes(kw)
      );
      if (!matchesAll) return false;
    }

    return true;
  });

  // Sorting
  const sortMode = options.sort || "best_deal";
  filtered.sort((a, b) => {
    if (sortMode === "price_asc") {
      return a.lowestPriceUsd - b.lowestPriceUsd;
    }
    if (sortMode === "price_desc") {
      return b.lowestPriceUsd - a.lowestPriceUsd;
    }
    if (sortMode === "rating") {
      return b.rating - a.rating || b.reviewCount - a.reviewCount;
    }
    if (sortMode === "most_compared") {
      return b.offerCount - a.offerCount || b.maxDiscountPercent - a.maxDiscountPercent;
    }
    // Default: "best_deal"
    return (
      b.maxDiscountPercent - a.maxDiscountPercent ||
      b.savingsUsd - a.savingsUsd
    );
  });

  // Compute dynamic facets across all catalog items
  const categoryFacets: Record<string, number> = { ALL: allEnriched.length };
  allEnriched.forEach((p) => {
    categoryFacets[p.category] = (categoryFacets[p.category] || 0) + 1;
  });

  const totalOffersCount = filtered.reduce((acc, p) => acc + p.offerCount, 0);

  return {
    products: filtered,
    totalProducts: filtered.length,
    totalOffersCount,
    parsedIntent: intent,
    facets: {
      categories: categoryFacets,
      brands: store.brands,
      merchants: store.merchants,
    },
  };
}

export function findOfferById(offerId: string): {
  offer: MerchantOfferRecord;
  product: ProductRecord;
} | null {
  const store = loadStore();
  for (const product of store.products) {
    const found = product.offers.find((o) => o.id === offerId);
    if (found) {
      return { offer: found, product };
    }
  }
  return null;
}

export function recordClickEvent(
  offerId: string,
  currency: string = "USD"
): ClickEventRecord | null {
  const store = loadStore();
  const match = findOfferById(offerId);
  if (!match) return null;

  const { offer, product } = match;
  const estimatedCommissionUsd = Number(
    (offer.salePriceUsd * offer.commissionRate).toFixed(2)
  );

  const clickEvent: ClickEventRecord = {
    id: `clk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    offerId: offer.id,
    productId: product.id,
    productTitle: product.title,
    brandName: product.brandName,
    merchantId: offer.merchantId,
    merchantName: offer.merchantName,
    affiliateNetwork: offer.affiliateNetwork,
    salePriceUsd: offer.salePriceUsd,
    currency,
    commissionRate: offer.commissionRate,
    estimatedCommissionUsd,
    promoCodeApplied: offer.promoCode,
    timestamp: new Date().toISOString(),
  };

  store.clickEvents.unshift(clickEvent);
  saveStore(store);
  return clickEvent;
}

export function getAnalyticsSummary() {
  const store = loadStore();
  const enriched = store.products.map(enrichProduct);
  const totalProducts = enriched.length;
  const totalOffers = enriched.reduce((acc, p) => acc + p.offerCount, 0);
  const blackFridayOffers = enriched.reduce(
    (acc, p) => acc + p.offers.filter((o) => o.isBlackFriday).length,
    0
  );
  const avgDiscountPercent = Math.round(
    enriched.reduce((acc, p) => acc + p.maxDiscountPercent, 0) /
      Math.max(1, totalProducts)
  );

  const totalClicks = store.clickEvents.length;
  const totalEstimatedCommissionUsd = Number(
    store.clickEvents
      .reduce((acc, c) => acc + c.estimatedCommissionUsd, 0)
      .toFixed(2)
  );
  const totalGmvReferredUsd = Number(
    store.clickEvents.reduce((acc, c) => acc + c.salePriceUsd, 0).toFixed(2)
  );

  // Merchant breakdown
  const merchantStats = store.merchants.map((m) => {
    const mClicks = store.clickEvents.filter((c) => c.merchantId === m.id);
    const clicksCount = mClicks.length;
    const estCommission = Number(
      mClicks.reduce((acc, c) => acc + c.estimatedCommissionUsd, 0).toFixed(2)
    );
    const activeOffersCount = store.products.reduce(
      (acc, p) => acc + p.offers.filter((o) => o.merchantId === m.id).length,
      0
    );

    return {
      ...m,
      clicksCount,
      estCommission,
      activeOffersCount,
    };
  });

  merchantStats.sort((a, b) => b.estCommission - a.estCommission);

  return {
    kpis: {
      totalProducts,
      totalOffers,
      blackFridayOffers,
      avgDiscountPercent,
      totalClicks,
      totalEstimatedCommissionUsd,
      totalGmvReferredUsd,
    },
    merchantStats,
    recentClicks: store.clickEvents.slice(0, 15),
    syncLogs: store.syncLogs.slice(0, 10),
  };
}

export async function runFeedSync(
  mode: "demo" | "commercial" = "demo"
): Promise<FeedSyncResult> {
  const start = Date.now();
  const store = loadStore();
  const adapter =
    mode === "commercial"
      ? new AffiliateCsvFeedAdapter()
      : new DemoFeedAdapter();

  const payload = await adapter.fetchNormalizedCatalog();
  store.brands = payload.brands;
  store.merchants = payload.merchants;
  store.products = payload.products;

  const offersUpdated = payload.products.reduce(
    (acc, p) => acc + p.offers.length,
    0
  );
  const blackFridayDeals = payload.products.reduce(
    (acc, p) => acc + p.offers.filter((o) => o.isBlackFriday).length,
    0
  );

  const syncLog: FeedSyncResult = {
    id: `sync-${Date.now()}`,
    adapterName: adapter.name,
    network: adapter.network,
    status: "SUCCESS",
    productsSynced: payload.products.length,
    offersUpdated,
    blackFridayDeals,
    durationMs: Math.max(48, Date.now() - start),
    timestamp: new Date().toISOString(),
    notes: adapter.isCommercialLive
      ? "Synced live affiliate network datafeed"
      : "Synced multi-brand Black Friday portfolio catalog",
  };

  store.syncLogs.unshift(syncLog);
  saveStore(store);
  return syncLog;
}
