// Publiczny punkt wejścia modułu price-collector + rejestr adapterów sklepów.
//
// DODANIE KOLEJNEGO SKLEPU = jeden plik w ./sources + jedna linia w SOURCE_FACTORIES.

import { LeroyMerlinSource } from "./sources/leroy-merlin.source";
import {
  MrowkaSource,
  loadMrowkaFromFeedUrl,
  type FetchLike,
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
export { LeroyMerlinSource } from "./sources/leroy-merlin.source";
export {
  MrowkaSource,
  loadMrowkaFromFeedUrl,
  type FetchLike,
} from "./sources/mrowka.source";
export {
  parseMrowkaFeed,
  feedItemToProduct,
  feedItemToRawOffer,
  mapFeedCategory,
  slugifyCategory,
  parseUnitMeasure,
  type ProductFeedItem,
} from "./sources/mrowka.feed";

/** Rejestr adapterów: slug sklepu -> fabryka instancji PriceSource (bez sieci). */
export const SOURCE_FACTORIES: Record<string, () => PriceSource> = {
  "leroy-merlin": () => new LeroyMerlinSource(),
  mrowka: () => new MrowkaSource(),
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

/**
 * Buduje instancje adapterów dla podanych slugów, honorując ENV z URL-ami feedów
 * (np. `MROWKA_FEED_URL`). Gdy URL feedu jest ustawiony, adapter pobiera go
 * LEGALNIE po HTTP; w przeciwnym razie używa wbudowanej migawki (bez sieci).
 * Sieć jest TYLKO tutaj (granica) — reszta modułu pozostaje czysta i testowalna.
 */
export async function createSourcesFromEnv(
  slugs: readonly string[],
  env: SourceEnv = process.env,
  deps: BuildSourcesDeps = {},
): Promise<PriceSource[]> {
  const out: PriceSource[] = [];
  for (const slug of slugs) {
    if (slug === "mrowka" && env.MROWKA_FEED_URL) {
      out.push(await loadMrowkaFromFeedUrl(env.MROWKA_FEED_URL, deps.fetchImpl));
      continue;
    }
    const source = createSource(slug);
    if (source) out.push(source);
  }
  return out;
}
