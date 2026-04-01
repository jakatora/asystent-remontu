# Workspace

## Overview

This pnpm workspace monorepo, built with TypeScript, aims to create "Remont Asystent" – a production-ready, scalable, and user-friendly renovation assistant mobile application for Polish users. The app focuses on empowering DIY renovators with comprehensive tools for planning, budgeting, and executing home renovation projects. The long-term vision includes expanding features to cover more renovation types, integrating with local service providers, and offering advanced analytics.

Key capabilities include:
- A guided 9-step wizard for project setup, generating shopping lists and budget comparisons.
- Rich project management features including checklists, photo documentation, and an activity log.
- An offline-first architecture ensuring data availability and performance.
- A robust pricing system with regional baselines and quality tiers.
- Step-by-step instructions and safety warnings for various jobs.

## User Preferences

- **Communication Style**: Use plain Polish language in the mobile app, with helper hints for beginners.
- **Interaction Style**: Provide a 9-step wizard with big tap targets, icons, helper hints, a progress bar, and a back button. Auto-save drafts via AsyncStorage.
- **Workflow Preferences**: I want iterative development.
- **General Working Preferences**: Clearly warn about high-risk work and recommend professionals where appropriate. All data should be stored offline-first.

## System Architecture

The project is structured as a pnpm workspace monorepo using Node.js 24 and TypeScript 5.9. The mobile application (`artifacts/mobile`) is an Expo app, while the backend API (`artifacts/api-server`) uses Express 5, PostgreSQL, and Drizzle ORM.

**UI/UX Decisions (Mobile App):**
- **Language**: Polish.
- **User Flow**: Guided 9-step wizard for job setup.
- **Accessibility**: Big tap targets, icons, helper hints.
- **Feedback**: Progress bars, auto-save drafts.
- **Color Scheme**: Uses a defined color palette (`constants/colors.ts`) including difficulty/risk/category colors.
- **Components**: Reusable UI components (`components/ui/`) and project-specific components (`components/project/`) are used to maintain consistency.

**Technical Implementations (Mobile App):**
- **Data Storage**: Offline-first via `expo-sqlite v16`.
- **Data Layer**: TanStack Query v5 for data management, ready for background sync.
- **State Management**: Context API (`AppContext.tsx`) for backward compatibility.
- **Form Handling**: `react-hook-form` is used for forms.
- **Validation**: Zod for schema validation.
- **Font**: `@expo-google-fonts/inter`.
- **Image Handling**: `expo-image-picker`.
- **Core Logic**:
    - `features/pricing/`: Handles `computePricedBudget`, labor and material registries.
    - `features/calculator/`: Contains formula registry, formula builder, calculator engine, shopping list generator, and budget estimator.
    - `features/warnings/`: Resolves warnings based on conditions and provides difficulty/risk labels.
    - `features/content/`: Manages job and category registries, acting as a single source of truth.
    - `features/commerce/`: Provider-agnostic commerce preparation layer for future Shopify integration. Includes `CommerceProviderInterface` abstraction, `MockCommerceProvider`, `StoreConfig` validation, `CartDraft` builder (from shopping items + context-managed mappings), `CheckoutHandoff` builder, and mapping import/export. All mock-only, no live API calls.
    - `data/commerce/`: Product mappings (15 entries covering all 11 materials + 4 tool types) and bundle definitions (4 kits). Static seed data for commerce layer.
    - `context/CommerceContext.tsx`: React context providing commerce state (store config, cart drafts, product mappings, checkout handoffs). Provider factory keyed by `selectedCommerceProvider` (currently all route to MockCommerceProvider). Mappings are context-managed and injected into cart/readiness logic.
    - `components/commerce/`: UI components — `MappingStatusChip`, `CartDraftPreview`, `ToolCartToggle`, `CommerceReadinessSummary`, `BundleSuggestionCard`.
    - `types/commerce.ts`: All commerce domain types — `StoreConfig`, `ProductMapping`, `CartDraft`, `CartDraftLine`, `BundleDefinition`, `CheckoutHandoff`, `CommerceProduct`, `CommerceCart`, provider types.
    - `features/contractor/`: "Find a Contractor" module — mock contractor data (8 profiles), search/filter/sort logic, text search. Pure functions, no side effects.
    - `types/contractor.ts`: All contractor domain types — `ContractorProfile`, `ContractorRequest`, `ContractorSearchFilters`, `ContractorSortOption`, `ContractorRegistration`, `ContractorPaymentConfig`, listing tiers, budget ranges, request statuses. Payment config is feature-flagged (`enabled: false`).
    - `context/ContractorContext.tsx`: React context providing contractor state — filtered results, requests (draft/sent), saved contractors, search/filter/sort controls. Persists requests and saves to SQLite via repositories.
    - `db/migrations/005_contractor.ts`: SQLite tables for `contractor_requests` and `saved_contractors` with indexes.
    - `db/repositories/contractor-requests.repo.ts`: CRUD for contractor requests with status management.
    - `db/repositories/saved-contractors.repo.ts`: Save/unsave contractors locally.
    - `components/contractor/`: UI components — `ContractorCard` (with promoted label, verification badge, specialties, rating), `FilterBar` (filter modal + sort modal), `RequestSummaryCard` (status-colored request cards).
    - `app/contractor/`: 6 screens — request wizard (8-step: category → room → description → location → date → budget → offers → summary), results list (search + filter + sort), contractor profile (full detail + report + save), send request, my requests (drafts + sent + saved contractors), contractor registration (6-step wizard).
- **Project Structure**:
    - `app/`: Expo Router screens.
    - `types/`: Core domain, engine, user, calculator, and DB types.
    - `shared/`: Zod validation schemas and utility libraries.
    - `hooks/`: TanStack Query data hooks.
    - `db/`: SQLite client, migrations, repositories, and adapters.
    - `data/prices/`: Reference pricing seed data for labor, materials, regions, and mappings.
    - `data/jobs/`: Definition files for various renovation jobs, serving as canonical references. Content reviewed for technical accuracy with: correct primer guidance (not always required), crack repair flow (widen → clean → fill → dry → sand → dust → prime), skim coat product-dependent rules, wallpaper adhesive mode differentiation (fleece vs paper), laminate expansion gap at ALL perimeter elements, vinyl click vs glued separation, tile combined method for large format, waterproofing product-dependent thickness/curing, silicone backer rod for deep joints. Legacy wallpaper job in finishing.ts marked deprecated (superseded by wallpaper-install).
    - `utils/`: Formatting and calculator helpers.
    - `components/`: Reusable UI and project-specific components.
    - `constants/`: Color palettes and design constants.
    - `lib/`: Query client, Sentry integration, and optional Supabase integration.

**System Design Choices:**
- **Monorepo**: Uses pnpm workspaces for managing multiple packages.
- **TypeScript**: Ensures type safety across the entire codebase.
- **Modular Design**: Clear separation of concerns with features, data, and UI components in distinct directories.
- **API Codegen**: Orval is used to generate API clients and Zod schemas from an OpenAPI spec, ensuring consistency between frontend and backend.
- **Database Migrations**: Handled by Replit for production, with `drizzle-kit` for development.
- **Build System**: `esbuild` for CJS bundling, `tsc` for type-checking with `emitDeclarationOnly`.
- **Project References**: TypeScript composite projects are used for efficient type-checking across packages.

## External Dependencies

- **Database**: PostgreSQL (managed by Replit's integration)
- **ORM**: Drizzle ORM
- **Mobile Framework**: Expo (`expo-sqlite`, `expo-image-picker`)
- **API Framework**: Express 5
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API Codegen**: Orval
- **Data Fetching/Caching**: TanStack Query (`@tanstack/react-query@^5`)
- **Form Management**: `react-hook-form`
- **Fonts**: `@expo-google-fonts/inter`
- **Optional Backend Integration**: Supabase (via `supabase.adapter.ts` and environment variables)