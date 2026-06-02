import { db } from "@workspace/db";
import * as schema from "@workspace/db/schema";
import { sql, is, getTableColumns, getTableName } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import { logger } from "./logger";

/**
 * Discovers every table defined in the shared schema package. Iterating over
 * the schema exports (instead of hard-coding a list) means new tables are
 * covered by the drift check automatically as soon as they are added to the
 * schema, so the guard never silently goes stale.
 */
function getAllSchemaTables(): PgTable[] {
  return (Object.values(schema) as unknown[]).filter(
    (value): value is PgTable => is(value, PgTable),
  );
}

/**
 * Compares the columns Drizzle expects for a table against the columns that
 * actually exist in the connected database. The expected set is derived from
 * the schema itself, so it stays in sync automatically as the schema evolves.
 *
 * Returns the list of expected-but-missing database column names.
 */
async function findMissingColumns(table: PgTable): Promise<string[]> {
  const tableName = getTableName(table);
  const expected = Object.values(getTableColumns(table)).map((c) => c.name);

  const result = await db.execute<{ column_name: string }>(sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${tableName}
  `);

  const resultRows: Array<{ column_name: string }> = Array.isArray(result)
    ? result
    : ((result as { rows?: Array<{ column_name: string }> }).rows ?? []);

  const actual = new Set(resultRows.map((r) => r.column_name));

  return expected.filter((name) => !actual.has(name));
}

/**
 * Verifies that the database schema is in sync with what the application code
 * expects. Every table exported from the shared schema package is checked, so a
 * drift (e.g. the `contracts` table missing the ANAC or geo columns, or a newly
 * added table such as bandi / confiscated assets / PNRR missing entirely)
 * silently breaks ingestion with 500s. We surface it loudly at startup with an
 * actionable message instead of failing later, deep inside the ingestion loop.
 *
 * Returns `true` only when every table was successfully checked and no drift
 * was found. Returns `false` on detected drift OR when a check could not be
 * completed — callers should treat `false` as "not safe to ingest" rather than
 * assuming the schema is fine.
 */
export async function verifySchema(): Promise<boolean> {
  const tables = getAllSchemaTables();

  let drifted = false;
  let hadCheckError = false;

  for (const table of tables) {
    const tableName = getTableName(table);
    try {
      const missing = await findMissingColumns(table);
      if (missing.length > 0) {
        drifted = true;
        logger.error(
          { table: tableName, missingColumns: missing },
          `Database schema drift detected: table "${tableName}" is missing ` +
            `column(s) [${missing.join(", ")}]. Contract ingestion will fail ` +
            `until the schema is brought back in sync. ` +
            `To apply pending migrations non-interactively (safe, no data loss): ` +
            `pnpm --filter @workspace/db run migrate. ` +
            `If there is no migration yet for the change, generate one first: ` +
            `pnpm --filter @workspace/db run generate, then re-run migrate. ` +
            `Restart the API server afterwards.`,
        );
      }
    } catch (err) {
      hadCheckError = true;
      logger.error(
        { err, table: tableName },
        `Could not verify database schema for "${tableName}".`,
      );
    }
  }

  const ok = !drifted && !hadCheckError;
  if (ok) {
    logger.info(
      { tablesChecked: tables.length },
      "Database schema check passed: no drift detected.",
    );
  }
  return ok;
}
