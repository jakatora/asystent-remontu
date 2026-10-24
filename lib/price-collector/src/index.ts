// Publiczny punkt wejścia modułu price-collector + rejestr adapterów sklepów.
//
// DODANIE KOLEJNEGO SKLEPU = jeden plik w ./sources + jedna linia w SOURCE_FACTORIES.

import {
  CastoramaSource,
  loadCastoramaFromFeedUrl,
} from "./sources/castorama.source";
import {
  LeroyMerlinSource,
  loadLeroyFromFeedUrl,
} from "./sources/leroy-merlin.source";
import type { FetchLike } from "./sources/merchant-feed";
import {
  MrowkaSource,
  loadMrowkaFromFeedUrl,
} from "./sources/mrowka.source";
import type { PriceSource } from "./types";

export * from "./types";
export * from "./normalize";
export { BasePriceSource } from "./base-source";
export {
  runCollection,
  runCollectionForSources,
  type CollectorDeps,
  type CollectionResult,
} from "./orchestrator";
export {
  LeroyMerlinSource,
  loadLeroyFromFeedUrl,
} from "./sources/leroy-merlin.source";
export {
  MrowkaSource,
  loadMrowkaFromFeedUrl,
  type FetchLike,
  type FeedFetchOptions,
} from "./sources/mrowka.source";
export {
  CastoramaSource,
  loadCastoramaFromFeedUrl,
} from "./sources/castorama.source";
export {
  FeedPriceSource,
  fetchFeedItemsFromUrl,
  parseMerchantFeedXml,
  parseMerchantFeedAuto,
} from "./sources/merchant-feed";
export {
  parseMrowkaFeed,
  feedItemToProduct,
  feedItemToRawOffer,
  mapFeedCategory,
  slugifyCategory,
  parseUnitMeasure,
  type ProductFeedItem,
} from "./sources/mrowka.feed";
export {
  parseMrowkaFeedXml,
  parseMrowkaFeedAuto,
  splitPriceCurrency,
} from "./sources/mrowka.feed.xml";

/** Rejestr adapterów: slug sklepu -> fabryka instancji PriceSource (bez sieci). */
export const SOURCE_FACTORIES: Record<string, () => PriceSource> = {
  "leroy-merlin": () => new LeroyMerlinSource(),
  mrowka: () => new MrowkaSource(),
  castorama: () => new CastoramaSource(),
};

/** Zwraca nową instancję adaptera po slugu albo null, gdy nieznany. */
export function createSource(slug: string): PriceSource | null {
  const factory = SOURCE_FACTORIES[slug];
  return factory ? factory() : null;
}

/** Wszystkie zarejestrowane slugi sklepów. */
export function listSourceSlugs(): string[] {
  return Object.keys(SOURCE_FACTORIES);
}

/** Minimalny widok ENV, którego potrzebuje konfiguracja źródeł. */
export type SourceEnv = Record<string, string | undefined>;

/**
 * Ustala listę slugów źródeł do zebrania z ENV `PRICE_COLLECTOR_SOURCES`
 * (rozdzielone przecinkami). Puste/nieustawione -> wszystkie zarejestrowane.
 * Nieznane slugi są pomijane (z listą zwracaną w `unknown`, żeby wołający mógł
 * je zalogować/odrzucić).
 */
export function resolveSourceSlugs(env: SourceEnv = process.env): {
  slugs: string[];
  unknown: string[];
} {
  const raw = env.PRICE_COLLECTOR_SOURCES;
  if (!raw || raw.trim() === "") {
    return { slugs: listSourceSlugs(), unknown: [] };
  }
  const requested = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const known = new Set(listSourceSlugs());
  const slugs: string[] = [];
  const unknown: string[] = [];
  for (const slug of requested) {
    if (known.has(slug)) slugs.push(slug);
    else unknown.push(slug);
  }
  return { slugs, unknown };
}

/** Zależności do budowy źródeł z ENV (wstrzykiwalny fetch — testy/edge). */
export interface BuildSourcesDeps {
  fetchImpl?: FetchLike;
}

/** Parsuje dodatnią liczbę całkowitą z ENV; zwraca undefined dla braku/śmieci. */
function parsePositiveIntEnv(raw: string | undefined): number | undefined {
  if (raw == null || raw.trim() === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : undefined;
}

/**
 * Buduje instancje adapterów dla podanych slugów, honorując ENV z URL-em feedu
 * PER SKLEP:
 *   - Mrówka:      `STORE_FEED_URL` (ogólny, preferowany) lub `MROWKA_FEED_URL` (fallback),
 *   - Castorama:   `STORE2_FEED_URL`,
 *   - Leroy Merlin: `STORE3_FEED_URL`.
 * Gdy URL danego sklepu jest ustawiony, adapter pobiera feed LEGALNIE po HTTP
 * (z timeoutem `STORE_FEED_TIMEOUT_MS` i retry `STORE_FEED_RETRIES`, wspólnymi dla
 * wszystkich sklepów). Bez URL źródło jest pomijane. Próbki są dostępne
 * wyłącznie przez jawne PRICE_COLLECTOR_ALLOW_FIXTURES=true i oznaczone fixture.
 * Sieć jest TYLKO tutaj (granica) — reszta modułu pozostaje czysta i testowalna.
 * Dzięki temu scheduler/CLI/admin zbierają ceny ze WSZYSTKICH sklepów na te same
 * produkty (ten sam EAN -> >=3 realne oferty dla selectCheapestOffer).
 */
export async function createSourcesFromEnv(
  slugs: readonly string[],
  env: SourceEnv = process.env,
  deps: BuildSourcesDeps = {},
): Promise<PriceSource[]> {
  const out: PriceSource[] = [];
  const mrowkaFeedUrl = env.STORE_FEED_URL ?? env.MROWKA_FEED_URL;
  const castoramaFeedUrl = env.STORE2_FEED_URL;
  const leroyFeedUrl = env.STORE3_FEED_URL;
  const feedOptions = {
    timeoutMs: parsePositiveIntEnv(env.STORE_FEED_TIMEOUT_MS),
    retries: parsePositiveIntEnv(env.STORE_FEED_RETRIES),
  };
  for (const slug of slugs) {
    if (slug === "mrowka" && mrowkaFeedUrl) {
      out.push(
        await loadMrowkaFromFeedUrl(mrowkaFeedUrl, deps.fetchImpl, feedOptions),
      );
      continue;
    }
    if (slug === "castorama" && castoramaFeedUrl) {
      out.push(
        await loadCastoramaFromFeedUrl(
          castoramaFeedUrl,
          deps.fetchImpl,
          feedOptions,
        ),
      );
      continue;
    }
    if (slug === "leroy-merlin" && leroyFeedUrl) {
      out.push(
        await loadLeroyFromFeedUrl(leroyFeedUrl, deps.fetchImpl, feedOptions),
      );
      continue;
    }
    if (env.PRICE_COLLECTOR_ALLOW_FIXTURES === 'true') {
      const source = createSource(slug);
      if (source) out.push(source);
    }
  }
  return out;
}
