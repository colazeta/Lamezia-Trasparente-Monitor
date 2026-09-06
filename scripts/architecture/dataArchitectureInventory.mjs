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
const migrationJournalPath = path.join(migrationsDir, "meta", "_journal.json");
const dataDir = path.join(repoRoot, "data");
const registryPath = path.join(repoRoot, "architecture", "data-domain-registry.v1.json");
const migrationPlanPath = path.join(repoRoot, "architecture", "migration-plan.v1.json");
const inventoryPath = path.join(repoRoot, "architecture", "current-data-inventory.json");

function normalizePath(value) { return value.split(path.sep).join("/"); }
function stableJson(value) { return `${JSON.stringify(value, null, 2)}\n`; }
async function readJson(filePath) { return JSON.parse(await readFile(filePath, "utf8")); }
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
  return Array.from(source.matchAll(/export\s+\*\s+from\s+["']\.\/([^"']+)["']\s*;?/gu))
    .map((match) => match[1]).sort((a, b) => a.localeCompare(b));
}
function extractPgTables(source) {
  return Array.from(source.matchAll(/\bpgTable\(\s*["']([^"']+)["']/gu))
    .map((match) => match[1]).sort((a, b) => a.localeCompare(b));
}
function extractMigrationTables(source) {
  return Array.from(source.matchAll(/CREATE TABLE(?: IF NOT EXISTS)?\s+["']([^"']+)["']/giu))
    .map((match) => match[1]);
}
function uniqueSorted(values) { return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b)); }
function duplicates(values) {
  const seen = new Set();
  const duplicated = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicated.add(value);
    seen.add(value);
  }
  return Array.from(duplicated).sort((a, b) => String(a).localeCompare(String(b)));
}
function dataGroupFor(relativePath) {
  const parts = normalizePath(relativePath).split("/");
  const layer = parts[1] ?? "unknown";
  return parts.length >= 4 ? `data/${layer}/${parts[2]}` : `data/${layer}`;
}
function extensionFor(relativePath) { return path.extname(relativePath).toLowerCase() || "[none]"; }
function moduleRegistryMap(registry) { return new Map(registry.schemaModules.map((entry) => [entry.module, entry])); }
function sameStrings(a, b) { return JSON.stringify(uniqueSorted(a ?? [])) === JSON.stringify(uniqueSorted(b ?? [])); }

export function detectUnsupportedSchemaConstructs(source) {
  const problems = [];
  if (/\bpgSchema\s*\(/u.test(source)) problems.push("pgSchema");
  if (/\bpgTableCreator\s*\(/u.test(source)) problems.push("pgTableCreator");
  if (/\bpgTable\s+as\s+[A-Za-z_$][\w$]*/u.test(source)) problems.push("pgTable alias import");
  const literalTables = extractPgTables(source).length;
  const pgTableCalls = Array.from(source.matchAll(/\bpgTable\s*\(/gu)).length;
  if (pgTableCalls !== literalTables) problems.push("non-literal or unrecognized pgTable call");
  return uniqueSorted(problems);
}

export function validateMigrationPlan(plan, registeredModuleNames) {
  const problems = [];
  const phases = Array.isArray(plan?.phases) ? plan.phases : [];
  const ids = phases.map((phase) => phase.id);
  const keys = phases.map((phase) => phase.key);
  for (const id of duplicates(ids)) problems.push(`duplicate migration phase id: ${id}`);
  for (const key of duplicates(keys)) problems.push(`duplicate migration phase key: ${key}`);
  const idSet = new Set(ids);
  const moduleSet = new Set(registeredModuleNames);
  const edges = new Map();
  for (const phase of phases) {
    const prerequisites = Array.isArray(phase.prerequisites) ? phase.prerequisites : [];
    edges.set(phase.id, prerequisites);
    for (const prerequisite of prerequisites) {
      if (!idSet.has(prerequisite)) problems.push(`phase ${phase.id} references missing prerequisite ${prerequisite}`);
      if (prerequisite === phase.id) problems.push(`phase ${phase.id} depends on itself`);
    }
    for (const moduleName of phase.legacyModules ?? []) {
      if (!moduleSet.has(moduleName)) problems.push(`phase ${phase.id} references unknown legacy module ${moduleName}`);
    }
  }
  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const dependency of edges.get(id) ?? []) {
      if (idSet.has(dependency) && visit(dependency)) return true;
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  }
  if (ids.some((id) => visit(id))) problems.push("migration plan contains a prerequisite cycle");
  return uniqueSorted(problems);
}

export function validateRegistrySemantics(registry, validPhaseIds) {
  const problems = [];
  const modules = Array.isArray(registry?.schemaModules) ? registry.schemaModules : [];
  const namespaceValues = Array.isArray(registry?.canonicalTargetNamespaces) ? registry.canonicalTargetNamespaces : [];
  const statusValues = Array.isArray(registry?.architectureStatuses) ? registry.architectureStatuses : [];
  const layers = Array.isArray(registry?.dataLayers) ? registry.dataLayers : [];
  const namespaceSet = new Set(namespaceValues);
  const statusSet = new Set(statusValues);
  const phaseSet = new Set(validPhaseIds);

  for (const value of duplicates(namespaceValues)) problems.push(`duplicate canonical target namespace: ${value}`);
  for (const value of duplicates(statusValues)) problems.push(`duplicate architecture status: ${value}`);
  for (const value of duplicates(modules.map((entry) => entry.module))) problems.push(`duplicate registry module: ${value}`);
  for (const value of duplicates(layers.map((entry) => entry.name))) problems.push(`duplicate data layer: ${value}`);

  for (const entry of modules) {
    const label = entry.module || "[missing-module]";
    if (!entry.module) problems.push("registry entry missing module name");
    if (!entry.boundedContext) problems.push(`module ${label} missing boundedContext`);
    if (!Array.isArray(entry.tables) || entry.tables.length === 0) problems.push(`module ${label} must own at least one table`);
    if (!namespaceSet.has(entry.targetNamespace)) problems.push(`module ${label} has invalid targetNamespace ${entry.targetNamespace}`);
    if (!statusSet.has(entry.status)) problems.push(`module ${label} has invalid architecture status ${entry.status}`);
    if (!phaseSet.has(entry.migrationPhase)) problems.push(`module ${label} references missing migration phase ${entry.migrationPhase}`);
    if (!entry.notes || !String(entry.notes).trim()) problems.push(`module ${label} missing architecture notes`);
  }
  for (const layer of layers) {
    const label = layer.name || "[missing-layer]";
    if (!layer.name) problems.push("data layer entry missing name");
    if (!layer.role) problems.push(`data layer ${label} missing role`);
    if (typeof layer.authoritative !== "boolean") problems.push(`data layer ${label} missing authoritative boolean`);
    if (!layer.targetRule || !String(layer.targetRule).trim()) problems.push(`data layer ${label} missing targetRule`);
  }
  return uniqueSorted(problems);
}

export function validateMigrationJournal(journal, migrationFiles) {
  const problems = [];
  const entries = Array.isArray(journal?.entries) ? journal.entries : [];
  const fileTags = migrationFiles.map((file) => file.replace(/\.sql$/u, ""));
  const journalTags = entries.map((entry) => entry.tag);
  const indexes = entries.map((entry) => entry.idx);
  for (const tag of duplicates(journalTags)) problems.push(`duplicate journal tag: ${tag}`);
  for (const idx of duplicates(indexes)) problems.push(`duplicate journal index: ${idx}`);
  for (let i = 0; i < entries.length; i += 1) {
    if (entries[i]?.idx !== i) problems.push(`journal index ${entries[i]?.idx} is not sequential at position ${i}`);
  }
  const missingFromJournal = fileTags.filter((tag) => !journalTags.includes(tag));
  const missingSqlFile = journalTags.filter((tag) => !fileTags.includes(tag));
  if (missingFromJournal.length) problems.push(`migration SQL missing from journal: ${missingFromJournal.join(", ")}`);
  if (missingSqlFile.length) problems.push(`journal entry missing SQL file: ${missingSqlFile.join(", ")}`);
  if (fileTags.length === journalTags.length && JSON.stringify(fileTags) !== JSON.stringify(journalTags)) {
    problems.push("migration journal order does not match SQL filename order");
  }
  return uniqueSorted(problems);
}

export async function buildCurrentDataInventory() {
  const [registry, migrationPlan, migrationJournal] = await Promise.all([
    readJson(registryPath),
    readJson(migrationPlanPath),
    readJson(migrationJournalPath),
  ]);
  const registered = moduleRegistryMap(registry);
  const exportedModules = extractSchemaExports(await readFile(schemaIndexPath, "utf8"));
  const registeredModules = registry.schemaModules.map((entry) => entry.module).sort();
  const schemaEntries = await readdir(schemaDir, { withFileTypes: true });
  const schemaFiles = schemaEntries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".ts") && entry.name !== "index.ts" && !entry.name.endsWith(".test.ts"))
    .map((entry) => entry.name.replace(/\.ts$/u, ""))
    .sort((a, b) => a.localeCompare(b));
  const nestedSchemaDirectories = schemaEntries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  const schemaModules = [];
  const tables = [];
  const moduleTableMismatches = [];
  const unsupportedSchemaConstructs = [];
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
    const source = await readFile(modulePath, "utf8");
    const actualTables = extractPgTables(source);
    const unsupported = detectUnsupportedSchemaConstructs(source);
    if (unsupported.length) unsupportedSchemaConstructs.push({ module: moduleName, constructs: unsupported });
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
    for (const table of actualTables) tables.push({ table, module: moduleName });
  }
  tables.sort((a, b) => a.table.localeCompare(b.table) || a.module.localeCompare(b.module));
  const duplicateRegisteredTableOwners = Array.from(registeredTableOwners.entries())
    .filter(([, owners]) => owners.length > 1)
    .map(([table, owners]) => ({ table, owners: owners.sort() }))
    .sort((a, b) => a.table.localeCompare(b.table));

  const migrationFiles = (await readdir(migrationsDir, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name).sort((a, b) => a.localeCompare(b));
  const migrationTables = [];
  const unsupportedMigrationCreateStatements = [];
  for (const migration of migrationFiles) {
    const source = await readFile(path.join(migrationsDir, migration), "utf8");
    const extracted = extractMigrationTables(source);
    const createTableStatements = Array.from(source.matchAll(/CREATE TABLE(?: IF NOT EXISTS)?\b/giu)).length;
    if (createTableStatements !== extracted.length) unsupportedMigrationCreateStatements.push(migration);
    for (const table of extracted) migrationTables.push({ table, migration });
  }
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
  const phaseIds = migrationPlan.phases.map((phase) => phase.id);

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
        schemaTablesNotCreatedInVersionedMigrations: schemaTableNames.filter((table) => !migrationTableNames.includes(table)),
        migrationTablesNotInCurrentDrizzleSchema: migrationTableNames.filter((table) => !schemaTableNames.includes(table)),
      },
      registryCoverage: {
        exportedButUnregisteredModules: exportedModules.filter((module) => !registeredModules.includes(module)),
        registeredButNotExportedModules: registeredModules.filter((module) => !exportedModules.includes(module)),
        schemaFilesNotExported: schemaFiles.filter((module) => !exportedModules.includes(module)),
        exportedModulesWithoutSchemaFile: exportedModules.filter((module) => !schemaFiles.includes(module)),
        nestedSchemaDirectories,
        moduleTableMismatches,
        duplicateRegisteredTableOwners,
        unsupportedSchemaConstructs,
        registrySemanticProblems: validateRegistrySemantics(registry, phaseIds),
        migrationPlanProblems: validateMigrationPlan(migrationPlan, registeredModules),
        migrationJournalProblems: validateMigrationJournal(migrationJournal, migrationFiles),
        unsupportedMigrationCreateStatements,
      },
    },
    dataLake: {
      observedLayers: observedLayerList,
      registeredLayers: allowedLayers,
      unregisteredLayers: observedLayerList.filter((layer) => !allowedLayers.includes(layer)),
      registeredButMissingLayers: allowedLayers.filter((layer) => !observedLayerList.includes(layer)),
    },
  };

  const metrics = {
    schemaVersion: "lt-data-operational-metrics.v1",
    database: { schemaModuleCount: structural.database.schemaModuleCount, tableCount: structural.database.tableCount, migrationCount: migrationFiles.length },
    dataLake: {
      fileCount: dataFiles.length,
      byteCount: groupList.reduce((sum, group) => sum + group.byteCount, 0),
      groups: groupList.map((group) => ({ root: group.root, files: group.fileCount, bytes: group.byteCount, extensionTypes: Array.from(group.extensions).sort() })),
    },
  };
  return { structural, metrics };
}

export function assertArchitectureCoverage(inventory) {
  const structural = inventory.structural ?? inventory;
  const coverage = structural.database.registryCoverage;
  const problems = [];
  if (coverage.exportedButUnregisteredModules.length) problems.push(`unregistered schema modules: ${coverage.exportedButUnregisteredModules.join(", ")}`);
  if (coverage.registeredButNotExportedModules.length) problems.push(`stale registered schema modules: ${coverage.registeredButNotExportedModules.join(", ")}`);
  if (coverage.schemaFilesNotExported.length) problems.push(`schema files not exported by schema/index.ts: ${coverage.schemaFilesNotExported.join(", ")}`);
  if (coverage.exportedModulesWithoutSchemaFile.length) problems.push(`schema exports without a matching file: ${coverage.exportedModulesWithoutSchemaFile.join(", ")}`);
  if (coverage.nestedSchemaDirectories.length) problems.push(`unsupported nested schema directories: ${coverage.nestedSchemaDirectories.join(", ")}`);
  if (coverage.moduleTableMismatches.length) problems.push(`schema modules with undeclared table drift: ${coverage.moduleTableMismatches.map((entry) => entry.module).join(", ")}`);
  if (coverage.duplicateRegisteredTableOwners.length) problems.push(`tables with multiple registered owners: ${coverage.duplicateRegisteredTableOwners.map((entry) => entry.table).join(", ")}`);
  if (coverage.unsupportedSchemaConstructs.length) problems.push(`unsupported Drizzle schema constructs: ${coverage.unsupportedSchemaConstructs.map((entry) => `${entry.module}(${entry.constructs.join("|")})`).join(", ")}`);
  if (coverage.registrySemanticProblems.length) problems.push(`invalid architecture registry semantics: ${coverage.registrySemanticProblems.join(" | ")}`);
  if (coverage.migrationPlanProblems.length) problems.push(`invalid architecture migration plan: ${coverage.migrationPlanProblems.join(" | ")}`);
  if (coverage.migrationJournalProblems.length) problems.push(`migration journal drift: ${coverage.migrationJournalProblems.join(" | ")}`);
  if (coverage.unsupportedMigrationCreateStatements.length) problems.push(`unsupported CREATE TABLE syntax in migrations: ${coverage.unsupportedMigrationCreateStatements.join(", ")}`);
  if (structural.database.migrations.schemaTablesNotCreatedInVersionedMigrations.length) problems.push(`schema tables missing from versioned migration chain: ${structural.database.migrations.schemaTablesNotCreatedInVersionedMigrations.join(", ")}`);
  if (structural.dataLake.unregisteredLayers.length) problems.push(`unregistered data lake layers: ${structural.dataLake.unregisteredLayers.join(", ")}`);
  if (problems.length) throw new Error(`Data architecture registry coverage failed: ${problems.join("; ")}`);
}

function baselineFromStructural(structural) {
  return {
    schemaVersion: structural.schemaVersion,
    architectureContract: structural.architectureContract,
    registryVersion: structural.registryVersion,
    database: {
      dialect: structural.database.dialect,
      orm: structural.database.orm,
      schemaModuleCount: structural.database.schemaModuleCount,
      tableCount: structural.database.tableCount,
      sqlMigrationFiles: structural.database.migrations.sqlMigrationFiles,
      schemaTablesNotCreatedInVersionedMigrations: structural.database.migrations.schemaTablesNotCreatedInVersionedMigrations,
      migrationTablesNotInCurrentDrizzleSchema: structural.database.migrations.migrationTablesNotInCurrentDrizzleSchema,
    },
    dataLake: {
      observedLayers: structural.dataLake.observedLayers,
      registeredLayers: structural.dataLake.registeredLayers,
    },
    detailedOwnershipRegistry: "architecture/data-domain-registry.v1.json",
    operationalMetricsCommand: "node scripts/architecture/dataArchitectureInventory.mjs --metrics"
  };
}

async function checkCommittedInventory(structural) {
  const expected = stableJson(baselineFromStructural(structural));
  const actual = await readFile(inventoryPath, "utf8").catch(() => "");
  if (actual !== expected) {
    console.error("--- GENERATED STRUCTURAL DATA INVENTORY START ---");
    console.error(expected.trimEnd());
    console.error("--- GENERATED STRUCTURAL DATA INVENTORY END ---");
    throw new Error("architecture/current-data-inventory.json has structural drift. Run: node scripts/architecture/dataArchitectureInventory.mjs --write");
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const inventory = await buildCurrentDataInventory();
  assertArchitectureCoverage(inventory);
  if (args.has("--write")) {
    await writeFile(inventoryPath, stableJson(baselineFromStructural(inventory.structural)), "utf8");
    console.log(`Wrote structural baseline: ${inventory.structural.database.tableCount} tables; operational scan observed ${inventory.metrics.dataLake.fileCount} data files.`);
    return;
  }
  if (args.has("--check")) {
    await checkCommittedInventory(inventory.structural);
    console.log(`Data architecture structure is current: ${inventory.structural.database.tableCount} tables across ${inventory.structural.database.schemaModuleCount} modules.`);
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
