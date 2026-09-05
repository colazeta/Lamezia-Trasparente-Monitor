#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const DEFAULT_DIST_DIR = "artifacts/lamezia-trasparente/dist/public";
const CONTRACTS_RELATIVE_PATH =
  "data/processed/contracts/lamezia-contracts-current.json";
const CANONICAL_SCHEMA = "lamezia-contracts-canonical.v2";

function parseDist(argv) {
  const index = argv.indexOf("--dist");
  if (index === -1) return DEFAULT_DIST_DIR;
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error("Missing value for --dist.");
  }
  return value;
}

function assertNonNegativeInteger(value, label) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer.`);
  }
}

function assertCanonicalContractsDataset(dataset, datasetPath) {
  if (
    !dataset ||
    typeof dataset !== "object" ||
    Array.isArray(dataset) ||
    dataset.schemaVersion !== CANONICAL_SCHEMA ||
    dataset.source?.scope !== "current-public-window" ||
    dataset.source?.publicClaim !==
      "contratti canonici ed eventi procurement correnti" ||
    !Array.isArray(dataset.procurementEvents) ||
    !Array.isArray(dataset.contractEntities) ||
    !Array.isArray(dataset.unresolvedEvents) ||
    !Array.isArray(dataset.contracts) ||
    !dataset.storylines ||
    typeof dataset.storylines !== "object"
  ) {
    throw new Error(`Canonical contracts dataset has an invalid schema: ${datasetPath}`);
  }

  const coverage = dataset.coverage;
  if (!coverage || typeof coverage !== "object" || Array.isArray(coverage)) {
    throw new Error(`Canonical contracts coverage is missing: ${datasetPath}`);
  }

  for (const key of [
    "sourceItemsObserved",
    "publicOfficialItems",
    "procurementEvents",
    "procurementConfirmed",
    "procurementPossible",
    "eventsWithCig",
    "eventsWithoutCig",
    "multiCigEvents",
    "canonicalContracts",
    "contractEventLinks",
    "unresolvedEvents",
    "withCup",
    "withExplicitAmount",
    "withExplicitSupplier",
  ]) {
    assertNonNegativeInteger(coverage[key], `coverage.${key}`);
  }

  if (
    coverage.procurementEvents !== dataset.procurementEvents.length ||
    coverage.canonicalContracts !== dataset.contracts.length ||
    coverage.canonicalContracts !== dataset.contractEntities.length ||
    coverage.unresolvedEvents !== dataset.unresolvedEvents.length ||
    coverage.eventsWithoutCig !== dataset.unresolvedEvents.length ||
    coverage.eventsWithCig + coverage.eventsWithoutCig !==
      coverage.procurementEvents ||
    coverage.procurementConfirmed + coverage.procurementPossible !==
      coverage.procurementEvents ||
    coverage.eventCoverageInvariantSatisfied !== true ||
    coverage.resolutionInvariantSatisfied !== true ||
    dataset.feedStatus?.itemsTotal !== dataset.contracts.length
  ) {
    throw new Error(
      `Canonical contracts coverage invariants are inconsistent: ${datasetPath}`,
    );
  }

  const eventIds = new Set();
  for (const event of dataset.procurementEvents) {
    if (
      typeof event.eventId !== "string" ||
      !event.eventId ||
      eventIds.has(event.eventId) ||
      !["possible", "confirmed"].includes(event.procurementRelevance) ||
      !Array.isArray(event.cigs) ||
      !Array.isArray(event.contractIdentityCigs) ||
      !Array.isArray(event.relatedCigs) ||
      !Array.isArray(event.contractIds)
    ) {
      throw new Error(`Canonical procurement event is invalid: ${datasetPath}`);
    }
    eventIds.add(event.eventId);

    if (event.resolutionStatus === "unresolved_no_cig") {
      if (event.contractIdentityCigs.length !== 0 || event.contractIds.length !== 0) {
        throw new Error(
          `Unresolved procurement event was assigned a contract identity: ${event.eventId}`,
        );
      }
    } else if (event.contractIdentityCigs.length === 0) {
      throw new Error(
        `Resolved procurement event is missing its contract identity: ${event.eventId}`,
      );
    }
  }

  for (const event of dataset.unresolvedEvents) {
    if (
      event.resolutionStatus !== "unresolved_no_cig" ||
      !eventIds.has(event.eventId)
    ) {
      throw new Error(
        `Unresolved-event projection is inconsistent: ${event.eventId ?? "unknown"}`,
      );
    }
  }

  const contractIds = new Set();
  const contractCigs = new Set();
  for (const contract of dataset.contracts) {
    if (
      !Number.isSafeInteger(contract.id) ||
      contract.id <= 0 ||
      contractIds.has(contract.id) ||
      !/^[A-Z0-9]{10}$/u.test(contract.cig ?? "") ||
      contractCigs.has(contract.cig) ||
      typeof contract.title !== "string" ||
      !contract.title.trim() ||
      typeof contract.amount !== "number" ||
      contract.amount < 0 ||
      contract.withoutMepa !== false ||
      !dataset.storylines[String(contract.id)]
    ) {
      throw new Error(
        `Canonical contracts dataset contains an invalid contract entity: ${datasetPath}`,
      );
    }
    contractIds.add(contract.id);
    contractCigs.add(contract.cig);
  }

  for (const entity of dataset.contractEntities) {
    if (
      typeof entity.canonicalId !== "string" ||
      entity.canonicalId !== `contract:cig:${entity.cig}` ||
      !contractIds.has(entity.id) ||
      !contractCigs.has(entity.cig) ||
      !Array.isArray(entity.eventIds) ||
      entity.eventIds.length === 0 ||
      entity.eventIds.some((eventId) => !eventIds.has(eventId))
    ) {
      throw new Error(
        `Canonical contract entity projection is inconsistent: ${entity.canonicalId ?? "unknown"}`,
      );
    }
  }

  return {
    schemaVersion: dataset.schemaVersion,
    procurementEvents: dataset.procurementEvents.length,
    canonicalContracts: dataset.contracts.length,
    unresolvedEvents: dataset.unresolvedEvents.length,
    contractEventLinks: coverage.contractEventLinks,
  };
}

function legacySmokeAdapter(dataset) {
  return {
    ...dataset,
    schemaVersion: "lamezia-contracts-current.v1",
    source: {
      ...dataset.source,
      scope: "current-albo-window",
      publicClaim: "atti correnti con CIG",
    },
    coverage: {
      ...dataset.coverage,
      contracts: dataset.contracts.length,
      cigBearingItems: dataset.contracts.length,
    },
  };
}

async function main() {
  const distDir = parseDist(process.argv.slice(2));
  const contractsPath = path.join(distDir, CONTRACTS_RELATIVE_PATH);
  const originalText = await readFile(contractsPath, "utf8");
  const dataset = JSON.parse(originalText);
  const canonicalSummary = assertCanonicalContractsDataset(dataset, contractsPath);

  // The legacy smoke contains many unrelated deployment assertions that remain
  // valuable. Feed it only a temporary wire-compatible view of the contracts
  // artifact, then restore the canonical artifact before the workflow uploads it.
  await writeFile(
    contractsPath,
    `${JSON.stringify(legacySmokeAdapter(dataset))}\n`,
    "utf8",
  );

  try {
    const result = spawnSync(
      process.execPath,
      ["scripts/check-v0-static-fallback.mjs", ...process.argv.slice(2)],
      { stdio: "inherit" },
    );
    if (result.error) throw result.error;
    if (result.status !== 0) {
      process.exitCode = result.status ?? 1;
    }
  } finally {
    await writeFile(contractsPath, originalText, "utf8");
  }

  if (process.exitCode) return;
  console.log(
    `Canonical contracts smoke passed: ${JSON.stringify(canonicalSummary)}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
