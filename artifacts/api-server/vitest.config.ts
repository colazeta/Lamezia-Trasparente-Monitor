import { configDefaults, defineConfig } from "vitest/config";
import {
  hasTestDatabaseConfig,
  resolveTestDatabaseConfig,
} from "./src/test/testDatabase";

const databaseConfig = hasTestDatabaseConfig()
  ? resolveTestDatabaseConfig()
  : null;

// Most api-server tests intentionally exercise routes/ingestion against a
// disposable PostgreSQL database. In environments that do not provide a DB
// URL (for example the lightweight CI validation workflow), still run the
// database-free unit tests instead of failing while loading the config.
const databaseFreeTests = [
  "src/lib/geocode.test.ts",
  "src/lib/confiscatedAssetsCleanup.unit.test.ts",
  "src/lib/confiscatedAssetsSpatial.test.ts",
  "src/lib/ingestionSchedulerConfig.test.ts",
  "src/lib/publicActProjection.unit.test.ts",
  // Parser/contract only: imports the DB schema but never opens a connection.
  // Keeping these in the DB-free suite means source-contract regressions are
  // caught by the standard CI rather than only by a full integration database.
  "src/lib/populationCitizenship.test.ts",
  "src/lib/populationBirthCountry.test.ts",
];

export default defineConfig({
  resolve: {
    conditions: ["workspace"],
  },
  test: {
    environment: "node",
    include: databaseConfig ? ["src/**/*.test.ts"] : databaseFreeTests,
    fileParallelism: false,
    hookTimeout: 60000,
    testTimeout: 30000,
    exclude: configDefaults.exclude,
    globalSetup: databaseConfig ? ["./src/test/globalSetup.ts"] : [],
    env: {
      LOG_LEVEL: "silent",
      // Point every test worker at the isolated, disposable test database so
      // the suite never reads from or writes to the development database.
      ...(databaseConfig
        ? { DATABASE_URL: databaseConfig.testDatabaseUrl }
        : {}),
    },
  },
});
