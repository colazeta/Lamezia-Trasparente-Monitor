import path from "node:path";
import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";
import {
  type DestructiveOffense,
  formatOffenses,
  listMigrationFiles,
  scanMigrationsFolder,
} from "@workspace/db";

/**
 * Guards against accidentally shipping a generated migration that destroys live
 * production data. The baseline-logic tests in
 * `databaseMigrationSafety.test.ts` prove the *startup decision* (fresh vs
 * push-bootstrapped vs already-migrated) is correct, but they do not look at the
 * actual SQL drizzle generates. A future schema change could emit a migration
 * containing a `DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, or a non-idempotent
 * column rewrite that silently wipes or corrupts data when it runs against
 * production — and nothing would catch it.
 *
 * This test reuses the shared pre-flight scanner in `@workspace/db`
 * (`migrationSafety.ts`, which also backs the `check-migrations` CLI) so the
 * test suite and the development/CI pre-flight check enforce exactly the same
 * rules. A destructive statement is only allowed when it carries an inline
 * `-- allow-destructive: <reason>` annotation in the same statement block.
 */

const require = createRequire(import.meta.url);
// Resolve the @workspace/db package entry (lib/db/src/index.ts) and walk up to
// the source-tree migrations folder so the scan covers exactly the SQL that
// production ships.
const dbEntry = require.resolve("@workspace/db");
const migrationsFolder = path.resolve(path.dirname(dbEntry), "../migrations");

describe("migration SQL is non-destructive", () => {
  it("finds at least one migration to scan", () => {
    expect(listMigrationFiles(migrationsFolder).length).toBeGreaterThan(0);
  });

  it("contains no unannotated DROP TABLE / DROP COLUMN / TRUNCATE / rewrite statements", () => {
    const offenses: DestructiveOffense[] = scanMigrationsFolder(migrationsFolder);

    if (offenses.length > 0) {
      throw new Error(formatOffenses(offenses));
    }

    expect(offenses).toHaveLength(0);
  });
});
