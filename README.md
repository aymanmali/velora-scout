<div align="center">

# VeloraScout
### Multi-Brand Fashion, Cosmetics & Beauty Deal Meta-Search Engine

<p align="center">
  <a href="https://velora-scout.vercel.app">
    <img src="https://img.shields.io/badge/Live_Demo_↗-velora--scout.vercel.app-10B981?style=flat-square&logo=vercel&logoColor=white" alt="Live Demo on Vercel" />
  </a>
  &nbsp;
  <a href="https://velora-scout.vercel.app/admin">
    <img src="https://img.shields.io/badge/Admin_Console_↗-Publisher_&_Feed_Analytics-E11D48?style=flat-square&logo=vercel&logoColor=white" alt="Live Admin Console" />
  </a>
  &nbsp;
  <a href="https://github.com/aymanmali/velora-scout/actions">
    <img src="https://img.shields.io/badge/CI_&_Pages-Passing-10B981?style=flat-square&logo=githubactions&logoColor=white" alt="CI Status" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_15-App_Router-000000?style=flat-square&logo=next.js" alt="Next.js 15" />
  &nbsp;
  <img src="https://img.shields.io/badge/TypeScript-5.7_Strict-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  &nbsp;
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  &nbsp;
  <img src="https://img.shields.io/badge/Prisma_ORM-Relational_Schema-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
</p>

</div>

---

## Overview

**VeloraScout** is a full-stack, Google-style shopping and deal meta-search engine that indexes, normalizes, and compares real-time prices, **Black Friday / Cyber Week discounts**, and verified promo codes across global **Clothes, Fashion, Cosmetics, Makeup, Skincare, and Fragrance** retailers (*Sephora, Cult Beauty, ASOS, Nordstrom, Ulta Beauty, Selfridges, Zalando, and Farfetch*).

It combines a **Natural Language Search Intent Parser**, a **Multi-Retailer Price & Coupon Comparison Engine**, a **Pluggable `IFeedAdapter` Datafeed Pipeline** (`Awin`, `Rakuten Advertising`, `CJ Affiliate`, `Impact`, `Partnerize`), and a **Real-Time Attribution & Analytics Console** (`/admin`).

### Live Deployment Links
* **Primary Full-Stack Application (Vercel):** [https://velora-scout.vercel.app](https://velora-scout.vercel.app)
* **Merchant & Affiliate Analytics Console:** [https://velora-scout.vercel.app/admin](https://velora-scout.vercel.app/admin)
* **GitHub Pages Static Mirror:** [https://aymanmali.github.io/velora-scout/](https://aymanmali.github.io/velora-scout/)

---

## System Architecture

```mermaid
flowchart TD
    subgraph Client["Frontend (Next.js 15 App Router + Tailwind CSS)"]
        SearchUI["Google-Like Omnibox & NLP Intent Parser"]
        Filters["Faceted Verticals, Brand, Retailer & Black Friday Filters"]
        CompareModal["Multi-Store Price & Promo Code Comparison Modal"]
        Currency["Global Currency Switcher ($ USD / € EUR / £ GBP)"]
        AdminUI["Merchant Analytics & Feed Sync Console (/admin)"]
        LegalUI["FTC Affiliate Disclosure, Terms & GDPR Cookie Suite (/legal/*)"]
    end

    subgraph Backend["Backend REST API Layer (Vercel Serverless)"]
        SearchAPI["GET /api/search — Full-Text, NLP Intent, Facets & Sorting"]
        RedirectAPI["GET /api/redirect/[offerId] — CPA Click Logger & 302 Attribution"]
        SyncAPI["POST /api/feeds/sync — Pluggable Feed Ingestion Pipeline"]
        AnalyticsAPI["GET /api/analytics — GMV, CPA Revenue & Merchant Telemetry"]
    end

    subgraph Adapters["Pluggable Feed Adapter Engine (src/lib/adapters/)"]
        Interface["IFeedAdapter Contract"]
        DemoAdapter["DemoMultiNetworkFeedAdapter (Portfolio Catalog)"]
        CommercialAdapter["AffiliateCsvFeedAdapter (Awin / Rakuten / CJ Live Feeds)"]
    end

    subgraph Data["Persistence Layer"]
        DB[("Normalized Multi-Merchant Store + Prisma PostgreSQL Schema")]
    end

    SearchUI & Filters --> SearchAPI
    CompareModal --> RedirectAPI
    AdminUI --> AnalyticsAPI & SyncAPI
    SearchAPI & RedirectAPI & AnalyticsAPI --> DB
    SyncAPI --> Interface
    Interface --> DemoAdapter & CommercialAdapter
    DemoAdapter & CommercialAdapter --> DB
```

---

## Core Engineering Highlights

### 1. Google-Style Meta-Search & Natural Language Intent Parser
* **Instant Omnibox (`/` keyboard shortcut):** Full-text search across 18+ fashion & beauty brands, 25 canonical products, and 73+ competing retailer offers.
* **Conversational Filter Extraction:** Queries such as `"waterproof mascara under $30"` or `"Black Friday skincare 40% off"` are parsed in real time by `parseSearchIntent()` to automatically apply structured constraints (`Max Price: $30`, `40%+ Off`, `Black Friday Deal`).
* **Multi-Vertical Facets:** Instant filtering across **Clothes & Fashion**, **Makeup & Cosmetics**, **Skincare & K-Beauty**, **Luxury Fragrance**, and **Beauty Tech & Hair**.

### 2. Multi-Retailer Price Comparison & Global Currency Engine
* **Canonical Product Aggregation:** Groups competing offers for the same product across up to 4 retailers side-by-side, ranking the winning store by lowest checkout price and deepest discount percentage.
* **One-Click Promo Code Copy:** Interactive coupon chips (`BFGLOW45`, `FENTY50BF`, `WINTER50`, `AVIATOR50`) with clipboard feedback.
* **Multi-Currency Conversion:** Instant switching between **`$ USD`**, **`€ EUR`**, and **`£ GBP`**.

### 3. Commercial Affiliate Attribution & Publisher Console (`/admin`)
* **Click-Out Attribution Gateway (`GET /api/redirect/[offerId]`):** Logs each outbound click event, computes estimated CPA commission (`salePriceUsd * commissionRate`), and constructs tracked affiliate URLs (`utm_source=velorascout`, `aff_network`, `click_id`).
* **Live Analytics Dashboard:** Real-time KPI cards (Outbound Affiliate Clicks, Referred GMV, Estimated Publisher Commission, Average Discount Depth), merchant performance table, live click stream, and an interactive **"Run Feed Sync Pipeline"** trigger.

---

## REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/search` | Full-text search, NLP intent parsing, faceted filtering (`q`, `category`, `brand`, `merchant`, `minDiscount`, `blackFriday`, `hasPromo`, `freeShipping`, `sort`). |
| `GET` | `/api/redirect/[offerId]` | Logs commercial `ClickEvent`, computes CPA commission, and returns attribution receipt JSON (`mode=json`) or HTTP 302 redirect (`mode=redirect`). |
| `GET` | `/api/analytics` | Aggregates publisher KPIs, merchant CPA performance, recent click stream, and feed sync history. |
| `POST` | `/api/feeds/sync` | Executes the active `IFeedAdapter` ingestion pipeline and updates catalog offer timestamps. |

---

## Repository Structure

```text
velora-scout/
├── prisma/
│   └── schema.prisma                      # Production relational schema (PostgreSQL / SQLite)
├── src/
│   ├── app/
│   │   ├── page.tsx                       # Google-like Meta-Search UI & Multi-Store Deal Grid
│   │   ├── admin/page.tsx                 # Publisher Analytics, Click Stream & Feed Sync Console
│   │   ├── legal/[slug]/page.tsx          # FTC Affiliate Disclosure, Terms & Privacy Policy
│   │   └── api/
│   │       ├── search/route.ts            # Full-text search, NLP intent & faceted filtering API
│   │       ├── redirect/[offerId]/route.ts# Affiliate click logger & attribution redirector
│   │       ├── analytics/route.ts         # KPI & merchant performance aggregation API
│   │       └── feeds/sync/route.ts        # Pluggable feed ingestion webhook
│   ├── components/
│   │   ├── Navbar.tsx                     # Header with FTC disclosure bar & Currency Switcher
│   │   ├── CompareModal.tsx               # Side-by-side multi-retailer price comparison modal
│   │   ├── RedirectModal.tsx              # Commercial attribution receipt & checkout redirect
│   │   ├── CookieBanner.tsx               # GDPR / CCPA affiliate cookie consent manager
│   │   └── Footer.tsx                     # Legal notices & IP attribution footer
│   └── lib/
│       ├── adapters/
│       │   ├── types.ts                   # IFeedAdapter contract & domain types
│       │   ├── demo-adapter.ts            # Multi-brand Black Friday portfolio catalog adapter
│       │   └── affiliate-csv-adapter.ts   # Commercial Awin / Rakuten / CJ feed adapter
│       ├── seed-data.ts                   # 18 Brands, 8 Retailers, 25 Canonical Products, 73+ Offers
│       ├── currency.ts                    # USD / EUR / GBP conversion utility
│       ├── client-engine.ts               # Hybrid client fallback engine for static mirrors
│       └── db.ts                          # Server search engine, intent parser & attribution store
└── .github/workflows/
    ├── ci.yml                             # GitHub Actions CI (TypeScript + Next.js Production Build)
    └── deploy-pages.yml                   # Automated GitHub Pages mirror deployment
```

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to test the meta-search interface, or [http://localhost:3000/admin](http://localhost:3000/admin) to inspect the publisher analytics console.

