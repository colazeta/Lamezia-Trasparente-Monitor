const DB_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export interface TestDatabaseConfig {
  /** Connection string for the dedicated, disposable test database. */
  testDatabaseUrl: string;
  /** Connection string for the maintenance database used to create/drop the test database. */
  adminDatabaseUrl: string;
  /** Name of the dedicated test database. */
  testDatabaseName: string;
}

function databaseNameFromUrl(url: URL): string {
  return decodeURIComponent(url.pathname.replace(/^\//, ""));
}

/**
 * Resolves the connection details used to run the test suite against an
 * isolated, disposable database so tests never touch the development (or any
 * real) data.
 *
 * Resolution order:
 * 1. If `TEST_DATABASE_URL` is set, it is used verbatim as the test database.
 * 2. Otherwise a dedicated database is derived from `DATABASE_URL` by appending
 *    a `_test` suffix to the database name (same server/credentials).
 *
 * As a safety net it refuses to run when the resolved test database is the same
 * as the development database on the same host.
 */
export function resolveTestDatabaseConfig(): TestDatabaseConfig {
  const explicit = process.env.TEST_DATABASE_URL;
  const base = explicit ?? process.env.DATABASE_URL;

  if (!base) {
    throw new Error(
      "Either TEST_DATABASE_URL or DATABASE_URL must be set to run the api-server test suite.",
    );
  }

  const url = new URL(base);

  if (!explicit) {
    const currentName = databaseNameFromUrl(url) || "postgres";
    url.pathname = `/${currentName}_test`;
  }

  const testDatabaseName = databaseNameFromUrl(url);
  if (!testDatabaseName) {
    throw new Error(
      "Could not determine a test database name from the connection URL.",
    );
  }
  if (!DB_NAME_PATTERN.test(testDatabaseName)) {
    throw new Error(
      `Refusing to use unsafe test database name "${testDatabaseName}". ` +
        "Database names must match /^[A-Za-z_][A-Za-z0-9_]*$/.",
    );
  }

  if (process.env.DATABASE_URL) {
    const devUrl = new URL(process.env.DATABASE_URL);
    const devName = databaseNameFromUrl(devUrl);
    if (devUrl.host === url.host && devName === testDatabaseName) {
      throw new Error(
        `Refusing to run tests against the development database "${devName}". ` +
          "Point TEST_DATABASE_URL at a separate database.",
      );
    }
  }

  const adminUrl = new URL(url.toString());
  adminUrl.pathname = "/postgres";

  return {
    testDatabaseUrl: url.toString(),
    adminDatabaseUrl: adminUrl.toString(),
    testDatabaseName,
  };
}
