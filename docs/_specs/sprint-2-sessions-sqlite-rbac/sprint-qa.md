# Sprint 2 Sprint Plan QA — Sessions, SQLite, and RBAC

## Self-QA Pass (Sequential Thinking Analysis)

### 1. Specification Acceptance Criteria Coverage
- **Persistence:** Covered by Task 7.3b (Integration test) and 7.2 (Server Component fetch).
- **Signed Sessions:** Covered by Task 4.2 (Unit tests for jose v6 signing/verification).
- **Stateless Middleware:** Covered by the Task 5.1 sub-tasks and the explicit completion checklist constraint.
- **Shared Demo State:** Covered by Task 5.1c (Fallback logic) and 5.1f (Verification).
- **Role Switching:** Covered by Task 6.2 (Server Action with `revalidatePath('/')`) and Task 6.3 (Verification).
- **Route Authorization:** Covered by Task 6.1 (Verification endpoint) and Task 5.1d/e/f (Middleware enforcement).
- **Schema Integrity:** Covered by Task 2.2 (Verification of tables, CHECK constraints, and WAL mode).
- **Session TTL:** Covered by Task 5.1b and 5.1f.
- **Sprint 1 Regressions:** Covered by Task 7.2b (Updating `page.test.tsx` using new DB helpers).

### 2. Dependency & Order-of-Operations
- **Environment Schema (1.1) -> Auth Core (4.1):** The plan correctly positions the environment secret declaration before the `jose` signing implementation.
- **DB Schema (2.1) -> Seeding (3.1) -> Middleware (5.1c):** The implementation order correctly ensures the database exists before seeding, and seeding occurs before the Middleware relies on stable UUIDs for fallback assignment.
- **Auth Core (4.1) -> Middleware (5.1b):** Signing/verification utilities are built before the Middleware attempts to consume them.
- **Middleware (5.1) -> Actions (6.2) -> UI (7.1):** The auth foundation is completed before the switcher logic and UI components land.

### 3. Resolution of Minor Observations
- **Checklist Format:** Updated from `[x]` to `[ ]` for active tracking during implementation.
- **Task Decomposition:** Task 7.3 is split into 7.3a (Refactor) and 7.3b (Integration Test) for consistency.
- **Middleware Verification:** Each sub-task in Section 5 now includes `npx biome check` to catch syntax errors as each logical piece is implemented.
- **Automated Seeding Verification:** Replaced manual CLI checks with a formal `src/db/seed.test.ts` (Task 3.2).

### 4. Technical Gotchas & Mitigation
- **jose v6 Signing:** Task 1.1 will ensure the Zod schema for `CONTENTOPS_SESSION_SECRET` requires at least 32 characters, satisfying `jose` HS256 requirements.
- **Middleware Matchers:** Task 5.1a is designated to handle the Next.js matcher configuration, which must exclude static assets to maintain performance.
- **better-sqlite3 WAL Mode:** Task 2.1 centralizes WAL mode enabling in the database initialization module, ensuring it applies across all runtimes (dev, test, build).

## Verdict
**No issues found.** The plan is technically robust, respects all implementation-order dependencies, and provides clear, automated verification for every load-bearing change.
