# APP_AUDIT — Remont Assistance

> Audyt przeprowadzony 2026-05-06. Tylko odczyt — żaden plik produkcyjny nie został zmodyfikowany. Wszystkie cytaty kodu są fragmentami (≤50 linii) i odwołują się do źródeł przez ścieżki `path:linia`.

---

## 1. STRUKTURA PROJEKTU

### Drzewo katalogów (poziom 1–3, bez node_modules / .git / dist / build)

```
remont_assistance/
├── package.json                 ← root manifest workspace pnpm
├── pnpm-workspace.yaml          ← deklaracja pakietów + catalog
├── pnpm-lock.yaml
├── tsconfig.base.json / tsconfig.json
├── replit.md                    ← „blueprint" produktu (po polsku)
├── start_remont_assistance_windows.bat
├── .agents/  .config/  .local/  .replit  .replitignore
├── attached_assets/             (zewnętrzne pomoce, niegroźne dla repo)
├── scripts/
├── lib/
│   ├── api-client-react/        (placeholder, generowane z OpenAPI)
│   ├── api-spec/                (placeholder OpenAPI)
│   ├── api-zod/                 (placeholder zod-walidator)
│   └── db/                      (drizzle / Postgres - PUSTY schemat,
│                                 patrz lib/db/src/schema/index.ts)
└── artifacts/
    ├── api-server/              (Express 5 + Drizzle, minimalny — health + places)
    │   └── src/{app.ts, index.ts, lib, middlewares, routes/{health,places,index}.ts}
    ├── asystent-remontu-web/    (React + Vite + Tailwind, marketing/portal)
    │   └── src/{App.tsx, pages/{Home,Marketing,Privacy,Support,not-found,portal/}, components, hooks, lib}
    ├── panthea/                 (drugi mini-front w React+Vite — landing)
    │   └── src/{App.tsx, pages/{Home,not-found}, ...}
    ├── mockup-sandbox/          (Vite playground komponentów)
    ├── remont-asystent/         (Electron desktop wrapper, main.js + tools/)
    └── mobile/                  ← **GŁÓWNA APLIKACJA** (Expo SDK 54)
        ├── app/                 (expo-router screens)
        │   ├── (tabs)/{index, explore, projects, settings}.tsx
        │   ├── _layout.tsx
        │   ├── onboarding.tsx
        │   ├── wizard.tsx                 (1356 linii — 9-krokowy kreator)
        │   ├── job/[id].tsx
        │   ├── category/[id].tsx
        │   ├── project/[id].tsx           (557 linii)
        │   ├── hire-pro.tsx
        │   ├── contractor/                (lista, profil, admin, …)
        │   └── house-build/               (rozbudowany moduł "House Build")
        ├── data/
        │   ├── categories.ts              (re-export z features/content/registry)
        │   ├── commerce/{bundles, product-mappings, index}.ts
        │   ├── jobs/{paint, walls, flooring, bathroom, kitchen, gypsum, windows,
        │   │         finishing, fixtures, small-repairs, floor-prep, risky, index}.ts
        │   └── prices/{labor, materials, regions, mappings, index}.ts
        ├── features/
        │   ├── calculator/{engine, formulas, formula-builder, shopping,
        │   │                budget, explanation, job-config, index}.ts
        │   ├── content/{registry, index}.ts
        │   ├── pricing/{engine, registry, index}.ts
        │   ├── warnings/{difficulty, resolver, index}.ts
        │   ├── commerce/                  (mock layer + interfejs providera)
        │   ├── contractor/                (search, ranking, plans, …)
        │   └── house-build/               (~kilkanaście plików)
        ├── db/
        │   ├── client.ts                  (expo-sqlite, baza `remont_v2.db`)
        │   ├── migrations/001…014_*.ts    (14 migracji)
        │   └── repositories/*.repo.ts     (≈22 repo)
        ├── components/                    (UI + project + commerce + contractor + house-build)
        ├── context/                       (AppContext, CommerceContext, ContractorContext, HouseBuildContext)
        ├── hooks/                         (useCalculator, useContent, useProjects, useShopping, useWizardDraft)
        ├── types/                         (domain, engine, calculator, calculation, pricing, contractor, …)
        ├── shared/                        (zod-schemas + utility libs)
        ├── lib/                           (query-client, sentry, supabase optional)
        ├── constants/colors.ts
        ├── assets/images/{icon.png, splash-icon.png}
        ├── server/serve.js                (statyczny serwer dla Web buildu)
        ├── scripts/build.js
        ├── app.json                       (Expo manifest)
        ├── eas.json                       (EAS Build)
        ├── package.json / tsconfig.json
        └── *.md                           (release-readiness, expo-go-compat, known-blockers, …)
```

### Plik manifestu projektu

| Poziom | Plik | Rola |
|---|---|---|
| Root | [package.json](package.json) | workspace „workspace", uruchamia tylko `typecheck`/`build` rekurencyjnie |
| Root | [pnpm-workspace.yaml](pnpm-workspace.yaml) | rejestruje `artifacts/*`, `lib/*`, `lib/integrations/*`, `scripts` + `catalog:` z wersjami współdzielonymi |
| Mobile | [artifacts/mobile/package.json](artifacts/mobile/package.json) | właściwy manifest aplikacji RN/Expo |
| Mobile | [artifacts/mobile/app.json](artifacts/mobile/app.json) | manifest Expo (bundleId `pl.asystentremontu.app`, EAS projectId) |
| API | [artifacts/api-server/package.json](artifacts/api-server/package.json) | Express 5 + Drizzle |
| Web | [artifacts/asystent-remontu-web/package.json](artifacts/asystent-remontu-web/package.json) | Vite + React landing/portal |

### Technologia

- **Monorepo:** pnpm workspaces, Node 24, TypeScript ~5.9.2, Prettier 3.
- **Aplikacja mobilna (główna):**
  - **Framework:** Expo SDK ~54.0.27 + React Native 0.81.5 + react-native-web (also runs as web).
  - **Routing:** `expo-router` ~6.0.17 (file-based, typed routes).
  - **Język:** TypeScript 5.9.
  - **Platformy docelowe:** Android (`pl.asystentremontu.app`, versionCode 1), iOS (`pl.asystentremontu.app`, buildNumber 1, supportsTablet=false), Web (favicon, expo-router origin `https://asystentremontu.pl/`).
- **Backend API:** Express 5 + Drizzle ORM + Postgres (Replit-managed); jednak [lib/db/src/schema/index.ts:20](lib/db/src/schema/index.ts:20) jest **pusty** (`export {}`), API ma tylko `routes/health.ts` i `routes/places.ts` — backend jest szkieletem.
- **Web (marketing/portal):** React 19 + Vite 7 + Tailwind 4 + wouter (routing).
- **Wrapper desktop:** [artifacts/remont-asystent/main.js](artifacts/remont-asystent/main.js) — Electron-podobny launcher (wszedł do repo poza gitem; status `?? release/` `?? tools/`).

### Zależności mobile (kluczowe)

```jsonc
// artifacts/mobile/package.json
"expo": "~54.0.27",
"expo-router": "~6.0.17",
"expo-sqlite": "^16.0.10",        // offline-first store
"react": catalog (19.1.0),
"react-native": "0.81.5",
"react-native-web": "^0.21.0",
"@tanstack/react-query": catalog (^5.90.21),
"@supabase/supabase-js": "2.100.0",   // optional sync adapter
"react-hook-form": "^7.72.0",
"zod": catalog (^3.25.76),
"nativewind": "4.2.3",              // Tailwind dla RN
"react-native-reanimated": "~4.1.1",
"@expo-google-fonts/inter": "^0.4.0",
"expo-image-picker": "~17.0.9",
"expo-location": "~19.0.8",
"expo-haptics": "~15.0.8",
"expo-glass-effect": "~0.1.4",
"@expo/vector-icons": "^15.0.3"
```

> Pełna lista — [artifacts/mobile/package.json](artifacts/mobile/package.json:1).

`pnpm-workspace.yaml` ma istotne zabezpieczenia: `minimumReleaseAge: 1440` (1 dzień) — obrona przed atakami supply-chain. Patrz [pnpm-workspace.yaml:28](pnpm-workspace.yaml:28).

---

## 2. ARCHITEKTURA

### Wzorzec architektoniczny

**Hybryda Feature-Sliced + Repository pattern** — czysto warstwowa, bez zewnętrznego frameworka stanu typu Redux/Zustand:

- **Feature-Sliced Design** — kod domenowy w `features/` (calculator, pricing, content, warnings, commerce, contractor, house-build), niezależny od warstwy UI.
- **Repository Pattern** w `db/repositories/` — każdy domain object ma swoje repo (np. [db/repositories/projects.repo.ts](artifacts/mobile/db/repositories/projects.repo.ts), [db/repositories/shopping.repo.ts](artifacts/mobile/db/repositories/shopping.repo.ts)).
- **Engine + Registry** — formuły i joby trzymane w rejestrach (singletony), patrz [features/content/registry.ts:36](artifacts/mobile/features/content/registry.ts:36) i [features/calculator/formulas.ts:187](artifacts/mobile/features/calculator/formulas.ts:187).
- **Provider-agnostic abstrakcje** — `CommerceProviderInterface`, `BillingProviderInterface` (mock-only).
- **Server-state cache** TanStack Query v5 wokół warstwy repo/SQLite ([artifacts/mobile/lib/query-client.ts]).

### Warstwy: UI / Logika / Dane

```
┌────────────────────────────────────────────────────────────┐
│ UI:    app/  (expo-router screens) + components/           │
│        — wszystkie ekrany są React Native "function comp." │
└──────┬─────────────────────────────────────────────────────┘
       │ wykorzystuje
┌──────▼─────────────────────────────────────────────────────┐
│ STATE:  context/  (AppContext, CommerceContext, …)         │
│         hooks/    (useCalculator, useShopping, useProjects)│
│         + TanStack Query                                   │
└──────┬─────────────────────────────────────────────────────┘
       │ wywołuje
┌──────▼─────────────────────────────────────────────────────┐
│ DOMENA: features/  (calculator engine, formuły, pricing,   │
│                     warnings, content registry)            │
│         shared/    (zod-schemas, utility libs)             │
└──────┬─────────────────────────────────────────────────────┘
       │ czyta/zapisuje przez
┌──────▼─────────────────────────────────────────────────────┐
│ DANE:   db/        (expo-sqlite client + migrations + repo)│
│         data/      (statyczne JOBS, MATERIAL_PRICES,       │
│                     LABOR_PRICES, REGIONS — w TypeScript)  │
└────────────────────────────────────────────────────────────┘
```

### Routing / nawigacja

**`expo-router` ~6** (file-based, jak Next.js). Konfiguracja w [artifacts/mobile/app/_layout.tsx:67](artifacts/mobile/app/_layout.tsx:67):

```tsx
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
  <Stack.Screen name="wizard" options={{ headerShown: true, presentation: 'modal' }} />
  <Stack.Screen name="category/[id]" options={{ headerShown: true }} />
  <Stack.Screen name="job/[id]" options={{ headerShown: true }} />
  <Stack.Screen name="project/[id]" options={{ headerShown: true }} />
  <Stack.Screen name="hire-pro" options={{ headerShown: true, presentation: 'modal' }} />
  <Stack.Screen name="contractor" options={{ headerShown: false }} />
  <Stack.Screen name="house-build" options={{ headerShown: false }} />
  <Stack.Screen name="+not-found" />
</Stack>
```

Web używa `wouter` (lekki router HOC) — patrz portal kontraktora w `artifacts/asystent-remontu-web/src/pages/portal/`.

### Zarządzanie stanem

- **Lokalne / globalne UI:** Context API (4 providery zagnieżdżone w `_layout.tsx`):
  - `AppProvider` (onboarding, ogólne ustawienia)
  - `CommerceProvider`
  - `ContractorProvider`
  - `HouseBuildProvider`
- **Server / persistence:** **TanStack Query v5** (`@tanstack/react-query`) + custom hooks (`useProjects`, `useShopping`, `useCalculator`).
- **Drafts kreatora:** AsyncStorage przez `useWizardDraft.ts`.
- **Brak Reduxa, Zustanda, MobX, Recoil, Jotai.**

---

## 3. DANE REMONTÓW (najważniejsza sekcja)

### Gdzie są przechowywane

**Hardcoded w TypeScript** w [artifacts/mobile/data/jobs/](artifacts/mobile/data/jobs/) — każdy moduł to obiekt `RenovationJob` w pliku `.ts`. Single source of truth — rejestr w [features/content/registry.ts:36](artifacts/mobile/features/content/registry.ts:36).

> **Nie ma JSON, REST, Firebase, Supabase ani CMS — content jest zaszyty w kodzie aplikacji**. Supabase jest tylko *opcjonalnym* adapterem do synchronizacji projektów użytkownika ([artifacts/mobile/db/adapters/supabase.adapter.ts](artifacts/mobile/db/adapters/supabase.adapter.ts)), nie do contentu remontów. Lokalna baza `expo-sqlite` (`remont_v2.db`) trzyma TYLKO dane użytkownika (projekty, lista zakupów, checklisty, kontraktorzy, House Build), a nie definicje zadań.

### Pełna lista modułów remontowych (57 jobów, 23 kategorie)

Z [features/content/registry.ts:36–105](artifacts/mobile/features/content/registry.ts:36):

| # | id | Plik | Kategoria |
|---|----|------|-----------|
| 1 | `paint-walls` | paint.ts | paint |
| 2 | `paint-ceiling` | paint.ts | paint |
| 3 | `repaint-walls` | walls.ts | paint |
| 4 | `primer-walls` | walls.ts | primer |
| 5 | `wall-repair` | walls.ts | wall-repair |
| 6 | `skim-coat` | walls.ts | skim-coat |
| 7 | `wallpaper` *(legacy)* | finishing.ts | wallpaper |
| 8 | `wallpaper-install` | walls.ts | wallpaper |
| 9 | `wallpaper-remove` | walls.ts | wallpaper |
| 10 | `underlay-install` | flooring.ts | underlay |
| 11 | `laminate-flooring` | flooring.ts | laminate |
| 12 | `vinyl-click-flooring` | flooring.ts | vinyl |
| 13 | `vinyl-glued` | flooring.ts | vinyl |
| 14 | `floor-tiles` | flooring.ts | floor-tiles |
| 15 | `skirting-boards` | flooring.ts | skirting |
| 16 | `self-leveling-floor` | floor-prep.ts | floor-prep |
| 17 | `epoxy-floor` | floor-prep.ts | floor-prep |
| 18 | `parquet-sanding` | floor-prep.ts | floor-prep |
| 19 | `bathroom-waterproofing` | bathroom.ts | waterproofing |
| 20 | `wall-tiles-bathroom` | bathroom.ts | wall-tiles |
| 21 | `grout-only` | bathroom.ts | grout |
| 22 | `silicone-sealing` | bathroom.ts | silicone |
| 23 | `silicone-refresh` | small-repairs.ts | silicone |
| 24 | `kitchen-backsplash` | kitchen.ts | kitchen-tiles |
| 25 | `kitchen-countertop` | kitchen.ts | kitchen-tiles |
| 26 | `kitchen-cabinet-paint` | kitchen.ts | kitchen-tiles |
| 27 | `kitchen-hardware` | kitchen.ts | kitchen-tiles |
| 28 | `kitchen-hood` | kitchen.ts | kitchen-tiles |
| 29 | `gypsum-wall` | gypsum.ts | gypsum |
| 30 | `gypsum-ceiling` | gypsum.ts | gypsum |
| 31 | `window-sealing` | windows.ts | windows |
| 32 | `windowsill` | windows.ts | windows |
| 33 | `paint-frames` | windows.ts | windows |
| 34 | `trim-finishing` | windows.ts | windows |
| 35 | `interior-doors` | finishing.ts | doors |
| 36 | `door-painting` | small-repairs.ts | doors |
| 37 | `door-handle-replace` | small-repairs.ts | doors |
| 38 | `door-seal-replace` | small-repairs.ts | doors |
| 39 | `shelf-mounting` | fixtures.ts | fixtures |
| 40 | `curtain-rod` | fixtures.ts | fixtures |
| 41 | `bathroom-accessories` | fixtures.ts | fixtures |
| 42 | `mirror-install` | fixtures.ts | fixtures |
| 43 | `furniture-assembly` | fixtures.ts | fixtures |
| 44 | `picture-hanging` | fixtures.ts | fixtures |
| 45 | `toilet-seat-replace` | small-repairs.ts | plumbing |
| 46 | `sink-trap-replace` | small-repairs.ts | plumbing |
| 47 | `drain-unblock` | small-repairs.ts | plumbing |
| 48 | `light-fixture` | small-repairs.ts | electrical |
| 49 | `socket-frame-replace` | small-repairs.ts | electrical |
| 50 | `minor-plumbing` | risky.ts | plumbing |
| 51 | `electrical-overview` | risky.ts | electrical |
| 52 | `gas-installation` | risky.ts | high-risk |
| 53 | `structural-demolition` | risky.ts | high-risk |
| 54 | `main-electrical` | risky.ts | high-risk |
| 55 | `roof-repair` | risky.ts | high-risk |
| 56 | `chimney-work` | risky.ts | high-risk |
| 57 | `high-risk` *(parasolowy)* | risky.ts | high-risk |

> **Rejestr ma inline-walidację w trybie `__DEV__`** ([features/content/registry.ts:298–345](artifacts/mobile/features/content/registry.ts:298)) — wykrywa duplikaty id, brak instrukcji/materiałów/`measurementInputs`, nieznane kategorie.

### Przykładowa struktura jednego modułu — `paint-walls`

Kanoniczny job, najpełniejsza definicja. Pełny obraz: [data/jobs/paint.ts:9–403](artifacts/mobile/data/jobs/paint.ts:9).

```ts
// data/jobs/paint.ts:9
export const paintJob: RenovationJob = {
  // Identity
  id: 'paint-walls', slug: 'malowanie-scian',
  categoryId: 'paint', subcategory: 'interior',

  // Display
  name: 'Malowanie ścian',
  shortDescription: 'Pomaluj ściany samodzielnie — krok po kroku, bez stresu.',
  description: '…',
  beginnerFriendlyDescription: '…',
  coverIcon: 'droplet',           // Feather icon name

  // Classification
  difficulty: 'easy', riskLevel: 'low',
  visibilityMode: 'safe_diy',
  estimatedDays: 1, estimatedMessLevel: 2,

  // Safety
  safetyEquipment: [{ id: 'gloves', name: 'Rękawice…', icon: 'shield', required: false, notes: '…' }, …],
  warningRules: [{ condition: 'always' | 'beginner' | 'large-area', message: '…', level: 'info'|'warning'|'danger' }, …],

  // Inputs
  measurementInputs: [
    { id: 'wallArea', label: 'Łączna powierzchnia ścian', unit: 'm²',
      inputType: 'area', placeholder: 'np. 40', min: 1, max: 500, hint: '…' },
    { id: 'coats',    label: 'Liczba warstw farby', unit: 'warstwy', inputType: 'count',
      defaultValue: 2, min: 1, max: 3 },
    { id: 'coveragePerLiter', defaultValue: 10, … },
  ],

  // Materials
  materials: [
    { id: 'paint', name: 'Farba do ścian (zmywalna)', unit: 'litr', purchaseUnit: 'litr',
      formula: formulaBuilder.coverage(10),  // inline fn
      wasteFactor: 1.05, roundingRule: 'ceil',
      packaging: { size: 5, label: 'puszka 5 L', purchaseUnit: 'puszka' },
      pricePerUnit: 25, category: 'farba', notes: '…' },
    { id: 'primer-paint', formulaKey: 'primer', pricePerUnit: 18, optional: true, … },
    { id: 'painters-tape', formulaKey: 'tape', pricePerUnit: 8, … },
    { id: 'drop-cloth',   formula: formulaBuilder.fixed(1), pricePerUnit: 12, … },
  ],

  // Tools
  tools: [
    { id: 'roller',  name: 'Wałek malarski 18–22 cm', icon: 'edit-2', required: true,
      estimatedBuyCostPLN: 25, notes: '…' },
    { id: 'ladder',  rentable: true, estimatedRentCostPLN: 30, estimatedBuyCostPLN: 150 },
    …
  ],

  // Steps (rich + legacy)
  preparationSteps: [{ step:1, phase:'preparation', title:'…', durationMin:20, durationMaxMin:40,
                       checkpoints:['…'] }, …],
  workSteps:        [{ step:1, phase:'work',   title:'Pierwsza warstwa farby', requiresTool:'roller',
                       requiresMaterial:'paint', … }, …],
  instructions:     [{ step:1, title:'…', description:'…', durationMin:30 }, …],   // legacy
  dryingTimes:      [{ afterStep:3, description:'Grunt…', minHours:2, maxHours:4 }, …],
  cleanupSteps:     ['…', …],

  // Quality
  commonMistakes:   ['…', …],
  qualityChecklist: [{ id:'q1', description:'Kolor jest jednolity', critical:true }, …],

  // Cost
  costRules: [{ description:'Malowanie ścian — praca fachowca', type:'per_sqm',
                amountMin:12, amountMax:25, unit:'PLN/m²', isMaterialCost:false }, …],

  // Pro
  hireProfessionalRecommended: false,

  // Meta
  tags: ['malowanie','ściany','farba','grunt','wałek','interior','łatwe'],
};
```

Pełny model typu w [types/domain.ts:127–224](artifacts/mobile/types/domain.ts:127) i [types/engine.ts](artifacts/mobile/types/engine.ts).

---

## 4. MATERIAŁY I NARZĘDZIA

### Gdzie są przechowywane

Każdy `RenovationJob` ma własne tablice:
- `materials: readonly (MaterialItem | MaterialRequirement)[]`  — patrz definicje typów [types/domain.ts:61–77](artifacts/mobile/types/domain.ts:61)
- `tools:     readonly (ToolItem | ToolRequirement)[]`         — patrz [types/domain.ts:81–91](artifacts/mobile/types/domain.ts:81)

Materiały są zatem **zlokalizowane w pojedynczym jobie**, a osobno istnieje **referencyjny katalog cen rynkowych** dla porównań i jakościowych „tierów":

- [data/prices/materials.ts](artifacts/mobile/data/prices/materials.ts) — `MATERIAL_PRICES` (≈25–30 pozycji z Castorama/Knauf/Atlas/itd., kategorie `economy/standard/better`).
- [data/prices/labor.ts](artifacts/mobile/data/prices/labor.ts) — `LABOR_PRICES` (stawki robocizny per m²/mb).
- [data/prices/mappings.ts](artifacts/mobile/data/prices/mappings.ts) — mapuje `jobId → materialPriceId[]` per tier.
- [data/prices/regions.ts](artifacts/mobile/data/prices/regions.ts) — jeden region (`lodzkie`).

### Zdjęcia materiałów / narzędzi?

**Nie ma żadnych obrazków.** W całej `data/jobs/` materiały i narzędzia używają wyłącznie pól `icon: string` (nazwa ikony Feather), np. `'droplet'`, `'edit-2'`, `'tool'`. W `assets/images/` są tylko `icon.png` i `splash-icon.png` aplikacji ([artifacts/mobile/assets/images/](artifacts/mobile/assets/images/)).

Wyszukiwanie pól typu `imageUrl|photoUrl|imageSource|imageUri|productImage` dało **0 trafień** w katalogu mobile. Brak więc loadowania z CDN/URL/lokalnych assetów dla pojedynczych pozycji.

### Ceny — statyczne czy dynamiczne?

**Statyczne, hardcoded w plikach `.ts`.**

- **Cena per-job** w `pricePerUnit` przy każdym materiale w pliku joba (np. `pricePerUnit: 25` dla farby).
- **Cena referencyjna** w `MATERIAL_PRICES` z polem `pricePerPackage`, `lastUpdated: '2026-04-01'`, `storeName`, opcjonalnie `brand`, `sourceUrl?` (typ ma to pole, ale w aktualnych danych puste).
- **Robocizna** w `LABOR_PRICES` z `laborPriceMin/Max/Baseline`, `sourceType: 'contractor_survey' | 'retail_store' | …`.
- Użytkownik może w runtime nadpisać cenę przez `price-overrides.repo.ts` (zapisywane do SQLite per projekt).

> **Brak fetch-u, brak API z cenami** — o ile zaktualizowanie ceny wymaga edycji pliku `.ts` i nowego buildu aplikacji.

### Przykładowy obiekt MATERIAL_PRICES

[data/prices/materials.ts:3–40](artifacts/mobile/data/prices/materials.ts:3):

```ts
export const MATERIAL_PRICES: readonly MaterialPriceReference[] = [
  {
    id: 'mat-paint-economy-white-10l',
    materialType: 'paint',
    productLabel: 'Farba biała mat 10 l',
    packageSize: 10,
    packageUnit: 'l',
    pricePerPackage: 54.98,
    category: 'economy',
    storeName: 'Castorama',
    lastUpdated: '2026-04-01',
    currency: 'PLN',
  },
  {
    id: 'mat-paint-better-white-10l',
    materialType: 'paint',
    productLabel: 'Farba lateksowa Śnieżka Eko Plus biała 10 l',
    brand: 'Śnieżka',
    packageSize: 10, packageUnit: 'l',
    pricePerPackage: 108.00,
    category: 'better',
    storeName: 'Castorama',
    lastUpdated: '2026-04-01',
    currency: 'PLN',
  },
  // … kolejne ~25 pozycji
];
```

Typ — [types/pricing.ts:44–63](artifacts/mobile/types/pricing.ts:44):

```ts
export interface MaterialPriceReference {
  readonly id: string;
  readonly materialType: string;        // 'paint' | 'primer' | 'skim-coat' | 'laminate' | 'tile' | …
  readonly productLabel: string;
  readonly brand?: string;
  readonly packageSize: number;
  readonly packageUnit: string;         // 'l' | 'kg' | 'm2' | 'mb' | 'szt'
  readonly pricePerPackage: number;
  readonly pricePerM2?: number;
  readonly pricePerL?: number;
  readonly pricePerKg?: number;
  readonly pricePerMb?: number;
  readonly category: 'economy' | 'standard' | 'better';
  readonly storeName: string;
  readonly sourceUrl?: string;          // ← pole istnieje, ale nikt go nie wypełnił
  readonly lastUpdated: string;
  readonly regionSensitivityNote?: string;
  readonly notes?: string;
  readonly currency: 'PLN';
}
```

### Przykładowy obiekt narzędzia (z paint-walls)

```ts
// data/jobs/paint.ts:166–208
{ id: 'roller', name: 'Wałek malarski 18–22 cm', icon: 'edit-2', required: true,
  estimatedBuyCostPLN: 25, notes: 'Wełna 12mm do gładkich ścian, 18mm do fakturowych.' },
{ id: 'ladder', name: 'Drabina lub schodki', icon: 'chevrons-up', required: true,
  rentable: true, estimatedRentCostPLN: 30, estimatedBuyCostPLN: 150,
  notes: 'Wystarczy 5-stopniowa drabinka.' },
```

---

## 5. LOGIKA OBLICZEŃ ZAPOTRZEBOWANIA

### Główny silnik

Centralna klasa: `RenovationCalculatorEngine` w [features/calculator/engine.ts:94](artifacts/mobile/features/calculator/engine.ts:94). Wywołują ją hooki, screen `wizard.tsx`, `project/[id].tsx`, oraz `useCalculator.ts`. Eksponowane API:

```ts
// features/calculator/engine.ts:202–220
export const calculatorEngine: CalculatorEngine & {
  calculateDetailed(job: RenovationJob, m: MeasurementMap): CalculationResultDetail;
} = new RenovationCalculatorEngine();

export function calculateMaterials(job, measurements) { return engine.calculate(...); }
export function calculateDetailed(job, measurements)  { return engine.calculateDetailed(...); }
```

Fragment kluczowej logiki ([features/calculator/engine.ts:43–67](artifacts/mobile/features/calculator/engine.ts:43)) — to są dokładnie te miejsca, w których przeliczana jest ilość materiału:

```ts
function computeRawQuantity(material, measurements): number {
  const wasteFactor = material.wasteFactor ?? DEFAULT_WASTE_FACTOR; // 1.1

  if (isRichMaterial(material) && material.formula) {
    // Priorytet 1 — inline formuła w pliku joba
    return material.formula(measurements, wasteFactor);
  }
  // Priorytet 2 — formuła z rejestru po kluczu
  const key = (material as MaterialItem).formulaKey ?? '';
  const formulaFn = resolveFormula(key);
  return formulaFn(measurements, wasteFactor);
}

function applyRounding(quantity, material) {
  const rule = material.roundingRule ?? 'ceil';
  if (material.packaging) {
    const packs = Math.ceil(quantity / material.packaging.size);
    return { quantity: packs * material.packaging.size, packs };
  }
  switch (rule) {
    case 'none':  return { quantity, packs: undefined };
    case 'round': return { quantity: Math.round(quantity * 10) / 10, packs: undefined };
    case 'ceil':
    default:      return { quantity: Math.ceil(quantity * 10) / 10, packs: undefined };
  }
}
```

### Wzory są CENTRALNE — registry

Plik [features/calculator/formulas.ts:187–227](artifacts/mobile/features/calculator/formulas.ts:187) trzyma wszystkie formuły jako obiekty `(measurements, waste) => number`:

```ts
// features/calculator/formulas.ts:187
export const FORMULA_REGISTRY: FormulaRegistry = {
  paint:         paintFormula,    // (area * coats / coverage) * waste
  primer:        primerFormula,   // (area / coverage) * waste
  tape:          tapeFormula,     // perimeter / 6 (ceil)
  filler:        fillerFormula,   // area * 0.5 kg/m² * waste
  skimCoat:      skimCoatFormula, // area * coats * 1.5 kg/m² * waste
  mesh:          meshFormula,
  sandpaper:     sandpaperFormula,
  floorPanels:   floorPanelsFormula,
  panelPacks:    panelPacksFormula, // ceil((area * waste) / packCoverage)
  underlay:      underlayFormula,
  threshold:     thresholdFormula,
  tiles:         tilesFormula,
  tilePieces:    tilePiecesFormula,
  tileAdhesive:  tileAdhesiveFormula,
  grout:         groutFormula,        // formuła geometryczna z fugą i głębokością
  crosses:       crossesFormula,
  membrane:      membraneFormula,
  sealingTape:   sealingTapeFormula,
  silicone:      siliconeFormula,
  wallpaper:     wallpaperFormula,
  wallpaperGlue: wallpaperGlueFormula,
  skirting:      skirtingFormula,
  skirtingGlue:  skirtingGlueFormula,
  corners:       cornersFormula,
  faucets:       faucetsFormula,
  sockets:       socketsFormula,
  constant:      constantFormula,
  linearMeters:  linearMetersFormula,
  byArea:        byAreaFormula,       // alias dla nowych jobów
  byPerimeter:   byPerimeterFormula,
} as const;

export function resolveFormula(key: string): FormulaFn {
  return FORMULA_REGISTRY[key] ?? constantFormula; // graceful fallback do "1"
}
```

Przykładowe konkretne formuły ([features/calculator/formulas.ts:39–55](artifacts/mobile/features/calculator/formulas.ts:39)):

```ts
const paintFormula:  FormulaFn = (m, waste) => {
  const cov = coveragePerLiter(m, 10); // m.coveragePerLiter ?? 10
  return round1((area(m) * coats(m)) / cov * waste);
};
const primerFormula: FormulaFn = (m, waste) => {
  const cov = coveragePerLiter(m, 10);
  return round1((area(m) / cov) * waste);
};
const tapeFormula:   FormulaFn = (m, _waste) => Math.ceil(perimeter(m) / 6);
const tilePiecesFormula: FormulaFn = (m, _waste) => {
  const w = wastePctMultiplier(m, 15); // 15% lub m.wastePercent
  return Math.ceil((area(m) * w) / tileAreaM2(m));
};
```

### Czy wzory są takie same dla każdego remontu?

**Nie — są zdecydowanie współdzielone, ale każdy job może też podać własną inline-formułę.**

- **Wspólne wzory** — przez `formulaKey: 'paint' | 'primer' | 'tape' | …`. Większość materiałów używa registry.
- **Inline formula** — pole `material.formula = formulaBuilder.coverage(10)` lub `formulaBuilder.fixed(1)` (patrz [data/jobs/paint.ts:108](artifacts/mobile/data/jobs/paint.ts:108)). Jest brany jako pierwszy priorytet ([engine.ts:49](artifacts/mobile/features/calculator/engine.ts:49)).
- **`formulaBuilder`** w [features/calculator/formula-builder.ts](artifacts/mobile/features/calculator/formula-builder.ts) wystawia helpery: `coverage(default)`, `fixed(qty)`, `byArea`, `byPerimeter` itd.
- **`getJobConfig(jobId)`** ([features/calculator/job-config.ts](artifacts/mobile/features/calculator/job-config.ts)) pozwala dla wybranych jobów dorzucić walidację i indywidualne overrides do tekstu wyjaśnienia (`materialExplanationOverrides[material.id]`) — patrz [engine.ts:181–185](artifacts/mobile/features/calculator/engine.ts:181).

### Testy jednostkowe

**Brak.** Komenda `find … -name "*.test.ts" -o -name "*.spec.ts"` w całym `artifacts/mobile/` zwraca zero plików. Brak też Jest/Vitest w `package.json` mobile. Walidacja w trybie `__DEV__` ([registry.ts:298](artifacts/mobile/features/content/registry.ts:298)) to console.warn-y, nie testy.

---

## 6. EKRAN LISTY ZAKUPOWEJ

### Generator listy

[features/calculator/shopping.ts:7–62](artifacts/mobile/features/calculator/shopping.ts:7) — klasa `RenovationShoppingListGenerator`:

```ts
class RenovationShoppingListGenerator implements ShoppingListGenerator {
  fromCalculation(projectId, result: CalculationResult): Omit<ShoppingItem, 'id'>[] {
    return result.materials
      .filter((m) => m.quantity > 0)
      .map((m) => ({
        projectId,
        materialId: m.material.id,
        name:       m.material.name,
        quantity:   m.quantity,
        unit:       m.material.unit,
        estimatedPrice: roundMoney(m.cost),
        purchased: false, owned: false,
        itemType: 'material', tier: 'standard',
        category: m.material.category,
        notes: m.material.notes,
        createdAt: nowISO(),
      }));
  }
}
export function generateAllShoppingItems(projectId, result, job) {
  const materials = generateShoppingItems(projectId, result);
  const tools     = generateToolShoppingItems(projectId, job); // tylko required
  // dedupe po (materialId, itemType)
  …
}
```

### Wymiary — gdzie się je wpisuje

**9-krokowy kreator** [app/wizard.tsx](artifacts/mobile/app/wizard.tsx) (1356 linii). Kroki ([wizard.tsx:30–55](artifacts/mobile/app/wizard.tsx:30)):

```ts
type WizardStep =
  | 'category'  // Co remontujesz?
  | 'room'      // Które pomieszczenie?
  | 'job'       // Jaki rodzaj pracy?
  | 'condition' // Aktualny stan
  | 'desired'   // Oczekiwany efekt
  | 'budget'    // Budżet
  | 'diy'       // Kto wykona pracę?
  | 'measure'   // Wymiary  ← TUTAJ
  | 'summary';  // Podsumowanie
```

Wymiary są wpisywane w jednym kroku `measure`, w ekranie wizarda — nie ma osobnego ekranu na wymiary; pola pochodzą z `job.measurementInputs[]`. Kreator zapisuje draft do AsyncStorage przez [hooks/useWizardDraft.ts](artifacts/mobile/hooks/useWizardDraft.ts).

Po zakończeniu kreator tworzy projekt w SQLite, a w ekranie projektu (`project/[id].tsx` + `components/project/ShoppingTab.tsx`) wywołuje `onGenerateShoppingList` (patrz [components/project/ShoppingTab.tsx:1–98](artifacts/mobile/components/project/ShoppingTab.tsx)).

### Czy lista zakupowa pokazuje sumy cen?

**Tak.** [components/project/ShoppingTab.tsx:46–58](artifacts/mobile/components/project/ShoppingTab.tsx:46):

```tsx
const totalMaterials = toBuyMaterials.reduce((s, i) => s + getEffectivePrice(i), 0);
const totalTools     = toBuyTools.reduce((s, i) => s + getEffectivePrice(i), 0);
const totalAll       = totalMaterials + totalTools;
const contingency    = totalAll * CONTINGENCY_RATE;   // ~10% rezerwy
const grandTotal     = totalAll + contingency;
```

Plus oddzielne komponenty `MaterialsTab.tsx`, `ToolsTab.tsx`, `PricingSummary.tsx`, `LaborPriceCard.tsx`, `MaterialPriceCard.tsx`, `QualityTierSelector.tsx`, `TierBadge.tsx`, `PriceDisclaimer.tsx`. Pełny budżet liczy też [features/calculator/budget.ts](artifacts/mobile/features/calculator/budget.ts) (`estimateBudget`, zwraca `BudgetEstimate { materialsMin/Max, laborMin/Max, totalMin/Max }`).

---

## 7. ASSETY I ZASOBY

### Zdjęcia / obrazki

- **Lokalne pliki binarne — TYLKO 2:**
  - [artifacts/mobile/assets/images/icon.png](artifacts/mobile/assets/images/icon.png) — 615 KB
  - [artifacts/mobile/assets/images/splash-icon.png](artifacts/mobile/assets/images/splash-icon.png) — 696 KB
  - **Łącznie ≈ 1,3 MB.**
- **Brak zdjęć produktów / materiałów / narzędzi / kroków instrukcji.** Zamiast nich — nazwy ikon Feather w polach `coverIcon`, `icon`.
- Web-frontendy mają osobne zasoby w `artifacts/asystent-remontu-web/public/` i `artifacts/panthea/src/assets/` (nie sprawdzone w detalach — nie dotyczy mobile content).

### Tłumaczenia / i18n

**Brak frameworka i18n.** Cała aplikacja pisana po polsku w hardcode'd stringach (patrz np. `app.json` `infoPlist` permissions w polskim, [data/jobs/paint.ts](artifacts/mobile/data/jobs/paint.ts) — wszystkie pola `name`, `description`, `tip`, `warning` po polsku). Słowo „i18n" nie pojawia się w kodzie. Brak biblioteki typu `i18next`, `expo-localization`, `react-intl`.

---

## 8. BAZA DANYCH

### Lokalna SQLite (główna)

[db/client.ts:8–28](artifacts/mobile/db/client.ts:8):

```ts
export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    try {
      const db = await SQLite.openDatabaseAsync('remont_v2.db');
      await db.execAsync('PRAGMA journal_mode = WAL;');
      await db.execAsync('PRAGMA foreign_keys = ON;');
      await runMigrations(db);
      _db = db;
      return db;
    } catch (error) { … }
  })();
  return _initPromise;
}
```

### Migracje (14 sztuk)

[db/migrations/](artifacts/mobile/db/migrations/) — wykonywane sekwencyjnie przez `runner.ts`:

| # | Plik | Zawartość |
|---|---|---|
| 001 | [001_initial.ts](artifacts/mobile/db/migrations/001_initial.ts) | `schema_versions`, `onboarding_completed`, `projects`, `shopping_items` |
| 002 | 002_shopping_extended.ts | rozszerzenia listy zakupów |
| 003 | 003_project_management.ts | `project_photos`, `checklist_items`, `project_activity` |
| 004 | 004_pricing.ts | `price_overrides`, ślad cen |
| 005 | 005_contractor.ts | kontraktorzy lokalnie |
| 006 | 006_house_build.ts | moduł House Build (etapy, wymagania) |
| 007 | 007_timeline_budget.ts | timeline + budżet |
| 008 | 008_investor_docs.ts | dokumenty inwestora |
| 009 | 009_utility_plans.ts | plany mediów |
| 010 | 010_house_build_pricing.ts | referencje cenowe HB |
| 011 | 011_house_build_content_admin.ts | admin contentu HB |
| 012 | 012_house_build_contractors.ts | kontraktorzy per etap HB |
| 013 | 013_contractor_trust.ts | reviews, reports, blocks, promotions |
| 014 | 014_contractor_plans.ts | plany kontraktorów + entitlements |

Schemat 001:

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  job_id TEXT NOT NULL,
  job_name TEXT NOT NULL,
  category_id TEXT NOT NULL,
  measurements TEXT NOT NULL DEFAULT '{}',     -- JSON
  calculation_result TEXT,                      -- JSON
  status TEXT NOT NULL DEFAULT 'planning',
  total_budget REAL,
  actual_cost REAL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  synced_at TEXT
);
CREATE TABLE shopping_items (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  material_id TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity REAL NOT NULL, unit TEXT NOT NULL,
  estimated_price REAL NOT NULL,
  purchased INTEGER NOT NULL DEFAULT 0,
  notes TEXT, created_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);
```

### Plik konfiguracji połączenia

- Mobile/SQLite: [artifacts/mobile/db/client.ts](artifacts/mobile/db/client.ts) (nazwa pliku DB: `remont_v2.db`).
- Postgres / Drizzle (api-server): [lib/db/drizzle.config.ts](lib/db/drizzle.config.ts) — schemat w [lib/db/src/schema/index.ts:20](lib/db/src/schema/index.ts:20) jest **PUSTY** (`export {}`). Oznacza to, że api-server nie ma żadnych tabel poza tym, co potencjalnie definiuje sam Replit.
- Synchronizacja zdalna (opcjonalna): [artifacts/mobile/db/adapters/supabase.adapter.ts](artifacts/mobile/db/adapters/supabase.adapter.ts) + [sync.adapter.ts](artifacts/mobile/db/adapters/sync.adapter.ts).

---

## 9. CO BRAKUJE / NIEDOKOŃCZONE

### Komentarze TODO / FIXME / HACK / XXX w kodzie

- **W całym `artifacts/mobile/*.{ts,tsx}` — 0 plików** z TODO/FIXME/HACK/XXX (zweryfikowane Grepem `pattern: TODO|FIXME|XXX|HACK` z `glob: *.{ts,tsx}`).
- **W innych artefaktach:**
  - [artifacts/api-server/.replit-artifact/artifact.toml:2](artifacts/api-server/.replit-artifact/artifact.toml:2) — `previewPath = "/api" # TODO - should be excluded from preview in the first place`
- **„placeholder" jako słowo** — pojawia się jako nazwa pól (typy `monthlyPricePlaceholder`, `enableLeadUnlockPlaceholder` itp. — patrz [types/contractor-plans.ts:9–55](artifacts/mobile/types/contractor-plans.ts:9)) — to **świadomy interfejs billingowy gotowy do podmiany**, nie defekt.
- **W release-md** — [release-readiness-report.md:27](artifacts/mobile/release-readiness-report.md:27), [known-blockers.md:15](artifacts/mobile/known-blockers.md:15), [release/release-checklist.md:24](artifacts/mobile/release/release-checklist.md:24): zawiera otwarte zadania (np. zastąpić maila kontaktowego, EAS projectId).

### Funkcje puste / pseudo-implementacje

- **Schema Postgres pusta** ([lib/db/src/schema/index.ts:20](lib/db/src/schema/index.ts:20)) — `export {}`. Backend api-server jest szkieletem (tylko `/health` i `/places`).
- **Komercja w stanie mock-only** — [features/commerce/](artifacts/mobile/features/commerce/) ma `MockCommerceProvider`, brak prawdziwego sklepu. Pole `enableLeadUnlockPlaceholder: false` w domyślnych flagach ([types/contractor.ts:370](artifacts/mobile/types/contractor.ts:370)).
- **Billing kontraktorów w stanie placeholder** — `PlaceholderBillingProvider`, statusy `app_store_billing_placeholder`, `web_billing_placeholder`, `payment_received_placeholder` — patrz [types/contractor-plans.ts:154–181](artifacts/mobile/types/contractor-plans.ts:154).
- **Region cenowy: tylko `lodzkie`** ([data/prices/regions.ts:3–9](artifacts/mobile/data/prices/regions.ts:3)) — pozostałe województwa nie zaseedowane.
- **Brak testów jednostkowych** — przy 5734 liniach definicji jobów i ~30 formułach to istotne ryzyko regresji.
- **Wallpaper legacy duplikat** — `wallpaperJob` (id `wallpaper`) w `finishing.ts` zostawiony „dla starych projektów"; nowy to `wallpaper-install` ([registry.ts:45](artifacts/mobile/features/content/registry.ts:45)).
- **Stary `skirtingJob`** w `finishing.ts` (id `skirting-boards`) wyparty przez `skirtingBoardsJob` z `flooring.ts` — drobny dług rejestru (patrz lista exportów; `skirtingJob` istnieje, ale **nie jest** w `JOB_REGISTRY`).
- **Mockup-sandbox i panthea** — to pochodne playgroundy, nie produkt.
- **Ścieżka `?? release/`, `?? tools/`, `?? main.js`** w katalogu `artifacts/remont-asystent/` to nowy, nieskommitowany Electron wrapper — status na nieprzejęty.

### Moduły wyglądające na placeholder

- `highRiskJob` (id `high-risk` w [data/jobs/risky.ts](artifacts/mobile/data/jobs/risky.ts)) — parasol/safety-net dla niebezpiecznych prac (gaz, prąd, dach), z `visibilityMode: 'overview_only'` i rekomendacją fachowca.
- Web-portal kontraktora ma 10 stron, ale działa na **mock-data** ([artifacts/asystent-remontu-web/src/lib/portal-mock-data.ts] — wynika z replit.md, nie sprawdzane w detalach).
- API w [routes/places.ts](artifacts/api-server/src/routes/places.ts) — pojedynczy endpoint, prawdopodobnie geocoding/podpowiedzi adresu.

---

## 10. REKOMENDACJE DLA AUTOMATYCZNEGO ULEPSZANIA W PĘTLI

### Aby dodać nowy moduł remontowy

Kanoniczny przepis (najmniejsza zmiana, brak zmian w UI):

1. **Utwórz lub uzupełnij plik** w [artifacts/mobile/data/jobs/](artifacts/mobile/data/jobs/) — np. nowy `myNewJob: RenovationJob = { … }`. Wzorem [paint.ts](artifacts/mobile/data/jobs/paint.ts) (najbogatsza definicja).
2. **Zarejestruj** import w [features/content/registry.ts:7–28](artifacts/mobile/features/content/registry.ts:7) i dodaj do `JOB_REGISTRY` ([registry.ts:36–105](artifacts/mobile/features/content/registry.ts:36)).
3. **(opcjonalnie)** dopisz nową kategorię w `CATEGORY_META` [registry.ts:112–273](artifacts/mobile/features/content/registry.ts:112), jeśli `categoryId` nie istnieje.
4. **Mapowanie cen** — [data/prices/mappings.ts:13–43](artifacts/mobile/data/prices/mappings.ts:13) dorzuć wpis w `JOB_LABOR_MAPPINGS` i `JOB_MATERIAL_MAPPINGS`.
5. **(opcjonalnie)** Dodaj nową formułę do [features/calculator/formulas.ts:187](artifacts/mobile/features/calculator/formulas.ts:187), jeśli żadna istniejąca nie pasuje.

> Klucz: **żaden ekran nie wymaga zmian** — UI iteruje po `ALL_JOBS` i `CATEGORIES` z rejestru. Walidacja w `__DEV__` szybko wyłapie brakujące pola.

### Aby dodać materiał z ceną

- **Cena domyślna in-context** — wpisz pole materiału w pliku joba (`materials: [{ id, name, formulaKey, pricePerUnit, packaging, … }]`).
- **Cena referencyjna do porównań tier-owych** — dodaj wpis do [data/prices/materials.ts](artifacts/mobile/data/prices/materials.ts) (patrz wzór [materials.ts:3–53](artifacts/mobile/data/prices/materials.ts:3)) i podlinkuj `id` w [data/prices/mappings.ts](artifacts/mobile/data/prices/mappings.ts) (`JOB_MATERIAL_MAPPINGS[jobId].materialTypeMap.standard`).
- **Cena robocizny** — analogicznie [data/prices/labor.ts](artifacts/mobile/data/prices/labor.ts) + mapping.
- **Cena per-projekt-override** — runtime-only, zapisywane w `price_overrides` przez [db/repositories/price-overrides.repo.ts](artifacts/mobile/db/repositories/price-overrides.repo.ts).

### Czy `source_url` (URL źródła ceny / produktu) można dodać bez łamania kompatybilności?

**Tak — pole już istnieje w typie `MaterialPriceReference`** ([types/pricing.ts:58](artifacts/mobile/types/pricing.ts:58) — `readonly sourceUrl?: string;`), `LaborPriceReference` ([types/pricing.ts:39](artifacts/mobile/types/pricing.ts:39)) i `PriceSourceMetadata` ([types/pricing.ts:17](artifacts/mobile/types/pricing.ts:17)). Jest opcjonalne (`?`), więc dorzucenie go do istniejących wpisów **nie złamie żadnego konsumenta**.

> **Dla materiałów per-job** (`MaterialItem` / `MaterialRequirement` w `RenovationJob.materials`) takiego pola **nie ma**. Aby dodać `source_url` do każdego materiału w pliku joba, trzeba rozszerzyć interfejs:
> - dopisać `readonly sourceUrl?: string;` w [types/domain.ts:61](artifacts/mobile/types/domain.ts:61) (`MaterialItem`) — opcjonalne, więc kompatybilne wstecznie;
> - i ewentualnie w [types/engine.ts](artifacts/mobile/types/engine.ts) (`MaterialRequirement`).
>
> Jest to bezpieczne, bo wszędzie pole jest readonly + opcjonalne, a engine kalkulacyjny ([features/calculator/engine.ts](artifacts/mobile/features/calculator/engine.ts)) odwołuje się tylko do `id`, `unit`, `formula/formulaKey`, `pricePerUnit`, `packaging`, `wasteFactor`, `roundingRule`. Odpowiednio analogicznie dla `tools` (`ToolItem` w [types/domain.ts:81](artifacts/mobile/types/domain.ts:81)).

### Zagrożenia dla automatycznych zmian w pętli

| # | Zagrożenie | Mitigacja przy automatyzacji |
|---|---|---|
| 1 | **Brak testów jednostkowych** — żadnej `*.test.ts` ani Jest/Vitest w mobile. Auto-edycja formuł/jobów może wprowadzić cichą regresję. | Każda iteracja powinna minimum wykonać `pnpm typecheck` (TypeScript wyłapie braki pól, złe typy). Polecane: dodać przed pętlą minimalną suite Vitest dla [features/calculator/formulas.ts](artifacts/mobile/features/calculator/formulas.ts) i `engine.calculate` ze snapshotami dla 3–5 jobów. |
| 2 | **Twardo zakodowane ID** w mappingach cen ([data/prices/mappings.ts](artifacts/mobile/data/prices/mappings.ts)) i w `formulaKey`. Zmiana `job.id` zerwie linki bez błędu kompilacji. | Auto-edycja musi przy zmianie ID przepisywać też mappingi; bezpieczniej — nigdy nie zmieniać już istniejących ID. |
| 3 | **Walidacja tylko w `__DEV__`** — błędy rejestru lecą jako `console.warn` (registry.ts:298), a nie throw. W prod nieprawidłowe joby przechodzą. | Dodać `if (!ok) throw …` lub testowo „strict mode" w pipeline weryfikującym contribusię. |
| 4 | **Legacy duplikaty** (`wallpaperJob` legacy vs `wallpaper-install` rich) wymagają trzymania spójności obu. | Pętla powinna mieć regułę: nigdy nie usuwać istniejących starych ID; nowe wersje dodawać pod nowym ID i zostawiać legacy. |
| 5 | **Pola `instructions` (legacy) i `preparationSteps`/`workSteps` (rich)** muszą być kompatybilne — ekran job/[id] może czytać legacy. | Generator nowych jobów powinien zawsze produkować obie reprezentacje (lub rzutować jedną z drugiej). |
| 6 | **Brak schema-validate dla `RenovationJob`** poza ts-typami i runtime-warnami. Złośliwie błędna struktura mogłaby przejść. | Dorzucić Zod-schemę dla `RenovationJob` w [shared/](artifacts/mobile/shared/) i wykonywać `safeParse` na wpisach rejestru w testach/CI. |
| 7 | **Region jest jeden (`lodzkie`)** — automatyczna ekspansja cen do innych regionów wymaga skoordynowanego dodania `RegionProfile` + duplikatów `LaborPriceReference` z odpowiednim `regionCode`. | Jeśli pętla ma uzupełniać regiony, niech zawsze dorzuca też wpis do [data/prices/regions.ts](artifacts/mobile/data/prices/regions.ts). |
| 8 | **Brak obrazków** — gdy chcemy podłączyć obrazki, trzeba zdecydować strategię (zdalne URL CDN vs lokalne assety). Lokalne pliki w monorepo łatwo rozdmuchują rozmiar bundle Expo. | Rekomendacja: nowe pole `imageUrl?: string` (URL CDN), nie wciągać binariów do repo. Pole opcjonalne — kompatybilne wstecznie. |
| 9 | **Duplikacja modeli** `MaterialItem` (legacy) vs `MaterialRequirement` (rich, w `engine.ts`). Engine robi `isRichMaterial` po obecności `formula` ([engine.ts:15](artifacts/mobile/features/calculator/engine.ts:15)). Edytor automatyczny musi wybrać jedną i się jej trzymać per-material. | Trzymać konwencję per-job (nowy job = wszędzie rich) i nigdy nie mieszać typów w jednej tablicy `materials[]`. |
| 10 | **Walidacja danych użytkownika w wizardzie** w [shared/schemas/wizard.schema.ts](artifacts/mobile/shared/schemas/) — Zod. Zmiany w `measurementInputs[].id` muszą iść w parze ze zmianą formuł, które tych ID szukają (`m.wallArea`, `m.coats`, `m.wastePercent` itd. w [formulas.ts:7–32](artifacts/mobile/features/calculator/formulas.ts:7)). | Każda automatyczna zmiana ID w `measurementInputs` powinna jednocześnie aktualizować odpowiednie helpery `area(m)`, `coats(m)` w `formulas.ts` lub używać już istniejących nazw. |

---

## PODSUMOWANIE 3 ZDANIAMI

To **ofline-first kreator remontów dla Polaków**: monorepo pnpm, w którym sercem jest aplikacja mobilno-webowa **Expo SDK 54 + React Native 0.81 + TypeScript 5.9** (`artifacts/mobile`), wspierana przez statyczny landing/portal w React+Vite oraz szkieletowy backend Express+Drizzle (schemat Postgres pusty). Cały content (57 jobów remontowych z instrukcjami, materiałami, narzędziami, formułami metrażu, cenami i ostrzeżeniami) jest **hardcoded w plikach `data/jobs/*.ts` i `data/prices/*.ts`**, spina go centralny rejestr w `features/content/registry.ts`, a silnik kalkulacyjny `features/calculator/engine.ts` rozwiązuje formuły z `FORMULA_REGISTRY` (lub inline). Aplikacja **bardzo dobrze nadaje się do automatycznej rozbudowy w pętli** — model danych jest przewidywalny, dodanie joba/materiału = jeden plik + linia w rejestrze, pole `sourceUrl` można dorzucić wstecznie-kompatybilnie — pod warunkiem, że pętla uruchamia `pnpm typecheck` i (najlepiej dorzucony) zestaw szybkich testów Vitest na `engine.calculate`/`formulas.*`, bo dzisiaj **nie ma żadnych testów jednostkowych**, a walidacja rejestru działa tylko jako `console.warn` w trybie `__DEV__`.
