import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";
import { db, pool } from "./client";
import {
  assertMigrationCreatedTablesPresent,
  baselineMigrations,
  ensureReportsPublishedAtColumn,
  getMigrationStatus,
  isMigrationTrackingPresent,
  isSchemaBootstrapped,
  type MigrationStatus,
  type QueryClient,
} from "./baselineLogic";
import { removeLegacyConfiscatedAssetDemoRows } from "./confiscatedAssetsCleanup";
import {
  ensureLegacyConversationTables,
  verifyLegacyConversationTables,
} from "./legacySchemaCompatibility";

const migrationsFolder = path.join(__dirname, "migrations");

export interface RunMigrationsDeps {
  client?: QueryClient;
  database?: Parameters<typeof migrate>[0];
  migrationsFolder?: string;
}

export type MigrationStartupState = "empty" | "push-bootstrapped" | "tracked";

/**
 * Represents a failure inside Drizzle's atomic migration transaction. Only the
 * `migrate(...)` call is wrapped as this error: post-commit compatibility checks
 * deliberately use a different error class so we never claim committed DDL was
 * rolled back when a later verification failed.
 */
export class MigrationError extends Error {
  constructor(
    readonly phase: "baseline" | "migrate",
    readonly detectedState: MigrationStartupState,
    readonly pendingMigrations: string[],
    readonly status: MigrationStatus | null,
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

/**
 * Startup is blocked because the physical schema could not be proven compatible.
 * When `stage` is `post-migrate`, Drizzle may already have committed migrations;
 * the message states that explicitly rather than misreporting an atomic rollback.
 */
export class SchemaCompatibilityError extends Error {
  constructor(
    readonly stage: "pre-baseline" | "post-migrate",
    readonly detectedState: MigrationStartupState,
    readonly cause: unknown,
  ) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    const commitNote = stage === "post-migrate"
      ? " Pending migrations may already be committed; startup is blocked until physical schema compatibility is restored."
      : " No migration baseline was recorded.";
    super(`Database schema compatibility check failed during ${stage} (detected state: ${detectedState}): ${detail}.${commitNote}`);
    this.name = "SchemaCompatibilityError";
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

async function preparePushBootstrapCompatibility(
  client: QueryClient,
  folder: string,
): Promise<void> {
  await ensureReportsPublishedAtColumn(client);
  await ensureLegacyConversationTables(client);
  await verifyLegacyConversationTables(client);
  await assertMigrationCreatedTablesPresent(client, folder);
}

async function verifyPostMigrationCompatibility(
  client: QueryClient,
): Promise<void> {
  await ensureReportsPublishedAtColumn(client);
  await ensureLegacyConversationTables(client);
  await verifyLegacyConversationTables(client);
}

export async function runMigrations(
  deps: RunMigrationsDeps = {},
): Promise<MigrationStatus> {
  const client = deps.client ?? pool;
  const database = deps.database ?? db;
  const folder = deps.migrationsFolder ?? migrationsFolder;

  const tracked = await isMigrationTrackingPresent(client);
  const detectedState: MigrationStartupState = tracked
    ? "tracked"
    : (await isSchemaBootstrapped(client))
      ? "push-bootstrapped"
      : "empty";

  if (detectedState === "push-bootstrapped") {
    try {
      // A single sentinel table is not sufficient evidence that an old push
      // schema matches today's journal. Apply only explicitly additive repairs,
      // then prove every migration-created table is present before recording the
      // baseline. Older/partial push schemas therefore fail closed.
      await preparePushBootstrapCompatibility(client, folder);
    } catch (err) {
      throw new SchemaCompatibilityError("pre-baseline", detectedState, err);
    }

    try {
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

  const before = await safeStatus(client, folder);

  // Drizzle owns the atomic migration transaction. Keep this catch scoped to
  // migrate() itself so the rollback guarantee in MigrationError stays true.
  try {
    await migrate(database, { migrationsFolder: folder });
  } catch (err) {
    throw new MigrationError(
      "migrate",
      detectedState,
      before?.pendingTags ?? [],
      await safeStatus(client, folder),
      err,
    );
  }

  try {
    await verifyPostMigrationCompatibility(client);
  } catch (err) {
    throw new SchemaCompatibilityError("post-migrate", detectedState, err);
  }

  // This signature-locked cleanup intentionally remains outside the atomic
  // migration catch because migrations have already committed at this point.
  await removeLegacyConfiscatedAssetDemoRows(client);

  return getMigrationStatus(client, folder);
}

export async function reportMigrationStatus(
  deps: Pick<RunMigrationsDeps, "client" | "migrationsFolder"> = {},
): Promise<MigrationStatus> {
  const client = deps.client ?? pool;
  const folder = deps.migrationsFolder ?? migrationsFolder;
  return getMigrationStatus(client, folder);
}
