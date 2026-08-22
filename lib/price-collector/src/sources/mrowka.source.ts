// Adapter sklepu PSB Mrówka (mrowkaonline.pl). Konsumuje produktowy feed sklepu
// (kształt Google Merchant / Ceneo). Domyślnie czyta wbudowaną migawkę realnych
// danych (mrowka.fixture.ts); gdy podany jest URL feedu, adapter pobiera go
// LEGALNIE po HTTP (bez omijania zabezpieczeń) i parsuje przez parseMrowkaFeed.
//
// Cała normalizacja cen/jednostek/nazw dzieje się w BasePriceSource + warstwie
// feedu — tu jest tylko spięcie źródła danych z kontraktem PriceSource.

import { BasePriceSource } from "../base-source";
import type { NormalizedOffer, NormalizedProduct } from "../types";
import {
  feedItemToProduct,
  feedItemToRawOffer,
  parseMrowkaFeed,
  type ProductFeedItem,
} from "./mrowka.feed";
import { MROWKA_FEED_FIXTURE } from "./mrowka.fixture";

/** Minimalny kontrakt fetcha (podzbiór globalnego `fetch`) — wstrzykiwalny w testach. */
export type FetchLike = (
  url: string,
) => Promise<{ ok: boolean; status: number; text: () => Promise<string> }>;

export class MrowkaSource extends BasePriceSource {
  readonly slug = "mrowka";
  readonly displayName = "PSB Mrówka";

  // Itemy feedu wstrzykiwalne (domyślnie wbudowana migawka) — ułatwia testy i
  // podmianę na pobrany feed bez zmiany reszty adaptera.
  private readonly items: readonly ProductFeedItem[];

  constructor(items: readonly ProductFeedItem[] = MROWKA_FEED_FIXTURE) {
    super();
    this.items = items;
  }

  async fetchProducts(): Promise<NormalizedProduct[]> {
    return this.items.map((item) => feedItemToProduct(item));
  }

  async fetchOffers(): Promise<NormalizedOffer[]> {
    return this.items.map((item) => this.toOffer(feedItemToRawOffer(item)));
  }
}

/**
 * Pobiera feed Mrówki z podanego URL (LEGALNE odczytanie oficjalnego feedu) i
 * buduje adapter na jego podstawie. `fetchImpl` domyślnie korzysta z globalnego
 * `fetch`; w testach można wstrzyknąć atrapę. Rzuca przy błędzie HTTP.
 */
export async function loadMrowkaFromFeedUrl(
  url: string,
  fetchImpl: FetchLike = globalThis.fetch as unknown as FetchLike,
): Promise<MrowkaSource> {
  if (typeof fetchImpl !== "function") {
    throw new Error(
      "loadMrowkaFromFeedUrl: brak dostępnego fetch (podaj fetchImpl).",
    );
  }
  const res = await fetchImpl(url);
  if (!res.ok) {
    throw new Error(
      `loadMrowkaFromFeedUrl: HTTP ${res.status} przy pobieraniu feedu ${url}`,
    );
  }
  const text = await res.text();
  return new MrowkaSource(parseMrowkaFeed(text));
}
