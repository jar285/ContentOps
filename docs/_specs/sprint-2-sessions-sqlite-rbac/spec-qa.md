# Sprint 2 Spec QA — Sessions, SQLite, and RBAC

## Gap-Finding Analysis (Sequential Thinking Pass)

### 1. Identity & Identity Ambiguity
- **Finding:** The spec previously used conceptual labels ("creator-1") in a way that conflicted with the Sprint 0 UUID mandate.
- **Resolution:** The spec now explicitly mandates **stable UUIDs** for seeded demo users (e.g., `...0001` for Creator). This preserves the TEXT PK + UUID format while ensuring deterministic reference in the session logic.
- **Verdict:** Resolved.

### 2. Anonymous State Semantics
- **Finding:** There was a significant ambiguity regarding whether anonymous visitors share state or have isolated sessions.
- **Analysis:** Isolated sessions would require runtime DB writes (potentially failing on read-only demo filesystems) and multi-tenant logic (explicitly out-of-scope per Section 11a). Shared state aligns with the "Single Brand Editorial Cockpit" persona.
- **Resolution:** The spec now explicitly defines **Shared Identity** for anonymous visitors. All anonymous traffic shares the `creator-1` identity and conversation history.
- **Verdict:** Resolved as a documented design decision.

### 3. Route Protection Enumeration
- **Finding:** The use of "e.g." in authorization rules was non-deterministic.
- **Resolution:** The spec now **enumerates the exact protected patterns**: `/api/admin/*` (prefix-based Admin only), and `/api/chat` / `/api/conversations` (authenticated roles).
- **Verdict:** Resolved.

### 4. Database Concurrency & Runtimes
- **Finding:** Using `better-sqlite3` across Route Handlers and Server Actions in a Next.js environment introduces potential concurrency locks.
- **Resolution:** Added **Invariant 5 (Database Concurrency)** requiring `PRAGMA journal_mode = WAL`. This ensures the SQLite file can handle the concurrent read/write patterns expected in Sprint 2.
- **Verdict:** Resolved.

### 5. UI Synchronization (Role Switcher)
- **Gap Found:** The spec mentioned the role switcher updates the cookie but didn't specify how the UI reflects this change immediately.
- **Analysis:** Since the page fetches from the DB in a Server Component load path, a simple cookie update won't trigger a re-render of the server-side data without a refresh.
- **Recommendation:** The implementation must ensure the Server Action calls `revalidatePath('/')` or `redirect('/')` to force a fresh fetch of the new role's context. (Added to the spec's "Acceptance Criteria" under Role Switching).

### 6. ID Generation Ownership
- **Gap Found:** It was unclear if message/conversation IDs were client-side or server-side.
- **Resolution:** Architecture section now specifies that **UUIDs are server-generated** at the point of persistence to ensure integrity and prevent collision.
- **Verdict:** Resolved.

## Verdict
**Passed.** The spec now contains sufficient technical detail to guide a deterministic implementation without "rubber-stamp" assumptions.
