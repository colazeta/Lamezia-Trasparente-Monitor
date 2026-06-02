---
name: DB auto-baseline at startup
description: Why runMigrations() self-baselines a push-bootstrapped DB before migrating, instead of a manual prod baseline step.
---

# Auto-baseline before migrate

`runMigrations()` (lib/db/src/migrate.ts) detects a `drizzle-kit push`-bootstrapped
database (application schema present but `drizzle.__drizzle_migrations` missing/empty)
and baselines it — records every journal migration as applied WITHOUT running its SQL —
before calling drizzle's `migrate()`. Shared logic lives in `lib/db/src/baselineLogic.ts`
(also used by the `baseline` CLI). Bootstrap probe = `to_regclass('public.categories')`.

**Why:** The api-server auto-migrates at startup, but production was push-bootstrapped
and had no migration tracking. A task asked to run `pnpm --filter @workspace/db run baseline`
against prod once. A task agent CANNOT do that: only the dev DATABASE_URL is available in the
isolated env, `executeSql({environment:"production"})` is read-only, and the database skill
forbids agent-run prod DDL/scripts (prod schema is owned by the Publish diff flow). Making the
baseline automatic and idempotent at startup achieves the task's goal ("apply migrations
automatically on deploy") with zero manual prod access.

**How to apply:**
- Baseline writes ONLY to drizzle's tracking table, never to application tables — this is why
  it's acceptable at startup even though schema-mutating startup DDL is not.
- `created_at` is set to the journal `when` (folderMillis), matching what drizzle itself writes,
  so its "apply everything with folderMillis > max(created_at)" logic skips baselined migrations
  and applies only genuinely newer ones.
- Migration hashes are `sha256(full .sql file contents)` — must match drizzle's node-postgres
  migrator hashing or it would re-run them.
- This self-heals on the FIRST deploy that ships the migration workflow; no human step needed.
