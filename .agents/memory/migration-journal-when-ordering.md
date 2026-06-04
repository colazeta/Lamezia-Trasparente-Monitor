---
name: Hand-authored migration journal `when` must be monotonic
description: Why a new migration's _journal.json "when" must exceed the prior entry's, or migration-status reports the wrong lastAppliedTag.
---

# Migration journal `when` ordering

When hand-authoring a migration + its `meta/_journal.json` entry, the new entry's
`when` (folderMillis) MUST be strictly greater than the previous entry's `when`.

**Why:** `getMigrationStatus` (and the api-server boot log) compute
`lastAppliedTag` by ordering `drizzle.__drizzle_migrations` rows by
`created_at DESC`, and both the drizzle migrator and `baselineMigrations` write
each row's `created_at` from the journal `when`. A too-small `when` makes the new
migration sort *before* an older one, so the newest tag is mis-reported as not-last.
`databaseMigrationSafety.test.ts` asserts `lastAppliedTag === latest journal tag`
and fails loudly when this happens (even though the schema is functionally correct).

**How to apply:** copy the prior entry's `when` and add a small delta (e.g.
+3600000). If you already baselined a bad value into a live DB, fix it with
`UPDATE drizzle.__drizzle_migrations SET created_at=<new> WHERE created_at=<old>`
(the SQL-file hash is unchanged, so hash→tag mapping still matches).
