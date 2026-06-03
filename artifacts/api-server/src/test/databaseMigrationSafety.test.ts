import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { Client, Pool } from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { pushSchema } from "drizzle-kit/api";
import * as schema from "@workspace/db/schema";
import {
  baselineMigrations,
  getMigrationStatus,
  isMigrationTrackingPresent,
  isSchemaBootstrapped,
  MigrationError,
  runMigrations,
} from "@workspace/db";
import os from "node:os";

import { resolveTestDatabaseConfig } from "./testDatabase";

// `drizzle(pool)` (no schema config) resolves to this concrete type, which is
// what both `pushSchema` and `runMigrations` accept.
type ScratchDb = NodePgDatabase<Record<string, never>>;

/**
 * These tests protect the database-upgrade safety logic in
 * `lib/db/src/baselineLogic.ts` / `runMigrations()`. A regression here could
 * silently re-run schema-creation SQL against a populated production database
 * during a deploy and break startup/ingestion, so we exercise each of the three
 * possible startup states against a throwaway, freshly created database.
 */

const require = createRequire(import.meta.url);
// Resolve the @workspace/db package entry (lib/db/src/index.ts) and walk up to
// the source-tree migrations folder so the test uses the same generated SQL and
// journal that production ships.
const dbEntry = require.resolve("@workspace/db");
const migrationsFolder = path.resolve(path.dirname(dbEntry), "../migrations");

const { adminDatabaseUrl } = resolveTestDatabaseConfig();

/** Read the single generated migration's expected hash + journal timestamp. */
function readJournalExpectations(): { tag: string; hash: string; when: number } {
  const journal = JSON.parse(
    fs.readFileSync(path.join(migrationsFolder, "meta/_journal.json"), "utf-8"),
  ) as { entries: Array<{ tag: string; when: number }> };
  const entry = journal.entries[0];
  if (!entry) {
    throw new Error("expected at least one migration in the journal");
  }
  const sql = fs.readFileSync(
    path.join(migrationsFolder, `${entry.tag}.sql`),
    "utf-8",
  );
  // Drizzle's node-postgres migrator hashes the full file with sha256; the
  // baseline must record exactly that hash so the migrator treats it as applied.
  const hash = crypto.createHash("sha256").update(sql).digest("hex");
  return { tag: entry.tag, hash, when: entry.when };
}

const expected = readJournalExpectations();

/** Total number of migrations currently in the journal. */
function journalEntryCount(): number {
  const journal = JSON.parse(
    fs.readFileSync(path.join(migrationsFolder, "meta/_journal.json"), "utf-8"),
  ) as { entries: Array<unknown> };
  return journal.entries.length;
}

const journalCount = journalEntryCount();

/** Tag of the newest migration in the production journal (highest idx). */
function latestJournalTag(): string {
  const journal = JSON.parse(
    fs.readFileSync(path.join(migrationsFolder, "meta/_journal.json"), "utf-8"),
  ) as { entries: Array<{ idx: number; tag: string }> };
  const newest = [...journal.entries].sort((a, b) => b.idx - a.idx)[0];
  if (!newest) {
    throw new Error("expected at least one migration in the journal");
  }
  return newest.tag;
}

/**
 * Builds a throwaway migrations folder containing one valid migration followed
 * by one with deliberately invalid SQL, so a `runMigrations` run aborts midway.
 * Returns the temp path, both tags, and a cleanup function.
 */
function makeBrokenMigrationsFolder(): {
  path: string;
  okTag: string;
  brokenTag: string;
  cleanup: () => void;
} {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "migbroken_"));
  fs.mkdirSync(path.join(dir, "meta"), { recursive: true });

  const okTag = "0000_ok";
  const brokenTag = "0001_broken";

  fs.writeFileSync(
    path.join(dir, `${okTag}.sql`),
    "CREATE TABLE status_probe (id serial PRIMARY KEY);\n",
  );
  // Invalid SQL — references a table that does not exist, so Postgres rejects it.
  fs.writeFileSync(
    path.join(dir, `${brokenTag}.sql`),
    "ALTER TABLE does_not_exist ADD COLUMN broken integer;\n",
  );

  const journal = {
    version: "7",
    dialect: "postgresql",
    entries: [
      { idx: 0, version: "7", when: 1, tag: okTag, breakpoints: true },
      { idx: 1, version: "7", when: 2, tag: brokenTag, breakpoints: true },
    ],
  };
  fs.writeFileSync(
    path.join(dir, "meta/_journal.json"),
    JSON.stringify(journal, null, 2),
  );

  return {
    path: dir,
    okTag,
    brokenTag,
    cleanup: () => fs.rmSync(dir, { recursive: true, force: true }),
  };
}

let adminBaseUrl: URL;
const createdDatabases: string[] = [];

async function withAdmin<T>(fn: (admin: Client) => Promise<T>): Promise<T> {
  const admin = new Client({ connectionString: adminDatabaseUrl });
  await admin.connect();
  try {
    return await fn(admin);
  } finally {
    await admin.end();
  }
}

/**
 * Creates a uniquely named throwaway database and returns a connection to it
 * plus a Drizzle instance. The database is dropped in `afterEach`.
 */
async function createScratchDatabase(): Promise<{
  name: string;
  url: string;
  pool: Pool;
  db: ScratchDb;
}> {
  const name = `migsafety_${crypto.randomBytes(6).toString("hex")}`;
  await withAdmin(async (admin) => {
    await admin.query(`CREATE DATABASE "${name}"`);
  });
  createdDatabases.push(name);

  const url = new URL(adminBaseUrl.toString());
  url.pathname = `/${name}`;
  const pool = new Pool({ connectionString: url.toString() });
  const db = drizzle(pool);
  return { name, url: url.toString(), pool, db };
}

/** Applies the current schema the way `drizzle-kit push` would (no tracking). */
async function pushBootstrap(db: ScratchDb): Promise<void> {
  const { apply } = await pushSchema(schema as Record<string, unknown>, db);
  await apply();
}

interface MigrationRow {
  hash: string;
  created_at: string | number | null;
}

async function readMigrationRows(pool: Pool): Promise<MigrationRow[]> {
  const res = await pool.query<MigrationRow>(
    "SELECT hash, created_at FROM drizzle.__drizzle_migrations ORDER BY id ASC",
  );
  return res.rows;
}

async function tableExists(pool: Pool, table: string): Promise<boolean> {
  const res = await pool.query<{ present: boolean }>(
    "SELECT to_regclass($1) IS NOT NULL AS present",
    [`public.${table}`],
  );
  return Boolean(res.rows[0]?.present);
}

async function insertSentinelCategory(pool: Pool, slug: string): Promise<void> {
  await pool.query(
    "INSERT INTO categories (name, slug, description) VALUES ($1, $2, $3)",
    [`Sentinel ${slug}`, slug, "live data that must survive an upgrade"],
  );
}

async function countCategories(pool: Pool): Promise<number> {
  const res = await pool.query<{ n: number }>(
    "SELECT count(*)::int AS n FROM categories",
  );
  return Number(res.rows[0]?.n ?? 0);
}

beforeAll(() => {
  adminBaseUrl = new URL(adminDatabaseUrl);
});

afterEach(async () => {
  // Drop every scratch database created during the test, terminating any
  // lingering connections first so DROP DATABASE cannot block.
  const names = createdDatabases.splice(0, createdDatabases.length);
  await withAdmin(async (admin) => {
    for (const name of names) {
      await admin.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
    }
  });
});

describe("database upgrade safety (baselineLogic / runMigrations)", () => {
  it("records hashes with drizzle's sha256 scheme and the journal `when`", async () => {
    const scratch = await createScratchDatabase();
    try {
      const baselined = await baselineMigrations(scratch.pool, migrationsFolder);
      expect(baselined).toContain(expected.tag);

      const rows = await readMigrationRows(scratch.pool);
      expect(rows).toHaveLength(journalCount);
      // Hash must match sha256(full .sql) exactly (checked against first migration).
      expect(rows[0]?.hash).toBe(expected.hash);
      // created_at must be the journal `when` (folderMillis) so drizzle treats
      // the migration as already applied and skips it.
      expect(Number(rows[0]?.created_at)).toBe(expected.when);

      // Baselining only writes to the tracking table — it must not create any
      // application table (no schema SQL was executed).
      expect(await tableExists(scratch.pool, "categories")).toBe(false);

      // Baselining is idempotent: a second pass records nothing new.
      const again = await baselineMigrations(scratch.pool, migrationsFolder);
      expect(again).toHaveLength(0);
      expect(await readMigrationRows(scratch.pool)).toHaveLength(journalCount);
    } finally {
      await scratch.pool.end();
    }
  });

  it("State 3 — fresh/empty DB: migrate creates everything from scratch", async () => {
    const scratch = await createScratchDatabase();
    try {
      // No schema and no tracking yet.
      expect(await isSchemaBootstrapped(scratch.pool)).toBe(false);
      expect(await isMigrationTrackingPresent(scratch.pool)).toBe(false);

      await runMigrations({
        client: scratch.pool,
        database: scratch.db,
        migrationsFolder,
      });

      // The migration ran, so the schema now exists and is queryable.
      expect(await tableExists(scratch.pool, "categories")).toBe(true);
      await insertSentinelCategory(scratch.pool, "fresh");
      expect(await countCategories(scratch.pool)).toBe(1);

      // All migrations are recorded, with the first having the real hash.
      const rows = await readMigrationRows(scratch.pool);
      expect(rows).toHaveLength(journalCount);
      expect(rows[0]?.hash).toBe(expected.hash);
      expect(await isMigrationTrackingPresent(scratch.pool)).toBe(true);
    } finally {
      await scratch.pool.end();
    }
  });

  it("State 2 — push-bootstrapped DB: baseline records migrations without running their SQL, then migrate is a no-op", async () => {
    const scratch = await createScratchDatabase();
    try {
      // Simulate the old `drizzle-kit push` workflow: full schema, no tracking.
      await pushBootstrap(scratch.db);
      await insertSentinelCategory(scratch.pool, "push-bootstrapped");

      expect(await isSchemaBootstrapped(scratch.pool)).toBe(true);
      expect(await isMigrationTrackingPresent(scratch.pool)).toBe(false);

      // If runMigrations re-ran the CREATE TABLE statements this would throw
      // ("relation already exists"); completing cleanly proves the SQL was
      // skipped via baselining.
      await runMigrations({
        client: scratch.pool,
        database: scratch.db,
        migrationsFolder,
      });

      // Live data must be untouched by the upgrade.
      expect(await countCategories(scratch.pool)).toBe(1);

      // All migrations were baselined (recorded) but their SQL never re-ran,
      // and the subsequent migrate added nothing new: one tracking row per
      // journal entry, the first holding the expected hash/timestamp.
      const rows = await readMigrationRows(scratch.pool);
      expect(rows).toHaveLength(journalCount);
      expect(rows[0]?.hash).toBe(expected.hash);
      expect(Number(rows[0]?.created_at)).toBe(expected.when);
      expect(await isMigrationTrackingPresent(scratch.pool)).toBe(true);
    } finally {
      await scratch.pool.end();
    }
  });

  it("State 1 — already on the migration workflow: baseline is skipped and a re-run preserves data", async () => {
    const scratch = await createScratchDatabase();
    try {
      // Bring the database fully onto the migration workflow.
      await runMigrations({
        client: scratch.pool,
        database: scratch.db,
        migrationsFolder,
      });
      await insertSentinelCategory(scratch.pool, "already-migrated");

      const before = await readMigrationRows(scratch.pool);
      expect(before).toHaveLength(journalCount);
      expect(await isMigrationTrackingPresent(scratch.pool)).toBe(true);

      // A second deploy: tracking is present, so the baseline branch is skipped
      // and migrate applies only pending migrations (none here).
      await runMigrations({
        client: scratch.pool,
        database: scratch.db,
        migrationsFolder,
      });

      // No duplicate tracking rows and no data loss.
      const after = await readMigrationRows(scratch.pool);
      expect(after).toHaveLength(journalCount);
      expect(after[0]?.hash).toBe(expected.hash);
      expect(await countCategories(scratch.pool)).toBe(1);
    } finally {
      await scratch.pool.end();
    }
  });
});

describe("migration status reporting (getMigrationStatus / runMigrations)", () => {
  it("reports every migration as pending on a never-tracked database", async () => {
    const scratch = await createScratchDatabase();
    try {
      const status = await getMigrationStatus(scratch.pool, migrationsFolder);
      expect(status.trackingPresent).toBe(false);
      expect(status.appliedCount).toBe(0);
      expect(status.lastAppliedTag).toBeNull();
      expect(status.journalCount).toBeGreaterThan(0);
      expect(status.pendingTags).toContain(expected.tag);
      expect(status.pendingTags).toHaveLength(status.journalCount);
    } finally {
      await scratch.pool.end();
    }
  });

  it("reports the last applied tag and zero pending after a clean migrate", async () => {
    const scratch = await createScratchDatabase();
    try {
      const result = await runMigrations({
        client: scratch.pool,
        database: scratch.db,
        migrationsFolder,
      });

      // runMigrations now returns the resulting status directly.
      expect(result.trackingPresent).toBe(true);
      expect(result.pendingTags).toHaveLength(0);
      expect(result.appliedCount).toBe(result.journalCount);

      const status = await getMigrationStatus(scratch.pool, migrationsFolder);
      expect(status.lastAppliedTag).not.toBeNull();
      expect(status.pendingTags).toHaveLength(0);
      // The newest journal entry must be the one reported as last applied.
      expect(status.lastAppliedTag).toBe(latestJournalTag());
    } finally {
      await scratch.pool.end();
    }
  });

  it("throws an annotated MigrationError listing the migrations the aborted run attempted", async () => {
    const scratch = await createScratchDatabase();
    const brokenFolder = makeBrokenMigrationsFolder();
    try {
      let caught: unknown;
      try {
        await runMigrations({
          client: scratch.pool,
          database: scratch.db,
          migrationsFolder: brokenFolder.path,
        });
      } catch (err) {
        caught = err;
      }

      expect(caught).toBeInstanceOf(MigrationError);
      const error = caught as MigrationError;
      expect(error.phase).toBe("migrate");
      expect(error.detectedState).toBe("empty");
      // drizzle applies the batch atomically, so the run attempted both pending
      // migrations and rolled them all back when the second one failed.
      expect(error.pendingMigrations).toEqual([
        brokenFolder.okTag,
        brokenFolder.brokenTag,
      ]);
      expect(error.status?.appliedCount).toBe(0);
      expect(error.status?.lastAppliedTag).toBeNull();
      expect(error.message).toContain(brokenFolder.brokenTag);

      // Atomic rollback: even the valid first migration left nothing behind.
      expect(await tableExists(scratch.pool, "status_probe")).toBe(false);
    } finally {
      brokenFolder.cleanup();
      await scratch.pool.end();
    }
  });
});
