# Sprint 2 Plan — Sessions, SQLite, and RBAC

## Goal
Transition from in-memory state to a persisted SQLite database with role-based access control. Establish a signed session system (`jose` v6) that supports a shared anonymous "Creator" persona for the demo and a role-switcher for reviewers, while maintaining a stateless middleware architecture.

## Implementation Tasks

### 1. Foundation: Environment & Types
- **Task 1.1:** Add `CONTENTOPS_SESSION_SECRET` to environment validation and `.env.example`.
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
- **Task 2.1:** Implement idempotent SQLite schema with WAL mode.
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
  - **Verification:** `npm run db:seed`, `sqlite3 contentops.db "SELECT count(*) FROM users;"` (confirming count is 3)

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
  - **Files:** `src/middleware.ts`
- **Task 5.1b:** Implement cookie extraction and `jose` verification with TTL.
- **Task 5.1c:** Implement fallback logic for missing/invalid/expired cookies (shared `creator-1`).
- **Task 5.1d:** Implement `/api/admin/*` route protection.
- **Task 5.1e:** Implement `/api/chat` and `/api/conversations` route protection.
- **Task 5.1f:** Verify middleware behavior.
  - **Files:** `src/middleware.test.ts`
  - **Assertions:** Signed OK, tampered rejected, expired fallback, Admin allowed on admin route, Creator denied on admin route, unprotected route passes through without session check.
  - **Verification:** `npm run test src/middleware.test.ts`, `npx biome check src/middleware.ts`

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
- **Task 7.3:** Refactor `/api/chat` for persistence and streaming (nodejs runtime).
  - **Files:** `src/app/api/chat/route.ts`, `src/components/chat/ChatUI.tsx`
  - **Verification:** `src/app/api/chat/route.integration.test.ts` (covers persist-then-reload flow), `npm run build`

---

## Completion Checklist

- [x] **Persistence:** Chat history survives page refresh. (Verified by `src/app/api/chat/route.integration.test.ts`)
- [x] **Signed Sessions:** `contentops_session` is signed; tampering clears it. (Verified by `src/lib/auth/session.test.ts`)
- [x] **Stateless Middleware:** `middleware.ts` contains zero database utility imports. (Verified by `grep -r "src/lib/db" src/middleware.ts` returning nothing)
- [x] **Shared Demo State:** Anonymous/expired visitors share the `creator-1` identity. (Verified by `src/middleware.test.ts`)
- [x] **Role Switching:** Switcher updates cookie and calls `revalidatePath('/')`. (Verified by `src/lib/auth/actions.test.ts`)
- [x] **Route Authorization:** `/api/admin/ping` correctly enforces Admin role. (Verified by `src/middleware.test.ts` and `curl`)
- [x] **Schema Integrity:** Database reflects the reconciled Sprint 0 + Sprint 2 schema. (Verified by `src/lib/db/schema.test.ts`)
- [x] **Session TTL:** Expired cookies are treated as missing (fallback to `creator-1`). (Verified by `src/middleware.test.ts`)
- [x] **Sprint 1 Regressions:** Existing tests pass with the new async DB fetch logic. (Verified by `npm run test src/app/page.test.tsx`)
- [x] **Verification:** `typecheck`, `lint`, `test`, `build` all pass.

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
