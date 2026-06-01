---
name: api-server startup schema-drift guard
description: Why ingestion is gated on a boot-time schema check, and how to react when ingestion doesn't start.
---

# Startup schema-drift guard (api-server)

At boot, api-server derives the columns it expects for the `contracts` table from
the Drizzle schema and compares them against `information_schema.columns`. HTTP
serving always starts; the **ingestion scheduler only starts when the check
returns clean**. A drift (or a failed check) logs a loud actionable ERROR and
skips ingestion.

**Why:** the DB setup is push-only (no migrations dir; post-merge runs `db push`
+ seed). In isolated/merged environments the `contracts` table repeatedly drifted
(missing ANAC/geo columns like `source_id`, `cig`, `latitude`, `geo_verify`),
which silently broke every ingestion run with 500s. Surfacing it at boot — and
not ingesting against a broken schema — turns a silent outage into one obvious
log line.

**How to apply:** if ingestion "isn't running", read the api-server boot log.
- `Database schema check passed: no drift detected.` → schema is fine, look elsewhere.
- drift/`Could not verify` ERROR → recover the schema (truncate the table if
  needed, then `pnpm -C lib/db push-force`, restart api-server). See
  `drizzle-push-truncate-prompt.md`.
- The check returns `false` on BOTH detected drift and a failed query — never
  assume "no log = fine"; a clean run always emits the explicit pass line.
