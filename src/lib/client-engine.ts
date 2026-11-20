import {
  BrandRecord,
  MerchantRecord,
  ProductRecord,
  MerchantOfferRecord,
  ProductCategory,
  FeedSyncResult,
} from "./adapters/types";
import { getSeedCatalog } from "./seed-data";
import type {
  ClickEventRecord,
  EnrichedProduct,
  ParsedSearchIntent,
  SearchQueryOptions,
} from "./db";

const CLICKS_STORAGE_KEY = "auradeals_live_clicks_v1";
const SYNCS_STORAGE_KEY = "auradeals_live_syncs_v1";

export function enrichProductClient(product: ProductRecord): EnrichedProduct {
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

export function parseSearchIntentClient(rawQuery: string = ""): ParsedSearchIntent {
  let working = rawQuery.toLowerCase().trim();
  const summaryBadges: string[] = [];

  let detectedMaxPriceUsd: number | null = null;
  let detectedMinDiscount: number | null = null;
  const detectedCategory: ProductCategory | null = null;
  let detectedBlackFriday = false;
  let detectedFreeShipping = false;

  const priceMatch = working.match(
    /(?:under|below|less than|<)\s*[$€£]?\s*(\d+(?:\.\d+)?)/i
  );
  if (priceMatch) {
    detectedMaxPriceUsd = parseFloat(priceMatch[1]);
    summaryBadges.push(`Max Price: $${detectedMaxPriceUsd}`);
    working = working.replace(priceMatch[0], " ");
  }

  const discountMatch = working.match(/(\d{2})\s*%\+?\s*(?:off|discount)?/i);
  if (discountMatch) {
    detectedMinDiscount = parseInt(discountMatch[1], 10);
    summaryBadges.push(`${detectedMinDiscount}%+ Off`);
    working = working.replace(discountMatch[0], " ");
  }

  if (working.includes("black friday") || working.includes("cyber")) {
    detectedBlackFriday = true;
    summaryBadges.push("Black Friday Deal");
    working = working.replace(/black friday|cyber monday|cyber/gi, " ");
  }

  if (working.includes("free shipping")) {
    detectedFreeShipping = true;
    summaryBadges.push("Free Shipping");
    working = working.replace(/free shipping/gi, " ");
  }

  const stopWords = new Set([
    "at",
    "with",
    "for",
    "and",
    "or",
    "the",
    "in",
    "on",
    "deals",
    "deal",
    "offers",
    "offer",
    "sale",
  ]);
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

function getStoredClicks(products: ProductRecord[]): ClickEventRecord[] {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(CLICKS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ClickEventRecord[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
  }

  const events: ClickEventRecord[] = [];
  const sampleProducts = products.slice(0, 8);
  const now = Date.now();

  sampleProducts.forEach((prod, idx) => {
    const offer = prod.offers[0];
    if (!offer) return;
    const estCommission = Number(
      (offer.salePriceUsd * offer.commissionRate).toFixed(2)
    );
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

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CLICKS_STORAGE_KEY, JSON.stringify(events));
    } catch {
      // ignore
    }
  }
  return events;
}

function getStoredSyncLogs(products: ProductRecord[]): FeedSyncResult[] {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(SYNCS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as FeedSyncResult[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
  }

  const totalOffers = products.reduce((acc, p) => acc + p.offers.length, 0);
  const bfOffers = products.reduce(
    (acc, p) => acc + p.offers.filter((o) => o.isBlackFriday).length,
    0
  );

  const initial: FeedSyncResult[] = [
    {
      id: "sync-init-1",
      adapterName: "DemoMultiNetworkFeedAdapter",
      network: "Awin + Rakuten + CJ + Impact + Partnerize",
      status: "SUCCESS",
      productsSynced: products.length,
      offersUpdated: totalOffers,
      blackFridayDeals: bfOffers,
      durationMs: 142,
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      notes: "Initial multi-brand Black Friday catalog indexed",
    },
  ];

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SYNCS_STORAGE_KEY, JSON.stringify(initial));
    } catch {
      // ignore
    }
  }
  return initial;
}

export function searchCatalogClient(options: SearchQueryOptions = {}) {
  const seed = getSeedCatalog();
  const intent = parseSearchIntentClient(options.q || "");

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

  const allEnriched = seed.products.map(enrichProductClient);

  const filtered = allEnriched.filter((product) => {
    if (options.category && options.category !== "ALL") {
      if (product.category !== options.category) return false;
    }

    if (options.brand && options.brand !== "ALL") {
      if (
        product.brandId !== options.brand &&
        product.brandName.toLowerCase() !== options.brand.toLowerCase()
      ) {
        return false;
      }
    }

    if (options.merchant && options.merchant !== "ALL") {
      const hasMerchant = product.offers.some(
        (o) =>
          o.merchantId === options.merchant ||
          o.merchantName.toLowerCase() === options.merchant?.toLowerCase()
      );
      if (!hasMerchant) return false;
    }

    if (effectiveMinDiscount > 0) {
      if (product.maxDiscountPercent < effectiveMinDiscount) return false;
    }

    if (effectiveBlackFriday && !product.hasBlackFriday) {
      return false;
    }

    if (options.onlyPromoCode && !product.hasPromoCode) {
      return false;
    }

    if (effectiveFreeShipping && !product.hasFreeShipping) {
      return false;
    }

    if (effectiveMaxPrice && effectiveMaxPrice > 0) {
      if (product.lowestPriceUsd > effectiveMaxPrice) return false;
    }

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

  const sortMode = options.sort || "best_deal";
  filtered.sort((a, b) => {
    if (sortMode === "price_asc") return a.lowestPriceUsd - b.lowestPriceUsd;
    if (sortMode === "price_desc") return b.lowestPriceUsd - a.lowestPriceUsd;
    if (sortMode === "rating")
      return b.rating - a.rating || b.reviewCount - a.reviewCount;
    if (sortMode === "most_compared")
      return (
        b.offerCount - a.offerCount ||
        b.maxDiscountPercent - a.maxDiscountPercent
      );
    return (
      b.maxDiscountPercent - a.maxDiscountPercent ||
      b.savingsUsd - a.savingsUsd
    );
  });

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
      brands: seed.brands as BrandRecord[],
      merchants: seed.merchants as MerchantRecord[],
    },
  };
}

export function recordClickClient(offerId: string, currency: string = "USD") {
  const seed = getSeedCatalog();
  let foundOffer: MerchantOfferRecord | null = null;
  let foundProduct: ProductRecord | null = null;

  for (const product of seed.products) {
    const match = product.offers.find((o) => o.id === offerId);
    if (match) {
      foundOffer = match;
      foundProduct = product;
      break;
    }
  }

  if (!foundOffer || !foundProduct) return null;

  const estimatedCommissionUsd = Number(
    (foundOffer.salePriceUsd * foundOffer.commissionRate).toFixed(2)
  );

  const clickEvent: ClickEventRecord = {
    id: `clk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    offerId: foundOffer.id,
    productId: foundProduct.id,
    productTitle: foundProduct.title,
    brandName: foundProduct.brandName,
    merchantId: foundOffer.merchantId,
    merchantName: foundOffer.merchantName,
    affiliateNetwork: foundOffer.affiliateNetwork,
    salePriceUsd: foundOffer.salePriceUsd,
    currency,
    commissionRate: foundOffer.commissionRate,
    estimatedCommissionUsd,
    promoCodeApplied: foundOffer.promoCode,
    timestamp: new Date().toISOString(),
  };

  const existing = getStoredClicks(seed.products);
  const updated = [clickEvent, ...existing];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CLICKS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  const separator = foundOffer.affiliateUrl.includes("?") ? "&" : "?";
  const trackedOutboundUrl = `${foundOffer.affiliateUrl}${separator}utm_source=auradeals&utm_medium=meta_search&aff_network=${foundOffer.affiliateNetwork.toLowerCase()}&click_id=${clickEvent.id}`;

  return {
    status: "CLICK_ATTRIBUTED",
    clickEvent,
    offer: foundOffer,
    product: {
      id: foundProduct.id,
      title: foundProduct.title,
      brandName: foundProduct.brandName,
      category: foundProduct.category,
    },
    trackedOutboundUrl,
    legalDisclosure:
      "AuraDeals earns an affiliate commission when you complete a purchase via this merchant link, at no additional cost to you.",
  };
}

export function getAnalyticsSummaryClient() {
  const seed = getSeedCatalog();
  const enriched = seed.products.map(enrichProductClient);
  const clickEvents = getStoredClicks(seed.products);
  const syncLogs = getStoredSyncLogs(seed.products);

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

  const totalClicks = clickEvents.length;
  const totalEstimatedCommissionUsd = Number(
    clickEvents
      .reduce((acc, c) => acc + c.estimatedCommissionUsd, 0)
      .toFixed(2)
  );
  const totalGmvReferredUsd = Number(
    clickEvents.reduce((acc, c) => acc + c.salePriceUsd, 0).toFixed(2)
  );

  const merchantStats = seed.merchants.map((m) => {
    const mClicks = clickEvents.filter((c) => c.merchantId === m.id);
    const clicksCount = mClicks.length;
    const estCommission = Number(
      mClicks.reduce((acc, c) => acc + c.estimatedCommissionUsd, 0).toFixed(2)
    );
    const activeOffersCount = seed.products.reduce(
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
    recentClicks: clickEvents.slice(0, 15),
    syncLogs: syncLogs.slice(0, 10),
  };
}

export function runFeedSyncClient() {
  const seed = getSeedCatalog();
  const offersUpdated = seed.products.reduce(
    (acc, p) => acc + p.offers.length,
    0
  );
  const blackFridayDeals = seed.products.reduce(
    (acc, p) => acc + p.offers.filter((o) => o.isBlackFriday).length,
    0
  );

  const syncResult: FeedSyncResult = {
    id: `sync-${Date.now()}`,
    adapterName: "DemoMultiNetworkFeedAdapter",
    network: "Portfolio Multi-Network Simulator (Awin + Rakuten + CJ + Impact)",
    status: "SUCCESS",
    productsSynced: seed.products.length,
    offersUpdated,
    blackFridayDeals,
    durationMs: 64,
    timestamp: new Date().toISOString(),
    notes: "Synced multi-brand Black Friday portfolio catalog",
  };

  const existing = getStoredSyncLogs(seed.products);
  const updated = [syncResult, ...existing];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SYNCS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  return {
    syncResult,
    summary: getAnalyticsSummaryClient(),
  };
}
