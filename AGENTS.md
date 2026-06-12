# Remont Assistance — Agent Instructions

> **Full conventions, loop phases, and critical rules are in [CLAUDE.md](./CLAUDE.md).**
> This file is the quick-start guide for Copilot agents.

## Stack

- **Monorepo**: pnpm workspaces, Node 24, TypeScript 5.9
- **Mobile (primary)**: Expo SDK 54 + React Native 0.81 + expo-router
- **Web**: React + Vite + Tailwind (`artifacts/asystent-remontu-web/`)
- **API**: Express 5 + Drizzle (skeleton only)
- **Local DB**: expo-sqlite `remont_v2.db` (14 migrations, do not modify)

## Build & Validate

```bash
# Typecheck (required after every change)
pnpm --filter ./artifacts/mobile typecheck

# Start mobile dev server
pnpm --filter ./artifacts/mobile expo start

# Validation scripts
bash scripts/validate-sources.sh <file>   # verifies // source: URL comments
bash scripts/check-legacy-ids.sh          # verifies job IDs unchanged
```

No test runner is configured yet (`state.json: setup_tests_done: false`).

## Key Paths

| What | Path |
|---|---|
| Job definitions | `artifacts/mobile/data/jobs/{paint,walls,flooring,…}.ts` |
| Job registry | `artifacts/mobile/features/content/registry.ts` |
| Calculator engine | `artifacts/mobile/features/calculator/engine.ts` |
| Formulas | `artifacts/mobile/features/calculator/formulas.ts` |
| Price data | `artifacts/mobile/data/prices/{materials,labor,mappings,regions}.ts` |
| Domain types | `artifacts/mobile/types/domain.ts` |

## Critical Rules (Silent Runtime Failures)

1. **Never change `job.id`** — IDs are keys in `JOB_LABOR_MAPPINGS` and `JOB_MATERIAL_MAPPINGS`; no TS error if broken
2. **Never remove legacy job IDs** — `wallpaper`, `skirting-boards` are used by existing user projects
3. **Never mix rich and legacy materials** — a job's `materials[]` is either all `MaterialItem` (legacy) or all `MaterialRequirement` (rich, has `formula` field); mixing silently breaks calculations
4. **Never change `measurementInputs[].id`** — used directly in formulas as `m.<id>`; renaming produces `undefined` with no TS error
5. **Every price/fact needs a source** — add `// source: <URL>` inline; prices use full `{ sourceUrl, fetchedAt, store, value, currency }` objects

## Adding a New Job

Follow the recipe in [CLAUDE.md § Faza `discover`](./CLAUDE.md):
1. New file in `data/jobs/` (copy `paint.ts` as template)
2. Import + entry in `JOB_REGISTRY` and `CATEGORY_META` in `registry.ts`
3. Entry in `JOB_LABOR_MAPPINGS` + `JOB_MATERIAL_MAPPINGS` in `mappings.ts`
4. Optionally add formula in `formulas.ts`
5. Run typecheck

## What NOT to Touch

- `node_modules/`, `.git/`, `dist/`, `.expo/`
- DB migration files (`001`–`014`)
- `package.json` / `pnpm-lock.yaml` (unless explicitly asked)
- UI screens (`app/`, `wizard.tsx`)
