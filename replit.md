# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### `artifacts/mobile` — Remont Asystent (Expo mobile app)
Production-ready, scalable renovation assistant app for Polish users. Offline-first, Polish language, beginner-friendly.

**Features:**
- 30+ renovation jobs across 20 categories (paint, walls, flooring, bathroom, kitchen, gypsum/drywall, windows, doors, electrical, plumbing)
- Calculates material quantities and costs (with waste factor + packaging) from user measurements
- `calculateDetailed()` generates per-material Polish explanations of every formula step
- Auto-generates shopping lists from calculation results
- Step-by-step instructions with tips and warnings per step
- Clearly warns about high-risk work and recommends professionals
- All data stored offline-first via SQLite (expo-sqlite v16)
- TanStack Query v5 data layer (hooks/) ready for background sync

**Architecture (scalable layers):**
```
app/                     # Expo Router screens only — no business logic
types/
  domain.ts              # Core domain types — extended with all new engine fields
  engine.ts              # Rich engine types: MeasurementInputDefinition, MaterialRequirement,
                         #   ToolRequirement, StepGuide, DryingTime, CostRule, VisibilityMode, etc.
  user.ts                # User entities: Room, UserPreference, SavedCalculation
  calculator.ts          # Calculator/warning/generator interfaces
  db.ts                  # SQLite row shapes (typed, no any)
  index.ts               # Re-exports ALL types — always import from here
shared/
  schemas/               # Zod validation schemas
    engine.schema.ts     # Zod schemas for all engine types (MaterialRequirement, Room, etc.)
    project.schema.ts    # Project CRUD schema
    shopping.schema.ts   # Shopping item schema
    wizard.schema.ts     # Wizard form schema
    measurement.schema.ts # Runtime measurement builder
  lib/                   # id.ts, currency.ts, date.ts utilities
features/
  calculator/
    formulas.ts          # Formula registry (30+ formulas); byArea/byPerimeter aliases
                         #   New: tilePieces (uses tileWidthCm/tileHeightCm), panelPacks,
                         #        grout (precise from groutWidthMm), paintLiters
    formula-builder.ts   # Parameterized formula factories:
                         #   coverage(litersPerM2), kgPerSqm(), packs(), tilePieces(),
                         #   panelPacks(), linear(), fixed(), perItem(), grout(), siliconeTubes()
                         #   + resolveSpec(FormulaSpec) for declarative config
    engine.ts            # Calculator engine: resolves inline formula fn OR registry key;
                         #   supports PackagingInfo (auto-convert qty → packs), RoundingRule
    shopping.ts          # ShoppingListGenerator (packs/purchaseUnit aware)
    budget.ts            # BudgetEstimator class
    index.ts             # Barrel
  warnings/
    resolver.ts          # WarningResolver with condition evaluator map
    difficulty.ts        # Difficulty/risk label+color maps
  content/
    registry.ts          # Auto-assembled job+category registry (single source of truth)
hooks/                   # TanStack Query data hooks (use in new components)
  useProjects.ts, useShopping.ts, useContent.ts, useCalculator.ts
  index.ts               # Barrel
db/
  client.ts, migrations/, repositories/, adapters/
  adapters/sync.adapter.ts      # SyncAdapter interface + NullSyncAdapter
  adapters/supabase.adapter.ts  # SupabaseSyncAdapter (ready when env vars added)
context/
  AppContext.tsx          # Backward-compat wiring layer (existing screens use this)
data/jobs/               # ONE FILE PER JOB GROUP — reference impl: paint.ts
  paint.ts               # CANONICAL REFERENCE: showcases ALL new engine fields
  walls.ts               # primer, repaint, wall-repair, skim-coat, wallpaper-install, wallpaper-remove
  flooring.ts            # underlay, laminate, vinyl-click, vinyl-glued, floor-tiles, skirting-boards
  bathroom.ts            # waterproofing, wall-tiles-bathroom, grout-only, silicone-sealing
  windows.ts             # window-sealing, windowsill, paint-frames, trim-finishing
  finishing.ts, risky.ts, kitchen.ts, gypsum.ts
  index.ts               # Barrel → re-exports from features/content/registry.ts
components/ui/           # Reusable UI components; index.ts barrel
constants/
  colors.ts              # Full color palette incl. all category colors
  design.ts, app.ts
lib/
  query-client.ts, sentry.ts, supabase.ts
```

**How to add a new renovation job:**
1. Create (or extend) a file in `data/jobs/`
2. Import it in `features/content/registry.ts` and add to `JOB_REGISTRY`
3. Done — categories, job counts, search, and screens auto-update

**How to add a new formula:**
- Add a key+function to `FORMULA_REGISTRY` in `features/calculator/formulas.ts`
- Convenience aliases: `byArea` = `mesh` (area × waste), `byPerimeter` = `skirting` (perimeter × waste)

**Adding Supabase sync:**
- Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` env vars
- `db/adapters/supabase.adapter.ts` is already fully implemented
- Call `createSupabaseAdapter(userId)` and inject into AppContext

**Dependencies:** expo-sqlite@~16.0.10, @tanstack/react-query@^5, zod, react-hook-form, @expo-google-fonts/inter

### `artifacts/api-server` — Express API
Backend Express server (PostgreSQL + Drizzle ORM). Used by other artifacts if needed.
- Health endpoint: `GET /api/health`
- Uses `DATABASE_URL` secret (auto-provided by Replit PostgreSQL integration)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
