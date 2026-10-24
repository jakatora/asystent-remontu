// Adapter sklepu PSB Mrówka (mrowkaonline.pl). Konsumuje produktowy feed sklepu
// (kształt Google Merchant / Ceneo). Domyślnie czyta wbudowaną migawkę realnych
// danych (mrowka.fixture.ts); gdy podany jest URL feedu, adapter pobiera go
// LEGALNIE po HTTP (bez omijania zabezpieczeń) i parsuje przez warstwę feedu.
//
// Cała normalizacja cen/jednostek/nazw oraz odporne pobieranie po sieci żyją w
// generycznym module `merchant-feed.ts` (współdzielonym z innymi sklepami na
// feedzie) — tu jest tylko spięcie sklepu z jego migawką i nazwą.

import {
  FeedPriceSource,
  fetchFeedItemsFromUrl,
  type FeedFetchOptions,
  type FetchLike,
} from "./merchant-feed";
import type { ProductFeedItem } from "./mrowka.feed";
import { MROWKA_FEED_FIXTURE } from "./mrowka.fixture";

// Re-eksport typów sieci dla wstecznej zgodności konsumentów (index.ts, testy).
export type { FetchLike, FeedFetchOptions } from "./merchant-feed";

export class MrowkaSource extends FeedPriceSource {
  constructor(items: readonly ProductFeedItem[] = MROWKA_FEED_FIXTURE, provenance: 'fixture' | 'feed' = 'fixture') {
    super("mrowka", "PSB Mrówka", items, provenance);
  }
}

/**
 * Pobiera feed Mrówki z podanego URL (LEGALNE odczytanie oficjalnego feedu) i
 * buduje adapter na jego podstawie. Format wykrywany automatycznie (XML/JSON),
 * a odporność sieciowa (timeout + retry-lite, 4xx fail-fast) pochodzi z
 * `fetchFeedItemsFromUrl`. `fetchImpl` domyślnie korzysta z globalnego `fetch`;
 * w testach można wstrzyknąć atrapę. Rzuca po wyczerpaniu prób.
 */
export async function loadMrowkaFromFeedUrl(
  url: string,
  fetchImpl?: FetchLike,
  options: FeedFetchOptions = {},
): Promise<MrowkaSource> {
  const items = await fetchFeedItemsFromUrl(url, fetchImpl, options);
  return new MrowkaSource(items, 'feed');
}
