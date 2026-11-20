"use client";

import React, { useState } from "react";
import {
  X,
  Flame,
  Copy,
  Check,
  Truck,
  ShieldCheck,
  ExternalLink,
  Star,
  Tag,
} from "lucide-react";
import { EnrichedProduct, MerchantOfferRecord } from "@/lib/db";
import { useCurrency } from "./CurrencyContext";

interface CompareModalProps {
  product: EnrichedProduct | null;
  onClose: () => void;
  onSelectOffer: (offer: MerchantOfferRecord, product: EnrichedProduct) => void;
}

export function CompareModal({
  product,
  onClose,
  onSelectOffer,
}: CompareModalProps) {
  const { format } = useCurrency();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!product) return null;

  const handleCopy = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
    } catch {
      // Fallback
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white/95 p-5 backdrop-blur-md">
          <div className="pr-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                {product.brandName}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {product.subcategory}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {product.rating} ({product.reviewCount.toLocaleString()} reviews)
              </span>
            </div>
            <h3 className="mt-1.5 text-lg font-extrabold text-slate-900">
              {product.title}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Comparing {product.offerCount} verified merchant offers • Up to{" "}
              <span className="font-bold text-rose-600">
                {product.maxDiscountPercent}% OFF
              </span>{" "}
              (Save up to {format(product.savingsUsd)})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Comparison Table / Cards */}
        <div className="p-5 space-y-3">
          {product.offers.map((offer, index) => {
            const isBest = index === 0;
            return (
              <div
                key={offer.id}
                className={`relative rounded-xl border p-4 transition-all ${
                  isBest
                    ? "border-rose-300 bg-rose-50/40 ring-1 ring-rose-200"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {isBest && (
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                      <Flame className="h-3 w-3" />
                      Best Price & Deal Across All Stores
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      Network: {offer.affiliateNetwork}
                    </span>
                  </div>
                )}

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  {/* Store & Shipping Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-slate-900">
                        {offer.merchantName}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({offer.merchantDomain})
                      </span>
                      <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <ShieldCheck className="h-3 w-3" />
                        {offer.trustScore}/5
                      </span>
                    </div>

                    {offer.promoDescription && (
                      <p className="text-xs font-medium text-rose-700">
                        {offer.promoDescription}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5 text-slate-400" />
                        {offer.shippingInfo}
                      </span>
                      {offer.isBlackFriday && (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                          <Flame className="h-3.5 w-3.5" />
                          Black Friday Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Promo Code + Price + CTA */}
                  <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                    {offer.promoCode && (
                      <button
                        type="button"
                        onClick={() => handleCopy(offer.promoCode!)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-rose-300 bg-white px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50"
                        title="Click to copy promo code"
                      >
                        <Tag className="h-3.5 w-3.5" />
                        <span>{offer.promoCode}</span>
                        {copiedCode === offer.promoCode ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-slate-400" />
                        )}
                      </button>
                    )}

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="rounded bg-rose-100 px-1.5 py-0.5 text-xs font-extrabold text-rose-700">
                          -{offer.discountPercent}%
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          {format(offer.originalPriceUsd)}
                        </span>
                      </div>
                      <div className="text-xl font-extrabold text-slate-900">
                        {format(offer.salePriceUsd)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectOffer(offer, product)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all ${
                        isBest
                          ? "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
                          : "bg-slate-900 hover:bg-slate-800"
                      }`}
                    >
                      <span>Get Deal</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer notice */}
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-[11px] text-slate-500 flex items-center justify-between">
          <span>
            Prices updated via {product.offers[0]?.affiliateNetwork} feed • Stock verified
          </span>
          <span>Affiliate disclosure applies to all outbound merchant links</span>
        </div>
      </div>
    </div>
  );
}
