---
name: Dev DB schema drift in isolated task environments
description: How to fix "column does not exist" 500s when an isolated env's database is behind the Drizzle schema
---

In an isolated task/parallel environment, the local Postgres can lag behind `lib/db` schema, so API routes 500 with `error: column "<x>" does not exist` (e.g. contracts missing `source_id`).

**Fix:** `pnpm -C lib/db push-force`. Note `--force` STILL shows an interactive truncate prompt when adding a unique/NOT NULL column to a table that already has rows, and the shell is non-TTY so it errors. Workaround: `TRUNCATE TABLE <table> RESTART IDENTITY;` first (via the database skill's executeSql), then re-run push-force, then restart the api-server workflow.

**Why:** feeds like ANAC contracts re-ingest on api-server startup, so truncating is safe — the restart repopulates the table with the corrected schema.

**How to apply:** when a read endpoint 500s on a missing column, suspect drift before touching code; verify the column genuinely doesn't exist, then push schema rather than editing routes.

**Newly-added tables (e.g. `questions`):** an isolated env may be missing the whole table → endpoint 500s `Errore interno del server`. A plain `pnpm -C lib/db push-force` creates new tables with NO truncate prompt (nothing to drop). Then `pnpm -C lib/db seed` populates sample/curated data; the seed is idempotent (skips each block if rows already exist), so it's safe to re-run.

**Fresh/empty isolated env (all endpoints 500):** symptom is every route failing with Neon's `error: The endpoint has been disabled. Enable it using the API and retry.` and `checkDatabase()` may report `provisioned: false` even though `createDatabase()` says it already exists. The endpoint is just asleep — the first `executeSql` (via the database skill) wakes it. Then `pnpm -C lib/db push` (no force needed on an empty DB) creates the schema, and restarting the api-server workflow re-ingests the feeds. Retrying HTTP requests alone does NOT wake it; you must hit it through the database tool.
