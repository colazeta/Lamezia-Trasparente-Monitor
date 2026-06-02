/**
 * Baseline script: marks all current migrations as already applied in the
 * drizzle.__drizzle_migrations tracking table WITHOUT executing their SQL.
 *
 * Run this ONCE on databases that were bootstrapped via `drizzle-kit push`
 * (the old workflow) to safely transition them to the migration-based workflow.
 * After baselining, `pnpm --filter @workspace/db run migrate` and the
 * api-server auto-migrate will work correctly.
 *
 * Usage:
 *   pnpm --filter @workspace/db run baseline
 *
 * It is safe to run multiple times — already-recorded migrations are skipped.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(__dirname, "../migrations");
const journalPath = path.join(migrationsFolder, "meta/_journal.json");

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL must be set.");
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

const journal: Journal = JSON.parse(fs.readFileSync(journalPath, "utf-8"));

const client = new pg.Client({ connectionString: dbUrl });
await client.connect();

try {
  await client.query(`
    CREATE SCHEMA IF NOT EXISTS drizzle;
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id serial PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    );
  `);

  for (const entry of journal.entries) {
    const sqlFile = path.join(migrationsFolder, `${entry.tag}.sql`);
    const sql = fs.readFileSync(sqlFile, "utf-8");
    const hash = crypto.createHash("sha256").update(sql).digest("hex");

    const existing = await client.query(
      "SELECT id FROM drizzle.__drizzle_migrations WHERE hash = $1",
      [hash],
    );

    if (existing.rows.length > 0) {
      console.log(`  already applied: ${entry.tag}`);
    } else {
      await client.query(
        "INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)",
        [hash, Date.now()],
      );
      console.log(`  baselined: ${entry.tag}`);
    }
  }

  console.log("Baseline complete. Run `pnpm --filter @workspace/db run migrate` to apply any future migrations.");
} finally {
  await client.end();
}
