// Adapter sklepu Leroy Merlin PL (leroymerlin.pl). Trzeci REALNY sklep na
// produktowym feedzie (kształt Google Merchant / Ceneo), obok PSB Mrówki i
// Castoramy. Domyślnie czyta wbudowaną migawkę realnych danych
// (leroy-merlin.fixture.ts); gdy podany jest URL feedu (STORE3_FEED_URL),
// adapter pobiera go LEGALNIE po HTTP (bez omijania zabezpieczeń) i parsuje
// przez warstwę feedu.
//
// Cała normalizacja cen/jednostek/nazw oraz odporne pobieranie po sieci żyją w
// generycznym module `merchant-feed.ts` (współdzielonym z Mrówką i Castoramą) —
// tu jest tylko spięcie sklepu z jego migawką i nazwą.

import { LEROY_MERLIN_FEED_FIXTURE } from "./leroy-merlin.fixture";
import {
  FeedPriceSource,
  fetchFeedItemsFromUrl,
  type FeedFetchOptions,
  type FetchLike,
} from "./merchant-feed";
import type { ProductFeedItem } from "./mrowka.feed";

export class LeroyMerlinSource extends FeedPriceSource {
  constructor(items: readonly ProductFeedItem[] = LEROY_MERLIN_FEED_FIXTURE) {
    super("leroy-merlin", "Leroy Merlin", items);
  }
}

/**
 * Pobiera feed Leroy Merlin z podanego URL (LEGALNE odczytanie oficjalnego
 * feedu) i buduje adapter na jego podstawie. Format wykrywany automatycznie
 * (XML/JSON), a odporność sieciowa (timeout + retry-lite, 4xx fail-fast — bez
 * omijania blokad) pochodzi z `fetchFeedItemsFromUrl`. `fetchImpl` domyślnie
 * korzysta z globalnego `fetch`; w testach można wstrzyknąć atrapę. Rzuca po
 * wyczerpaniu prób.
 */
export async function loadLeroyFromFeedUrl(
  url: string,
  fetchImpl?: FetchLike,
  options: FeedFetchOptions = {},
): Promise<LeroyMerlinSource> {
  const items = await fetchFeedItemsFromUrl(url, fetchImpl, options);
  return new LeroyMerlinSource(items);
}
