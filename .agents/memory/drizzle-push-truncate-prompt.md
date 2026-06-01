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

## Variant 2: text -> numeric column can't auto-cast (same cascade)

Converting a column type (e.g. `attuazione_pnrr_projects.importo_finanziato`
text -> `numeric(14,2)`) makes `push` abort with
`column ... cannot be cast automatically to type numeric` BEFORE it applies any
other pending changes (new columns/indexes). Result: same cascade — later
columns (e.g. `publications.last_seen_at`) never get added and `seed` then dies
with `column ... does not exist`.

**Data gotcha:** in this dev DB the legacy `importo_finanziato` values are
Italian-formatted currency strings like `1.512.000,00 €` (dot = thousands,
comma = decimal, trailing €) — NOT plain decimals. A naive `::numeric` cast
fails/corrupts. A merging task's "values were plain decimals so a direct cast
worked" can be true in its isolated env but false here.

**Recovery:** run the type change manually with a parsing USING clause, then
`push` + `seed`:
`ALTER TABLE attuazione_pnrr_projects ALTER COLUMN importo_finanziato TYPE numeric(14,2) USING NULLIF(replace(replace(regexp_replace(importo_finanziato,'[^0-9.,]','','g'),'.',''),',','.'),'')::numeric(14,2);`
Verify there are no genuine plain-decimal rows first (that parse would corrupt
`5000.00` -> `500000`); here all rows were euro-formatted or empty.

**General pattern:** both variants = `push` aborts on a migration it won't do
non-interactively/automatically -> seed crashes on a missing column. Fix the one
blocking DDL by hand (truncate, or manual ALTER...USING), then re-run push+seed.
