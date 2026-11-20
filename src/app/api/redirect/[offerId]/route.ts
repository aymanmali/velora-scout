import { NextRequest, NextResponse } from "next/server";
import { findOfferById, recordClickEvent } from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ offerId: string }> }
) {
  const { offerId } = await context.params;
  const { searchParams } = new URL(request.url);
  const currency = searchParams.get("currency") || "USD";
  const mode = searchParams.get("mode") || "json";

  const match = findOfferById(offerId);
  if (!match) {
    return NextResponse.json(
      { error: "Offer not found", offerId },
      { status: 404 }
    );
  }

  const clickEvent = recordClickEvent(offerId, currency);
  const { offer, product } = match;

  // Build commercial affiliate tracking URL
  const separator = offer.affiliateUrl.includes("?") ? "&" : "?";
  const trackedOutboundUrl = `${offer.affiliateUrl}${separator}utm_source=auradeals&utm_medium=meta_search&aff_network=${offer.affiliateNetwork.toLowerCase()}&click_id=${clickEvent?.id || "anon"}`;

  if (mode === "redirect") {
    return NextResponse.redirect(trackedOutboundUrl, 302);
  }

  return NextResponse.json({
    status: "CLICK_ATTRIBUTED",
    clickEvent,
    offer,
    product: {
      id: product.id,
      title: product.title,
      brandName: product.brandName,
      category: product.category,
    },
    trackedOutboundUrl,
    legalDisclosure:
      "AuraDeals earns an affiliate commission when you complete a purchase via this merchant link, at no additional cost to you.",
  });
}
