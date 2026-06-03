import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

/**
 * Guards against accidentally shipping a generated migration that destroys live
 * production data. The baseline-logic tests in
 * `databaseMigrationSafety.test.ts` prove the *startup decision* (fresh vs
 * push-bootstrapped vs already-migrated) is correct, but they do not look at the
 * actual SQL drizzle generates. A future schema change could emit a migration
 * containing a `DROP TABLE`, `DROP COLUMN`, or `TRUNCATE` that silently wipes
 * data when it runs against production — and nothing would catch it.
 *
 * This test scans every `lib/db/migrations/*.sql` file and fails if any
 * statement is destructive, unless that specific statement is explicitly opted
 * in with an inline annotation that records *why* the loss is intentional:
 *
 *   -- allow-destructive: <documented reason>
 *   DROP TABLE "legacy_thing";--> statement-breakpoint
 *
 * The annotation must appear in the same statement block (delimited by drizzle's
 * `--> statement-breakpoint`) as the destructive statement, and must carry a
 * non-empty reason. When you genuinely intend to drop something, edit the
 * generated `.sql` file to add the annotation; otherwise treat a failure here as
 * a signal that the generated migration would have destroyed data.
 */

const require = createRequire(import.meta.url);
// Resolve the @workspace/db package entry (lib/db/src/index.ts) and walk up to
// the source-tree migrations folder so the scan covers exactly the SQL that
// production ships.
const dbEntry = require.resolve("@workspace/db");
const migrationsFolder = path.resolve(path.dirname(dbEntry), "../migrations");

/** Destructive DDL patterns that can irreversibly remove live data. */
const DESTRUCTIVE_PATTERNS: ReadonlyArray<{ label: string; regex: RegExp }> = [
  { label: "DROP TABLE", regex: /\bDROP\s+TABLE\b/i },
  { label: "DROP COLUMN", regex: /\bDROP\s+COLUMN\b/i },
  { label: "TRUNCATE", regex: /\bTRUNCATE\b/i },
];

const ALLOW_ANNOTATION = /--\s*allow-destructive:\s*(.+)/i;

/** Lists every generated migration SQL file in the migrations folder. */
function listMigrationFiles(): string[] {
  return fs
    .readdirSync(migrationsFolder)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .map((name) => path.join(migrationsFolder, name));
}

interface Offense {
  file: string;
  label: string;
  statement: string;
}

/**
 * Splits a migration into its statement blocks (drizzle separates them with
 * `--> statement-breakpoint`) and returns every block that contains a
 * destructive statement *without* a valid allow-destructive annotation.
 */
function findUnannotatedDestructiveStatements(
  file: string,
  sql: string,
): Offense[] {
  const offenses: Offense[] = [];
  const blocks = sql.split("--> statement-breakpoint");

  for (const block of blocks) {
    const annotationMatch = block.match(ALLOW_ANNOTATION);
    const hasDocumentedReason = Boolean(annotationMatch?.[1]?.trim());

    for (const { label, regex } of DESTRUCTIVE_PATTERNS) {
      if (!regex.test(block)) {
        continue;
      }
      if (hasDocumentedReason) {
        continue;
      }
      offenses.push({
        file: path.basename(file),
        label,
        statement: block.trim().slice(0, 200),
      });
    }
  }

  return offenses;
}

describe("migration SQL is non-destructive", () => {
  const files = listMigrationFiles();

  it("finds at least one migration to scan", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("contains no unannotated DROP TABLE / DROP COLUMN / TRUNCATE statements", () => {
    const offenses: Offense[] = [];
    for (const file of files) {
      const sql = fs.readFileSync(file, "utf-8");
      offenses.push(...findUnannotatedDestructiveStatements(file, sql));
    }

    if (offenses.length > 0) {
      const details = offenses
        .map(
          (o) =>
            `  - ${o.file}: ${o.label}\n      ${o.statement.replace(/\n/g, "\n      ")}`,
        )
        .join("\n");
      throw new Error(
        `Found ${offenses.length} destructive migration statement(s) that would ` +
          `wipe live data:\n${details}\n\n` +
          `If a drop/truncate is genuinely intended, edit the generated .sql file ` +
          `and add an inline annotation in the same statement block documenting why ` +
          `the data loss is safe, e.g.:\n` +
          `  -- allow-destructive: column unused since v2, confirmed empty in prod\n` +
          `Otherwise, do NOT ship this migration — it will destroy production data.`,
      );
    }

    expect(offenses).toHaveLength(0);
  });
});
