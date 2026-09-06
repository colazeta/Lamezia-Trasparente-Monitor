#!/usr/bin/env node
import process from "node:process";

const DEFAULT_URL = "https://lamezia-trasparente.pages.dev";
const PROVENANCE_PATH = "/deploy-provenance.json";
const CONTRACTS_PATH =
  "/data/processed/contracts/lamezia-contracts-current.json";
const EXPECTED_SCHEMA = "lamezia-contracts-multisource.v1";
const EXPECTED_REPOSITORY = "colazeta/Lamezia-Trasparente-Monitor";

function parseArgs(argv) {
  const options = {
    url: DEFAULT_URL,
    expectedCommit: null,
    attempts: 1,
    delayMs: 10_000,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--url") options.url = argv[++index];
    else if (arg === "--expected-commit") options.expectedCommit = argv[++index];
    else if (arg === "--attempts") options.attempts = Number(argv[++index]);
    else if (arg === "--delay-ms") options.delayMs = Number(argv[++index]);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.url) throw new Error("--url cannot be blank");
  if (
    options.expectedCommit !== null &&
    !/^[0-9a-f]{40}$/iu.test(options.expectedCommit)
  ) {
    throw new Error("--expected-commit must be a full 40-character Git SHA");
  }
  if (!Number.isInteger(options.attempts) || options.attempts < 1) {
    throw new Error("--attempts must be a positive integer");
  }
  if (!Number.isInteger(options.delayMs) || options.delayMs < 0) {
    throw new Error("--delay-ms must be a non-negative integer");
  }
  options.url = new URL(options.url).href.replace(/\/+$/u, "");
  options.expectedCommit = options.expectedCommit?.toLowerCase() ?? null;
  return options;
}

async function fetchJson(baseUrl, pathname, label) {
  const response = await fetch(new URL(pathname, `${baseUrl}/`), {
    headers: { "cache-control": "no-cache", pragma: "no-cache" },
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`${label} returned HTTP ${response.status}: ${response.url}`);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error(`${label} returned unexpected Content-Type: ${contentType}`);
  }
  return response.json();
}

function assertProvenance(provenance, expectedCommit) {
  if (
    !provenance ||
    typeof provenance !== "object" ||
    Array.isArray(provenance) ||
    provenance.repository !== EXPECTED_REPOSITORY ||
    provenance.deploymentContract !== "contracts-anac-bdncp-resilient-v4" ||
    !/^[0-9a-f]{40}$/iu.test(provenance.commitSha ?? "")
  ) {
    throw new Error("Public deploy provenance is invalid");
  }
  if (
    expectedCommit &&
    provenance.commitSha.toLowerCase() !== expectedCommit.toLowerCase()
  ) {
    throw new Error(
      `Public deploy is ${provenance.commitSha}; expected ${expectedCommit}`,
    );
  }
}

function assertDataset(dataset) {
  if (
    !dataset ||
    typeof dataset !== "object" ||
    Array.isArray(dataset) ||
    dataset.schemaVersion !== EXPECTED_SCHEMA ||
    dataset.source?.scope !== "known-public-sources" ||
    !Array.isArray(dataset.contracts) ||
    !dataset.reconciliation ||
    typeof dataset.reconciliation !== "object" ||
    dataset.authorityDiscovery?.schemaVersion !== "anac-authority-discovery.v1"
  ) {
    throw new Error("Public static contracts dataset is not the multi-source census");
  }
  const coverage = dataset.coverage;
  const reconciliation = dataset.reconciliation;
  if (
    coverage?.multiSourceContracts !== dataset.contracts.length ||
    reconciliation.unionCigs !== dataset.contracts.length ||
    coverage?.unionInvariantSatisfied !== true ||
    reconciliation.sourceResolutionInvariantSatisfied !== true
  ) {
    throw new Error("Public multi-source contracts reconciliation is inconsistent");
  }
}

async function check(options) {
  const [provenance, dataset] = await Promise.all([
    fetchJson(options.url, PROVENANCE_PATH, "Deploy provenance"),
    fetchJson(options.url, CONTRACTS_PATH, "Static contracts dataset"),
  ]);
  assertProvenance(provenance, options.expectedCommit);
  assertDataset(dataset);
  return {
    commit: provenance.commitSha,
    contracts: dataset.contracts.length,
    authorityStatus: dataset.authorityDiscovery.status,
    anacAuthorityCigs: dataset.reconciliation.anacAuthorityCigs,
    unresolvedAlboEvents: dataset.reconciliation.unresolvedAlboEvents,
  };
}

const options = parseArgs(process.argv.slice(2));
let lastError;
for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
  try {
    const result = await check(options);
    console.log(`Static contracts deploy preflight passed: ${JSON.stringify(result)}`);
    process.exit(0);
  } catch (error) {
    lastError = error;
    console.warn(
      `Static contracts deploy preflight attempt ${attempt}/${options.attempts} failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    if (attempt < options.attempts) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }
  }
}
console.error(lastError instanceof Error ? lastError.message : String(lastError));
process.exit(1);
