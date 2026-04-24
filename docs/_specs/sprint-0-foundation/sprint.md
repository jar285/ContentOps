# Sprint 0: Foundation Plan

## Goal
Establish the foundational Next.js 16 App Router repository backed by SQLite and verified by Vitest and Biome. This sprint lays the groundwork by configuring strict environment validation, a read-only capable database connection for Vercel, and a fully typed verification pipeline without implementing product-specific features.

## Tasks

### 1. Initialize Configuration and Dependencies
Initialize `package.json`, `tsconfig.json`, `next.config.ts`, and `biome.json`. Install the exact packages: `next`, `react`, `react-dom`, `tailwindcss`, `@tailwindcss/postcss`, `postcss`, `zod`, `better-sqlite3`, `biome`, `tsx`, `vitest`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `happy-dom`, `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, and `@types/better-sqlite3`. Configure `serverExternalPackages: ['better-sqlite3']` in `next.config.ts` to explicitly opt the native module out of Next.js bundling and use native Node `require`. Configure `outputFileTracingIncludes: { '/*': ['./data/**/*'] }` to guarantee the `.db` file is explicitly traced into the Vercel serverless function payload.
- **Target Files:** `package.json`, `tsconfig.json`, `next.config.ts`, `biome.json`
- **Verification Command:** `npm install` runs without errors, and `npm run lint` executes using Biome.

### 2. Configure Environment Validation
Create the environment schema using Zod 4. Define and coerce variables `CONTENTOPS_DB_PATH`, `CONTENTOPS_DEMO_MODE`, `CONTENTOPS_ANTHROPIC_MODEL`, `CONTENTOPS_DAILY_SPEND_CEILING_USD`, and `ANTHROPIC_API_KEY`. The application must crash if `ANTHROPIC_API_KEY` is missing. To allow `npm run test`, `npm run db:seed`, and `npm run build` to pass from a clean checkout, the setup documentation must explicitly direct the user to create an `.env.local` or `.env.test` file containing a dummy key (e.g., `ANTHROPIC_API_KEY=sk-ant-dummy-placeholder`).
- **Target Files:** `src/lib/env.ts`, `.env.example`
- **Verification Command:** `npm run typecheck` passes with no type errors.

### 3. Establish Database Connection and Seeding
Implement `src/db/index.ts` to instantiate `better-sqlite3`. The runtime connection must use `{ readonly: true }` when `CONTENTOPS_DEMO_MODE=true` to suppress WAL and journal file creation. The seed script (`src/db/seed.ts`) must bypass this readonly check and explicitly open a writable connection. The seed script must safely use path aliases (e.g., `@/lib/env`) to import internal modules, which executes successfully because Context7 verified that `tsx 4.x` natively resolves `tsconfig.json` paths. The seed script must use the `email` column as the stable unique conflict target for an `INSERT OR IGNORE` command, dynamically generating a `crypto.randomUUID()` upon insertion but safely ignoring subsequent runs (expected row count remains exactly 1). The local `package.json` must retain `"build": "next build"`, while Vercel's deployment settings will be explicitly configured to override the build command to `npm run db:seed && npm run build` to guarantee the SQLite asset exists before bundling.
- **Target Files:** `src/db/index.ts`, `src/db/seed.ts`
- **Verification Command:** `npm run db:seed` executes correctly, creates the SQLite file, and subsequent runs do not fail (idempotency confirmed).

### 4. Implement App Layout and Styling
Set up the minimal Next.js App Router structure. Apply Tailwind CSS 4 by importing it directly in `globals.css` with `@import "tailwindcss";`. Create a placeholder `page.tsx` displaying a simple welcome message. Ensure that any routes or pages explicitly testing database access export `const runtime = 'nodejs'`.
- **Target Files:** `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- **Verification Command:** `npm run build` locally builds the placeholder application without error.

### 5. Configure Vitest and Integration Test
Set up `vitest.config.ts` to explicitly discover `src/**/*.test.{ts,tsx}` files and declare `environment: 'happy-dom'`. Create a setup file to register `@testing-library/jest-dom/vitest`. Write a basic component integration test for `src/app/page.tsx` asserting the placeholder page component successfully renders the placeholder text.
- **Target Files:** `vitest.config.ts`, `vitest.setup.ts`, `src/app/page.test.tsx`
- **Verification Command:** `npm run test` executes successfully and the component integration test passes.

## Completion Checklist
- [ ] Exact packages (Next.js 16, React 19, Tailwind CSS 4, Biome 2, Vitest, Testing Library, TypeScript, Node Types) installed.
- [ ] Zod 4 strictly coerces environment variables and ensures `ANTHROPIC_API_KEY` is provided, with a documented `.env.local` workaround for verification.
- [ ] Runtime database connection dynamically uses `readonly: true` when `CONTENTOPS_DEMO_MODE` is active, while the seed script remains explicitly writable.
- [ ] Vercel configuration explicitly traces `./data/**/*` and opts `better-sqlite3` out of bundling via `serverExternalPackages`.
- [ ] `npm run db:seed` safely uses path aliases and executes via `tsx 4.x`, inserting exactly one seeded user idempotently using the email as a stable conflict target.
- [ ] Vercel build command explicitly documented to run `npm run db:seed && npm run build`, separating local stateless builds from the Vercel requirement.
- [ ] `vitest` runs a passing integration test using `happy-dom` against the placeholder page component, verifying successful rendering.
- [ ] `npm run build` succeeds locally after executing the seed script.
- [ ] `npm run typecheck` and `npm run lint` execute with 0 warnings/errors.

## QA Deviations
- None anticipated. If Vercel build asset configuration deviates from standard `outputFileTracingIncludes` behavior due to Next.js 16 App Router idiosyncrasies, the deviation will be documented during implementation.
