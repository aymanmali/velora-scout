export type ProductCategory =
  | "CLOTHES"
  | "MAKEUP"
  | "SKINCARE"
  | "FRAGRANCE"
  | "ACCESSORIES";

export type AffiliateNetwork =
  | "AWIN"
  | "CJ_AFFILIATE"
  | "RAKUTEN"
  | "IMPACT"
  | "PARTNERIZE"
  | "AMAZON_ASSOCIATES"
  | "DIRECT_PARTNER";

export interface BrandRecord {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  verified: boolean;
  country: string;
}

export interface MerchantRecord {
  id: string;
  name: string;
  slug: string;
  domain: string;
  affiliateNetwork: AffiliateNetwork;
  commissionRate: number; // e.g., 0.10 = 10%
  trustScore: number;
  activeFeed: boolean;
  badgeColor: string;
}

export interface MerchantOfferRecord {
  id: string;
  productId: string;
  merchantId: string;
  merchantName: string;
  merchantDomain: string;
  affiliateNetwork: AffiliateNetwork;
  commissionRate: number;
  trustScore: number;
  originalPriceUsd: number;
  salePriceUsd: number;
  discountPercent: number;
  isBlackFriday: boolean;
  promoCode: string | null;
  promoDescription: string | null;
  freeShipping: boolean;
  shippingInfo: string;
  inStock: boolean;
  affiliateUrl: string;
  lastUpdated: string;
}

export interface ProductRecord {
  id: string;
  title: string;
  slug: string;
  category: ProductCategory;
  subcategory: string;
  brandId: string;
  brandName: string;
  description: string;
  imageUrl: string;
  accentGradient: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  trending: boolean;
  offers: MerchantOfferRecord[];
}

export interface NormalizedFeedPayload {
  brands: BrandRecord[];
  merchants: MerchantRecord[];
  products: ProductRecord[];
}

export interface FeedSyncResult {
  id: string;
  adapterName: string;
  network: string;
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  productsSynced: number;
  offersUpdated: number;
  blackFridayDeals: number;
  durationMs: number;
  timestamp: string;
  notes: string;
}

export interface IFeedAdapter {
  readonly name: string;
  readonly network: string;
  readonly isCommercialLive: boolean;
  fetchNormalizedCatalog(): Promise<NormalizedFeedPayload>;
}
