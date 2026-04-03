import type * as SQLite from 'expo-sqlite';

export async function migration_014(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS contractor_plans (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      short_description TEXT NOT NULL DEFAULT '',
      monthly_price   REAL NOT NULL DEFAULT 0,
      yearly_price    REAL NOT NULL DEFAULT 0,
      status          TEXT NOT NULL DEFAULT 'active',
      display_order   INTEGER NOT NULL DEFAULT 0,
      notes           TEXT NOT NULL DEFAULT '',
      entitlements    TEXT NOT NULL DEFAULT '{}',
      highlight_features TEXT NOT NULL DEFAULT '[]',
      badge           TEXT,
      color           TEXT NOT NULL DEFAULT '#94A3B8',
      created_at      TEXT NOT NULL,
      updated_at      TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contractor_plan_assignments (
      id              TEXT PRIMARY KEY,
      contractor_id   TEXT NOT NULL,
      plan_id         TEXT NOT NULL,
      state           TEXT NOT NULL DEFAULT 'active',
      start_date      TEXT NOT NULL,
      end_date        TEXT,
      trial_end_date  TEXT,
      assigned_by     TEXT NOT NULL DEFAULT 'system',
      notes           TEXT,
      created_at      TEXT NOT NULL,
      updated_at      TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contractor_usage_counters (
      id              TEXT PRIMARY KEY,
      contractor_id   TEXT NOT NULL,
      counter_key     TEXT NOT NULL,
      current_value   INTEGER NOT NULL DEFAULT 0,
      limit_value     INTEGER NOT NULL DEFAULT 0,
      updated_at      TEXT NOT NULL,
      UNIQUE(contractor_id, counter_key)
    );

    CREATE TABLE IF NOT EXISTS contractor_billing_events (
      id              TEXT PRIMARY KEY,
      contractor_id   TEXT NOT NULL,
      event_type      TEXT NOT NULL,
      plan_id         TEXT NOT NULL,
      provider_type   TEXT NOT NULL DEFAULT 'admin_manual_assignment',
      amount          REAL,
      currency        TEXT,
      notes           TEXT,
      metadata        TEXT,
      created_at      TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contractor_promotion_slots (
      id              TEXT PRIMARY KEY,
      contractor_id   TEXT NOT NULL,
      scope           TEXT NOT NULL,
      scope_value     TEXT,
      label           TEXT NOT NULL DEFAULT '',
      priority        INTEGER NOT NULL DEFAULT 0,
      is_active       INTEGER NOT NULL DEFAULT 1,
      start_date      TEXT NOT NULL,
      end_date        TEXT,
      plan_id         TEXT,
      created_at      TEXT NOT NULL,
      updated_at      TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_cpa_contractor ON contractor_plan_assignments(contractor_id);
    CREATE INDEX IF NOT EXISTS idx_cpa_state ON contractor_plan_assignments(state);
    CREATE INDEX IF NOT EXISTS idx_cuc_contractor ON contractor_usage_counters(contractor_id);
    CREATE INDEX IF NOT EXISTS idx_cbe_contractor ON contractor_billing_events(contractor_id);
    CREATE INDEX IF NOT EXISTS idx_cbe_type ON contractor_billing_events(event_type);
    CREATE INDEX IF NOT EXISTS idx_cps_contractor ON contractor_promotion_slots(contractor_id);
    CREATE INDEX IF NOT EXISTS idx_cps_active ON contractor_promotion_slots(is_active);
    CREATE INDEX IF NOT EXISTS idx_cps_scope ON contractor_promotion_slots(scope);
  `);
}
