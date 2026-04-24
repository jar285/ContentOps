# Sprint 1: Homepage Chat UI + Streaming Shell

## Problem Statement
Sprint 1 replaces the Sprint 0 placeholder homepage with the first real product surface for ContentOps: a polished chat interface at `/`. This sprint establishes the core user interaction loop (message composition, submission, and streaming assistant response) entirely on the client side. By utilizing a deterministic local mock for the streaming response, we decouple the UI development from external API orchestration and database persistence. The result will be a polished, reviewer-visible, accessible, and responsive chat shell tailored to the "Side Quest Syndicate" brand onboarding experience.

## Design Quality Lens
The chat UI must be memorable, disciplined, and grounded in the following design principles:
- **Don Norman:** Obvious affordances and forgiving interaction.
- **Jakob Nielsen:** Visible system status, consistency, error recovery.
- **Adam Wathan and Steve Schoger:** Strong hierarchy, spacing, contrast, and developer-built polish.
- **Dieter Rams:** Useful, honest, minimal interface decisions.
- **Ordo reference:** Operator-chat rhythm and cockpit-like seriousness, without copying architecture or features.

## Invariants
1. **Narrow Rendering Scope:** Sprint 1 message rendering supports only user, assistant, loading, and error messages. Tool-call rendering is strictly out of scope.
2. **Deterministic Mocking:** The streaming response mechanism must be strictly deterministic (e.g., using an async generator to yield fixed chunks). It must not use randomization that would cause flakiness in component tests. No SSE endpoint, network request, ReadableStream API, or server route is allowed in Sprint 1.
3. **Foundation Adherence:** Sprint 1 must not regress the strict environment validation or read-only deployment invariants established in Sprint 0.

## Architecture

### Overview
The chat UI will be built as a set of React Components where `ChatUI.tsx` explicitly owns the `"use client"` boundary. Child components should remain presentational unless they absolutely require client-only behavior. The root orchestrator will utilize local state (`useState` / `useReducer`) to manage the session transcript. The streaming interaction will be powered by a local async generator or equivalent local utility that yields fixed chunks, transitioning the UI through `idle`, `streaming`, and `error` states.

### UI Inspiration (Ordo Benchmark)
Taking cues from the read-only Ordo reference (`docs/_references/ai_mcp_chat_ordo/`), the architecture will utilize:
- A flex-column transcript area that automatically scrolls to the bottom (note: auto-scroll is implemented but not pixel-tested in happy-dom).
- A semantic `ul`/`li` hierarchy for message bubbles.
- A fixed/sticky composer surface anchored at the bottom of the viewport.
- Explicit loading/streaming affordances (e.g., cursor blinking or typing indicators).

### External UI Dependencies
- **Iconography:** `lucide-react` is approved as the only new runtime dependency for Sprint 1 iconography. The implementation must install the current npm-resolved version and commit the `package-lock.json`. Icons must be imported individually from `lucide-react`. No other UI/icon library is approved.

## File Layout
```text
src/
  app/
    page.tsx                 (Updates to render ChatUI)
    page.test.tsx            (Updates to test ChatUI interactions)
  components/
    chat/
      ChatUI.tsx             (Main client component orchestrator)
      ChatTranscript.tsx     (Renders the list of messages)
      ChatMessage.tsx        (Individual user/assistant bubble)
      ChatComposer.tsx       (Textarea and submit controls)
      ChatEmptyState.tsx     (Side Quest Syndicate onboarding state)
  lib/
    mock-stream.ts           (Deterministic stream generator utility)
```

## Acceptance Criteria
The UI and test suite must verify that:
- The initial empty state renders correctly tailored to the "Side Quest Syndicate" brand.
- The user can type into the composer and submit a message.
- Pressing `Enter` submits the message.
- Pressing `Shift+Enter` creates a newline (or at minimum does not submit the form).
- The user's message appears immediately in the transcript upon submission.
- The mock assistant response streams and renders properly in the UI.
- The composer is disabled or explicitly locked while the assistant response is streaming.
- Submitting the explicit phrase "throw error" triggers and renders the error state.
- **Accessibility:**
  - The composer textarea must have a valid accessible label.
  - The submit button must have a valid accessible name.
  - Streaming status must be visible or exposed through a status region (e.g., via `aria-live` or visible text).
  - Error messages must be visibly rendered and testable via accessible queries.
- Component tests assert the rendered messages, forms, and states (note: tests should assert rendered output, not the exact pixel scroll position of auto-scroll).

## Verification Commands
```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Explicitly Out-Of-Scope
- Real Anthropic API integration or external network calls.
- Retrieval-Augmented Generation (RAG).
- Execution or rendering of MCP tools.
- Database persistence (no new SQLite tables, no reading/writing chat history).
- Authentication, authorization, or RBAC middleware.
- Admin dashboard or Cockpit UI.
- Chat session sidebar or history navigation.
- Server-Sent Events (SSE), API routes, or `ReadableStream` APIs.

## Risks and Stop-the-Line Conditions
- **State Complexity:** If the local React state required to manage the streaming chunks becomes overly complex, stop the line. We must rely on standard `useState`/`useRef` without introducing external state managers (like Zustand/Redux) in this sprint.
- **Test Flakiness:** If streaming tests are flaky under happy-dom, stop and simplify the mock until tests pass deterministically.
