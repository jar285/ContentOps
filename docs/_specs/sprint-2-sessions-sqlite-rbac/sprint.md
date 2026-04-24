# Sprint 2 Plan — Sessions, SQLite, and RBAC

## Goal
Transition from in-memory state to a persisted SQLite database with role-based access control. Establish a signed session system (`jose` v6) that supports a shared anonymous "Creator" persona for the demo and a role-switcher for reviewers, while maintaining a stateless middleware architecture.

## Implementation Tasks

### 1. Foundation: Environment & Types
- **Task 1.1:** Add `CONTENTOPS_SESSION_SECRET` to environment validation and `.env.example`.
  - **Requirement:** Use `z.string().min(32)` for the secret validation to ensure sufficient entropy for HS256.
  - **Files:** `.env.example`, `src/lib/env.ts`
  - **Verification:** `npm run typecheck`, `npx biome check src/lib/env.ts`
- **Task 1.2:** Retroactively amend Sprint 0 spec.
  - **Action:** Add `CONTENTOPS_SESSION_SECRET` to the env list in `docs/_specs/sprint-0-foundation/spec.md` with note "Added in Sprint 2 per Charter Amendment". Add a note to the changelog subsection pointing to Sprint 2's Charter Amendment.
  - **Files:** `docs/_specs/sprint-0-foundation/spec.md`
  - **Verification:** `git diff docs/_specs/sprint-0-foundation/spec.md` (confirming only these changes exist)
- **Task 1.3:** Define session payload and role types.
  - **Files:** `src/lib/auth/types.ts`
  - **Verification:** `npx biome check src/lib/auth/types.ts`, `npm run typecheck`

### 2. Persistence: Schema & Concurrency
- **Task 2.1:** Implement idempotent SQLite schema and connection logic.
  - **Requirement:** `PRAGMA journal_mode = WAL` must be set in `src/lib/db/index.ts` during connection creation to apply to all runtimes. `schema.ts` owns table definitions only.
  - **Files:** `src/lib/db/schema.ts`, `src/lib/db/index.ts`
  - **Verification:** `npx biome check src/lib/db/schema.ts src/lib/db/index.ts`
- **Task 2.2:** Verify schema integrity and concurrency.
  - **Files:** `src/lib/db/schema.test.ts`
  - **Assertions:** (a) tables `users`, `conversations`, `messages` exist with expected columns, (b) `CHECK` constraints reject invalid role values, (c) `PRAGMA journal_mode` returns 'wal'.
  - **Verification:** `npm run test src/lib/db/schema.test.ts`
- **Task 2.3:** Create test helpers for in-memory DB fixtures.
  - **Files:** `src/lib/db/test-helpers.ts`
  - **Verification:** `npx biome check src/lib/db/test-helpers.ts`, `npm run typecheck`

### 3. Seeding: Build-time
- **Task 3.1:** Extend seed script to provision three demo users with stable UUIDs.
  - **Files:** `src/db/seed.ts`
  - **Verification:** `npx biome check src/db/seed.ts`
- **Task 3.2:** Verify seed logic.
  - **Files:** `src/db/seed.test.ts`
  - **Assertions:** (a) seed script runs against :memory: DB, (b) assertions for 3 users with expected IDs and roles.
  - **Verification:** `npm run test src/db/seed.test.ts`

### 4. Auth Core: jose v6
- **Task 4.1:** Implement `encrypt`/`decrypt` utilities for HS256 tokens.
  - **Files:** `src/lib/auth/session.ts`
  - **Verification:** `npx biome check src/lib/auth/session.ts`
- **Task 4.2:** Verify session logic.
  - **Files:** `src/lib/auth/session.test.ts`
  - **Assertions:** (a) sign+verify round-trip, (b) tampered signature rejection, (c) expired token rejection, (d) missing secret throws expected error.
  - **Verification:** `npm run test src/lib/auth/session.test.ts`

### 5. Middleware: Stateless RBAC
- **Task 5.1a:** Define middleware matcher config.
  - **Requirement:** Matcher must exclude `/_next/static`, `/_next/image`, `/favicon.ico`, and public assets to maintain performance.
  - **Files:** `src/middleware.ts`
  - **Verification:** `npx biome check src/middleware.ts`
- **Task 5.1b:** Implement cookie extraction and `jose` verification with TTL.
  - **Verification:** `npx biome check src/middleware.ts`
- **Task 5.1c:** Implement fallback logic for missing/invalid/expired cookies (shared `creator-1`).
  - **Verification:** `npx biome check src/middleware.ts`
- **Task 5.1d:** Implement `/api/admin/*` route protection.
  - **Verification:** `npx biome check src/middleware.ts`
- **Task 5.1e:** Implement `/api/chat` and `/api/conversations` route protection.
  - **Verification:** `npx biome check src/middleware.ts`
- **Task 5.1f:** Verify middleware behavior.
  - **Files:** `src/middleware.test.ts`
  - **Assertions:** Signed OK, tampered rejected, expired fallback, Admin allowed on admin route, Creator denied on admin route, unprotected route passes through without session check.
  - **Verification:** `npm run test src/middleware.test.ts`, `npx biome check src/middleware.ts`, `npm run typecheck`

### 6. Server Logic: Runtimes & Verifiers
- **Task 6.1:** Create Admin verification endpoint.
  - **Files:** `src/app/api/admin/ping/route.ts`
  - **Verification:** `curl -I http://localhost:3000/api/admin/ping` (confirming 403 or 200 based on session)
- **Task 6.2:** Implement `switchRole` Server Action with `revalidatePath('/')`.
  - **Files:** `src/lib/auth/actions.ts`
  - **Verification:** `npx biome check src/lib/auth/actions.ts`
- **Task 6.3:** Verify Role Switching logic.
  - **Files:** `src/lib/auth/actions.test.ts`
  - **Assertions:** Cookie update occurs with correct payload, `revalidatePath('/')` is called.
  - **Verification:** `npm run test src/lib/auth/actions.test.ts`

### 7. Integration: UI & E2E
- **Task 7.1:** Create `RoleSwitcher` UI component (demo-only).
  - **Files:** `src/components/auth/RoleSwitcher.tsx`, `src/app/page.tsx`
  - **Verification:** Manual: `CONTENTOPS_DEMO_MODE=true npm run dev`, confirm switcher is visible and functional.
- **Task 7.2:** Refactor `page.tsx` to fetch history via Server Component.
  - **Files:** `src/app/page.tsx`
  - **Verification:** `npx biome check src/app/page.tsx`, `npm run build`
- **Task 7.2b:** Update existing Sprint 1 tests.
  - **Files:** `src/app/page.test.tsx`
  - **Action:** Update to use `test-helpers.ts` for async DB fetch mocking.
  - **Verification:** `npm run test src/app/page.test.tsx`
- **Task 7.3a:** Refactor `/api/chat` for persistence and streaming (nodejs runtime).
  - **Files:** `src/app/api/chat/route.ts`, `src/components/chat/ChatUI.tsx`
  - **Verification:** `npx biome check src/app/api/chat/route.ts`, `npm run typecheck`
- **Task 7.3b:** Verify E2E persistence flow.
  - **Files:** `src/app/api/chat/route.integration.test.ts`
  - **Assertions:** Send message -> check DB -> refresh -> verify history persistence.
  - **Verification:** `npm run test src/app/api/chat/route.integration.test.ts`, `npm run build`

---

## Completion Checklist

- [ ] **Persistence:** Chat history survives page refresh. (Verified by `src/app/api/chat/route.integration.test.ts`)
- [ ] **Signed Sessions:** `contentops_session` is signed; tampering clears it. (Verified by `src/lib/auth/session.test.ts`)
- [ ] **Stateless Middleware:** `middleware.ts` contains zero database utility imports. (Verified by `grep -r "src/lib/db" src/middleware.ts` returning nothing)
- [ ] **Shared Demo State:** Anonymous/expired visitors share the `creator-1` identity. (Verified by `src/middleware.test.ts`)
- [ ] **Role Switching:** Switcher updates cookie and calls `revalidatePath('/')`. (Verified by `src/lib/auth/actions.test.ts`)
- [ ] **Route Authorization:** `/api/admin/ping` correctly enforces Admin role. (Verified by `src/middleware.test.ts` and `curl`)
- [ ] **Schema Integrity:** Database reflects the reconciled Sprint 0 + Sprint 2 schema. (Verified by `src/lib/db/schema.test.ts`)
- [ ] **Session TTL:** Expired cookies are treated as missing (fallback to `creator-1`). (Verified by `src/middleware.test.ts`)
- [ ] **Sprint 1 Regressions:** Existing tests pass with the new async DB fetch logic. (Verified by `npm run test src/app/page.test.tsx`)
- [ ] **Verification:** `typecheck`, `lint`, `test`, `build` all pass.

---

## QA Deviations
1. **`revalidatePath` Implementation:** Included in Task 6.2/6.3 as the spec mentioned it in self-QA but not in the AC section.
2. **Stateless Middleware Check:** Explicitly added to Task 5.1 and checklist as a grep-able constraint.
3. **Schema Integrity Check:** Explicitly added to Task 2.2 and checklist to ensure Sprint 0 constraints are preserved.
4. **Task Ordering:** Task 7.2b added to separate test infrastructure setup (2.3) from test implementation (7.2b) once the Server Component exists.

---

## Commit Strategy
- **Section 1 Commit:** "Sprint 2 Section 1: Foundation (Env & Types)"
- **Section 2 Commit:** "Sprint 2 Section 2: Persistence (Schema & Test Helpers)"
- **Section 3 Commit:** "Sprint 2 Section 3: Seeding (3 Demo Users)"
- **Section 4 Commit:** "Sprint 2 Section 4: Auth Core (jose v6)"
- **Section 5 Commit:** "Sprint 2 Section 5: Stateless Middleware RBAC"
- **Section 6 Commit:** "Sprint 2 Section 6: Server Actions & Verifiers"
- **Section 7 Commit:** "Sprint 2 Section 7: Integration & E2E"
- **Final Commit:** "Sprint 2: Final Verification & Checklist Closeout"
