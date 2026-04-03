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
- **Components**: Reusable UI components (`components/ui/`) and project-specific components (`components/project/`).

**Technical Implementations (Mobile App):**
- **Data Storage**: Offline-first via `expo-sqlite v16`.
- **Data Layer**: TanStack Query v5 for data management, ready for background sync.
- **State Management**: Context API (`AppContext.tsx`).
- **Form Handling**: `react-hook-form` is used for forms.
- **Validation**: Zod for schema validation.
- **Core Logic**:
    - `features/pricing/`: Handles `computePricedBudget`, labor and material registries.
    - `features/calculator/`: Contains formula registry, formula builder, calculator engine, shopping list generator, and budget estimator.
    - `features/warnings/`: Resolves warnings based on conditions and provides difficulty/risk labels.
    - `features/content/`: Manages job and category registries.
    - `features/commerce/`: Provider-agnostic commerce preparation layer with `CommerceProviderInterface` abstraction, `MockCommerceProvider`, `CartDraft` builder, and `CheckoutHandoff` builder. Currently mock-only.
    - `features/contractor/`: "Find a Contractor" module with mock contractor data, search/filter/sort logic, and text search. Contractor profile screen supports adding contractors to House Build stage shortlists when navigated from the build module. **Trust + Ranking + Moderation + Promoted Listings** (Prompt 11): 8-value VerificationStatus with trust levels and badges, profile completeness scoring (10 dimensions), quality score computation (8 weighted factors), organic/promoted/featured result separation, ranking engine with context-aware scoring, profile health checks with rankability gate, 4 new DB tables (contractor_reviews, contractor_reports, contractor_blocks, contractor_promotions) via migration 013, full CRUD repositories for reviews/reports/blocks/promotions, TrustBadge/PromotedLabel/CompletenessHint UI components, ReviewSection with distribution chart and flagging, report modal with reason selection, block/unblock with context sync, admin board with 8 tabs (reports, verification, promoted, suspended, flagged-reviews, incomplete, blocked, queue), quality-score sort option, house-build stage filtering for contractors. **Contractor Plans + Entitlements + Billing Preparation** (Prompt 12): 5-plan system (free/starter/pro/featured/enterprise) with full entitlement sets (16 entitlement keys), plan assignment lifecycle (8 states), usage counters, billing events, promotion slots (city/category/stage/featured-global). Migration 014 (5 new tables: contractor_plans, contractor_plan_assignments, contractor_usage_counters, contractor_billing_events, contractor_promotion_slots). Full CRUD repository (`contractor-plans.repo.ts`). Entitlement enforcement engine (`contractor-plans.ts`) with access state resolution, plan comparison, usage tracking, upgrade suggestions. Billing abstraction layer (`billing-provider.ts`) with `BillingProviderInterface` and `PlaceholderBillingProvider` (no real checkout). Plan seed data with 5 tiered plans. Import/export with JSON validation, duplicate detection, and safe apply. Contractor-facing plan dashboard (`app/contractor/plans.tsx`) with current plan display, entitlement list, usage meters, plan comparison grid, upgrade placeholder. Admin plan management (`app/contractor/admin-plans.tsx`) with 5 tabs (plans, assignments, promotion slots, billing events, import/export), manual plan assignment, slot creation, suspension. 11 monetization feature flags added to `ContractorFeatureFlags`. Plan status chip and entitlement enforcement on contractor profile page. Navigation links from dashboard and admin board to plan screens.
    - `features/house-build/`: "House Build Assistant" module including enriched build stages, stage-gate support, professional roles, construction warnings, energy planning, stage dependency logic, official form definitions, question templates, completion package items, decision templates, utility guidance, reference pricing data (46 seeded price references across 10 categories), a **Content Admin layer** (Prompt 9) with 4 admin tables, full CRUD repository with transactional snapshot/restore, import/export, health check diagnostics, ~60 seeded content records, and 13 admin screens. **Contractor Integration** (Prompt 10): 2 new tables (`hb_stage_contractor_needs`, `hb_stage_contractor_shortlist`), 8-value ContractorNeedStatus lifecycle, per-stage contractor planning board, stage-level shortlist management, request preparation with project data prefill, hiring questions (universal + stage-specific), professional guidance per stage, extended specialty aliases, and full bidirectional navigation between House Build stages and Contractor search/profile screens.
- **Project Structure**:
    - `app/`: Expo Router screens.
    - `types/`: Core domain, engine, user, calculator, and DB types.
    - `shared/`: Zod validation schemas and utility libraries.
    - `hooks/`: TanStack Query data hooks.
    - `db/`: SQLite client, migrations, repositories, and adapters.
    - `data/prices/`: Reference pricing seed data.
    - `data/jobs/`: Definition files for various renovation jobs.
    - `utils/`: Formatting and calculator helpers.
    - `components/`: Reusable UI and project-specific components.
    - `constants/`: Color palettes and design constants.
    - `lib/`: Query client, Sentry integration, and optional Supabase integration.

**System Design Choices:**
- **Monorepo**: Uses pnpm workspaces.
- **TypeScript**: Ensures type safety.
- **Modular Design**: Clear separation of concerns.
- **API Codegen**: Orval for generating API clients and Zod schemas from an OpenAPI spec.
- **Database Migrations**: Handled by Replit for production, `drizzle-kit` for development.
- **Build System**: `esbuild` for CJS bundling, `tsc` for type-checking.
- **Project References**: TypeScript composite projects for efficient type-checking.

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
- **Optional Backend Integration**: Supabase (via `supabase.adapter.ts`)
- **Web Support Pages**: React + Vite + Tailwind CSS web app for marketing, support, and privacy policies.
- **Contractor Web Portal** (Prompt 13): Full web-first contractor portal at `/portal/contractor` with sidebar navigation, 10 pages (dashboard, profile, plans & visibility, billing, promotions, usage & limits, support, settings, checkout flow, admin inspect). Uses wouter routing, PortalProvider context with mock data, test billing/checkout simulation (success/failure/cancel). Admin panel at `/portal/contractor/admin` for inspecting accounts and manual plan assignment. All Polish UI. Files: `src/lib/portal-types.ts`, `src/lib/portal-mock-data.ts`, `src/lib/portal-context.tsx`, `src/components/portal/PortalLayout.tsx`, `src/pages/portal/*.tsx`.
- **App Store Release Assets**: `app-store-metadata.md`, `app-review-notes.md`, `release-checklist.md`.
- **Contact Configuration**: Centralized contact/URL config (`artifacts/mobile/config/contact.ts`).