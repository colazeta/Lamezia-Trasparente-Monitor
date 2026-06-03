---
name: drizzle migrate is atomic
description: How drizzle-orm's node-postgres migrator batches migrations and what that means for failure reporting
---
drizzle-orm's `drizzle-orm/node-postgres/migrator` `migrate()` applies every
pending migration inside a SINGLE `session.transaction(...)` (see
`pg-core/dialect.js` `migrate`). When any migration in the run throws, the whole
batch rolls back — none are recorded in `drizzle.__drizzle_migrations`.

**Why:** This means after a failed startup migration you CANNOT determine the
single failing migration from the tracking table (appliedCount is unchanged;
every migration in the run is still "pending"). The offending statement is only
identifiable from the underlying Postgres error message.

**How to apply:** `runMigrations()` (lib/db) snapshots `pendingTags` BEFORE
migrating and, on failure, throws `MigrationError` carrying `pendingMigrations`
(the whole rolled-back batch) + the pg `cause`, not a guessed single culprit.
`getMigrationStatus()` / `reportMigrationStatus()` expose last-applied tag +
counts; api-server logs them at startup and serves `/api/healthz/migrations`.
