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
    - `features/contractor/`: "Find a Contractor" module with mock contractor data, search/filter/sort logic, and text search.
    - `features/house-build/`: "House Build Assistant" module including enriched build stages, stage-gate support, professional roles, construction warnings, energy planning, stage dependency logic, official form definitions, question templates, completion package items, decision templates, and utility guidance.
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
- **App Store Release Assets**: `app-store-metadata.md`, `app-review-notes.md`, `release-checklist.md`.
- **Contact Configuration**: Centralized contact/URL config (`artifacts/mobile/config/contact.ts`).