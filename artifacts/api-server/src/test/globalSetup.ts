import { Client, Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { pushSchema } from "drizzle-kit/api";
import * as schema from "@workspace/db/schema";
import { resolveTestDatabaseConfig } from "./testDatabase";

async function recreateDatabase(
  adminDatabaseUrl: string,
  testDatabaseName: string,
): Promise<void> {
  const admin = new Client({ connectionString: adminDatabaseUrl });
  await admin.connect();
  try {
    // The database name is validated against a strict allowlist in
    // resolveTestDatabaseConfig, so it is safe to interpolate here.
    await admin.query(`DROP DATABASE IF EXISTS "${testDatabaseName}" WITH (FORCE)`);
    await admin.query(`CREATE DATABASE "${testDatabaseName}"`);
  } finally {
    await admin.end();
  }
}

async function dropDatabase(
  adminDatabaseUrl: string,
  testDatabaseName: string,
): Promise<void> {
  const admin = new Client({ connectionString: adminDatabaseUrl });
  await admin.connect();
  try {
    await admin.query(`DROP DATABASE IF EXISTS "${testDatabaseName}" WITH (FORCE)`);
  } finally {
    await admin.end();
  }
}

export default async function setup() {
  const { testDatabaseUrl, adminDatabaseUrl, testDatabaseName } =
    resolveTestDatabaseConfig();

  // Start from a clean slate every run.
  await recreateDatabase(adminDatabaseUrl, testDatabaseName);

  // Apply the current Drizzle schema to the fresh database using the
  // programmatic API (drizzle-kit/api pushSchema) instead of spawning a
  // CLI subprocess.  The subprocess approach (drizzle-kit push --force)
  // intermittently stalls in non-TTY environments because drizzle-kit can
  // prompt for confirmation even when the --force flag is present, causing
  // the process to hang until it is killed, which leaves the test database
  // with a partially applied schema.  The programmatic API has no interactive
  // prompts and completes synchronously before any test worker connects.
  const pool = new Pool({ connectionString: testDatabaseUrl });
  try {
    const db = drizzle(pool);
    const { apply } = await pushSchema(schema as Record<string, unknown>, db);
    await apply();
  } finally {
    await pool.end();
  }

  return async function teardown() {
    await dropDatabase(adminDatabaseUrl, testDatabaseName);
  };
}
