import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";
import { db } from "./client";

// When bundled by esbuild the build copies lib/db/migrations/ next to the
// bundle entrypoint as dist/migrations/, so __dirname resolves correctly in
// both dev (tsx) and production (bundled dist/index.mjs) contexts.
const migrationsFolder = path.join(__dirname, "migrations");

/**
 * Applies all pending Drizzle migrations from the `migrations/` directory.
 *
 * This is the safe, non-interactive way to keep the database schema in sync:
 * - Never truncates or drops existing rows
 * - Idempotent: already-applied migrations are skipped (tracked in
 *   `drizzle.__drizzle_migrations`)
 * - Works in CI and production without a TTY
 *
 * ### Adding a migration after a schema change
 * 1. Edit the table(s) in `lib/db/src/schema/`
 * 2. `pnpm --filter @workspace/db run generate`  — creates a new SQL file
 * 3. `pnpm --filter @workspace/db run migrate`   — applies it (non-interactive)
 * 4. `git add lib/db/migrations/`               — commit the generated file
 *
 * The API server calls `runMigrations()` automatically at startup so the
 * schema is always up to date before ingestion begins.
 *
 * ### First-time setup on a database bootstrapped via `push`
 * If the database was previously brought up with `drizzle-kit push` (the old
 * workflow), run the baseline command ONCE to mark all existing migrations as
 * already applied without re-executing their SQL:
 *
 *   pnpm --filter @workspace/db run baseline
 *
 * After that, `migrate` and the api-server auto-migrate will work normally.
 */
export async function runMigrations(): Promise<void> {
  await migrate(db, { migrationsFolder });
}
