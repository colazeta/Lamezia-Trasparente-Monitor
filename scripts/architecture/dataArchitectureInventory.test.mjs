import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  assertArchitectureCoverage,
  buildCurrentDataInventory,
} from "./dataArchitectureInventory.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const inventoryScript = path.join(here, "dataArchitectureInventory.mjs");

test("all exported Drizzle schema modules and data-lake layers are architecture-registered", async () => {
  const inventory = await buildCurrentDataInventory();
  assert.doesNotThrow(() => assertArchitectureCoverage(inventory));
  assert.equal(
    inventory.database.registryCoverage.exportedButUnregisteredModules.length,
    0,
  );
  assert.equal(inventory.dataLake.unregisteredLayers.length, 0);
});

test("committed current-state data inventory matches the repository", () => {
  const result = spawnSync(process.execPath, [inventoryScript, "--check"], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    process.stderr.write(result.stdout ?? "");
    process.stderr.write(result.stderr ?? "");
  }
  assert.equal(result.status, 0);
});
