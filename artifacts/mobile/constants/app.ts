// ─── App identity ─────────────────────────────────────────────────────────────
export const APP_NAME    = 'Remont Asystent' as const;
export const APP_TAGLINE = 'Twój przewodnik po remontach' as const;
export const APP_VERSION = '1.0.0' as const;

// ─── Database ─────────────────────────────────────────────────────────────────
export const DB_NAME     = 'remont_v2.db' as const;
export const DB_VERSION  = 1 as const;

// ─── Stale/cache times (ms) ──────────────────────────────────────────────────
export const CACHE_TTL = {
  projects:  1000 * 60 * 5,   // 5 min
  shopping:  1000 * 60 * 2,   // 2 min
  content:   1000 * 60 * 60,  // 1 hour (static content)
} as const;

// ─── Limits ───────────────────────────────────────────────────────────────────
export const LIMITS = {
  projectNameMax:  100,
  projectNotesMax: 1000,
  searchQueryMax:  200,
  recentProjects:  3,
} as const;

// ─── Area thresholds ──────────────────────────────────────────────────────────
export const AREA_THRESHOLDS = {
  large: 30,   // m² — triggers 'large-area' warning
} as const;

// ─── Labor cost multipliers by difficulty ────────────────────────────────────
export const LABOR_MULTIPLIER = {
  easy:   { min: 0.5, max: 1.0 },
  medium: { min: 1.0, max: 2.0 },
  hard:   { min: 2.0, max: 4.0 },
} as const;

// ─── Price variance for budget range ─────────────────────────────────────────
export const PRICE_VARIANCE = 0.2;

// ─── Default waste factor applied to material quantities ─────────────────────
export const DEFAULT_WASTE_FACTOR = 1.1;

// ─── Supabase table names ─────────────────────────────────────────────────────
export const SUPABASE_TABLES = {
  projects:      'projects',
  shoppingItems: 'shopping_items',
  userProfiles:  'user_profiles',
} as const;
