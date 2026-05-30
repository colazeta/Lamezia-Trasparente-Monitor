---
name: drizzle-kit push truncate prompt blocks non-TTY merges
description: Why post-merge seed/push can fail with errorMissingColumn, and how to recover
---

When drizzle-kit `push` must add a unique constraint to a table that already
has rows (e.g. `contracts_source_id_unique`), it shows an interactive
"Do you want to truncate <table>?" data-loss prompt. In a non-TTY context
(post-merge setup, CI, agent-run shells) this throws
"Interactive prompts require a TTY terminal" and aborts.

**Key gotcha:** `push --force` (our `push-force` script) does NOT bypass this
particular truncate/data-loss prompt — it still blocks.

**Symptom chain:** push aborts -> schema never updates -> `seed` then fails
with `column <x> does not exist` (e.g. `contracts.cig`) and the whole
post-merge setup (and api-server/seed) breaks.

**Recovery (dev DB):** `psql "$DATABASE_URL" -c 'TRUNCATE TABLE <table> CASCADE;'`
then `pnpm --filter @workspace/db run push-force` then `... run seed`. Once the
constraint is actually applied, the schema is in sync and future `push` runs no
longer prompt. Contracts are re-seeded + re-ingested from ANAC on api-server boot.

**Why:** the prompt only appears while the constraint is pending; emptying the
table lets drizzle add it without a data-loss confirmation.
