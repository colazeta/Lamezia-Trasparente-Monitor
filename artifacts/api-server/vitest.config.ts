import { defineConfig } from "vitest/config";
import { resolveTestDatabaseConfig } from "./src/test/testDatabase";

const { testDatabaseUrl } = resolveTestDatabaseConfig();

export default defineConfig({
  resolve: {
    conditions: ["workspace"],
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    fileParallelism: false,
    hookTimeout: 60000,
    testTimeout: 30000,
    globalSetup: ["./src/test/globalSetup.ts"],
    env: {
      LOG_LEVEL: "silent",
      // Point every test worker at the isolated, disposable test database so
      // the suite never reads from or writes to the development database.
      DATABASE_URL: testDatabaseUrl,
    },
  },
});
