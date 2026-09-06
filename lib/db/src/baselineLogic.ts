/**
 * Shared baseline logic for transitioning a `drizzle-kit push`-bootstrapped
 * database onto the migration-based workflow.
 *
 * "Baselining" records every migration listed in the journal as already applied
 * in `drizzle.__drizzle_migrations` WITHOUT executing its SQL. Because that can
 * only be safe when the legacy schema already contains the structures represented
 * by those migrations, callers must run the compatibility checks in this module
 * before recording a baseline.
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

function migrationHash(migrationsFolder: string, tag: string): string {
  const sql = fs.readFileSync(
    path.join(migrationsFolder, `${tag}.sql`),
    "utf-8",
  );
  return crypto.createHash("sha256").update(sql).digest("hex");
}

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

export async function isSchemaBootstrapped(
  client: QueryClient,
): Promise<boolean> {
  const res = await client.query(
    "SELECT to_regclass('public.categories') IS NOT NULL AS present",
  );
  return Boolean(res.rows[0]?.["present"]);
}

/**
 * Compatibility repair for the civic issue register publication gate. Some
 * deployments were bootstrapped before the nullable `reports.published_at`
 * column was introduced. The repair is additive and idempotent.
 */
export async function ensureReportsPublishedAtColumn(
  client: QueryClient,
): Promise<void> {
  await client.query(`
    ALTER TABLE IF EXISTS "reports"
      ADD COLUMN IF NOT EXISTS "published_at" timestamp with time zone;
    CREATE INDEX IF NOT EXISTS "reports_published_at_idx"
      ON "reports" USING btree ("published_at");
  `);
}

function migrationCreatedTableNames(migrationsFolder: string): string[] {
  const journal = readJournal(migrationsFolder);
  const tables = new Set<string>();
  for (const entry of journal.entries) {
    const sql = fs.readFileSync(
      path.join(migrationsFolder, `${entry.tag}.sql`),
      "utf-8",
    );
    for (const match of sql.matchAll(/CREATE TABLE(?: IF NOT EXISTS)?\s+"([^"]+)"/giu)) {
      if (match[1]) tables.add(match[1]);
    }
  }
  return [...tables].sort();
}

/**
 * A push-bootstrapped database must not be allowed to baseline the current
 * journal merely because one old sentinel table exists. Verify that every
 * application table created anywhere in the current migration chain is already
 * present before the journal is marked as applied. Known additive column repairs
 * are handled separately before this check.
 *
 * This intentionally fails closed for an older or partial push schema. It is a
 * structural floor, not a claim that every historical column/index/constraint is
 * identical; domain-specific compatibility verifiers complement it where needed.
 */
export async function assertMigrationCreatedTablesPresent(
  client: QueryClient,
  migrationsFolder: string,
): Promise<void> {
  const missing: string[] = [];
  for (const table of migrationCreatedTableNames(migrationsFolder)) {
    const result = await client.query(
      "SELECT to_regclass($1) IS NOT NULL AS present",
      [`public.${table}`],
    );
    if (!result.rows[0]?.["present"]) missing.push(table);
  }
  if (missing.length) {
    throw new Error(
      `Refusing to baseline a stale or partial push-bootstrapped schema; ` +
      `migration-created table(s) are missing: ${missing.join(", ")}`,
    );
  }
}

/**
 * Records every migration in the journal as already applied without running its
 * SQL. Idempotent: migrations already recorded (matched by content hash) are
 * left untouched. Callers are responsible for compatibility verification before
 * invoking this function.
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
    const hash = migrationHash(migrationsFolder, entry.tag);
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

export interface MigrationStatus {
  trackingPresent: boolean;
  appliedCount: number;
  journalCount: number;
  lastAppliedTag: string | null;
  pendingTags: string[];
}

export async function getMigrationStatus(
  client: QueryClient,
  migrationsFolder: string,
): Promise<MigrationStatus> {
  const journal = readJournal(migrationsFolder);
  const orderedEntries = [...journal.entries].sort((a, b) => a.idx - b.idx);
  const hashToTag = new Map<string, string>(
    orderedEntries.map((entry) => [
      migrationHash(migrationsFolder, entry.tag),
      entry.tag,
    ]),
  );

  const trackingPresent = await isMigrationTrackingPresent(client);
  if (!trackingPresent) {
    return {
      trackingPresent: false,
      appliedCount: 0,
      journalCount: orderedEntries.length,
      lastAppliedTag: null,
      pendingTags: orderedEntries.map((entry) => entry.tag),
    };
  }

  const applied = await client.query(
    "SELECT hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at DESC, id DESC",
  );
  const appliedHashes = new Set(
    applied.rows.map((row) => String(row["hash"])),
  );

  const lastAppliedHash =
    applied.rows.length > 0 ? String(applied.rows[0]?.["hash"]) : null;
  const lastAppliedTag =
    lastAppliedHash !== null ? (hashToTag.get(lastAppliedHash) ?? null) : null;

  const pendingTags = orderedEntries
    .filter(
      (entry) =>
        !appliedHashes.has(migrationHash(migrationsFolder, entry.tag)),
    )
    .map((entry) => entry.tag);

  return {
    trackingPresent: true,
    appliedCount: applied.rows.length,
    journalCount: orderedEntries.length,
    lastAppliedTag,
    pendingTags,
  };
}
