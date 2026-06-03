---
name: Half-tracked migration drift (isolated env)
description: When the drizzle tracking table records some migrations but later tables exist untracked, baseline instead of truncating.
---

# Half-tracked migration drift

In an isolated env the api-server can fail to boot with a `MigrationError` whose
cause is `relation "<table>" already exists` while `detectedState: "tracked"`.

This happens when `drizzle.__drizzle_migrations` has *some* rows (e.g. only
`0000`) so `isMigrationTrackingPresent` returns true (state = "tracked", so the
self-baseline is skipped), yet later migrations' tables were created by an
out-of-band `push` and were never recorded. The atomic migrator then tries to
re-run those CREATE TABLEs and the whole batch rolls back.

**Fix:** run `pnpm -C lib/db run baseline` (it calls `baselineMigrations`,
recording every journal entry by file-hash, idempotently — only the missing
tags get inserted). Then restart the api-server; migration state becomes
"up to date" and the ingestion scheduler starts.

**Why:** the data/DDL already exists; only drizzle's tracking is behind. Do NOT
truncate tables or re-run SQL — that's destructive and unnecessary.

**How to apply:** any new migration you add (which appends a pending tag) will
surface this latent drift, because it forces the migrator to attempt the whole
pending batch. After hand-authoring a migration + adding its `_journal.json`
entry, if boot fails this way, baseline first.
