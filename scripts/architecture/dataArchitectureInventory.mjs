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
const registryPath = path.join(
  repoRoot,
  "architecture",
  "data-domain-registry.v1.json",
);
const inventoryPath = path.join(
  repoRoot,
  "architecture",
  "current-data-inventory.json",
);

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

function extractSchemaExports(indexSource) {
  return Array.from(indexSource.matchAll(/export \* from ["']\.\/([^"']+)["'];/gu))
    .map((match) => match[1])
    .sort((a, b) => a.localeCompare(b));
}

function extractPgTables(source) {
  return Array.from(
    source.matchAll(/pgTable\(\s*["']([^"']+)["']/gu),
  ).map((match) => match[1]);
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
  if (parts.length >= 4) return `data/${layer}/${parts[2]}`;
  return `data/${layer}`;
}

function extensionFor(relativePath) {
  const ext = path.extname(relativePath).toLowerCase();
  return ext || "[none]";
}

function moduleRegistryMap(registry) {
  return new Map(registry.schemaModules.map((entry) => [entry.module, entry]));
}

export async function buildCurrentDataInventory() {
  const registry = await readJson(registryPath);
  const schemaIndexSource = await readFile(schemaIndexPath, "utf8");
  const exportedModules = extractSchemaExports(schemaIndexSource);
  const registeredModules = registry.schemaModules
    .map((entry) => entry.module)
    .sort((a, b) => a.localeCompare(b));
  const registered = moduleRegistryMap(registry);

  const tables = [];
  for (const moduleName of exportedModules) {
    const modulePath = path.join(schemaDir, `${moduleName}.ts`);
    const source = await readFile(modulePath, "utf8");
    for (const table of extractPgTables(source)) {
      const registration = registered.get(moduleName) ?? null;
      tables.push({
        table,
        module: moduleName,
        schemaFile: normalizePath(path.relative(repoRoot, modulePath)),
        boundedContext: registration?.boundedContext ?? null,
        targetNamespace: registration?.targetNamespace ?? null,
        architectureStatus: registration?.status ?? "unregistered",
        migrationPhase: registration?.migrationPhase ?? null,
      });
    }
  }
  tables.sort((a, b) =>
    a.table.localeCompare(b.table) || a.module.localeCompare(b.module),
  );

  const migrationFiles = (await readdir(migrationsDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
  const migrationTables = [];
  for (const migration of migrationFiles) {
    const source = await readFile(path.join(migrationsDir, migration), "utf8");
    for (const table of extractMigrationTables(source)) {
      migrationTables.push({ table, migration });
    }
  }
  migrationTables.sort((a, b) =>
    a.table.localeCompare(b.table) || a.migration.localeCompare(b.migration),
  );

  const schemaTableNames = uniqueSorted(tables.map((entry) => entry.table));
  const migrationTableNames = uniqueSorted(
    migrationTables.map((entry) => entry.table),
  );

  const dataFiles = await listFiles(dataDir);
  const groupMap = new Map();
  const observedLayers = new Set();
  for (const absolute of dataFiles) {
    const relative = normalizePath(path.relative(repoRoot, absolute));
    const parts = relative.split("/");
    const layer = parts[1] ?? "unknown";
    observedLayers.add(layer);
    const group = dataGroupFor(relative);
    const fileStat = await stat(absolute);
    const existing = groupMap.get(group) ?? {
      root: group,
      layer,
      files: 0,
      bytes: 0,
      extensions: {},
    };
    existing.files += 1;
    existing.bytes += fileStat.size;
    const extension = extensionFor(relative);
    existing.extensions[extension] =
      (existing.extensions[extension] ?? 0) + 1;
    groupMap.set(group, existing);
  }

  const dataGroups = Array.from(groupMap.values())
    .map((group) => ({
      ...group,
      extensions: Object.fromEntries(
        Object.entries(group.extensions).sort(([a], [b]) => a.localeCompare(b)),
      ),
    }))
    .sort((a, b) => a.root.localeCompare(b.root));

  const allowedLayers = registry.dataLayers
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
  const observedLayerList = Array.from(observedLayers).sort((a, b) =>
    a.localeCompare(b),
  );

  return {
    schemaVersion: "lt-current-data-inventory.v1",
    architectureContract: registry.architectureContract,
    registryVersion: registry.schemaVersion,
    database: {
      dialect: "postgresql",
      orm: "drizzle",
      schemaModuleCount: exportedModules.length,
      tableCount: schemaTableNames.length,
      schemaModules: exportedModules.map((module) => {
        const entry = registered.get(module) ?? null;
        return {
          module,
          boundedContext: entry?.boundedContext ?? null,
          targetNamespace: entry?.targetNamespace ?? null,
          architectureStatus: entry?.status ?? "unregistered",
          migrationPhase: entry?.migrationPhase ?? null,
        };
      }),
      tables,
      migrations: {
        sqlMigrationFiles: migrationFiles,
        createdTables: migrationTables,
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
      },
    },
    dataLake: {
      fileCount: dataFiles.length,
      byteCount: dataGroups.reduce((sum, group) => sum + group.bytes, 0),
      observedLayers: observedLayerList,
      registeredLayers: allowedLayers,
      unregisteredLayers: observedLayerList.filter(
        (layer) => !allowedLayers.includes(layer),
      ),
      registeredButMissingLayers: allowedLayers.filter(
        (layer) => !observedLayerList.includes(layer),
      ),
      groups: dataGroups,
    },
  };
}

export function assertArchitectureCoverage(inventory) {
  const problems = [];
  if (inventory.database.registryCoverage.exportedButUnregisteredModules.length) {
    problems.push(
      `unregistered schema modules: ${inventory.database.registryCoverage.exportedButUnregisteredModules.join(", ")}`,
    );
  }
  if (inventory.database.registryCoverage.registeredButNotExportedModules.length) {
    problems.push(
      `stale registered schema modules: ${inventory.database.registryCoverage.registeredButNotExportedModules.join(", ")}`,
    );
  }
  if (inventory.dataLake.unregisteredLayers.length) {
    problems.push(
      `unregistered data lake layers: ${inventory.dataLake.unregisteredLayers.join(", ")}`,
    );
  }
  if (problems.length) {
    throw new Error(`Data architecture registry coverage failed: ${problems.join("; ")}`);
  }
}

async function checkCommittedInventory(inventory) {
  const expected = stableJson(inventory);
  const actual = await readFile(inventoryPath, "utf8").catch(() => "");
  if (actual !== expected) {
    console.error("--- GENERATED CURRENT DATA INVENTORY START ---");
    console.error(expected.trimEnd());
    console.error("--- GENERATED CURRENT DATA INVENTORY END ---");
    throw new Error(
      "architecture/current-data-inventory.json is out of date. Run: node scripts/architecture/dataArchitectureInventory.mjs --write",
    );
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const inventory = await buildCurrentDataInventory();
  assertArchitectureCoverage(inventory);

  if (args.has("--write")) {
    await writeFile(inventoryPath, stableJson(inventory), "utf8");
    console.log(
      `Wrote ${normalizePath(path.relative(repoRoot, inventoryPath))}: ${inventory.database.tableCount} tables, ${inventory.dataLake.fileCount} data files.`,
    );
    return;
  }
  if (args.has("--check")) {
    await checkCommittedInventory(inventory);
    console.log(
      `Data architecture inventory is current: ${inventory.database.tableCount} tables, ${inventory.dataLake.fileCount} data files.`,
    );
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
