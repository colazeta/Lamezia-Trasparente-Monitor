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
 *
 * NOTE: The api-server now self-baselines at startup (see migrate.ts), so this
 * manual script is rarely needed. It remains available for operators who want
 * to baseline a database out-of-band.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { baselineMigrations } from "./baselineLogic";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(__dirname, "../migrations");

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL must be set.");
}

const client = new pg.Client({ connectionString: dbUrl });
await client.connect();

try {
  const baselined = await baselineMigrations(client, migrationsFolder);
  if (baselined.length === 0) {
    console.log("  nothing to baseline: all migrations already recorded.");
  } else {
    for (const tag of baselined) {
      console.log(`  baselined: ${tag}`);
    }
  }
  console.log(
    "Baseline complete. Run `pnpm --filter @workspace/db run migrate` to apply any future migrations.",
  );
} finally {
  await client.end();
}
