// CLI zbierania cen: spina adaptery sklepów (price-collector) z REALNYM
// Postgresem i faktycznie zapisuje oferty + historię cen do bazy (nie tylko
// liczy na fixture).
//
// Uruchomienie: `pnpm --filter @workspace/api-server collect`
// Wymaga DATABASE_URL. Konfiguracja przez ENV:
//   PRICE_COLLECTOR_SOURCES  - lista slugów sklepów po przecinku
//                              (domyślnie wszystkie: leroy-merlin,mrowka)
//   STORE_FEED_URL           - URL realnego feedu produktowego sklepu (XML
//                              Google Merchant/RSS lub JSON). Gdy ustawiony,
//                              adapter Mrówki pobiera feed po HTTP zamiast
//                              migawki (MROWKA_FEED_URL = starsza nazwa, fallback).
//   STORE_FEED_TIMEOUT_MS    - limit czasu jednej próby pobrania (domyślnie 15000)
//   STORE_FEED_RETRIES       - liczba dodatkowych prób po błędzie przejściowym (domyślnie 2)
//
// Idempotentne w sensie katalogu: upsert po EAN/GTIN, a price_history dopisuje
// wpis tylko przy ZMIANIE ceny (append-only) — patrz product-offers.repo.
import {
  createSourcesFromEnv,
  resolveSourceSlugs,
  runCollectionForSources,
  type CollectionResult,
} from "@workspace/price-collector";

import { createDb } from "../lib/db";

/** Sumaryczny log jednego źródła — czytelny przegląd tego, co trafiło do bazy. */
function logResult(r: CollectionResult): void {
  console.log(
    `[collect] ${r.source}: oferty=${r.offersProcessed} ` +
      `zapisane=${r.offersUpserted} nowe=${r.productsCreated} ` +
      `dopasowane=${r.productsMatched} błędy=${r.errors.length}`,
  );
  for (const e of r.errors) {
    console.warn(`[collect]   ! ${e.offer}: ${e.message}`);
  }
}

async function main(): Promise<void> {
  const { slugs, unknown } = resolveSourceSlugs(process.env);
  if (unknown.length > 0) {
    console.warn(`[collect] pominięto nieznane źródła: ${unknown.join(", ")}`);
  }
  if (slugs.length === 0) {
    console.error("[collect] brak źródeł do zebrania (sprawdź PRICE_COLLECTOR_SOURCES)");
    process.exit(1);
    return;
  }

  console.log(`[collect] źródła: ${slugs.join(", ")}`);
  const sources = await createSourcesFromEnv(slugs, process.env);

  const { pool, db } = createDb();
  try {
    const results = await runCollectionForSources(sources, db);
    results.forEach(logResult);

    const totalErrors = results.reduce(
      (n: number, r) => n + r.errors.length,
      0,
    );
    const totalUpserted = results.reduce(
      (n: number, r) => n + r.offersUpserted,
      0,
    );
    console.log(
      `[collect] gotowe: zapisano ${totalUpserted} ofert, błędów ${totalErrors}`,
    );
    if (totalErrors > 0) process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[collect] failed", err);
  process.exit(1);
});
