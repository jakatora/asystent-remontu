# Remont Assistance - Reguły dla Claude Code (v3, post-audit)

Pracujesz nad **istniejącym monorepo** "Remont Assistance" (Expo + RN + TS). Twoim zadaniem jest **udoskonalanie i uzupełnianie** w pętli, bazując na realiach poznanych w audycie.

## 🏗️ Stack (zweryfikowany audytem)

- **Monorepo:** pnpm workspaces, Node 24, TypeScript 5.9
- **Mobile (główna):** Expo SDK 54 + React Native 0.81 + expo-router (file-based)
- **Web/portal:** React + Vite + Tailwind (`asystent-remontu-web/`)
- **API:** Express 5 + Drizzle (Postgres) — **schemat PUSTY** (`lib/db/src/schema/index.ts:20` = `export {}`), backend to szkielet
- **Lokalna DB:** expo-sqlite `remont_v2.db`, 14 migracji, ~22 repozytoriów
- **i18n:** brak frameworka, wszystko hardcoded po polsku
- **Testy:** **BRAK żadnych** *.test.ts ani Jest/Vitest w mobile

## 📍 Mapa kodu (ścieżki względem katalogu głównego repo)

| Co | Ścieżka |
|---|---|
| Definicje jobów | `artifacts/mobile/data/jobs/{paint,walls,flooring,bathroom,kitchen,gypsum,windows,finishing,fixtures,small-repairs,floor-prep,risky}.ts` |
| Indeks jobów | `artifacts/mobile/data/jobs/index.ts` |
| Centralny rejestr | `artifacts/mobile/features/content/registry.ts` (`JOB_REGISTRY` linia 36–105, `CATEGORY_META` linia 112–273) |
| Materiały referencyjne | `artifacts/mobile/data/prices/materials.ts` |
| Robocizna referencyjna | `artifacts/mobile/data/prices/labor.ts` |
| Mapowania per job | `artifacts/mobile/data/prices/mappings.ts` (`JOB_LABOR_MAPPINGS`, `JOB_MATERIAL_MAPPINGS`) |
| Regiony cenowe | `artifacts/mobile/data/prices/regions.ts` (**TYLKO `lodzkie` zaseedowane!**) |
| Engine kalkulatora | `artifacts/mobile/features/calculator/engine.ts` (rozróżnia rich/legacy przez `isRichMaterial` w linii ~15) |
| Formuły | `artifacts/mobile/features/calculator/formulas.ts` (linia 187 - `FORMULA_REGISTRY`) |
| Budżet | `artifacts/mobile/features/calculator/budget.ts` (`estimateBudget`) |
| Lista zakupowa | `artifacts/mobile/features/calculator/shopping.ts` |
| UI listy zakupowej | `artifacts/mobile/components/project/ShoppingTab.tsx:46` (sumy + 10% rezerwy) |
| Typy domeny | `artifacts/mobile/types/domain.ts` (`MaterialItem` linia 61, `ToolItem` linia 81) |
| Typy pricing | `artifacts/mobile/types/pricing.ts` (**`sourceUrl?` JUŻ ISTNIEJE** w PriceSourceMetadata:17, LaborPriceReference:39, MaterialPriceReference:58) |
| Typy engine | `artifacts/mobile/types/engine.ts` (`MaterialRequirement` rich) |
| Walidacja wizardu | `artifacts/mobile/shared/schemas/wizard.schema.ts` |

## ⛔ ZAKAZ HALUCYNACJI (priorytet 1)

- Każda informacja techniczna → komentarz `// source: <URL>` w TS
- Każda cena → pełny obiekt z `sourceUrl`, `fetchedAt`, `store`, `value`, `currency`
- Każdy materiał/narzędzie → minimum 2 niezależne źródła (zapisane w `research/<jobId>.md`)
- Brak pewnego źródła → `// TODO: brak wiarygodnego źródła`. **NIE zgaduj.**
- Akceptowane sklepy PL: Castorama, Leroy Merlin, OBI, Bricoman, Praktiker, Mrówka

## 🚨 KRYTYCZNE ZAKAZY (z audytu, sekcja 10)

### NIGDY nie zmieniaj istniejących `job.id`
Linki w `JOB_LABOR_MAPPINGS` i `JOB_MATERIAL_MAPPINGS` (data/prices/mappings.ts:13–43) trzymają job po ID. Zmiana ID **nie jest błędem TS** — pęknie cicho w runtime.

### NIGDY nie usuwaj legacy IDs
- `wallpaperJob` (id `wallpaper`) w `finishing.ts` musi zostać — używają go istniejące projekty użytkowników
- `skirtingJob` (id `skirting-boards`) w `finishing.ts` — j.w. (mimo że nie jest w aktywnym JOB_REGISTRY)
- Każdy nowy wariant joba dodawaj pod **nowym** ID, stary zostaw

### NIGDY nie mieszaj rich i legacy w jednej tablicy `materials[]`
Engine wykrywa rich przez obecność pola `formula` (engine.ts:15). Mieszanka rozwala obliczenia.
- Job ma tylko `MaterialItem` (legacy, bez `formula`) **albo** tylko `MaterialRequirement` (rich, z `formula`)
- Nowe joby zawsze rich
- Nigdy nie konwertuj istniejącego joba z legacy na rich w pojedynczej zmianie — zostawiaj jak jest

### NIGDY nie zmieniaj `measurementInputs[].id`
Pola jak `m.wallArea`, `m.coats`, `m.wastePercent`, `m.area` są używane bezpośrednio w formulas.ts (linia 7–32). Zmiana ID = `undefined` w wyniku obliczenia, bez błędu TS.

### Walidacja rejestru tylko w `__DEV__`
`registry.ts:298` używa `console.warn`, nie `throw`. W prod błędne joby przechodzą. **Po każdej zmianie sprawdzaj logi `__DEV__`** — uruchom `pnpm --filter ./artifacts/mobile expo start` na chwilę i poszukaj warnów (lub jeszcze lepiej: dodaj test który czyta rejestr i `safeParse` przez Zod).

## ✅ POLE `sourceUrl` — co masz, czego brakuje

**Już istnieje** (opcjonalne, więc dorzucanie wartości NIC nie psuje):
- `MaterialPriceReference.sourceUrl?` (types/pricing.ts:58)
- `LaborPriceReference.sourceUrl?` (types/pricing.ts:39)
- `PriceSourceMetadata.sourceUrl?` (types/pricing.ts:17)

**Trzeba dodać** (jako opcjonalne `readonly sourceUrl?: string` żeby nie złamać konsumentów):
- `MaterialItem` w types/domain.ts:61
- `ToolItem` w types/domain.ts:81
- `MaterialRequirement` w types/engine.ts (jeśli odróżnia się od MaterialItem)

To może zrobić Claude w **fazie `extend_types`** (jednorazowej) zanim ruszy iteracja po jobach.

## 🖼️ Zdjęcia produktów

- W aplikacji są obecnie tylko 2 binarne pliki (icon, splash) — łącznie ~1.3 MB
- Materiały/narzędzia używają nazw ikon Feather w polach `coverIcon`, `icon` (NIE prawdziwe zdjęcia)
- **Dorzucanie zdjęć:** dodaj opcjonalne pole `imageUrl?: string` (URL CDN, **NIE** lokalny plik) do `MaterialItem`/`ToolItem` w types/domain.ts. Wartość = URL strony produktu w sklepie PL (NIE pobieraj plików graficznych).
- **NIE dodawaj plików graficznych do repo** — rozdmucha bundle Expo.

## 🔄 Fazy pętli

### Faza 0a: `setup_tests` (jednorazowa, opcjonalna ale ZALECANA)
Dorzuca Vitest do `artifacts/mobile`, pisze 5 snapshot testów dla `engine.calculate` na 5 istniejących jobach (paint, flooring, bathroom, kitchen, walls). Bez tego pętla pracuje na ślepo - jedyny gate to typecheck.

### Faza 0b: `map_codebase` (jednorazowa)
Wczytuje rejestr i wypisuje **kompletną listę 57 jobów** do `research/_codebase.md` + przegląd interfejsów (Job, MaterialItem, MaterialRequirement, Tool, formuły).
Po niej `scripts/sync-state.sh` aktualizuje state.json o pełną listę jobów.

### Faza 0c: `extend_types` (jednorazowa)
Dorzuca opcjonalne `sourceUrl?` i `imageUrl?` do `MaterialItem` i `ToolItem` w types/domain.ts. Sprawdza typecheck.

### Fazy modułowe (per jobId, nie per plik!)
1. `research` - 3 polskie źródła → `research/<jobId>.md`
2. `compare` - diff vs aktualny job w `data/jobs/<plik>.ts` → `diff/<jobId>.md`
3. `fix` - poprawki w pliku TS, każde zmienione pole z `// source: URL`. Po zmianie typecheck + (jeśli są) testy
4. `tools_materials` - uzupełnia/dodaje materiały do `data/prices/materials.ts` + mapowania w `data/prices/mappings.ts`
5. `photos_prices` - URL produktów w sklepach PL + ceny + `imageUrl` (jako URL CDN ze sklepu)
6. `verify_calcs` - czyta formułę dla joba, pisze 3 weryfikacje (test snapshot albo `research/<jobId>-tests.md`), porównuje z 3 przykładami z internetu
7. `done`

### Faza `discover` (po wszystkich `done`)
Szuka nowych remontów. Dodanie według kanonicznego przepisu z audytu (rekomendacje 1-5):
1. Plik w `data/jobs/` (kopia z paint.ts jako wzorzec)
2. Import + wpis w `JOB_REGISTRY` (registry.ts:36)
3. Opcjonalnie kategoria w `CATEGORY_META`
4. Wpis w `JOB_LABOR_MAPPINGS` i `JOB_MATERIAL_MAPPINGS`
5. Opcjonalnie nowa formuła w formulas.ts:187

## ✅ Walidacja po każdej zmianie

```bash
# Bezwzględnie:
pnpm --filter ./artifacts/mobile typecheck

# Jeśli setup_tests została zrobiona:
pnpm --filter ./artifacts/mobile test

# Walidacja URL-i ze źródeł:
bash scripts/validate-sources.sh <plik>

# Walidacja że nie ruszono legacy IDs:
bash scripts/check-legacy-ids.sh
```

Jeśli **którykolwiek** check się sypie → `git checkout -- <plik>`, zapis `errors[]` w state.json, **bez zmiany fazy**.

## 🚫 Czego NIE wolno

- NIE dotykaj `node_modules/`, `.git/`, `dist/`, `build/`, `.expo/`, migracji 001-014
- NIE zmieniaj `package.json`/`pnpm-lock.yaml` poza `setup_tests` (wtedy dodanie Vitest do devDependencies jest OK)
- NIE używaj `--dangerously-skip-permissions`
- NIE rób zmian w UI (`wizard.tsx`, ekrany w `app/`) — pętla skupia się tylko na **content + cenach + formułach**
- NIE zmieniaj `MaterialItem` na `MaterialRequirement` (lub odwrotnie) w istniejących jobach
- NIE dodawaj plików graficznych do repo
