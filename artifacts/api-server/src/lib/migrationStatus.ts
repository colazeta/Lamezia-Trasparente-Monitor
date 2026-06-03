import { reportMigrationStatus, type MigrationStatus } from "@workspace/db";
import { logger } from "./logger";

/**
 * Writes a single, scannable line summarising the database's migration state at
 * startup so a deploy can be verified at a glance from the logs: which migration
 * the database is on, how many are applied vs. committed, and whether anything
 * is still pending. A non-empty `pendingTags` after `runMigrations()` succeeded
 * means migrations exist on disk that the database has not applied — surface it
 * as a warning rather than an info line.
 */
export function logMigrationStatus(status: MigrationStatus): void {
  const base = {
    lastAppliedMigration: status.lastAppliedTag,
    appliedCount: status.appliedCount,
    journalCount: status.journalCount,
    pendingCount: status.pendingTags.length,
  };

  if (status.pendingTags.length > 0) {
    logger.warn(
      { ...base, pendingMigrations: status.pendingTags },
      `Database migration state: on "${status.lastAppliedTag ?? "(none)"}" ` +
        `with ${status.pendingTags.length} migration(s) still pending. ` +
        `This usually means a new migration was deployed but not applied — ` +
        `run: pnpm --filter @workspace/db run migrate, then restart the API server.`,
    );
    return;
  }

  logger.info(
    base,
    `Database migration state: up to date on "${status.lastAppliedTag ?? "(none)"}" ` +
      `(${status.appliedCount}/${status.journalCount} applied).`,
  );
}

/**
 * Fetches the live migration status for the health endpoint. Read-only: it never
 * applies or records anything, so it is safe to call on every request.
 */
export async function getMigrationHealth(): Promise<MigrationStatus> {
  return reportMigrationStatus();
}
