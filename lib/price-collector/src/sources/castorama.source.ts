// Adapter sklepu Castorama PL (castorama.pl). Drugi REALNY sklep na produktowym
// feedzie (kształt Google Merchant / Ceneo), obok PSB Mrówki. Domyślnie czyta
// wbudowaną migawkę realnych danych (castorama.fixture.ts); gdy podany jest URL
// feedu (STORE2_FEED_URL), adapter pobiera go LEGALNIE po HTTP (bez omijania
// zabezpieczeń) i parsuje przez warstwę feedu.
//
// Cała normalizacja cen/jednostek/nazw oraz odporne pobieranie po sieci żyją w
// generycznym module `merchant-feed.ts` (współdzielonym z Mrówką) — tu jest
// tylko spięcie sklepu z jego migawką i nazwą.

import { CASTORAMA_FEED_FIXTURE } from "./castorama.fixture";
import {
  FeedPriceSource,
  fetchFeedItemsFromUrl,
  type FeedFetchOptions,
  type FetchLike,
} from "./merchant-feed";
import type { ProductFeedItem } from "./mrowka.feed";

export class CastoramaSource extends FeedPriceSource {
  constructor(items: readonly ProductFeedItem[] = CASTORAMA_FEED_FIXTURE, provenance: 'fixture' | 'feed' = 'fixture') {
    super("castorama", "Castorama", items, provenance);
  }
}

/**
 * Pobiera feed Castoramy z podanego URL (LEGALNE odczytanie oficjalnego feedu) i
 * buduje adapter na jego podstawie. Format wykrywany automatycznie (XML/JSON),
 * a odporność sieciowa (timeout + retry-lite, 4xx fail-fast — bez omijania
 * blokad) pochodzi z `fetchFeedItemsFromUrl`. `fetchImpl` domyślnie korzysta z
 * globalnego `fetch`; w testach można wstrzyknąć atrapę. Rzuca po wyczerpaniu prób.
 */
export async function loadCastoramaFromFeedUrl(
  url: string,
  fetchImpl?: FetchLike,
  options: FeedFetchOptions = {},
): Promise<CastoramaSource> {
  const items = await fetchFeedItemsFromUrl(url, fetchImpl, options);
  return new CastoramaSource(items, 'feed');
}
