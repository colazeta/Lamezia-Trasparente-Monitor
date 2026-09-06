#!/usr/bin/env node
import process from "node:process";

const DEFAULT_PUBLIC_URL = "https://lamezia-trasparente.pages.dev";
const REPOSITORY = "colazeta/Lamezia-Trasparente-Monitor";
const MAIN_BRANCH = "main";
const DEPLOY_PROVENANCE_PATH = "/deploy-provenance.json";
const STATIC_CONTRACTS_DATA_PATH =
  "/data/processed/contracts/lamezia-contracts-current.json";
const MULTI_SOURCE_SCHEMA = "lamezia-contracts-multisource.v1";
const REQUIRED_DEPLOYMENT_CONTRACT = "contracts-anac-bdncp-resilient-v4";
const REQUIRED_ROUTES = ["/", "/contratti", "/organi", "/amministratori"];
const REQUIRED_CONTRACT_MARKERS = [
  "contracts-search",
  "contracts-list",
  "Contratti nel perimetro",
  "I dati mancanti non sono trattati come zero",
];
const REQUIRED_ORGANI_MARKERS = [
  "organi-list",
  "Organi del Comune",
  "Componenti correnti",
  "Righe storiche",
];
const REQUIRED_PUBLIC_TEXT = [
  "rendiamoLameziaTrasparente",
  "Osservatorio Civico Indipendente",
];
const relationCache = new Map();

function parseArgs(argv) {
  const options = {
    publicUrl: DEFAULT_PUBLIC_URL,
    expectedCommit: null,
    allowNewerMain: false,
    attempts: 1,
    delayMs: 10_000,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => argv[++index];
    if (arg === "--url") options.publicUrl = next();
    else if (arg === "--expected-commit") options.expectedCommit = next();
    else if (arg === "--allow-newer-main") options.allowNewerMain = true;
    else if (arg === "--attempts") options.attempts = Number(next());
    else if (arg === "--delay-ms") options.delayMs = Number(next());
    else if (arg === "--help" || arg === "-h") {
      console.log(
        "Usage: node scripts/check-public-contracts-page.mjs [--url <url>] [--expected-commit <sha>] [--allow-newer-main] [--attempts <n>] [--delay-ms <ms>]",
      );
      process.exit(0);
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.publicUrl) throw new Error("Public URL cannot be blank.");
  options.publicUrl = new URL(options.publicUrl).href.replace(/\/+$/u, "");
  if (options.expectedCommit) {
    options.expectedCommit = normalizeCommit(options.expectedCommit, "--expected-commit");
  }
  if (!Number.isInteger(options.attempts) || options.attempts < 1) {
    throw new Error("--attempts must be a positive integer.");
  }
  if (!Number.isInteger(options.delayMs) || options.delayMs < 0) {
    throw new Error("--delay-ms must be a non-negative integer.");
  }
  return options;
}

function normalizeCommit(value, label) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/u.test(normalized)) {
    throw new Error(`${label} must be a full 40-character Git SHA.`);
  }
  return normalized;
}

function routeUrl(base, pathname) {
  return new URL(pathname, `${base}/`).href;
}

async function fetchResponse(url, method = "GET") {
  return fetch(url, {
    method,
    headers: { "cache-control": "no-cache", pragma: "no-cache" },
    redirect: "follow",
  });
}

async function fetchRequiredText(url, label, method = "GET") {
  const response = await fetchResponse(url, method);
  if (!response.ok) {
    throw new Error(`${label} returned HTTP ${response.status}: ${response.url}`);
  }
  return {
    finalUrl: response.url,
    status: response.status,
    contentType: response.headers.get("content-type") ?? "",
    text: method === "HEAD" ? "" : await response.text(),
  };
}

async function fetchRequiredJson(url, label) {
  const result = await fetchRequiredText(url, label);
  if (!result.contentType.toLowerCase().includes("application/json")) {
    throw new Error(`${label} returned unexpected Content-Type: ${result.contentType}`);
  }
  try {
    return { ...result, value: JSON.parse(result.text) };
  } catch (error) {
    throw new Error(
      `${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function fetchOptionalJson(url, label) {
  const response = await fetchResponse(url);
  const contentType = response.headers.get("content-type") ?? "";
  if (response.status === 503) {
    await response.body?.cancel();
    return { mode: "static-fallback", status: 503, value: null };
  }
  if (!response.ok) {
    throw new Error(`${label} returned HTTP ${response.status}: ${response.url}`);
  }
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error(`${label} returned unexpected Content-Type: ${contentType}`);
  }
  return { mode: "live", status: response.status, value: await response.json() };
}

async function fetchGitHubJson(path, label) {
  const headers = {
    accept: "application/vnd.github+json",
    "user-agent": "lamezia-trasparente-deploy-smoke",
    "x-github-api-version": "2022-11-28",
  };
  const token = String(process.env.GITHUB_TOKEN ?? "").trim();
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) {
    throw new Error(`${label} returned HTTP ${response.status}: ${response.url}`);
  }
  return response.json();
}

async function assertCommitRelation(expected, observed, allowNewerMain) {
  if (!expected || observed === expected) return { mode: expected ? "exact" : "unconstrained", observedCommit: observed };
  if (!allowNewerMain) {
    throw new Error(`Deploy provenance commit is ${observed}; expected ${expected}.`);
  }
  const key = `${expected}:${observed}`;
  if (relationCache.has(key)) return relationCache.get(key);
  const comparison = await fetchGitHubJson(
    `/repos/${REPOSITORY}/compare/${expected}...${observed}`,
    "GitHub expected-to-production comparison",
  );
  if (comparison.status !== "ahead") {
    throw new Error(`Deploy commit ${observed} is not a descendant of ${expected}.`);
  }
  const main = await fetchGitHubJson(
    `/repos/${REPOSITORY}/branches/${MAIN_BRANCH}`,
    "GitHub main branch",
  );
  const mainCommit = normalizeCommit(main?.commit?.sha, "main commit");
  if (observed !== mainCommit) {
    const productionToMain = await fetchGitHubJson(
      `/repos/${REPOSITORY}/compare/${observed}...${mainCommit}`,
      "GitHub production-to-main comparison",
    );
    if (productionToMain.status !== "ahead") {
      throw new Error(`Deploy commit ${observed} is not in current main history.`);
    }
  }
  const result = { mode: "superseded", observedCommit: observed, mainCommit };
  relationCache.set(key, result);
  return result;
}

async function assertProvenance(provenance, options) {
  if (
    !provenance ||
    typeof provenance !== "object" ||
    Array.isArray(provenance) ||
    provenance.repository !== REPOSITORY ||
    provenance.deploymentContract !== REQUIRED_DEPLOYMENT_CONTRACT
  ) {
    throw new Error("Deploy provenance marker is invalid.");
  }
  const observed = normalizeCommit(provenance.commitSha, "deploy provenance commitSha");
  const requiredRoutes = Array.isArray(provenance.requiredRoutes)
    ? provenance.requiredRoutes
    : [];
  for (const route of ["/contratti", "/organi", "/amministratori"]) {
    if (!requiredRoutes.includes(route)) {
      throw new Error(`Deploy provenance is missing required route: ${route}`);
    }
  }
  const requiredMarkers = Array.isArray(provenance.requiredMarkers)
    ? provenance.requiredMarkers
    : [];
  for (const marker of [...REQUIRED_CONTRACT_MARKERS, ...REQUIRED_ORGANI_MARKERS]) {
    if (!requiredMarkers.includes(marker)) {
      throw new Error(`Deploy provenance is missing required marker: ${marker}`);
    }
  }
  return assertCommitRelation(
    options.expectedCommit,
    observed,
    options.allowNewerMain,
  );
}

function assertUniqueStrings(values, label) {
  if (
    !Array.isArray(values) ||
    values.some((value) => typeof value !== "string" || !value.trim()) ||
    new Set(values).size !== values.length
  ) {
    throw new Error(`${label} must be a unique non-empty string array.`);
  }
}

function assertMultiSourceDataset(dataset) {
  if (
    !dataset ||
    typeof dataset !== "object" ||
    Array.isArray(dataset) ||
    dataset.schemaVersion !== MULTI_SOURCE_SCHEMA ||
    dataset.source?.scope !== "known-public-sources" ||
    !Array.isArray(dataset.contracts) ||
    !dataset.storylines ||
    dataset.authorityDiscovery?.schemaVersion !== "anac-authority-discovery.v1" ||
    !dataset.reconciliation
  ) {
    throw new Error("Static contracts dataset must expose the multi-source schema.");
  }
  const reconciliation = dataset.reconciliation;
  const coverage = dataset.coverage;
  for (const key of ["overlapCigs", "alboOnlyCigs", "anacOnlyCigs"]) {
    assertUniqueStrings(reconciliation[key], `reconciliation.${key}`);
  }
  const local = new Set([
    ...reconciliation.overlapCigs,
    ...reconciliation.alboOnlyCigs,
  ]);
  const authority = new Set([
    ...reconciliation.overlapCigs,
    ...reconciliation.anacOnlyCigs,
  ]);
  const union = new Set([...local, ...authority]);
  if (
    dataset.contracts.length !== reconciliation.unionCigs ||
    dataset.contracts.length !== coverage?.multiSourceContracts ||
    local.size !== reconciliation.localCanonicalCigs ||
    authority.size !== reconciliation.anacAuthorityCigs ||
    union.size !== reconciliation.unionCigs ||
    coverage?.canonicalContracts !== reconciliation.localCanonicalCigs ||
    coverage?.overlapContracts !== reconciliation.overlapCigs.length ||
    coverage?.alboOnlyContracts !== reconciliation.alboOnlyCigs.length ||
    coverage?.anacOnlyContracts !== reconciliation.anacOnlyCigs.length ||
    coverage?.unresolvedEvents !== reconciliation.unresolvedAlboEvents ||
    coverage?.unionInvariantSatisfied !== true ||
    reconciliation.sourceResolutionInvariantSatisfied !== true
  ) {
    throw new Error("Static multi-source contracts reconciliation is inconsistent.");
  }
  const ids = new Set();
  const cigs = new Set();
  for (const contract of dataset.contracts) {
    if (
      !Number.isSafeInteger(contract.id) ||
      contract.id <= 0 ||
      ids.has(contract.id) ||
      !/^[A-Z0-9]{10}$/u.test(contract.cig ?? "") ||
      cigs.has(contract.cig) ||
      !union.has(contract.cig) ||
      contract.withoutMepa !== false ||
      typeof contract.amount !== "number" ||
      contract.amount < 0 ||
      !dataset.storylines[String(contract.id)]
    ) {
      throw new Error("Static multi-source contracts dataset contains an invalid contract.");
    }
    ids.add(contract.id);
    cigs.add(contract.cig);
  }
  return { local, authority, union };
}

function assertLiveParity(contracts, dataset) {
  if (!Array.isArray(contracts)) throw new Error("Contracts API must return a JSON array.");
  if (contracts.length !== dataset.contracts.length) {
    throw new Error("Contracts API and static multi-source dataset totals differ.");
  }
  const staticByCig = new Map(dataset.contracts.map((item) => [item.cig, item]));
  for (const contract of contracts) {
    const expected = staticByCig.get(contract.cig);
    if (!expected || expected.id !== contract.id) {
      throw new Error(`Contracts API does not match static census for CIG ${contract.cig}.`);
    }
  }
}

function assertPublicText(html, label) {
  if (!REQUIRED_PUBLIC_TEXT.some((marker) => html.toLowerCase().includes(marker.toLowerCase()))) {
    throw new Error(`${label} does not contain an expected public site marker.`);
  }
}

function extractScriptPaths(...documents) {
  const paths = new Set();
  for (const html of documents) {
    for (const match of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/giu)) {
      if (match[1]) paths.add(match[1]);
    }
  }
  return [...paths];
}

async function assertBundleMarkers(baseUrl, scriptPaths) {
  const queue = scriptPaths.map((path) => new URL(path, `${baseUrl}/`).href);
  const visited = new Set();
  let combined = "";
  while (queue.length > 0 && visited.size < 64) {
    const url = queue.shift();
    if (!url || visited.has(url)) continue;
    const result = await fetchRequiredText(url, `JavaScript asset ${url}`);
    visited.add(url);
    combined += `\n${result.text}`;
    const missing = [...REQUIRED_CONTRACT_MARKERS, ...REQUIRED_ORGANI_MARKERS].filter(
      (marker) => !combined.includes(marker),
    );
    if (missing.length === 0) return visited.size;
    for (const match of result.text.matchAll(/["']([^"'?]+\.js(?:\?[^"']*)?)["']/gu)) {
      const ref = match[1];
      if (!ref || !(ref.startsWith("/") || ref.startsWith("./") || ref.startsWith("../"))) continue;
      const dependency = new URL(ref, url).href;
      if (new URL(dependency).origin === new URL(baseUrl).origin && !visited.has(dependency)) {
        queue.push(dependency);
      }
    }
  }
  const missing = [...REQUIRED_CONTRACT_MARKERS, ...REQUIRED_ORGANI_MARKERS].filter(
    (marker) => !combined.includes(marker),
  );
  if (missing.length > 0) {
    throw new Error(`Public JavaScript bundle is missing markers: ${missing.join(", ")}`);
  }
  return visited.size;
}

async function check(options) {
  const routeResults = await Promise.all(
    REQUIRED_ROUTES.map((route) =>
      fetchRequiredText(routeUrl(options.publicUrl, route), `Route ${route}`),
    ),
  );
  for (const result of routeResults) assertPublicText(result.text, result.finalUrl);

  const [provenance, staticDataset, contractsApi] = await Promise.all([
    fetchRequiredJson(
      routeUrl(options.publicUrl, DEPLOY_PROVENANCE_PATH),
      "Deploy provenance marker",
    ),
    fetchRequiredJson(
      routeUrl(options.publicUrl, STATIC_CONTRACTS_DATA_PATH),
      "Static contracts dataset",
    ),
    fetchOptionalJson(routeUrl(options.publicUrl, "/api/contracts"), "Contracts API"),
  ]);
  const relation = await assertProvenance(provenance.value, options);
  assertMultiSourceDataset(staticDataset.value);
  if (contractsApi.mode === "live") {
    assertLiveParity(contractsApi.value, staticDataset.value);
  } else {
    console.log(
      "Contracts API is intentionally unavailable in static fallback mode; validated the public multi-source dataset instead.",
    );
  }

  const scriptPaths = extractScriptPaths(...routeResults.map((result) => result.text));
  const assetCount = await assertBundleMarkers(options.publicUrl, scriptPaths);
  console.log(
    `Verified multi-source census (${staticDataset.value.contracts.length} contracts), ${assetCount} JavaScript assets, authority status ${staticDataset.value.authorityDiscovery.status}.`,
  );
  return relation;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  let lastError;
  for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
    try {
      console.log(`Public contracts smoke attempt ${attempt}/${options.attempts}`);
      const relation = await check(options);
      console.log(
        relation.mode === "superseded"
          ? `Public contracts smoke passed on verified newer main commit ${relation.observedCommit}.`
          : "Public contracts smoke passed.",
      );
      return;
    } catch (error) {
      lastError = error;
      console.error(
        `Public contracts smoke attempt ${attempt} failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      if (attempt < options.attempts && options.delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, options.delayMs));
      }
    }
  }
  throw lastError;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
