---
name: Albo "In breve" brief generation
description: How AI summaries for Albo acts are generated (lazy + proactive batch) and the cost-protection locks
---

The "In breve" (brief) AI summary for Albo Pretorio acts lives in `artifacts/api-server/src/lib/briefs.ts`, shared by three callers: the lazy path in `GET /publications/:id`, the admin endpoint `POST /admin/publications/generate-briefs`, and the ingestion cycle (`runIngestionCycle` calls `runBriefBatchGuarded` last).

**Candidate rule:** an act is a brief candidate when `brief IS NULL AND brief_manual = false`. There is NO `markdown_text IS NOT NULL` requirement — `oggetto` is always present (NOT NULL) and `generateBrief` works from the oggetto alone, so acts without extracted full text still get a preview.
**Why:** previews on the web/mobile Albo lists must populate for every act, not just opened ones; an earlier batch wrongly excluded the ~half of acts that never got `markdown_text` extracted.

**Cost protection — two in-memory locks (shared module-level state, so keep them in one module):**
- `briefGenerationInProgress` (Set, per-act): at most one LLM call in flight per act, shared between lazy and batch.
- `briefBatchRunning` (boolean, per-process): one batch at a time. `startBriefBatch()` = fire-and-forget (admin endpoint, returns 202); `runBriefBatchGuarded()` = awaited (ingestion cycle), no-op if a batch is already running or AI env unset.

**How to apply:** the batch runs last in the ingestion cycle because it depends on `extractDocumentMarkdown` having populated `markdown_text` for richer summaries. The batch is idempotent (re-checks state before each LLM call, conditional UPDATE on `brief IS NULL AND brief_manual=false`) so manual summaries always win.

**Per-act admin override (deliberate exception):** the editor can force-regenerate or hand-edit a single act's brief from the public act page (when the redazione token is in sessionStorage). `regenerateBriefNow` is the ONLY brief writer that intentionally drops the `brief IS NULL` guard — it force-overwrites and resets `brief_manual=false` (it's a fresh AI summary). The hand-edit PUT sets `brief_manual=true` (so the batch leaves it), and saving an EMPTY text clears the brief + resets `brief_manual=false` to re-enable auto generation.
