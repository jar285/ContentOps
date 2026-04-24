# References

This directory holds external projects used as **read-only architectural
reference material** for ContentOps. Nothing in this directory is part of the
ContentOps build, test, or runtime surface.

## Rules For The Coding Agent

These rules are not negotiable. They exist because without them, the reference
material stops being reference material and becomes a liability.

1. **Read-only.** Do not modify, create, rename, or delete any file inside
   `docs/_references/` or any subdirectory of it. This rule applies during
   every sprint without exception.
2. **Not a dependency.** ContentOps must not `import`, `require`, or otherwise
   link to code inside `docs/_references/`. If a pattern is useful, port it
   into ContentOps under `src/` with a comment citing the Ordo path.
3. **Not a scope expander.** Patterns that exist in Ordo but are not required
   by the current sprint spec must not be added to ContentOps. A pattern being
   "cool" or "good practice" is not a reason to expand scope.
4. **Cite when borrowing.** When a sprint implementation borrows a pattern
   from a reference, the sprint doc must name the specific file path in the
   reference and describe what was adapted. Example citation format:

   > Borrowed from `docs/_references/ai_mcp_chat_ordo/src/lib/chat/tool-composition-root.ts` — adapted the tool-registry-with-RBAC-middleware pattern for ContentOps; simplified from 20 tools to 6, from 5 roles to 3.

5. **Do not mirror the reference's surface area.** Ordo is the output of many
   sprints of consolidation by a professional team. ContentOps is a four-to-six
   weekend project by a student. Faithfully mirroring Ordo's complexity is a
   scope failure, not a success.

## Current References

### `ai_mcp_chat_ordo/`

**Source:** https://github.com/kaw393939/ai_mcp_chat_ordo

**Purpose:** Architectural reference for a chat-first, MCP-enabled, RBAC-aware,
spec-driven application. Studio Ordo is used for:

- the single-source tool registry pattern
  (prompt-visible schemas and RBAC-enforced execution come from the same source)
- the middleware-composed tool execution path
  (logging + RBAC as composable middleware)
- the priority-ordered prompt composition model
  (numbered sections: identity, tool manifest, role directive, etc.)
- the spec / sprint / QA artifact discipline described in
  `docs/operations/agentic-delivery-playbook.md`
- the role-overlay session pattern for demoing RBAC without multiple accounts

**Explicitly NOT borrowed from Ordo:**

- the full capability catalog with seven projections
- the provider resilience policy across seven surfaces
- the deferred job queue and web push notification system
- the blog pipeline, referrals, deals, training paths, and consultation workflows
- Playwright + Lighthouse + release evidence scripts
- multi-provider model routing (ContentOps uses Anthropic only)
- the 190+ test suite (ContentOps targets roughly 40 tests across three tiers)
- the 14-sprint unification program (ContentOps has eight sprints total)

These exclusions are intentional. They exist in Ordo because Ordo has real
fragmentation to consolidate. ContentOps is greenfield and does not.

## Files To Read First

When the agent is grounding on Ordo before a sprint, the reading order is:

1. `ai_mcp_chat_ordo/README.md`
2. `ai_mcp_chat_ordo/docs/operations/system-architecture.md`
3. `ai_mcp_chat_ordo/docs/operations/agentic-delivery-playbook.md`
4. Files specific to the current sprint's subject (e.g., tool registry code
   for Sprint 4, RBAC middleware for Sprint 2)

Do not read the entire `ai_mcp_chat_ordo/src/` tree before every sprint. Read
what the current sprint needs and stop.