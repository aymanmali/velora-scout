"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BarChart3,
  RefreshCw,
  DollarSign,
  MousePointerClick,
  Layers,
  Flame,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Database,
  ArrowLeft,
  Terminal,
  Clock,
} from "lucide-react";
import { useCurrency } from "@/components/CurrencyContext";
import { ClickEventRecord } from "@/lib/db";
import { FeedSyncResult, MerchantRecord } from "@/lib/adapters/types";
import {
  getAnalyticsSummaryClient,
  runFeedSyncClient,
} from "@/lib/client-engine";

interface MerchantStat extends MerchantRecord {
  clicksCount: number;
  estCommission: number;
  activeOffersCount: number;
}

interface AnalyticsResponse {
  kpis: {
    totalProducts: number;
    totalOffers: number;
    blackFridayOffers: number;
    avgDiscountPercent: number;
    totalClicks: number;
    totalEstimatedCommissionUsd: number;
    totalGmvReferredUsd: number;
  };
  merchantStats: MerchantStat[];
  recentClicks: ClickEventRecord[];
  syncLogs: FeedSyncResult[];
}

export default function AdminDashboardPage() {
  const { format } = useCurrency();
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncBanner, setLastSyncBanner] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const json = (await res.json()) as AnalyticsResponse;
        setData(json);
        return;
      }
      throw new Error("Fallback to client analytics");
    } catch {
      setData(getAnalyticsSummaryClient());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleTriggerSync = async () => {
    setSyncing(true);
    setLastSyncBanner(null);
    try {
      const res = await fetch("/api/feeds/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "demo" }),
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.summary);
        setLastSyncBanner(
          `Feed Sync Completed in ${json.syncResult.durationMs}ms: ${json.syncResult.productsSynced} products & ${json.syncResult.offersUpdated} merchant offers refreshed.`
        );
        return;
      }
      throw new Error("Fallback to client sync");
    } catch {
      const result = runFeedSyncClient();
      setData(result.summary);
      setLastSyncBanner(
        `Feed Sync Completed in ${result.syncResult.durationMs}ms: ${result.syncResult.productsSynced} products & ${result.syncResult.offersUpdated} merchant offers refreshed.`
      );
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Search
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Publisher & Feed Console
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Merchant & Affiliate Attribution Analytics
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Real-time click-out telemetry, estimated CPA commissions, and pluggable affiliate datafeed pipeline manager.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchAnalytics}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Telemetry</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerSync}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:from-rose-700 hover:to-pink-700 disabled:opacity-60"
          >
            <Database className={`h-3.5 w-3.5 ${syncing ? "animate-bounce" : ""}`} />
            <span>{syncing ? "Syncing Partner Feeds..." : "Run Feed Sync Pipeline"}</span>
          </button>
        </div>
      </div>

      {/* Sync Notification Banner */}
      {lastSyncBanner && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{lastSyncBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setLastSyncBanner(null)}
            className="text-emerald-600 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Outbound Affiliate Clicks
            </span>
            <div className="rounded-xl bg-rose-50 p-2 text-rose-600">
              <MousePointerClick className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900">
            {data?.kpis.totalClicks ?? 0}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Referred GMV:{" "}
            <span className="font-bold text-slate-700">
              {format(data?.kpis.totalGmvReferredUsd ?? 0)}
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Est. Publisher Commission
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-emerald-700">
            {format(data?.kpis.totalEstimatedCommissionUsd ?? 0)}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Avg 7%–10% CPA across 8 partner networks
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Indexed Store Offers
            </span>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900">
            {data?.kpis.totalOffers ?? 0}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Across{" "}
            <span className="font-bold text-slate-700">
              {data?.kpis.totalProducts ?? 0} canonical products
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Black Friday & Discount Depth
            </span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <Flame className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-rose-600">
            {data?.kpis.avgDiscountPercent ?? 0}% Avg Off
          </div>
          <p className="mt-1 text-xs text-slate-500">
            <span className="font-bold text-slate-700">
              {data?.kpis.blackFridayOffers ?? 0} verified
            </span>{" "}
            Black Friday flash deals
          </p>
        </div>
      </div>

      {/* Main Grid: Merchant Table + Recent Clicks */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Merchant Performance Table */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Connected Merchant & Affiliate Network Performance
              </h2>
              <p className="text-xs text-slate-500">
                Commission rates, active feed offers, and outbound attribution breakdown by retailer.
              </p>
            </div>
            <BarChart3 className="h-5 w-5 text-rose-600" />
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3">Merchant / Store</th>
                  <th className="pb-3">Affiliate Network</th>
                  <th className="pb-3">CPA Rate</th>
                  <th className="pb-3">Active Offers</th>
                  <th className="pb-3">Clicks</th>
                  <th className="pb-3 text-right">Est. Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.merchantStats.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80">
                    <td className="py-3 font-bold text-slate-900">
                      <div>{m.name}</div>
                      <div className="text-[11px] font-normal text-slate-400">
                        {m.domain}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {m.affiliateNetwork}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-slate-700">
                      {(m.commissionRate * 100).toFixed(0)}%
                    </td>
                    <td className="py-3 font-semibold text-slate-700">
                      {m.activeOffersCount}
                    </td>
                    <td className="py-3 font-bold text-slate-900">
                      {m.clicksCount}
                    </td>
                    <td className="py-3 text-right font-extrabold text-emerald-700">
                      {format(m.estCommission)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Live Click Attribution Stream */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Live Click Attribution Stream
              </h2>
              <p className="text-xs text-slate-500">
                Logged by <code>/api/redirect/[offerId]</code>
              </p>
            </div>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <div className="mt-4 max-h-[420px] space-y-2.5 overflow-y-auto pr-1">
            {data?.recentClicks.map((clk) => (
              <div
                key={clk.id}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {clk.merchantName}
                  </span>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-extrabold text-emerald-800">
                    +{format(clk.estimatedCommissionUsd)} est.
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-[11px] font-medium text-slate-600">
                  {clk.brandName} — {clk.productTitle}
                </p>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                  <span>
                    Sale: {format(clk.salePriceUsd)}{" "}
                    {clk.promoCodeApplied ? `(${clk.promoCodeApplied})` : ""}
                  </span>
                  <span>{new Date(clk.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Feed Sync History & Commercial Readiness Checklist */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Feed Ingestion Logs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Feed Ingestion Pipeline Logs
              </h2>
              <p className="text-xs text-slate-500">
                Execution history of <code>IFeedAdapter</code> sync jobs
              </p>
            </div>
            <Clock className="h-5 w-5 text-slate-400" />
          </div>

          <div className="mt-4 space-y-3">
            {data?.syncLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                      {log.status}
                    </span>
                    <span className="font-bold text-slate-900">
                      {log.adapterName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({log.durationMs}ms)
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">{log.notes}</p>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <div className="font-bold text-slate-800">
                    {log.productsSynced} products / {log.offersUpdated} offers
                  </div>
                  <div>{new Date(log.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commercial Production Switch Guide */}
        <div className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-rose-400">
            <Terminal className="h-5 w-5" />
            <span className="text-xs font-extrabold uppercase tracking-wider">
              Portfolio → Commercial Launch Switch
            </span>
          </div>
          <h2 className="mt-2 text-lg font-extrabold text-white">
            How to Connect Live Affiliate Network Feeds
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            This platform uses the <code>IFeedAdapter</code> pattern in{" "}
            <code>src/lib/adapters/</code>. Once your live website URL is approved by Awin, Rakuten, CJ, or Impact, configure your environment variables to switch from the portfolio dataset to live commercial product feeds:
          </p>

          <pre className="mt-4 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-[11px] text-emerald-400">
{`# .env.production (Vercel / Cloudflare)
DATABASE_URL="postgresql://user:pass@ep-aura.neon.tech/auradeals"
AFFILIATE_FEED_URL="https://productdata.awin.com/datafeed/download/..."
AFFILIATE_API_KEY="your_live_publisher_token"`}
          </pre>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
            <Link
              href="/legal/affiliate-disclosure"
              className="inline-flex items-center gap-1.5 font-bold text-rose-400 hover:underline"
            >
              <ShieldCheck className="h-4 w-4" />
              Review Commercial Legal & FTC Compliance Pages
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
