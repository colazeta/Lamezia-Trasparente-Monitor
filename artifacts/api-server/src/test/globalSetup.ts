import { execFileSync } from "node:child_process";
import { Client } from "pg";
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

  // Apply migrations to the fresh database. Using the same migration path as
  // production ensures tests catch any migration regressions before they ship.
  execFileSync("pnpm", ["--filter", "@workspace/db", "run", "migrate"], {
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: "inherit",
  });

  return async function teardown() {
    await dropDatabase(adminDatabaseUrl, testDatabaseName);
  };
}
