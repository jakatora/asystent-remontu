// Skrypt uruchamiający migracje katalogu produktów/ofert/historii cen na realnym
// Postgresie (te same pliki SQL, które generuje @workspace/db w lib/db/drizzle).
//
// Uruchomienie: `pnpm --filter @workspace/api-server migrate`
// Wymaga ustawionego DATABASE_URL. Idempotentne — drizzle trzyma zastosowane
// migracje w tabeli `__drizzle_migrations`, więc ponowne uruchomienie to no-op.
import path from "node:path";
import { fileURLToPath } from "node:url";

import { migrate } from "drizzle-orm/node-postgres/migrator";

import { createDb } from "../lib/db";

async function main(): Promise<void> {
  const { pool, db } = createDb();
  const here = path.dirname(fileURLToPath(import.meta.url));
  // src/scripts -> src -> api-server -> artifacts -> <repo root> -> lib/db/drizzle
  const migrationsFolder = path.resolve(here, "../../../../lib/db/drizzle");

  console.log(`[migrate] applying migrations from ${migrationsFolder}`);
  try {
    await migrate(db, { migrationsFolder });
    console.log("[migrate] done");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[migrate] failed", err);
  process.exit(1);
});
