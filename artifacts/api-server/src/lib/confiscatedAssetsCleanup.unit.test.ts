import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const dbEntry = require.resolve("@workspace/db");
const migrationsFolder = path.resolve(path.dirname(dbEntry), "../migrations");

async function loadCleanupModule() {
  // Importing @workspace/db constructs a lazy pg Pool. A syntactically valid
  // placeholder is sufficient here because these unit tests inject a query
  // client and never open a network connection.
  process.env.DATABASE_URL ??= "postgresql://localhost/not-used-by-unit-test";
  return import("@workspace/db");
}

describe("legacy confiscated-assets demo cleanup", () => {
  it("keeps the custom migration aligned with the runtime repair", async () => {
    const { LEGACY_CONFISCATED_ASSETS_DEMO_CLEANUP_SQL } =
      await loadCleanupModule();
    const migration = fs.readFileSync(
      path.join(
        migrationsFolder,
        "0013_cleanup_confiscated_assets_demo_rows.sql",
      ),
      "utf-8",
    );

    expect(migration).toContain(LEGACY_CONFISCATED_ASSETS_DEMO_CLEANUP_SQL);
  });

  it("runs the signature-locked statement and reports the deleted row count", async () => {
    const {
      LEGACY_CONFISCATED_ASSETS_DEMO_CLEANUP_SQL,
      removeLegacyConfiscatedAssetDemoRows,
    } = await loadCleanupModule();
    const queries: string[] = [];
    const client = {
      async query(text: string) {
        queries.push(text);
        if (text.includes("to_regclass")) {
          return { rows: [{ present: true }] };
        }
        return { rows: [{ id: 1 }, { id: 2 }] };
      },
    };

    await expect(removeLegacyConfiscatedAssetDemoRows(client)).resolves.toBe(2);
    expect(queries).toEqual([
      expect.stringContaining("to_regclass"),
      LEGACY_CONFISCATED_ASSETS_DEMO_CLEANUP_SQL,
    ]);
  });

  it("is a no-op when the legacy table is absent", async () => {
    const { removeLegacyConfiscatedAssetDemoRows } = await loadCleanupModule();
    const queries: string[] = [];
    const client = {
      async query(text: string) {
        queries.push(text);
        return { rows: [{ present: false }] };
      },
    };

    await expect(removeLegacyConfiscatedAssetDemoRows(client)).resolves.toBe(0);
    expect(queries).toHaveLength(1);
  });
});
