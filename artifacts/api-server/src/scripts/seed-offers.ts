// CLI seedowania WIELOOFERTOWEGO + startowej historii cen: dla każdego materiału
// katalogu z potwierdzonym kodem EAN (MATERIAL_EAN_OVERLAY) tworzy oferty w 3
// sklepach i 5 startowych punktów historii per produkt.
//
// Uruchomienie: `pnpm --filter @workspace/api-server seed:offers`
// Wymaga DATABASE_URL. Idempotentne: oferty upsertowane po (produkt+sklep+URL),
// trajektoria historii wstawiana tylko, gdy jeszcze jej nie ma (marker źródła).
//
// UWAGA kolejność: najpierw uruchom bazowy `pnpm seed` (tworzy produkty katalogu
// z materials.ts). Ten skrypt i tak upsertuje produkt po EAN, więc zadziała też
// samodzielnie, ale bazowy seed daje pełne pokrycie katalogu.
//
// materials.ts jest częścią pakietu mobile (alias `@/...`), więc ładujemy go
// DYNAMICZNIE po ścieżce pliku — jego jedyny import to `import type` (kasowany w
// runtime), więc alias nie jest potrzebny do wykonania.
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  appendPrice,
  getPriceHistoryForProduct,
  upsertOffer,
  upsertProductWithMatch,
} from "@workspace/db/repositories";

import { createDb } from "../lib/db";
import { getEanOverlay } from "../lib/ean-overlay";
import type { SeedMaterial } from "../lib/seed-catalog";
import {
  seedOffers,
  type SeedOffersDeps,
  type SeedOffersResult,
} from "../lib/seed-offers";

/** Ładuje MATERIAL_PRICES z pakietu mobile po ścieżce pliku (bez aliasu `@/`). */
async function loadReferenceMaterials(): Promise<readonly SeedMaterial[]> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const materialsPath = path.resolve(
    here,
    "../../../mobile/data/prices/materials.ts",
  );
  const mod = (await import(pathToFileURL(materialsPath).href)) as {
    MATERIAL_PRICES?: readonly SeedMaterial[];
  };
  if (!Array.isArray(mod.MATERIAL_PRICES)) {
    throw new Error(
      `Nie znaleziono MATERIAL_PRICES w ${materialsPath} (sprawdź eksport).`,
    );
  }
  return mod.MATERIAL_PRICES;
}

const deps: SeedOffersDeps = {
  upsertProduct: upsertProductWithMatch,
  upsertOffer,
  appendPrice,
  getHistoryForProduct: getPriceHistoryForProduct,
};

function logResult(r: SeedOffersResult): void {
  console.log(
    `[seed:offers] materiały=${r.materialsProcessed} ` +
      `zEAN=${r.materialsProcessed - r.skippedNoEan} pominięte(bezEAN)=${r.skippedNoEan} ` +
      `produkty=${r.productsUpserted} oferty=${r.offersUpserted} ` +
      `historia+=${r.historyPointsInserted} błędy=${r.errors.length}`,
  );
  for (const e of r.errors) {
    console.warn(`[seed:offers]   ! ${e.material}: ${e.message}`);
  }
}

async function main(): Promise<void> {
  const all = await loadReferenceMaterials();
  const withEan = all.filter((m) => {
    const o = getEanOverlay(m.id);
    return Boolean(o?.ean || o?.gtin);
  });
  console.log(
    `[seed:offers] wczytano ${all.length} materiałów, ${withEan.length} z kodem EAN → seed wieloofertowy`,
  );

  const { pool, db } = createDb();
  try {
    const result = await seedOffers(db, all, deps);
    logResult(result);
    console.log(
      `[seed:offers] gotowe: ${result.offersUpserted} ofert + ${result.historyPointsInserted} punktów historii`,
    );
    if (result.errors.length > 0) process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[seed:offers] failed", err);
  process.exit(1);
});
