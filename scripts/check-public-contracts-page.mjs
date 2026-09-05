#!/usr/bin/env node
import process from "node:process";

const DEFAULT_PUBLIC_URL = "https://lamezia-trasparente.pages.dev";
const DEFAULT_ATTEMPTS = 1;
const DEFAULT_DELAY_MS = 10_000;
const REPOSITORY = "colazeta/Lamezia-Trasparente-Monitor";
const MAIN_BRANCH = "main";
const DEPLOY_PROVENANCE_PATH = "/deploy-provenance.json";
const SITEMAP_PATH = "/sitemap.xml";
const STATIC_CONTRACTS_DATA_PATH =
  "/data/processed/contracts/lamezia-contracts-current.json";
const MULTI_SOURCE_SCHEMA = "lamezia-contracts-multisource.v1";
const AUTHORITY_SCHEMA = "anac-authority-discovery.v1";
const REQUIRED_DEPLOYMENT_CONTRACT = "contracts-anac-bdncp-resilient-v4";
const REQUIRED_PUBLIC_TEXT = [
  "rendiamoLameziaTrasparente",
  "Osservatorio Civico Indipendente",
];
const REQUIRED_CONTRACT_BUNDLE_TEXT = [
  "contracts-search",
  "contracts-list",
  "Contratti nel perimetro",
  "I dati mancanti non sono trattati come zero",
];
const REQUIRED_ORGANI_BUNDLE_TEXT = [
  "organi-list",
  "Organi del Comune",
  "Componenti correnti",
  "Righe storiche",
];
const REQUIRED_DEPLOY_ROUTES = ["/contratti", "/organi", "/amministratori"];
const API_CONTENT_TYPE_PROBES = [
  "/api/healthz",
  "/api/public/v1/stats",
  "/api/public/v1/contracts",
  "/api/public/v1/pnrr",
];
const FEED_CONTENT_TYPE_PROBES = [
  "/api/feeds/contratti.xml",
  "/feeds/albo.xml",
];
const requiredCommitRelationCache = new Map();

function usage() {
  return [
    "Usage: node scripts/check-public-contracts-page.mjs [--url <public-url>] [--expected-commit <sha>] [--allow-newer-main] [--attempts <n>] [--delay-ms <ms>]",
    "",
    "Checks production routes, deployment provenance and the multi-source procurement census.",
    "A newer production commit is accepted only when GitHub proves that it descends from the expected commit on current main.",
  ].join("\n");
}

function parseArgs(argv) {
  const options = {
    allowNewerMain: false,
    attempts: DEFAULT_ATTEMPTS,
    delayMs: DEFAULT_DELAY_MS,
    expectedCommit: null,
    publicUrl: DEFAULT_PUBLIC_URL,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--url") {
      const value = argv[(i += 1)];
      if (!value || value.startsWith("--")) throw new Error("Missing value for --url.");
      options.publicUrl = value;
    } else if (arg === "--expected-commit") {
      const value = argv[(i += 1)];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --expected-commit.");
      }
      options.expectedCommit = normalizeCommit(value, "--expected-commit");
    } else if (arg === "--allow-newer-main") {
      options.allowNewerMain = true;
    } else if (arg === "--attempts") {
      const value = Number(argv[(i += 1)]);
      if (!Number.isInteger(value) || value < 1) {
        throw new Error("--attempts must be a positive integer.");
      }
      options.attempts = value;
    } else if (arg === "--delay-ms") {
      const value = Number(argv[(i += 1)]);
      if (!Number.isInteger(value) || value < 0) {
        throw new Error("--delay-ms must be a non-negative integer.");
      }
      options.delayMs = value;
    } else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  options.publicUrl = normalizePublicUrl(options.publicUrl);
  return options;
}

function normalizePublicUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) throw new Error("Public URL cannot be blank.");
  return new URL(trimmed).href.replace(/\/+$/, "");
}

function normalizeCommit(value, label = "commit") {
  const normalized = String(value || "").trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/u.test(normalized)) {
    throw new Error(`${label} must be a full 40-character Git SHA.`);
  }
  return normalized;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function routeUrl(publicUrl, route) {
  return new URL(route, `${publicUrl}/`).href;
}

async function fetchText(url, label, method = "GET") {
  const response = await fetch(url, {
    method,
    headers: { "cache-control": "no-cache", pragma: "no-cache" },
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`${label} returned HTTP ${response.status}: ${response.url}`);
  }
  return {
    contentType: response.headers.get("content-type") ?? "",
    finalUrl: response.url,
    status: response.status,
    text: method === "HEAD" ? "" : await response.text(),
  };
}

async function fetchProbe(url, label) {
  const response = await fetch(url, {
    method: "HEAD",
    headers: { "cache-control": "no-cache", pragma: "no-cache" },
    redirect: "follow",
  });
  if (response.status >= 500 && response.status !== 503) {
    throw new Error(`${label} returned HTTP ${response.status}: ${response.url}`);
  }
  return {
    contentType: response.headers.get("content-type") ?? "",
    finalUrl: response.url,
    status: response.status,
  };
}

async function fetchJson(url, label) {
  const result = await fetchText(url, label);
  try {
    return { finalUrl: result.finalUrl, value: JSON.parse(result.text) };
  } catch (error) {
    throw new Error(
      `${label} is not valid JSON at ${result.finalUrl}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

async function fetchGitHubJson(path, label) {
  const token = String(process.env.GITHUB_TOKEN ?? "").trim();
  const headers = {
    accept: "application/vnd.github+json",
    "user-agent": "lamezia-trasparente-deploy-smoke",
    "x-github-api-version": "2022-11-28",
  };
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) {
    throw new Error(`${label} returned HTTP ${response.status}: ${response.url}`);
  }
  return response.json();
}

async function assertExpectedOrNewerMainCommit(expectedCommit, observedCommit) {
  if (observedCommit === expectedCommit) {
    return { mode: "exact", observedCommit };
  }
  const cacheKey = `${expectedCommit}:${observedCommit}`;
  if (requiredCommitRelationCache.has(cacheKey)) {
    const cached = requiredCommitRelationCache.get(cacheKey);
    if (cached.ok) return cached.result;
    throw new Error(cached.message);
  }
  const expectedToObserved = await fetchGitHubJson(
    `/repos/${REPOSITORY}/compare/${expectedCommit}...${observedCommit}`,
    "GitHub expected-to-production comparison",
  );
  if (expectedToObserved.status !== "ahead") {
    const message = `Deploy provenance commit is ${observedCommit}; expected ${expectedCommit}, and GitHub does not identify the observed commit as its descendant.`;
    requiredCommitRelationCache.set(cacheKey, { ok: false, message });
    throw new Error(message);
  }
  const mainBranch = await fetchGitHubJson(
    `/repos/${REPOSITORY}/branches/${MAIN_BRANCH}`,
    "GitHub main branch",
  );
  const mainCommit = normalizeCommit(mainBranch?.commit?.sha, "main commit");
  if (observedCommit !== mainCommit) {
    const observedToMain = await fetchGitHubJson(
      `/repos/${REPOSITORY}/compare/${observedCommit}...${mainCommit}`,
      "GitHub production-to-main comparison",
    );
    if (observedToMain.status !== "ahead") {
      const message = `Deploy provenance commit ${observservedCommit} is not in current main history ending at ${mainCommit}.`;
      requiredCommitRelationCache.set(cacheKey, { ok: false, message });
      throw new Error(message);
    }
  }
  const result = { mode: "superseded", observedCommit, mainCommit };
  requiredCommitRelationCache.set(cacheKey, { ok: true, result });
  return result;
}

function normalizeRouteForCompare(url) {
  const parsed = new URL(url);
  return `${parsed.origin}${parsed.pathname.replace(/\/+$/, "")}`;
}

function assertRoute(publicUrl, route, finalUrl) {
  const expected = normalizeRouteForCompare(routeUrl(publicUrl, route));
  const actual = normalizeRouteForCompare(finalUrl);
  if (actual !== expected) {
    throw new Error(`Direct ${route} resolved to ${finalUrl}; expected ${expected}.`);
  }
}

function assertPublicText(html, label) {
  if (
    !REQUIRED_PUBLIC_TEXT.some((marker) =>
      html.toLowerCase().includes(marker.toLowerCase()),
    )
  ) {
    throw new Error(`${label} does not contain an expected public site marker.`);
  }
}

function assertContentType(result, expected, label) {
  if (!result.contentType.toLowerCase().includes(expected)) {
    throw new Error(
      `${label} returned ${result.contentType || "no Content-Type"} at ${result.finalUrl}; expected ${expected}.`,
    );
  }
}

function extractSitemapRoutes(sitemapXml) {
  const routes = Array.from(
    sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/gu),
    ([, loc]) => new URL(loc).pathname,
  );
  if (routes.length === 0) throw new Error("Public sitemap does not contain any routes.");
  return routes;
}

async function assertDeployProvenance(
  provenance,
  { expectedCommit = null, allowNewerMain = false } = {},
) {
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) {
    throw new Error("Deploy provenance marker must be a JSON object.");
  }
  if (provenance.repository !== REPOSITORY) {
    throw new Error(`Deploy provenance has unexpected repository: ${String(provenance.repository)}`);
  }
  if (provenance.deploymentContract !== REQUIRED_DEPLOYMENT_CONTRACT) {
    throw new Error(
      `Deploy provenance has unexpected deploymentContract: ${String(provenance.deploymentContract)}`,
    );
  }
  const observedCommit = normalizeCommit(
    provenance.commitSha,
    "deploy provenance commitSha",
  );
  let commitRelation = { mode: "unconstrained", observedCommit };
  if (expectedCommit) {
    if (observedCommit === expectedCommit) {
      commitRelation = { mode: "exact", observedCommit };
    } else if (allowNewerMain) {
      commitRelation = await assertExpectedOrNewerMainCommit(
        expectedCommit,
        observedCommit,
      );
    } else {
      throw new Error(
        `Deploy provenance commit is ${observedCommit}; expected ${expectedCommit}.`,
      );
    }
  }
  if (provenance.requiredRoute !== "/contratti") {
    throw new Error(
      `Deploy provenance has unexpected requiredRoute: ${String(provenance.requiredRoute)}`,
    );
  }
  const requiredRoutes = Array.isArray(provenance.requiredRoutes)
    ? provenance.requiredRoutes
    : [];
  for (const route of REQUIRED_DEPLOY_ROUTES) {
    if (!requiredRoutes.includes(route)) {
      throw new Error(`Deploy provenance is missing required route: ${route}`);
    }
  }
  const requiredMarkers = Array.isArray(provenance.requiredMarkers)
    ? provenance.requiredMarkers
    : [];
  for (const marker of [
    ...REQUIRED_CONTRACT_BUNDLE_TEXT,
    ...REQUIRED_ORGANI_BUNDLE_TEXT,
  ]) {
    if (!requiredMarkers.includes(marker)) {
      throw new Error(`Deploy provenance is missing required marker: ${marker}`);
    }
  }
  return commitRelation;
}

function assertNonNegativeInteger(value, label) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer.`);
  }
}

function assertUniqueStrings(value, label) {
  if (
    !Array.isArray(value) ||
    value.some((item) => typeof item !== "string" || !item.trim()) ||
    new Set(value).size !== value.length
  ) {
    throw new Error(`${label} must be a unique non-empty string array.`);
  }
}

function assertMultiSourceStaticDataset(dataset) {
  if (
    !dataset ||
    typeof dataset !== "object" ||
    Array.isArray(dataset) ||
    dataset.schemaVersion !== MULTI_SOURCE_SCHEMA ||
    dataset.source?.scope !== "known-public-sources" ||
    dataset.source?.publicClaim !==
      "contratti individuati dalle fonti pubbliche integrate" ||
    !Array.isArray(dataset.contracts) ||
    !dataset.storylines ||
    typeof dataset.storylines !== "object" ||
    dataset.authorityDiscovery?.schemaVersion !== AUTHORITY_SCHEMA ||
    !dataset.reconciliation ||
    typeof dataset.reconciliation !== "object"
  ) {
    throw new Error("Static contracts dataset must expose the multi-source schema.");
  }
  const coverage = dataset.coverage;
  const reconciliation = dataset.reconciliation;
  for (const key of [
    "multiSourceContracts",
    "canonicalContracts",
    "overlapContracts",
    "alboOnlyContracts",
    "anacOnlyContracts",
    "anacAuthorityDiscoveredContracts",
    "authorityRequestedYears",
    "authorityCompletedYears",
    "unresolvedEvents",
  ]) {
    assertNonNegativeInteger(coverage?.[key], `coverage.${key}`);
  }
  for (const key of [
    "localCanonicalCigs",
    "anacAuthorityCigs",
    "unionCigs",
    "requestedYears",
    "completedYears",
    "unresolvedAlboEvents",
  ]) {
    assertNonNegativeInteger(reconciliation[key], `reconciliation.${key}`);
  }
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
    dataset.contracts.length !== coverage.multiSourceContracts ||
    dataset.contracts.length !== reconciliation.unionCigs ||
    local.size !== reconciliation.localCanonicalCigs ||
    authority.size !== reconciliation.anacAuthorityCigs ||
    union.size !== reconciliation.unionCigs ||
    coverage.canonicalContracts !== reconciliation.localCanonicalCigs ||
    coverage.overlapContracts !== reconciliation.overlapCigs.length ||
    coverage.alboOnlyContracts !== reconciliation.alboOnlyCigs.length ||
    coverage.anacOnlyContracts !== reconciliation.anacOnlyCigs.length ||
    coverage.anacAuthorityDiscoveredContracts !==
      reconciliation.anacAuthorityCigs ||
    coverage.authorityRequestedYears !== reconciliation.requestedYears ||
    coverage.authorityCompletedYears !== reconciliation.completedYears ||
    coverage.authorityHistoricalBackfillComplete !==
      reconciliation.historicalBackfillComplete ||
    coverage.unresolvedEvents !== reconciliation.unresolvedAlboEvents ||
    coverage.unionInvariantSatisfied !== true ||
    reconciliation.sourceResolutionInvariantSatisfied !== true ||
    dataset.authorityDiscovery.records?.length !== reconciliation.anacAuthorityCigs ||
    dataset.authorityDiscovery.requestedYears?.length !== reconciliation.requestedYears ||
    dataset.authorityDiscovery.completedYears?.length !== reconciliation.completedYears
  ) {
    throw new Error("Static multi-source contracts reconciliation is inconsistent.");
  }
  const seenIds = new Set();
  const seenCigs = new Set();
  for (const contract of dataset.contracts) {
    if (
      !Number.isSafeInteger(contract.id) ||
      contract.id <= 0 ||
      seenIds.has(contract.id) ||
      !/^[A-Z0-9]{10}$/u.test(contract.cig ?? "") ||
      seenCigs.has(contract.cig) ||
      !union.has(contract.cig) ||
      contract.withoutMepa !== false ||
      typeof contract.amount !== "number" ||
      contract.amount < 0 ||
      !dataset.storylines[String(contract.id)]
    ) {
      throw new Error("Static multi-source contracts dataset contains an invalid contract.");
    }
    seenIds.add(contract.id);
    seenCigs.add(contract.cig);
  }
  for (const cig of reconciliation.anacOnlyCigs) {
    const contract = dataset.contracts.find((item) => item.cig === cig);
    const storyline = contract && dataset.storylines[String(contract.id)];
    if (
      !contract ||
      !storyline ||
      storyline.timeline?.length !== 1 ||
      storyline.timeline[0]?.progressivo !== `ANAC:${cig}`
    ) {
      throw new Error(`ANAC-only CIG lacks explicit discovery provenance: ${cig}`);
    }
  }
  return { local, authority, union };
}

function assertLiveContractsData({ contracts, feedStatus, staticDataset, anacStatus }) {
  if (!Array.isArray(contracts)) {
    throw new Error("Contracts API must return a JSON array.");
  }
  const sets = assertMultiSourceStaticDataset(staticDataset);
  if (
    feedStatus?.source !== "multi_source_procurement_census" ||
    !["multi-source-current", "multi-source-backfill"].includes(feedStatus?.status) ||
    feedStatus?.itemsTotal !== contracts.length ||
    staticDataset.feedStatus?.source !== feedStatus.source ||
    staticDataset.feedStatus?.status !== feedStatus.status ||
    staticDataset.feedStatus?.itemsTotal !== feedStatus.itemsTotal
  ) {
    throw new Error(
      "Contracts feed status must identify the multi-source census and match the list total.",
    );
  }
  if (
    anacStatus?.schemaVersion !== "anac-bdncp-connection.v1" ||
    !["pending", "current", "stale", "degraded"].includes(anacStatus.status) ||
    !Number.isInteger(anacStatus.coverage?.directCigLinks) ||
    !Number.isInteger(anacStatus.coverage?.structuredMatches) ||
    anacStatus.coverage.directCigLinks < 0 ||
    anacStatus.coverage.structuredMatches < 0 ||
    anacStatus.coverage.directCigLinks > sets.local.size ||
    anacStatus.coverage.structuredMatches > anacStatus.coverage.directCigLinks ||
    staticDataset.anacConnection?.schemaVersion !== "anac-bdncp-connection.v1"
  ) {
    throw new Error(
      "Tracked-CIG ANAC status must remain separate from authority discovery coverage.",
    );
  }
  if (staticDataset.contracts.length !== contracts.length) {
    throw new Error("Static multi-source contracts dataset must match the API total.");
  }
  const staticByCig = new Map(
    staticDataset.contracts.map((contract) => [contract.cig, contract]),
  );
  for (const contract of contracts) {
    const expected = staticByCig.get(contract.cig);
    if (
      !expected ||
      expected.id !== contract.id ||
      !Number.isSafeInteger(contract.id) ||
      !/^[A-Z0-9]{10}$/u.test(contract.cig ?? "") ||
      contract.withoutMepa !== false ||
      typeof contract.amount !== "number" ||
      contract.amount < 0
    ) {
      throw new Error(
        "Contracts API contains a record that violates the multi-source public-data safeguards.",
      );
    }
  }
}

function extractScriptPaths(...htmlDocuments) {
  const paths = new Set();
  for (const html of htmlDocuments) {
    for (const match of html.matchAll(
      /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/giu,
    )) {
      if (match[1]) paths.add(match[1]);
    }
  }
  return [...paths];
}

function extractJavaScriptReferences(sourceText) {
  const references = new Set();
  for (const match of sourceText.matchAll(
    /["']([^"'?]+\.js(?:\?[^"']*)?)["']/gu,
  )) {
    const reference = match[1];
    if (
      reference?.startsWith("/") ||
      reference?.startsWith("./") ||
      reference?.startsWith("../")
    ) {
      references.add(reference);
    }
  }
  return [...references];
}

function hasRequiredBundleMarkers(text) {
  return [
    ...REQUIRED_CONTRACT_BUNDLE_TEXT,
    ...REQUIRED_ORGANI_BUNDLE_TEXT,
  ].every((marker) => text.includes(marker));
}

async function fetchBundleText(publicUrl, scriptPaths) {
  if (scriptPaths.length === 0) {
    throw new Error("No generated JavaScript assets found on public URL.");
  }
  const publicOrigin = new URL(publicUrl).origin;
  const queue = scriptPaths.map((item) => new URL(item, `${publicUrl}/`).href);
  const queued = new Set(queue);
  const fetched = new Set();
  const parts = [];
  while (queue.length > 0 && fetched.size < 64) {
    const scriptUrl = queue.shift();
    if (!scriptUrl || fetched.has(scriptUrl)) continue;
    const { text } = await fetchText(scriptUrl, `JavaScript asset ${scriptUrl}`);
    fetched.add(scriptUrl);
    parts.push(text);
    const combined = parts.join("\n");
    if (hasRequiredBundleMarkers(combined)) {
      return { assetCount: fetched.size, text: combined };
    }
    for (const reference of extractJavaScriptReferences(text)) {
      const dependencyUrl = new URL(reference, scriptUrl);
      if (
        dependencyUrl.origin === publicOrigin &&
        !queued.has(dependencyUrl.href)
      ) {
        queued.add(dependencyUrl.href);
        queue.push(dependencyUrl.href);
      }
    }
  }
  return { assetCount: fetched.size, text: parts.join("\n") };
}

function assertBundleMarkers(bundleText) {
  const missing = [
    ...REQUIRED_CONTRACT_BUNDLE_TEXT,
    ...REQUIRED_ORGANI_BUNDLE_TEXT,
  ].filter((marker) => !bundleText.includes(marker));
  if (missing.length > 0) {
    throw new Error(`Public JavaScript bundle is missing markers: ${missing.join(", ")}`);
  }
}

async function checkPublicContractsPage(
  publicUrl,
  { expectedCommit = null, allowNewerMain = false } = {},
) {
  const root = await fetchText(routeUrl(publicUrl, "/"), "Root route");
  const contractsPage = await fetchText(
    routeUrl(publicUrl, "/contratti"),
    "Contracts route",
  );
  const organi = await fetchText(routeUrl(publicUrl, "/organi"), "Organi route");
  const provenance = await fetchJson(
    routeUrl(publicUrl, DEPLOY_PROVENANCE_PATH),
    "Deploy provenance marker",
  );
  const sitemap = await fetchText(
    routeUrl(publicUrl, SITEMAP_PATH),
    "Public sitemap",
  );
  const contractsApi = await fetchJson(
    routeUrl(publicUrl, "/api/contracts"),
    "Contracts API",
  );
  const feedStatus = await fetchJson(
    routeUrl(publicUrl, "/api/contracts/feed-status"),
    "Contracts feed status",
  );
  const anacStatus = await fetchJson(
    routeUrl(publicUrl, "/api/contracts/anac-status"),
    "ANAC/BDNCP tracked-CIG status",
  );
  const staticDataset = await fetchJson(
    routeUrl(publicUrl, STATIC_CONTRACTS_DATA_PATH),
    "Static contracts dataset",
  );

  assertRoute(publicUrl, "/contratti", contractsPage.finalUrl);
  assertRoute(publicUrl, "/organi", organi.finalUrl);
  assertPublicText(root.text, "Root route");
  assertPublicText(contractsPage.text, "Contracts route");
  assertPublicText(organi.text, "Organi route");
  const commitRelation = await assertDeployProvenance(provenance.value, {
    expectedCommit,
    allowNewerMain,
  });
  assertLiveContractsData({
    contracts: contractsApi.value,
    feedStatus: feedStatus.value,
    staticDataset: staticDataset.value,
    anacStatus: anacStatus.value,
  });

  if (contractsApi.value.length > 0) {
    const firstId = contractsApi.value[0].id;
    await fetchJson(
      routeUrl(publicUrl, `/api/contracts/${firstId}`),
      "Contracts detail API",
    );
    await fetchJson(
      routeUrl(publicUrl, `/api/contracts/${firstId}/storyline`),
      "Contracts storyline API",
    );
  }

  const sitemapRoutes = extractSitemapRoutes(sitemap.text);
  for (const route of sitemapRoutes) {
    const result = await fetchText(
      routeUrl(publicUrl, route),
      `Sitemap route ${route}`,
      "HEAD",
    );
    assertRoute(publicUrl, route, result.finalUrl);
    assertContentType(result, "text/html", `Sitemap route ${route}`);
  }

  for (const path of API_CONTENT_TYPE_PROBES) {
    const result = await fetchProbe(routeUrl(publicUrl, path), `API probe ${path}`);
    assertContentType(result, "application/json", `API probe ${path}`);
  }
  for (const path of FEED_CONTENT_TYPE_PROBES) {
    const result = await fetchProbe(routeUrl(publicUrl, path), `Feed probe ${path}`);
    assertContentType(result, "xml", `Feed probe ${path}`);
    if (path.includes("contratti.xml") && result.status !== 200) {
      throw new Error(`Contracts feed ${path} returned HTTP ${result.status}; expected 200.`);
    }
  }

  const scriptPaths = extractScriptPaths(root.text, contractsPage.text, organi.text);
  const bundle = await fetchBundleText(publicUrl, scriptPaths);
  assertBundleMarkers(bundle.text);
  console.log(
    `Verified multi-source census (${staticDataset.value.contracts.length} contracts), ${sitemapRoutes.length} sitemap routes and ${bundle.assetCount} JavaScript assets.`,
  );
  return commitRelation;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  let lastError;
  for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
    try {
      console.log(`Public contracts smoke attempt ${attempt}/${options.attempts}`);
      const relation = await checkPublicContractsPage(options.publicUrl, {
        expectedCommit: options.expectedCommit,
        allowNewerMain: options.allowNewerMain,
      });
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
        await sleep(options.delayMs);
      }
    }
  }
  throw lastError;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
