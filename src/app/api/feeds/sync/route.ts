import { NextRequest, NextResponse } from "next/server";
import { runFeedSync, getAnalyticsSummary } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const mode = body?.mode === "commercial" ? "commercial" : "demo";
    const syncResult = await runFeedSync(mode);
    const updatedSummary = getAnalyticsSummary();

    return NextResponse.json({
      syncResult,
      summary: updatedSummary,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Feed sync failed",
      },
      { status: 500 }
    );
  }
}
