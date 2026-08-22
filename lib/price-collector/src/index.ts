// Publiczny punkt wejścia modułu price-collector + rejestr adapterów sklepów.
//
// DODANIE KOLEJNEGO SKLEPU = jeden plik w ./sources + jedna linia w SOURCE_FACTORIES.

import { LeroyMerlinSource } from "./sources/leroy-merlin.source";
import type { PriceSource } from "./types";

export * from "./types";
export * from "./normalize";
export { BasePriceSource } from "./base-source";
export {
  runCollection,
  type CollectorDeps,
  type CollectionResult,
} from "./orchestrator";
export { LeroyMerlinSource } from "./sources/leroy-merlin.source";

/** Rejestr adapterów: slug sklepu -> fabryka instancji PriceSource. */
export const SOURCE_FACTORIES: Record<string, () => PriceSource> = {
  "leroy-merlin": () => new LeroyMerlinSource(),
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
