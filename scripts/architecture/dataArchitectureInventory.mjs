#!/usr/bin/env node
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const schemaDir = path.join(repoRoot, "lib", "db", "src", "schema");
const schemaIndexPath = path.join(schemaDir, "index.ts");
const migrationsDir = path.join(repoRoot, "lib", "db", "migrations");
const dataDir = path.join(repoRoot, "data");
const registryPath = path.join(repoRoot, "architecture", "data-domain-registry.v1.json");
const inventoryPath = path.join(repoRoot, "architecture", "current-data-inventory.json");

function normalizePath(value) {
  return value.split(path.sep).join("/");
}
function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}
async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}
async function listFiles(root) {
  const files = [];
  async function visit(current) {
    const entries = await readdir(current, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile()) files.push(absolute);
    }
  }
  await visit(root);
  return files;
}
function extractSchemaExports(source) {
  return Array.from(source.matchAll(/export \* from ["']\.\/([^"']+)["'];/gu))
    .map((match) => match[1])
    .sort((a, b) => a.localeCompare(b));
}
function extractPgTables(source) {
  return Array.from(source.matchAll(/pgTable\(\s*["']([^"']+)["']/gu))
    .map((match) => match[1])
    .sort((a, b) => a.localeCompare(b));
}
function extractMigrationTables(source) {
  return Array.from(
    source.matchAll(/CREATE TABLE(?: IF NOT EXISTS)?\s+["']([^"']+)["']/giu),
  ).map((match) => match[1]);
}
function uniqueSorted(values) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}
function dataGroupFor(relativePath) {
  const parts = normalizePath(relativePath).split("/");
  const layer = parts[1] ?? "unknown";
  return parts.length >= 4 ? `data/${layer}/${parts[2]}` : `data/${layer}`;
}
function extensionFor(relativePath) {
  return path.extname(relativePath).toLowerCase() || "[none]";
}
function moduleRegistryMap(registry) {
  return new Map(registry.schemaModules.map((entry) => [entry.module, entry]));
}
function sameStrings(a, b) {
  return JSON.stringify(uniqueSorted(a ?? [])) === JSON.stringify(uniqueSorted(b ?? []));
}

export async function buildCurrentDataInventory() {
  const registry = await readJson(registryPath);
  const registered = moduleRegistryMap(registry);
  const exportedModules = extractSchemaExports(await readFile(schemaIndexPath, "utf8"));
  const registeredModules = registry.schemaModules.map((entry) => entry.module).sort();

  const schemaModules = [];
  const tables = [];
  const moduleTableMismatches = [];
  const registeredTableOwners = new Map();

  for (const entry of registry.schemaModules) {
    for (const table of entry.tables ?? []) {
      const owners = registeredTableOwners.get(table) ?? [];
      owners.push(entry.module);
      registeredTableOwners.set(table, owners);
    }
  }

  for (const moduleName of exportedModules) {
    const modulePath = path.join(schemaDir, `${moduleName}.ts`);
    const actualTables = extractPgTables(await readFile(modulePath, "utf8"));
    const registration = registered.get(moduleName) ?? null;
    const expectedTables = uniqueSorted(registration?.tables ?? []);
    if (registration && !sameStrings(actualTables, expectedTables)) {
      moduleTableMismatches.push({ module: moduleName, expectedTables, actualTables });
    }
    schemaModules.push({
      module: moduleName,
      tables: actualTables,
      boundedContext: registration?.boundedContext ?? null,
      targetNamespace: registration?.targetNamespace ?? null,
      architectureStatus: registration?.status ?? "unregistered",
      migrationPhase: registration?.migrationPhase ?? null,
    });
    for (const table of actualTables) {
      tables.push({ table, module: moduleName });
    }
  }
  tables.sort((a, b) => a.table.localeCompare(b.table) || a.module.localeCompare(b.module));
  const duplicateRegisteredTableOwners = Array.from(registeredTableOwners.entries())
    .filter(([, owners]) => owners.length > 1)
    .map(([table, owners]) => ({ table, owners: owners.sort() }))
    .sort((a, b) => a.table.localeCompare(b.table));

  const migrationFiles = (await readdir(migrationsDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
  const migrationTables = [];
  for (const migration of migrationFiles) {
    const source = await readFile(path.join(migrationsDir, migration), "utf8");
    for (const table of extractMigrationTables(source)) migrationTables.push({ table, migration });
  }
  migrationTables.sort((a, b) => a.table.localeCompare(b.table) || a.migration.localeCompare(b.migration));

  const schemaTableNames = uniqueSorted(tables.map((entry) => entry.table));
  const migrationTableNames = uniqueSorted(migrationTables.map((entry) => entry.table));
  const dataFiles = await listFiles(dataDir);
  const groups = new Map();
  const observedLayers = new Set();
  for (const absolute of dataFiles) {
    const relative = normalizePath(path.relative(repoRoot, absolute));
    const layer = relative.split("/")[1] ?? "unknown";
    observedLayers.add(layer);
    const root = dataGroupFor(relative);
    const group = groups.get(root) ?? { root, layer, fileCount: 0, byteCount: 0, extensions: new Set() };
    const fileStat = await stat(absolute);
    group.fileCount += 1;
    group.byteCount += fileStat.size;
    group.extensions.add(extensionFor(relative));
    groups.set(root, group);
  }
  const groupList = Array.from(groups.values()).sort((a, b) => a.root.localeCompare(b.root));
  const allowedLayers = registry.dataLayers.map((entry) => entry.name).sort();
  const observedLayerList = Array.from(observedLayers).sort();

  const structural = {
    schemaVersion: "lt-current-data-inventory.v1",
    architectureContract: registry.architectureContract,
    registryVersion: registry.schemaVersion,
    database: {
      dialect: "postgresql",
      orm: "drizzle",
      schemaModuleCount: exportedModules.length,
      tableCount: schemaTableNames.length,
      schemaModules,
      tables,
      migrations: {
        sqlMigrationFiles: migrationFiles,
        schemaTablesNotCreatedInVersionedMigrations: schemaTableNames.filter(
          (table) => !migrationTableNames.includes(table),
        ),
        migrationTablesNotInCurrentDrizzleSchema: migrationTableNames.filter(
          (table) => !schemaTableNames.includes(table),
        ),
      },
      registryCoverage: {
        exportedButUnregisteredModules: exportedModules.filter(
          (module) => !registeredModules.includes(module),
        ),
        registeredButNotExportedModules: registeredModules.filter(
          (module) => !exportedModules.includes(module),
        ),
        moduleTableMismatches,
        duplicateRegisteredTableOwners,
      },
    },
    dataLake: {
      observedLayers: observedLayerList,
      registeredLayers: allowedLayers,
      unregisteredLayers: observedLayerList.filter((layer) => !allowedLayers.includes(layer)),
      registeredButMissingLayers: allowedLayers.filter((layer) => !observedLayerList.includes(layer)),
      structuralGroups: groupList.map((group) => ({
        root: group.root,
        layer: group.layer,
        extensionTypes: Array.from(group.extensions).sort(),
      })),
    },
  };

  const metrics = {
    schemaVersion: "lt-data-operational-metrics.v1",
    database: {
      schemaModuleCount: structural.database.schemaModuleCount,
      tableCount: structural.database.tableCount,
      migrationCount: migrationFiles.length,
    },
    dataLake: {
      fileCount: dataFiles.length,
      byteCount: groupList.reduce((sum, group) => sum + group.byteCount, 0),
      groups: groupList.map((group) => ({
        root: group.root,
        files: group.fileCount,
        bytes: group.byteCount,
        extensionTypes: Array.from(group.extensions).sort(),
      })),
    },
  };

  return { structural, metrics };
}

export function assertArchitectureCoverage(inventory) {
  const structural = inventory.structural ?? inventory;
  const coverage = structural.database.registryCoverage;
  const problems = [];
  if (coverage.exportedButUnregisteredModules.length) {
    problems.push(`unregistered schema modules: ${coverage.exportedButUnregisteredModules.join(", ")}`);
  }
  if (coverage.registeredButNotExportedModules.length) {
    problems.push(`stale registered schema modules: ${coverage.registeredButNotExportedModules.join(", ")}`);
  }
  if (coverage.moduleTableMismatches.length) {
    problems.push(
      `schema modules with undeclared table drift: ${coverage.moduleTableMismatches.map((entry) => entry.module).join(", ")}`,
    );
  }
  if (coverage.duplicateRegisteredTableOwners.length) {
    problems.push(
      `tables with multiple registered owners: ${coverage.duplicateRegisteredTableOwners.map((entry) => entry.table).join(", ")}`,
    );
  }
  if (structural.dataLake.unregisteredLayers.length) {
    problems.push(`unregistered data lake layers: ${structural.dataLake.unregisteredLayers.join(", ")}`);
  }
  if (problems.length) throw new Error(`Data architecture registry coverage failed: ${problems.join("; ")}`);
}

async function checkCommittedInventory(structural) {
  const expected = stableJson(structural);
  const actual = await readFile(inventoryPath, "utf8").catch(() => "");
  if (actual !== expected) {
    console.error("--- GENERATED STRUCTURAL DATA INVENTORY START ---");
    console.error(expected.trimEnd());
    console.error("--- GENERATED STRUCTURAL DATA INVENTORY END ---");
    throw new Error(
      "architecture/current-data-inventory.json has structural drift. Run: node scripts/architecture/dataArchitectureInventory.mjs --write",
    );
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const inventory = await buildCurrentDataInventory();
  assertArchitectureCoverage(inventory);
  if (args.has("--write")) {
    await writeFile(inventoryPath, stableJson(inventory.structural), "utf8");
    console.log(
      `Wrote structural inventory: ${inventory.structural.database.tableCount} tables; operational scan observed ${inventory.metrics.dataLake.fileCount} data files.`,
    );
    return;
  }
  if (args.has("--check")) {
    await checkCommittedInventory(inventory.structural);
    console.log(
      `Data architecture structure is current: ${inventory.structural.database.tableCount} tables across ${inventory.structural.database.schemaModuleCount} modules.`,
    );
    return;
  }
  if (args.has("--metrics")) {
    process.stdout.write(stableJson(inventory.metrics));
    return;
  }
  process.stdout.write(stableJson(inventory));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
