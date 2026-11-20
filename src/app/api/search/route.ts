import { NextRequest, NextResponse } from "next/server";
import { searchCatalog, SearchQueryOptions } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "ALL";
  const brand = searchParams.get("brand") || "ALL";
  const merchant = searchParams.get("merchant") || "ALL";
  const minDiscount = Number(searchParams.get("minDiscount") || "0");
  const onlyBlackFriday = searchParams.get("blackFriday") === "true";
  const onlyPromoCode = searchParams.get("hasPromo") === "true";
  const onlyFreeShipping = searchParams.get("freeShipping") === "true";
  const maxPrice = Number(searchParams.get("maxPrice") || "0");
  const sort = (searchParams.get("sort") || "best_deal") as SearchQueryOptions["sort"];

  const results = searchCatalog({
    q,
    category,
    brand,
    merchant,
    minDiscount,
    onlyBlackFriday,
    onlyPromoCode,
    onlyFreeShipping,
    maxPrice: maxPrice > 0 ? maxPrice : undefined,
    sort,
  });

  return NextResponse.json(results);
}
