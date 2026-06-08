import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";
import { db, pool } from "./client";
import {
  baselineMigrations,
  ensureReportsPublishedAtColumn,
  getMigrationStatus,
  isMigrationTrackingPresent,
  isSchemaBootstrapped,
  type MigrationStatus,
  type QueryClient,
} from "./baselineLogic";

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
/**
 * Optional dependency overrides for {@link runMigrations}. They default to the
 * shared singleton pool/db and the bundled migrations folder, so production
 * callers invoke `runMigrations()` with no arguments. Tests inject a throwaway
 * database (and the source-tree migrations folder) to exercise each startup
 * state in isolation without touching the real database.
 */
export interface RunMigrationsDeps {
  /** Low-level query client used for the baseline detection/recording step. */
  client?: QueryClient;
  /** Drizzle instance the migrator applies pending migrations against. */
  database?: Parameters<typeof migrate>[0];
  /** Folder containing the generated `*.sql` migrations and `meta/_journal.json`. */
  migrationsFolder?: string;
}

/**
 * The startup state {@link runMigrations} detected before doing any work:
 * - `empty`             — no schema and no tracking; a fresh database.
 * - `push-bootstrapped` — schema exists from `drizzle-kit push` but has never
 *                         been tracked; needs a one-time baseline first.
 * - `tracked`           — already on the migration workflow.
 */
export type MigrationStartupState = "empty" | "push-bootstrapped" | "tracked";

/**
 * Thrown when {@link runMigrations} aborts. Carries the state that was detected
 * before migrating and the set of migrations the run was attempting, so the
 * startup logs say exactly what went wrong instead of surfacing only an opaque
 * Postgres error.
 *
 * Note: drizzle applies every pending migration inside a single transaction, so
 * a failure rolls the whole batch back — none of `pendingMigrations` are
 * applied. The offending statement is identified by the underlying Postgres
 * error (`cause`); the batch is all-or-nothing, so we report the full set rather
 * than guessing a single culprit from the (unchanged) post-failure state.
 */
export class MigrationError extends Error {
  constructor(
    /** Which phase failed: recording the baseline or applying migrations. */
    readonly phase: "baseline" | "migrate",
    /** The database state detected before migrating. */
    readonly detectedState: MigrationStartupState,
    /**
     * The migrations the run was attempting (pending before it started). Empty
     * for the baseline phase. Because the migrate phase is atomic, all of these
     * were rolled back when the failure occurred.
     */
    readonly pendingMigrations: string[],
    /** Best-effort status snapshot taken after the failure (may be null). */
    readonly status: MigrationStatus | null,
    /** The underlying error thrown by drizzle / Postgres. */
    readonly cause: unknown,
  ) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    const where =
      phase === "baseline"
        ? " while recording the baseline"
        : pendingMigrations.length > 0
          ? ` while applying ${pendingMigrations.length} pending migration(s) ` +
            `[${pendingMigrations.join(", ")}] (atomic — none were applied)`
          : "";
    super(
      `Database migration aborted${where} (detected state: ${detectedState}): ${detail}`,
    );
    this.name = "MigrationError";
  }
}

async function safeStatus(
  client: QueryClient,
  folder: string,
): Promise<MigrationStatus | null> {
  try {
    return await getMigrationStatus(client, folder);
  } catch {
    return null;
  }
}

/**
 * Applies pending migrations and returns the resulting {@link MigrationStatus}
 * (last applied tag, applied/journal counts) so a deploy can be verified at a
 * glance. Throws {@link MigrationError} — annotated with the detected state and
 * the failing migration — when it cannot complete.
 */
export async function runMigrations(
  deps: RunMigrationsDeps = {},
): Promise<MigrationStatus> {
  const client = deps.client ?? pool;
  const database = deps.database ?? db;
  const folder = deps.migrationsFolder ?? migrationsFolder;

  // First-time transition guard: a database bootstrapped via `drizzle-kit push`
  // already has the full schema but no migration-tracking record. Running the
  // migrator against it would attempt to re-execute CREATE TABLE statements that
  // already exist and fail. Detect that case, run the idempotent compatibility
  // repair for the reports publication column, then baseline (record migrations
  // as applied without running their SQL) before migrating. The repair is
  // additive and non-destructive; the baseline itself only writes Drizzle
  // tracking rows.
  const tracked = await isMigrationTrackingPresent(client);
  const detectedState: MigrationStartupState = tracked
    ? "tracked"
    : (await isSchemaBootstrapped(client))
      ? "push-bootstrapped"
      : "empty";

  if (detectedState === "push-bootstrapped") {
    try {
      await ensureReportsPublishedAtColumn(client);
      await baselineMigrations(client, folder);
    } catch (err) {
      throw new MigrationError(
        "baseline",
        detectedState,
        [],
        await safeStatus(client, folder),
        err,
      );
    }
  }

  // Snapshot what this run is about to apply, before migrating. drizzle applies
  // the whole batch atomically, so on failure these are the migrations that were
  // rolled back together.
  const before = await safeStatus(client, folder);

  try {
    await migrate(database, { migrationsFolder: folder });
    await ensureReportsPublishedAtColumn(client);
  } catch (err) {
    throw new MigrationError(
      "migrate",
      detectedState,
      before?.pendingTags ?? [],
      await safeStatus(client, folder),
      err,
    );
  }

  return getMigrationStatus(client, folder);
}

/**
 * Reports the current {@link MigrationStatus} of the production database without
 * modifying it, using the same default pool and bundled migrations folder as
 * {@link runMigrations}. Intended for a startup health log and/or a health
 * endpoint that verifies the deploy landed on the expected migration.
 */
export async function reportMigrationStatus(
  deps: Pick<RunMigrationsDeps, "client" | "migrationsFolder"> = {},
): Promise<MigrationStatus> {
  const client = deps.client ?? pool;
  const folder = deps.migrationsFolder ?? migrationsFolder;
  return getMigrationStatus(client, folder);
}
