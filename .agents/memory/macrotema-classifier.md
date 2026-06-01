---
name: Macrotema (spending-area) classifier
description: Where the contract spending-area classifier lives and how its consumers resolve it
---

Contracts carry a persisted `macrotema` (spending area) plus `macrotemaManual` flag.
The classifier (`classifyMacrotema`, `isMacrotemaKey`, `MACROTEMA_KEYS`, `MacrotemaKey`)
lives in `lib/db/src/macrotemi.ts` and is re-exported from `@workspace/db`.

**Why:** It must be the single source of truth shared by both the ANAC ingestion
(api-server) and the sample-data seed (lib/db). lib/db cannot import from api-server,
so the shared logic must live in the db package.

**How to apply:**
- ANAC ingestion re-derives `macrotema` on upsert ONLY when `macrotemaManual` is false
  (editor corrections via `PATCH /contracts/:id` set it true and are authoritative).
- The seed classifies sample contracts inline at insert time.
- Existing rows with null `macrotema` are NOT touched by re-seeding (seed skips when
  the table is non-empty); backfill them with a one-off update if needed.
