"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, Check, Shield } from "lucide-react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("auradeals_cookie_consent");
      if (!consent) {
        setVisible(true);
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const handleAccept = (mode: "all" | "essential") => {
    try {
      localStorage.setItem("auradeals_cookie_consent", mode);
    } catch {
      // Ignore storage access errors
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur-md sm:p-5">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <Cookie className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              GDPR / CCPA Cookie & Affiliate Tracking Consent
            </h4>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
              We use essential cookies for currency preferences and third-party affiliate attribution cookies (Awin, Rakuten, CJ) when you click out to a brand offer so our merchant partners can credit referrals. See our{" "}
              <Link href="/legal/privacy" className="font-semibold text-rose-600 underline">
                Privacy & Cookie Policy
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => handleAccept("essential")}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            <Shield className="h-3.5 w-3.5" />
            Essential Only
          </button>
          <button
            type="button"
            onClick={() => handleAccept("all")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-600 transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
            Accept All & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
