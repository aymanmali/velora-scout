import { IFeedAdapter, NormalizedFeedPayload } from "./types";
import { getSeedCatalog } from "../seed-data";

/**
 * DemoFeedAdapter
 * Used in Portfolio / Showcase mode and local development.
 * Returns normalized multi-brand fashion, cosmetics, skincare, and fragrance offers
 * mirroring the schema produced by commercial Affiliate Network feeds (Awin, Rakuten, CJ).
 */
export class DemoFeedAdapter implements IFeedAdapter {
  public readonly name = "DemoMultiNetworkFeedAdapter";
  public readonly network = "Portfolio Multi-Network Simulator (Awin + Rakuten + CJ + Impact)";
  public readonly isCommercialLive = false;

  public async fetchNormalizedCatalog(): Promise<NormalizedFeedPayload> {
    const payload = getSeedCatalog();
    // Refresh offer timestamps on sync to simulate live price feed ingestion
    const nowIso = new Date().toISOString();
    const updatedProducts = payload.products.map((product) => ({
      ...product,
      offers: product.offers.map((offer) => ({
        ...offer,
        lastUpdated: nowIso,
      })),
    }));

    return {
      brands: payload.brands,
      merchants: payload.merchants,
      products: updatedProducts,
    };
  }
}
