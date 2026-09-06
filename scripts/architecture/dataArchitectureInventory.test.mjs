import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  assertArchitectureCoverage,
  buildCurrentDataInventory,
  detectUnsupportedSchemaConstructs,
  validateMigrationJournal,
  validateMigrationPlan,
  validateRegistrySemantics,
} from "./dataArchitectureInventory.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const inventoryScript = path.join(here, "dataArchitectureInventory.mjs");

test("all Drizzle modules, owned tables, registry semantics and data-lake layers pass the architecture gate", async () => {
  const inventory = await buildCurrentDataInventory();
  assert.doesNotThrow(() => assertArchitectureCoverage(inventory));
  const coverage = inventory.structural.database.registryCoverage;
  assert.equal(coverage.exportedButUnregisteredModules.length, 0);
  assert.equal(coverage.registeredButNotExportedModules.length, 0);
  assert.equal(coverage.schemaFilesNotExported.length, 0);
  assert.equal(coverage.exportedModulesWithoutSchemaFile.length, 0);
  assert.equal(coverage.nestedSchemaDirectories.length, 0);
  assert.equal(coverage.moduleTableMismatches.length, 0);
  assert.equal(coverage.duplicateRegisteredTableOwners.length, 0);
  assert.equal(coverage.unsupportedSchemaConstructs.length, 0);
  assert.equal(coverage.registrySemanticProblems.length, 0);
  assert.equal(coverage.migrationPlanProblems.length, 0);
  assert.equal(coverage.migrationJournalProblems.length, 0);
  assert.equal(coverage.unsupportedMigrationCreateStatements.length, 0);
  assert.equal(inventory.structural.database.migrations.schemaTablesNotCreatedInVersionedMigrations.length, 0);
  assert.equal(inventory.structural.dataLake.unregisteredLayers.length, 0);
});

test("schema-to-migration convergence is a forward invariant rather than an updateable baseline exception", async () => {
  const inventory = await buildCurrentDataInventory();
  const mutated = structuredClone(inventory);
  mutated.structural.database.migrations.schemaTablesNotCreatedInVersionedMigrations = ["new_unmigrated_table"];
  assert.throws(
    () => assertArchitectureCoverage(mutated),
    /schema tables missing from versioned migration chain: new_unmigrated_table/,
  );
});

test("unsupported Drizzle construction styles fail closed until the scanner explicitly supports them", () => {
  assert.deepEqual(detectUnsupportedSchemaConstructs('const t = pgSchema("core").table("x", {});'), ["pgSchema"]);
  assert.deepEqual(detectUnsupportedSchemaConstructs('const creator = pgTableCreator((name) => `x_${name}`);'), ["pgTableCreator"]);
  assert.ok(detectUnsupportedSchemaConstructs('const name = "x"; const t = pgTable(name, {});').includes("non-literal or unrecognized pgTable call"));
});

test("registry semantics reject undeclared namespaces, statuses and phases", () => {
  const registry = {
    canonicalTargetNamespaces: ["core"],
    architectureStatuses: ["transition"],
    schemaModules: [{
      module: "demo",
      tables: ["demo"],
      boundedContext: "demo",
      targetNamespace: "unknown",
      status: "invented",
      migrationPhase: 99,
      notes: "test",
    }],
    dataLayers: [{ name: "raw", role: "source", authoritative: false, targetRule: "registered" }],
  };
  const problems = validateRegistrySemantics(registry, [0, 1]);
  assert.ok(problems.some((problem) => problem.includes("invalid targetNamespace")));
  assert.ok(problems.some((problem) => problem.includes("invalid architecture status")));
  assert.ok(problems.some((problem) => problem.includes("missing migration phase 99")));
});

test("migration plan validation rejects cycles, missing prerequisites and unknown legacy modules", () => {
  const plan = {
    phases: [
      { id: 0, key: "a", prerequisites: [1], legacyModules: ["known"] },
      { id: 1, key: "b", prerequisites: [0, 2], legacyModules: ["missing"] },
    ],
  };
  const problems = validateMigrationPlan(plan, ["known"]);
  assert.ok(problems.some((problem) => problem.includes("missing prerequisite 2")));
  assert.ok(problems.some((problem) => problem.includes("unknown legacy module missing")));
  assert.ok(problems.includes("migration plan contains a prerequisite cycle"));
});

test("migration journal validation rejects missing SQL, duplicate indexes and order drift", () => {
  const journal = {
    entries: [
      { idx: 0, tag: "0001_b" },
      { idx: 0, tag: "0000_a" },
    ],
  };
  const problems = validateMigrationJournal(journal, ["0000_a.sql", "0001_b.sql", "0002_c.sql"]);
  assert.ok(problems.some((problem) => problem.includes("duplicate journal index")));
  assert.ok(problems.some((problem) => problem.includes("migration SQL missing from journal: 0002_c")));
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
