import { IFeedAdapter, NormalizedFeedPayload } from "./types";
import { getSeedCatalog } from "../seed-data";

/**
 * AffiliateCsvFeedAdapter
 * Commercial-ready adapter template for Awin, CJ Affiliate, Rakuten Advertising,
 * or Impact product data feeds (CSV / JSON API).
 *
 * To activate in commercial production:
 * Set `AWIN_FEED_URL`, `RAKUTEN_API_TOKEN`, or `CJ_FEED_ENDPOINT` in your `.env.local`
 * or Vercel Environment Variables.
 */
export class AffiliateCsvFeedAdapter implements IFeedAdapter {
  public readonly name = "CommercialAffiliateFeedAdapter";
  public readonly network = "Awin / Rakuten / CJ Affiliate Datafeed Engine";
  public readonly isCommercialLive: boolean;

  private readonly feedEndpoint?: string;
  private readonly apiKey?: string;

  constructor() {
    this.feedEndpoint = process.env.AFFILIATE_FEED_URL;
    this.apiKey = process.env.AFFILIATE_API_KEY;
    this.isCommercialLive = Boolean(this.feedEndpoint && this.apiKey);
  }

  public async fetchNormalizedCatalog(): Promise<NormalizedFeedPayload> {
    if (!this.isCommercialLive || !this.feedEndpoint) {
      // Safe fallback to seed catalog until live publisher credentials are configured
      return getSeedCatalog();
    }

    const response = await fetch(this.feedEndpoint, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Affiliate feed sync failed with HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = (await response.json()) as NormalizedFeedPayload;
    return data;
  }
}
