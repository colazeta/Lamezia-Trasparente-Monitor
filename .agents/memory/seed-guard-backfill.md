---
name: Seed count-guard vs new columns
description: Why seed values don't appear on existing rows after adding a column, and how to backfill
---

Each `seed*` function in `lib/db/src/seed.ts` has a `count > 0` skip guard (idempotent).

**Symptom:** After adding a new column (e.g. `referenceYear`) and applying it with `pnpm -C lib/db push-force` (which adds the nullable column to *existing* rows as NULL), the new seed values never appear in the UI/API — rows keep NULL.

**Why:** push-force only alters the table; it does not re-run seed. And re-running `pnpm -C lib/db seed` is a no-op because the table already has rows (guard trips).

**How to apply:** In the isolated dev env, to backfill seed-provided values for a single table: `TRUNCATE <table>, <child_tables> RESTART IDENTITY CASCADE;` then `pnpm -C lib/db seed`, then the data is fresh. Don't expect push-force alone to populate new seed columns.
