"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  BarChart3,
  Tag,
} from "lucide-react";
import { ClickEventRecord } from "@/lib/db";
import { MerchantOfferRecord } from "@/lib/adapters/types";
import { useCurrency } from "./CurrencyContext";

export interface RedirectReceipt {
  status: string;
  clickEvent: ClickEventRecord;
  offer: MerchantOfferRecord;
  product: {
    id: string;
    title: string;
    brandName: string;
    category: string;
  };
  trackedOutboundUrl: string;
  legalDisclosure: string;
}

interface RedirectModalProps {
  receipt: RedirectReceipt | null;
  loading: boolean;
  onClose: () => void;
}

export function RedirectModal({
  receipt,
  loading,
  onClose,
}: RedirectModalProps) {
  const { format } = useCurrency();
  const [copied, setCopied] = useState(false);

  if (!loading && !receipt) return null;

  const handleCopyPromo = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
    } catch {
      // ignore
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>

        {loading || !receipt ? (
          <div className="py-10 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-rose-200 border-t-rose-600" />
            <p className="mt-4 text-sm font-bold text-slate-900">
              Generating Affiliate Attribution Token & Logging Click...
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Connecting to merchant tracking gateway...
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
              <span className="text-xs font-extrabold uppercase tracking-wider">
                Commercial Affiliate Click Logged
              </span>
            </div>

            <h3 className="mt-2 text-lg font-extrabold text-slate-900">
              Ready to Checkout at {receipt.offer.merchantName}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {receipt.product.brandName} — {receipt.product.title}
            </p>

            {/* Price & Promo Summary */}
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500">
                    Verified Deal Price
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {format(receipt.offer.salePriceUsd)}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      {format(receipt.offer.originalPriceUsd)}
                    </span>
                    <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                      -{receipt.offer.discountPercent}% OFF
                    </span>
                  </div>
                </div>

                {receipt.offer.promoCode && (
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-rose-700 block mb-1">
                      Apply Promo Code at Checkout:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyPromo(receipt.offer.promoCode!)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-rose-400 bg-white px-3 py-1.5 text-xs font-extrabold text-rose-700 shadow-sm hover:bg-rose-50"
                    >
                      <Tag className="h-3.5 w-3.5" />
                      <span>{receipt.offer.promoCode}</span>
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Technical / Commercial Attribution Receipt (Great for CV Portfolio & Admin verification) */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span>Affiliate Attribution Telemetry</span>
                <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-mono">
                  {receipt.clickEvent.id}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>
                  <span className="text-slate-400">Affiliate Network:</span>{" "}
                  <span className="font-semibold text-slate-800">
                    {receipt.offer.affiliateNetwork}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Commission Rate:</span>{" "}
                  <span className="font-semibold text-slate-800">
                    {(receipt.offer.commissionRate * 100).toFixed(0)}% CPA
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Est. Publisher Payout:</span>{" "}
                  <span className="font-bold text-emerald-700">
                    {format(receipt.clickEvent.estimatedCommissionUsd)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Merchant Domain:</span>{" "}
                  <span className="font-semibold text-slate-800">
                    {receipt.offer.merchantDomain}
                  </span>
                </div>
              </div>
              <div className="mt-2 truncate rounded bg-white p-1.5 font-mono text-[10px] text-slate-500 border border-slate-200">
                {receipt.trackedOutboundUrl}
              </div>
            </div>

            {/* FTC Legal Disclosure */}
            <p className="mt-3 flex items-start gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{receipt.legalDisclosure}</span>
            </p>

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/admin"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <BarChart3 className="h-4 w-4 text-rose-600" />
                View Click in Admin Analytics
              </Link>

              <a
                href={receipt.trackedOutboundUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-rose-700 hover:to-pink-700"
              >
                <span>Continue to {receipt.offer.merchantName}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
