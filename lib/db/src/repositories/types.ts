import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import type * as schema from "../schema";

// Typ instancji Drizzle wstrzykiwanej do repozytoriów. Repozytoria przyjmują
// `db` jako argument (zamiast importować singleton z ../index), żeby były
// testowalne i nie wymuszały ustawionego DATABASE_URL przy samym imporcie.
export type Database = NodePgDatabase<typeof schema>;
