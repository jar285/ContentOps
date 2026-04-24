# Sprint 1: Homepage Chat UI + Streaming Shell - Sprint Plan

## 1. Goal
Replace the placeholder homepage with the ContentOps chat UI featuring session-local state and a deterministic streaming assistant mock. The implementation is strictly bounded to the frontend shell, decoupling the UI from external APIs, RAG, MCP, and database persistence.

## 2. Files to Create or Modify
- `package.json` / `package-lock.json` (modified via npm install)
- `src/lib/mock-stream.ts` [NEW]
- `src/components/chat/ChatEmptyState.tsx` [NEW]
- `src/components/chat/ChatMessage.tsx` [NEW]
- `src/components/chat/ChatComposer.tsx` [NEW]
- `src/components/chat/ChatTranscript.tsx` [NEW]
- `src/components/chat/ChatUI.tsx` [NEW]
- `src/app/page.tsx` [MODIFIED]
- `src/app/page.test.tsx` [MODIFIED]

## 3. Implementation Tasks

### Task 1: Install Dependencies
Run the exact dependency command for the approved iconography library:
`npm install lucide-react`
*(Note: Must commit `package-lock.json` and import icons individually).*

### Task 2: Implement Deterministic Mock
Create `src/lib/mock-stream.ts` implementing the async generator contract. It must simulate chunked text yielding with short timeouts and explicitly `throw new Error()` for the `"throw error"` prompt.

### Task 3: Build Child Components
Create the child components without root client boundary declarations:
- `ChatEmptyState.tsx`: Renders the Side Quest Syndicate branded onboarding state.
- `ChatMessage.tsx`: Renders individual user/assistant bubbles with hierarchy and spacing.
- `ChatTranscript.tsx`: Renders the list of messages with auto-scrolling logic.
- `ChatComposer.tsx`: Textarea and submit controls managing local input state and strict keyboard handlers.

### Task 4: Build the ChatUI Orchestrator
Create `src/components/chat/ChatUI.tsx` as the explicit `"use client"` boundary owner. Implement the local React state (`useState`/`useReducer`) for message history and streaming status. Wire the mock generator to update the transcript state and lock the composer. Handle empty submissions.

### Task 5: Integrate into Homepage
Modify `src/app/page.tsx` to remove the Sprint 0 placeholder and render the `<ChatUI />` orchestrator.

### Task 6: Implement Component Test Plan
Rewrite `src/app/page.test.tsx` to exhaustively test the interactions against the happy-dom environment, utilizing Vitest fake timers (`vi.useFakeTimers()`) to ensure the streaming tests are perfectly deterministic.

## 4. Component Responsibilities

- **`ChatUI`**: The root orchestrator and sole `"use client"` boundary owner. Owns transcript state, streaming state, submit orchestration, assistant chunk updates, error state, and the `aria-live` status region.
- **`ChatComposer`**: Owns local textarea state and keyboard behavior (`Enter` vs `Shift+Enter`). Owns the accessible labels for the textarea and submit button.
- **`ChatTranscript`**: Renders the message array and owns the auto-scroll behavior.
- **`ChatMessage`**: Presentational. Renders a single message bubble, applying appropriate Tailwind styles and `lucide-react` icons based on the message role (User vs Assistant).
- **`ChatEmptyState`**: Presentational. Renders the static, branded welcome UI.

## 5. Deterministic Mock-Stream Contract
- **Location:** `src/lib/mock-stream.ts`
- **Contract:** Must export `async function* mockStreamGenerator(prompt: string)`.
- **Behavior:**
  - If `prompt` exactly contains `"throw error"`, the generator must explicitly `throw new Error()`.
  - Otherwise, it splits a static placeholder response into fixed chunks.
  - It yields each chunk after awaiting a short timeout (e.g., `await new Promise(r => setTimeout(r, 10))`).
  - No network requests, API routes, or actual Server-Sent Events (SSE) / `ReadableStream` usage is permitted.

## 6. Component Test Plan
The integration test suite (`src/app/page.test.tsx`) must mount the homepage, use Vitest fake timers (`vi.useFakeTimers()`), and assert the following:
1. **Empty State:** Initial render displays the branded empty state correctly.
2. **Typing & Submission:** The user can type into the composer (located via accessible label) and submit the message (located via accessible button name).
3. **Empty Submission:** Whitespace-only input must not create a user message and must not start mock streaming.
4. **Enter Submit:** Pressing `Enter` correctly fires the form submission.
5. **Shift+Enter Handling:** Pressing `Shift+Enter` creates a newline and strictly does NOT fire submission.
6. **Immediate Rendering:** Upon valid submission, the user's message appears immediately in the transcript DOM.
7. **Streaming Rendering:** The mock assistant response streams deterministically (advancing via `vi.advanceTimersByTime`) and renders.
8. **Composer Locking:** The composer textarea and submit button are explicitly `disabled` or locked while the streaming is active.
9. **Error State:** Submitting `"throw error"` triggers the error state, which is visually and structurally rendered.
10. **Accessibility Queries:** Test assertions must interact using accessible queries (`getByRole`, `getByLabelText`) and verify the `aria-live` status/error regions. Auto-scroll behavior will not be asserted via pixel coordinates.

## 7. Verification Commands
Following implementation, the exact verification suite must be run:
```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Explicit Restrictions
Do not implement or add: API routes, Anthropic SDK, Retrieval-Augmented Generation (RAG), MCP tools, database persistence (SQLite), Authentication, Authorization (RBAC), Admin/Cockpit UI, Server-Sent Events (SSE), native `ReadableStream`, `Zustand`/`Redux`, `shadcn`, or any additional UI/icon libraries beyond `lucide-react`.
