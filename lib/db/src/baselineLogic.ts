/**
 * Shared baseline logic for transitioning a `drizzle-kit push`-bootstrapped
 * database onto the migration-based workflow.
 *
 * "Baselining" records every migration listed in the journal as already applied
 * in `drizzle.__drizzle_migrations` WITHOUT executing its SQL. It only writes to
 * Drizzle's internal tracking table — it never creates, alters, or drops any
 * application table or row.
 *
 * This is consumed by:
 * - `baseline.ts`        — the manual one-shot CLI (`pnpm ... run baseline`)
 * - `migrate.ts`         — `runMigrations()` self-baselines at startup when it
 *                          detects a push-bootstrapped database (schema already
 *                          exists but has no migration-tracking record), so the
 *                          first deploy onto the migration workflow does not try
 *                          to re-run CREATE TABLE statements that already exist.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export interface QueryClient {
  query: (
    text: string,
    params?: unknown[],
  ) => Promise<{ rows: Array<Record<string, unknown>> }>;
}

interface JournalEntry {
  idx: number;
  tag: string;
  when: number;
  breakpoints: boolean;
}

interface Journal {
  entries: JournalEntry[];
}

function readJournal(migrationsFolder: string): Journal {
  const journalPath = path.join(migrationsFolder, "meta/_journal.json");
  return JSON.parse(fs.readFileSync(journalPath, "utf-8")) as Journal;
}

/**
 * True when Drizzle's migration-tracking table exists AND has at least one
 * recorded migration. An empty (or missing) tracking table means the database
 * has never been driven by the migration workflow.
 */
export async function isMigrationTrackingPresent(
  client: QueryClient,
): Promise<boolean> {
  const exists = await client.query(
    "SELECT to_regclass('drizzle.__drizzle_migrations') IS NOT NULL AS present",
  );
  if (!exists.rows[0]?.["present"]) {
    return false;
  }
  const count = await client.query(
    "SELECT count(*)::int AS n FROM drizzle.__drizzle_migrations",
  );
  return Number(count.rows[0]?.["n"] ?? 0) > 0;
}

/**
 * True when the application schema already exists (the database was previously
 * brought up via `drizzle-kit push`). We probe a core table that is present in
 * the very first migration; if it exists, re-running the initial CREATE TABLE
 * statements would fail, so the database must be baselined rather than migrated
 * from scratch.
 */
export async function isSchemaBootstrapped(
  client: QueryClient,
): Promise<boolean> {
  const res = await client.query(
    "SELECT to_regclass('public.categories') IS NOT NULL AS present",
  );
  return Boolean(res.rows[0]?.["present"]);
}

/**
 * Records every migration in the journal as already applied without running its
 * SQL. Idempotent: migrations already recorded (matched by content hash) are
 * left untouched. `created_at` is set to the migration's journal timestamp
 * (`folderMillis`) so Drizzle's "apply everything newer than the latest
 * recorded migration" logic behaves identically to a normally-migrated DB.
 *
 * Returns the list of migration tags that were newly baselined.
 */
export async function baselineMigrations(
  client: QueryClient,
  migrationsFolder: string,
): Promise<string[]> {
  const journal = readJournal(migrationsFolder);

  await client.query(`
    CREATE SCHEMA IF NOT EXISTS drizzle;
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id serial PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    );
  `);

  const baselined: string[] = [];

  for (const entry of journal.entries) {
    const sqlFile = path.join(migrationsFolder, `${entry.tag}.sql`);
    const sql = fs.readFileSync(sqlFile, "utf-8");
    // Drizzle's node-postgres migrator hashes the full file contents with
    // sha256; match that exactly so it recognises these as already applied.
    const hash = crypto.createHash("sha256").update(sql).digest("hex");

    const existing = await client.query(
      "SELECT id FROM drizzle.__drizzle_migrations WHERE hash = $1",
      [hash],
    );

    if (existing.rows.length === 0) {
      await client.query(
        "INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)",
        [hash, entry.when],
      );
      baselined.push(entry.tag);
    }
  }

  return baselined;
}
