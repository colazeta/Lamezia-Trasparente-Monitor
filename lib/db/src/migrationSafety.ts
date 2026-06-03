/**
 * Pre-flight safety scan for generated migration SQL.
 *
 * `runMigrations()` (see migrate.ts) is a *reactive* safety net: it detects and
 * reports problems at startup, after a deploy. It cannot stop a *destructive*
 * migration — a `DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, or a non-idempotent
 * column rewrite — from reaching the published database in the first place.
 *
 * This module is the *proactive* counterpart. It scans the generated `.sql`
 * files in the migrations folder for statements that can irreversibly remove or
 * corrupt live data, so they can be flagged for explicit review during
 * development / CI before they ship. It is consumed by:
 * - `checkMigrations.ts` — the CLI (`pnpm --filter @workspace/db run
 *   check-migrations`, also chained after `generate`) that fails the build when
 *   an unannotated destructive statement is found.
 * - the api-server test suite, which asserts the committed migrations are clean.
 *
 * ### Opting in to an intentional destructive change
 * When a drop / truncate / rewrite is genuinely intended, edit the generated
 * `.sql` file and add an inline annotation in the *same* statement block
 * (drizzle delimits blocks with `--> statement-breakpoint`) documenting why the
 * data loss is safe:
 *
 *   -- allow-destructive: column unused since v2, confirmed empty in prod
 *   ALTER TABLE "thing" DROP COLUMN "legacy";--> statement-breakpoint
 *
 * The annotation must carry a non-empty reason; a bare `-- allow-destructive:`
 * does not silence the check.
 */
import fs from "node:fs";
import path from "node:path";

export interface DestructivePattern {
  /** Human-readable name shown in the report. */
  label: string;
  /** Matches the destructive statement anywhere in a statement block. */
  regex: RegExp;
}

/**
 * DDL patterns that can irreversibly remove or corrupt live data. `SET DATA
 * TYPE` is included because drizzle emits it for a column type change, which is
 * a non-idempotent rewrite that can truncate values or fail the cast against
 * existing rows — exactly the kind of migration that must be reviewed by hand
 * before it runs against production.
 */
export const DESTRUCTIVE_PATTERNS: ReadonlyArray<DestructivePattern> = [
  { label: "DROP TABLE", regex: /\bDROP\s+TABLE\b/i },
  { label: "DROP COLUMN", regex: /\bDROP\s+COLUMN\b/i },
  { label: "TRUNCATE", regex: /\bTRUNCATE\b/i },
  { label: "DROP SCHEMA", regex: /\bDROP\s+SCHEMA\b/i },
  {
    label: "ALTER COLUMN type change (non-idempotent rewrite)",
    regex: /\bSET\s+DATA\s+TYPE\b/i,
  },
];

/** Inline opt-in: `-- allow-destructive: <reason>` with a non-empty reason. */
export const ALLOW_ANNOTATION = /--\s*allow-destructive:\s*(.+)/i;

export interface DestructiveOffense {
  /** Basename of the offending migration file. */
  file: string;
  /** Which {@link DESTRUCTIVE_PATTERNS} label matched. */
  label: string;
  /** The (truncated) statement block that triggered the match. */
  statement: string;
}

/**
 * Splits a single migration's SQL into its statement blocks (drizzle separates
 * them with `--> statement-breakpoint`) and returns every block that contains a
 * destructive statement *without* a valid allow-destructive annotation.
 */
export function findDestructiveStatements(
  fileName: string,
  sql: string,
): DestructiveOffense[] {
  const offenses: DestructiveOffense[] = [];
  const blocks = sql.split("--> statement-breakpoint");

  for (const block of blocks) {
    const annotationMatch = block.match(ALLOW_ANNOTATION);
    const hasDocumentedReason = Boolean(annotationMatch?.[1]?.trim());
    if (hasDocumentedReason) {
      continue;
    }

    for (const { label, regex } of DESTRUCTIVE_PATTERNS) {
      if (!regex.test(block)) {
        continue;
      }
      offenses.push({
        file: fileName,
        label,
        statement: block.trim().slice(0, 200),
      });
    }
  }

  return offenses;
}

/** Lists every generated `*.sql` migration file in the folder, sorted. */
export function listMigrationFiles(migrationsFolder: string): string[] {
  return fs
    .readdirSync(migrationsFolder)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .map((name) => path.join(migrationsFolder, name));
}

/**
 * Scans every migration file in `migrationsFolder` and returns all unannotated
 * destructive statements found across them.
 */
export function scanMigrationsFolder(
  migrationsFolder: string,
): DestructiveOffense[] {
  const offenses: DestructiveOffense[] = [];
  for (const file of listMigrationFiles(migrationsFolder)) {
    const sql = fs.readFileSync(file, "utf-8");
    offenses.push(...findDestructiveStatements(path.basename(file), sql));
  }
  return offenses;
}

/**
 * Renders a human-readable report naming each offending migration file and the
 * risky statement, with guidance on how to opt in when the loss is intentional.
 */
export function formatOffenses(offenses: ReadonlyArray<DestructiveOffense>): string {
  const details = offenses
    .map(
      (o) =>
        `  - ${o.file}: ${o.label}\n      ${o.statement.replace(/\n/g, "\n      ")}`,
    )
    .join("\n");

  return (
    `Found ${offenses.length} destructive migration statement(s) that would ` +
    `wipe or corrupt live data:\n${details}\n\n` +
    `If a drop/truncate/rewrite is genuinely intended, edit the generated .sql ` +
    `file and add an inline annotation in the same statement block documenting ` +
    `why the data loss is safe, e.g.:\n` +
    `  -- allow-destructive: column unused since v2, confirmed empty in prod\n` +
    `Otherwise, do NOT ship this migration — it will destroy production data.`
  );
}
