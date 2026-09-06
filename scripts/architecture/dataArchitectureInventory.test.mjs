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

test("all exported Drizzle modules, owned tables and data-lake layers are architecture-registered", async () => {
  const inventory = await buildCurrentDataInventory();
  assert.doesNotThrow(() => assertArchitectureCoverage(inventory));
  const coverage = inventory.structural.database.registryCoverage;
  assert.equal(coverage.exportedButUnregisteredModules.length, 0);
  assert.equal(coverage.registeredButNotExportedModules.length, 0);
  assert.equal(coverage.moduleTableMismatches.length, 0);
  assert.equal(coverage.duplicateRegisteredTableOwners.length, 0);
  assert.equal(inventory.structural.dataLake.unregisteredLayers.length, 0);
});

test("committed structural inventory matches repository architecture", () => {
  const result = spawnSync(process.execPath, [inventoryScript, "--check"], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    process.stderr.write(result.stdout ?? "");
    process.stderr.write(result.stderr ?? "");
  }
  assert.equal(result.status, 0);
});

test("operational metrics are separated from structural inventory", async () => {
  const inventory = await buildCurrentDataInventory();
  assert.ok(inventory.metrics.dataLake.fileCount > 0);
  assert.ok(inventory.metrics.dataLake.byteCount > 0);
  assert.equal("fileCount" in inventory.structural.dataLake, false);
  assert.equal("byteCount" in inventory.structural.dataLake, false);
});
