// Konfigurowalne połączenie Drizzle -> Postgres dla backendu API.
//
// Świadomie NIE używamy singletona `db` z @workspace/db (ten rzuca przy imporcie,
// gdy brak DATABASE_URL, więc uniemożliwia testy i import routera bez bazy).
// Tutaj połączenie budujemy LENIWIE: pool powstaje dopiero przy pierwszym
// `getDb()` (czyli przy pierwszym żądaniu wymagającym bazy), a `createDb()`
// pozwala wstrzyknąć własny connection string (migracje, testy integracyjne).
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@workspace/db/schema";

const { Pool } = pg;

/** Instancja Drizzle backendu — zgodna z `Database` z @workspace/db/repositories. */
export type AppDatabase = NodePgDatabase<typeof schema>;

/**
 * Buduje NOWE połączenie (pool + Drizzle) z podanego connection stringa
 * (domyślnie `DATABASE_URL`). Każde wywołanie tworzy własny pool — wołający
 * odpowiada za `pool.end()` (używane przez skrypt migracji). Rzuca, gdy brak URL.
 */
export function createDb(
  connectionString: string | undefined = process.env.DATABASE_URL,
): { pool: pg.Pool; db: AppDatabase } {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL must be set to use the pricing API database connection.",
    );
  }
  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });
  return { pool, db };
}

let singletonDb: AppDatabase | null = null;
let singletonPool: pg.Pool | null = null;

/**
 * Zwraca współdzielone połączenie procesu (leniwie utworzone przy pierwszym
 * użyciu). Endpointy wołają je dopiero w handlerze żądania, więc import routera
 * NIE wymaga DATABASE_URL — dzięki temu health/testy działają bez bazy.
 */
export function getDb(): AppDatabase {
  if (!singletonDb) {
    const created = createDb();
    singletonDb = created.db;
    singletonPool = created.pool;
  }
  return singletonDb;
}

/** Zamyka współdzielony pool (np. przy graceful shutdown / w testach). */
export async function closeDb(): Promise<void> {
  if (singletonPool) {
    await singletonPool.end();
    singletonPool = null;
    singletonDb = null;
  }
}
