/**
 * One-shot transition for a database that was bootstrapped with the old
 * `drizzle-kit push` workflow and has never recorded Drizzle migrations.
 *
 * This command is deliberately fail-closed: it refuses fresh databases and
 * already-tracked databases, applies only bounded additive compatibility
 * repairs, proves that every migration-created table is present, verifies the
 * legacy conversation schema, and only then records the current journal as
 * applied without re-executing its SQL.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import {
  assertMigrationCreatedTablesPresent,
  baselineMigrations,
  ensureReportsPublishedAtColumn,
  isMigrationTrackingPresent,
  isSchemaBootstrapped,
} from "./baselineLogic";
import {
  ensureLegacyConversationTables,
  verifyLegacyConversationTables,
} from "./legacySchemaCompatibility";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(__dirname, "../migrations");

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL must be set.");
}

const client = new pg.Client({ connectionString: dbUrl });
await client.connect();

try {
  if (await isMigrationTrackingPresent(client)) {
    throw new Error(
      "Refusing manual baseline: migration tracking is already present. Use migrate/status instead of marking additional migrations as applied.",
    );
  }
  if (!(await isSchemaBootstrapped(client))) {
    throw new Error(
      "Refusing manual baseline: the application schema is not push-bootstrapped. A fresh database must run the migrations normally.",
    );
  }

  await ensureReportsPublishedAtColumn(client);
  await ensureLegacyConversationTables(client);
  await verifyLegacyConversationTables(client);
  await assertMigrationCreatedTablesPresent(client, migrationsFolder);

  const baselined = await baselineMigrations(client, migrationsFolder);
  for (const tag of baselined) {
    console.log(`  baselined: ${tag}`);
  }
  console.log(
    `Baseline complete: ${baselined.length} migration(s) recorded after compatibility verification.`,
  );
} finally {
  await client.end();
}
