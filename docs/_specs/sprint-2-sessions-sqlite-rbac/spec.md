# Sprint 2 Spec — Sessions, SQLite, and RBAC

## Problem Statement
Sprint 1 provided a polished UI with mock streaming, but state is entirely in-memory and lost on refresh. To become a "ContentOps Studio," the application needs persistence, a stable concept of a user session, and the ability to differentiate between roles (Creator, Editor, Admin) for future tool authorization and workflow controls.

## Invariants
1. **Charter Invariant:** Tool schemas and runtime behavior must come from the same registry/RBAC.
2. **Session Integrity:** All session cookies must be signed using `HS256` and a server-side secret (`CONTENTOPS_SESSION_SECRET`).
3. **Stateless Middleware:** Middleware MUST NOT connect to the database. It validates the signed cookie only.
4. **Role Consistency:** Role values must be capitalized: `'Creator'`, `'Editor'`, `'Admin'`.
5. **Database Concurrency:** The SQLite connection must enable `PRAGMA journal_mode = WAL` to handle concurrent operations across Route Handlers and Server Actions.

## Charter Amendment (Retroactive Env Var)
This sprint retroactively adds `CONTENTOPS_SESSION_SECRET` to the environment schema defined in Sprint 0. This secret is required for signing session tokens and must be a minimum of 32 characters in production.

## Architecture

### 1. Reconciled Database Schema (SQLite)
Timestamps are `INTEGER` (unixepoch). All IDs are TEXT (UUID).

**`users`**
- `id`: TEXT PRIMARY KEY (UUID)
- `email`: TEXT UNIQUE NOT NULL
- `role`: TEXT NOT NULL CHECK(role IN ('Creator', 'Editor', 'Admin'))
- `display_name`: TEXT
- `created_at`: INTEGER NOT NULL

**`conversations`**
- `id`: TEXT PRIMARY KEY (UUID)
- `user_id`: TEXT NOT NULL REFERENCES users(id)
- `title`: TEXT DEFAULT 'New Conversation'
- `created_at`: INTEGER NOT NULL

**`messages`**
- `id`: TEXT PRIMARY KEY (UUID)
- `conversation_id`: TEXT NOT NULL REFERENCES conversations(id)
- `role`: TEXT NOT NULL CHECK(role IN ('user', 'assistant'))
- `content`: TEXT NOT NULL
- `tokens_in`: INTEGER
- `tokens_out`: INTEGER
- `created_at`: INTEGER NOT NULL

### 2. Session Logic (via `jose` v6)
- **Token Payload:** `{ sub: userId, role: role, name: displayName }`.
- **TTL:** 24 hours.
- **Middleware (`middleware.ts`):**
  - **Shared Identity:** Anonymous visitors without a cookie are assigned the `creator-1` identity by default. This results in a **shared demo state** for all anonymous visitors, reflecting a single-brand "Editorial Cockpit" rather than a multi-tenant SaaS.
  - **Enforcement:**
    - `/api/admin/*`: Requires `role === 'Admin'`.
    - `/api/chat`: Requires `role IN ('Creator', 'Editor', 'Admin')`.
    - `/api/conversations`: Requires `role IN ('Creator', 'Editor', 'Admin')`.

### 3. Persistence Flow & Runtimes
- **GET History:** `page.tsx` fetches history via a Server Component call (`nodejs` runtime).
- **Send & Stream:** `/api/chat` Route Handler (`nodejs`).
  - Generates UUIDs for messages.
  - Mocks token counts as `Math.ceil(content.length / 4)`.
- **Role Switcher:** Server Action (`nodejs`) updates the session cookie.
- **Verification Endpoint:** `GET /api/admin/ping` returns `"ok"` for `Admin`, else `403`.

### 4. Migration & Seeding Strategy
- **Seeding:** `src/db/seed.ts` provisions three stable UUIDs for the demo users:
  - `creator-1`: `00000000-0000-0000-0000-000000000001`
  - `editor-1`: `00000000-0000-0000-0000-000000000002`
  - `admin-1`: `00000000-0000-0000-0000-000000000003`
- **Execution:** `npm run db:seed` runs at build time. No runtime auto-seeding.

### 5. Testing & Verification
- **Test DB:** `:memory:` databases via `src/lib/db/test-helpers.ts`.
- **Sprint 1 Regressions:** Existing tests will be updated to provide a seeded in-memory DB during the `page.tsx` fetch.

## Acceptance Criteria
- **Persistence:** History survives refresh.
- **Signed Sessions:** Tampering clears the session.
- **Shared Demo State:** Anonymous visitors share the `creator-1` history.
- **Role Switching:** Switcher updates the session and is visible only in demo mode.
- **Admin Protection:** `/api/admin/ping` rejects non-Admin roles.

## Verification Commands
- `npm run typecheck`, `lint`, `test`, `build`.
