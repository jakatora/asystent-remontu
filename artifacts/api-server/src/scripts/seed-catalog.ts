// CLI seedowania katalogu produktów: czyta dane referencyjne z mobile
// (artifacts/mobile/data/prices/materials.ts) i wypełnia REALNE tabele
// `products` + `product_offers` w Postgresie przez istniejące DAO.
//
// Uruchomienie: `pnpm --filter @workspace/api-server seed`
// Wymaga DATABASE_URL. Idempotentne: produkty upsertowane po (nazwa+kategoria),
// oferty po (produkt+sklep+URL); price_history rośnie tylko przy zmianie ceny.
//
// materials.ts jest częścią pakietu mobile (alias `@/...`), więc ładujemy go
// DYNAMICZNIE po ścieżce pliku. Jego jedyny import (`import type`) jest kasowany
// w runtime, więc alias nie jest potrzebny do wykonania — czytamy sam array.
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { createDb } from "../lib/db";
import { seedCatalog, type SeedMaterial, type SeedResult } from "../lib/seed-catalog";

/** Ładuje MATERIAL_PRICES z pakietu mobile po ścieżce pliku (bez aliasu `@/`). */
async function loadReferenceMaterials(): Promise<readonly SeedMaterial[]> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  // src/scripts -> src -> api-server -> artifacts -> mobile/data/prices/materials.ts
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

function logResult(r: SeedResult): void {
  console.log(
    `[seed] materiały=${r.materialsProcessed} produkty=${r.productsUpserted} ` +
      `nowe=${r.productsCreated} oferty=${r.offersUpserted} błędy=${r.errors.length}`,
  );
  for (const e of r.errors) {
    console.warn(`[seed]   ! ${e.material}: ${e.message}`);
  }
}

async function main(): Promise<void> {
  const materials = await loadReferenceMaterials();
  console.log(`[seed] wczytano ${materials.length} materiałów referencyjnych`);

  const { pool, db } = createDb();
  try {
    const result = await seedCatalog(db, materials);
    logResult(result);
    console.log(
      `[seed] gotowe: ${result.offersUpserted} ofert startowych w katalogu`,
    );
    if (result.errors.length > 0) process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[seed] failed", err);
  process.exit(1);
});
