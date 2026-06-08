import { configDefaults, defineConfig } from "vitest/config";
import {
  hasTestDatabaseConfig,
  resolveTestDatabaseConfig,
} from "./src/test/testDatabase";

const databaseConfig = hasTestDatabaseConfig()
  ? resolveTestDatabaseConfig()
  : null;

// Most api-server tests intentionally exercise routes/ingestion against a
// disposable PostgreSQL database.  In environments that do not provide a DB
// URL (for example the lightweight Replit validation workflow), still run the
// database-free unit tests instead of failing while loading the config.
const databaseFreeTests = [
  "src/lib/geocode.test.ts",
  "src/lib/sourceAudit.test.ts",
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
