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
    - `features/house-build/`: "House Build Assistant" module — build stages (12 stages from land purchase to final inspections), professional roles (12 roles), construction risk warnings (8 warnings), source metadata support.
    - `types/house-build.ts`: All house-build domain types — `HouseBuildProject`, `LandContext`, `PlanningContext`, `BuildStage`, `BuildChecklistItem`, `DocumentRequirement`, `OfficialProcessStep`, `UtilityRequirement`, `ProfessionalRoleRequirement`, `ConstructionRiskNotice`, `BuildProjectTimelineItem`, `SourceMetadata`, plus formal path types: `FormalPathId`, `FormalPathAssessment`, `FormalCautionNote`, `FormalQuestion`, `FormalRequirementItem`, `OfficialChecklistGroup`, `StartWorksChecklistItem`, `CompletionChecklistItem`, `OfficialSourceLink`.
    - `features/house-build/formal-path.ts`: Formal path assessment logic — evaluates building-permit vs notification-with-design vs simplified-70m2 based on MPZP/WZ status, house type, footprint, floors, own-housing, investor experience, conservative preference. Includes path descriptions with pros/cons and source metadata.
    - `features/house-build/formal-checklists.ts`: All official checklist content — 6 official checklist groups (MPZP, WZ, design docs, property right, opinions, e-Budownictwo), 9 start-works checklist items (formal/site/utility categories), 10 completion checklist items (notice vs permit paths), EDB info block, 3 official source links. All items have source metadata.
    - `context/HouseBuildContext.tsx`: React context providing house-build state — projects, checklists, documents, utilities. Persists to SQLite via house-build repository. Auto-seeds stage checklists and documents from stage definitions.
    - `db/migrations/006_house_build.ts`: SQLite tables for `house_build_projects`, `build_checklist_items`, `build_documents`, `build_utilities` with indexes.
    - `db/repositories/house-build.repo.ts`: Full CRUD for house-build projects, checklists, documents, and utilities.
    - `app/house-build/`: 14 screens total — module home, create wizard, project detail (with 9 quick-action tiles), stage detail, documents overview, professionals guide, utilities tracker, PLUS 7 formal screens: formal-path (3-step wizard), formal-result (path assessment with pros/cons/cautions), formal-documents (official checklists with progress), before-works (pre-construction checklist by category), start-works (notification requirements), edb (Electronic Construction Log guide), completion (notice vs permit paths with closing checklist).
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

**Web Support Pages (`artifacts/asystent-remontu-web`):**
- React + Vite + Tailwind CSS web app with wouter routing
- `/asystent-remontu` — Marketing/landing page (App Store Marketing URL)
- `/pomoc` — Support page with FAQ (App Store Support URL)
- `/polityka-prywatnosci` — Privacy policy page
- Orange-branded (#F97316) to match the mobile app
- All content in Polish

**App Store Release Assets (`artifacts/mobile/release/`):**
- `app-store-metadata.md` — Ready-to-copy App Store Connect fields
- `app-review-notes.md` — Reviewer notes explaining features, login, data handling
- `release-checklist.md` — Pre-submission checklist with placeholder tracking

**Contact Config (`artifacts/mobile/config/contact.ts`):**
- Centralized contact/URL config with placeholder values
- Used by Settings screen for support/privacy/contact links
- Placeholder values to be replaced before submission: email, domain, owner name