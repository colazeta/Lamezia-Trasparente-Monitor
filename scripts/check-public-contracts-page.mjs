#!/usr/bin/env node
import process from "node:process";

const DEFAULT_PUBLIC_URL = "https://lamezia-trasparente.pages.dev";
const DEFAULT_ATTEMPTS = 1;
const DEFAULT_DELAY_MS = 10_000;
const REPOSITORY = "colazeta/Lamezia-Trasparente-Monitor";
const MAIN_BRANCH = "main";
const DEPLOY_PROVENANCE_PATH = "/deploy-provenance.json";
const SITEMAP_PATH = "/sitemap.xml";
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
const REQUIRED_DEPLOYMENT_CONTRACT = "contracts-anac-bdncp-resilient-v4";
const STATIC_CONTRACTS_DATA_PATH =
  "/data/processed/contracts/lamezia-contracts-current.json";
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
const requiredCommitRelationCache = new Map();

function usage() {
  return [
    "Usage: node scripts/check-public-contracts-page.mjs [--url <public-url>] [--expected-commit <sha>] [--allow-newer-main] [--attempts <n>] [--delay-ms <ms>]",
    "",
    "Checks the production/public contracts and organi routes plus generated bundle markers.",
    "When --allow-newer-main is used, a production commit newer than the expected SHA is accepted only if GitHub proves that it is a descendant of the expected SHA and belongs to the current main history.",
    "Defaults to https://lamezia-trasparente.pages.dev.",
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
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --url.");
      }
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
  if (!/^[0-9a-f]{40}$/.test(normalized)) {
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

async function fetchText(url, label) {
  const response = await fetch(url, {
    headers: {
      "cache-control": "no-cache",
      pragma: "no-cache",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(
      `${label} returned HTTP ${response.status}: ${response.url}`,
    );
  }

  return {
    contentType: response.headers.get("content-type") ?? "",
    finalUrl: response.url,
    status: response.status,
    text: await response.text(),
  };
}

async function fetchHead(url, label) {
  const response = await fetch(url, {
    method: "HEAD",
    headers: {
      "cache-control": "no-cache",
      pragma: "no-cache",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(
      `${label} returned HTTP ${response.status}: ${response.url}`,
    );
  }

  return {
    contentType: response.headers.get("content-type") ?? "",
    finalUrl: response.url,
    status: response.status,
  };
}

async function fetchProbe(url, label) {
  const response = await fetch(url, {
    method: "HEAD",
    headers: {
      "cache-control": "no-cache",
      pragma: "no-cache",
    },
    redirect: "follow",
  });

  if (response.status >= 500 && response.status !== 503) {
    throw new Error(
      `${label} returned HTTP ${response.status}: ${response.url}`,
    );
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
    return {
      finalUrl: result.finalUrl,
      value: JSON.parse(result.text),
    };
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
    throw new Error(
      `${label} returned HTTP ${response.status}: ${response.url}`,
    );
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
      const message = `Deploy provenance commit ${observedCommit} descends from ${expectedCommit} but is not in the current ${MAIN_BRANCH} history ending at ${mainCommit}.`;
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
    throw new Error(
      `Direct ${route} resolved to ${finalUrl}; expected ${expected}.`,
    );
  }
}

function assertPublicText(html, label) {
  const hasAnyMarker = REQUIRED_PUBLIC_TEXT.some((marker) =>
    html.toLowerCase().includes(marker.toLowerCase()),
  );
  if (!hasAnyMarker) {
    throw new Error(`${label} does not contain an expected public site marker.`);
  }
}

function extractSitemapRoutes(sitemapXml) {
  const routes = Array.from(
    sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g),
    ([, loc]) => new URL(loc).pathname,
  );
  if (routes.length === 0) {
    throw new Error("Public sitemap does not contain any routes.");
  }
  return routes;
}

function assertContentType(result, expected, label) {
  if (!result.contentType.toLowerCase().includes(expected)) {
    throw new Error(
      `${label} returned ${result.contentType || "no Content-Type"} at ${result.finalUrl}; expected ${expected}.`,
    );
  }
}

async function assertDeployProvenance(
  provenance,
  { expectedCommit = null, allowNewerMain = false } = {},
) {
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) {
    throw new Error("Deploy provenance marker must be a JSON object.");
  }
  if (provenance.repository !== REPOSITORY) {
    throw new Error(
      `Deploy provenance has unexpected repository: ${String(provenance.repository)}`,
    );
  }
  if (provenance.deploymentContract !== REQUIRED_DEPLOYMENT_CONTRACT) {
    throw new Error(
      `Deploy provenance has unexpected deploymentContract: ${String(provenance.deploymentContract)}`,
    );
  }

  const observedCommit = normalizeCommit(provenance.commitSha, "deploy provenance commitSha");
  let commitRelation = { mode: "unconstrained", observedCommit };
  if (expectedCommit) {
    if (observedCommit === expectedCommit) {
      commitRelation = { mode: "exact", observedCommit };
    } else if (allowNewerMain) {
      commitRelation = await assertExpectedOrNewerMainCommit(
        expectedCommit,
        observedCommit,
      );
      console.log(
        `Expected commit ${expectedCommit} has been superseded in production by verified newer main commit ${observedCommit}.`,
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

function extractScriptPaths(...htmlDocuments) {
  const scriptPaths = new Set();
  for (const html of htmlDocuments) {
    for (const match of html.matchAll(
      /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi,
    )) {
      const scriptPath = match[1];
      if (scriptPath) scriptPaths.add(scriptPath);
    }
  }
  return [...scriptPaths];
}

function extractJavaScriptReferences(sourceText) {
  const references = new Set();
  for (const match of sourceText.matchAll(
    /["']([^"'?]+\.js(?:\?[^"']*)?)["']/g,
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

function bundleAssetPriority(url) {
  const pathname = new URL(url).pathname;
  if (
    /\/(?:Contracts|ContractsCitizen|ContractsCitizenSections|Organi)-[^/]+\.js$/i.test(
      pathname,
    )
  ) {
    return 0;
  }
  if (
    /\/(?:contractCitizenSignals|contractDossier|institutionalStaticData)-[^/]+\.js$/i.test(
      pathname,
    )
  ) {
    return 1;
  }
  return 2;
}

function hasRequiredBundleMarkers(bundleText) {
  return [
    ...REQUIRED_CONTRACT_BUNDLE_TEXT,
    ...REQUIRED_ORGANI_BUNDLE_TEXT,
  ].every((marker) => bundleText.includes(marker));
}

async function fetchBundleText(publicUrl, scriptPaths) {
  if (scriptPaths.length === 0) {
    throw new Error("No generated JavaScript assets found on public URL.");
  }

  const publicOrigin = new URL(publicUrl).origin;
  const queue = scriptPaths.map(
    (scriptPath) => new URL(scriptPath, `${publicUrl}/`).href,
  );
  const queued = new Set(queue);
  const fetched = new Set();
  const bundleParts = [];

  while (queue.length > 0 && fetched.size < 64) {
    queue.sort(
      (left, right) => bundleAssetPriority(left) - bundleAssetPriority(right),
    );
    const scriptUrl = queue.shift();
    if (!scriptUrl || fetched.has(scriptUrl)) continue;

    const { text } = await fetchText(
      scriptUrl,
      `JavaScript asset ${scriptUrl}`,
    );
    fetched.add(scriptUrl);
    bundleParts.push(text);

    const combinedText = bundleParts.join("\n");
    if (hasRequiredBundleMarkers(combinedText)) {
      return { assetCount: fetched.size, text: combinedText };
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

  return { assetCount: fetched.size, text: bundleParts.join("\n") };
}

function assertBundleMarkers(bundleText) {
  const missing = REQUIRED_CONTRACT_BUNDLE_TEXT.filter(
    (marker) => !bundleText.includes(marker),
  );
  if (missing.length > 0) {
    throw new Error(
      `Public JavaScript bundle is missing contract markers: ${missing.join(", ")}`,
    );
  }

  const missingOrgani = REQUIRED_ORGANI_BUNDLE_TEXT.filter(
    (marker) => !bundleText.includes(marker),
  );
  if (missingOrgani.length > 0) {
    throw new Error(
      `Public JavaScript bundle is missing organi markers: ${missingOrgani.join(", ")}`,
    );
  }
}

function assertLiveContractsData({
  contracts,
  feedStatus,
  staticDataset,
  anacStatus,
}) {
  if (!Array.isArray(contracts)) {
    throw new Error("Contracts API must return a JSON array.");
  }
  if (
    feedStatus?.source !== "albo_pretorio_cig_current" ||
    feedStatus?.status !== "current-window" ||
    feedStatus?.itemsTotal !== contracts.length
  ) {
    throw new Error(
      "Contracts feed status must identify the current Albo window and match the list total.",
    );
  }
  if (
    anacStatus?.schemaVersion !== "anac-bdncp-connection.v1" ||
    !["pending", "current", "stale", "degraded"].includes(anacStatus.status) ||
    !Number.isInteger(anacStatus.coverage?.directCigLinks) ||
    !Number.isInteger(anacStatus.coverage?.structuredMatches) ||
    anacStatus.coverage.directCigLinks < 0 ||
    anacStatus.coverage.structuredMatches < 0 ||
    anacStatus.coverage.directCigLinks > contracts.length ||
    anacStatus.coverage.structuredMatches > anacStatus.coverage.directCigLinks ||
    staticDataset?.anacConnection?.schemaVersion !== "anac-bdncp-connection.v1"
  ) {
    throw new Error(
      "ANAC/BDNCP status must distinguish link coverage, structured matches and source state.",
    );
  }
  if (
    staticDataset?.schemaVersion !== "lamezia-contracts-current.v1" ||
    staticDataset?.source?.scope !== "current-albo-window" ||
    !Array.isArray(staticDataset.contracts) ||
    staticDataset.contracts.length !== contracts.length
  ) {
    throw new Error(
      "Static contracts dataset must expose the current-Albo schema and match the API.",
    );
  }

  for (const contract of contracts) {
    if (
      !Number.isInteger(contract.id) ||
      !/^[A-Z0-9]{10}$/u.test(contract.cig ?? "") ||
      contract.withoutMepa !== false ||
      typeof contract.amount !== "number" ||
      contract.amount < 0
    ) {
      throw new Error(
        "Contracts API contains a record that violates the static public-data safeguards.",
      );
    }
  }
}

async function checkPublicContractsPage(
  publicUrl,
  { expectedCommit = null, allowNewerMain = false } = {},
) {
  const rootUrl = routeUrl(publicUrl, "/");
  const contractsUrl = routeUrl(publicUrl, "/contratti");
  const organiUrl = routeUrl(publicUrl, "/organi");
  const provenanceUrl = routeUrl(publicUrl, DEPLOY_PROVENANCE_PATH);
  const sitemapUrl = routeUrl(publicUrl, SITEMAP_PATH);

  const root = await fetchText(rootUrl, "Root route");
  const contracts = await fetchText(contractsUrl, "Contracts route");
  const organi = await fetchText(organiUrl, "Organi route");
  const provenance = await fetchJson(provenanceUrl, "Deploy provenance marker");
  const sitemap = await fetchText(sitemapUrl, "Public sitemap");
  const contractsApi = await fetchJson(
    routeUrl(publicUrl, "/api/contracts"),
    "Contracts API",
  );
  const contractsFeedStatus = await fetchJson(
    routeUrl(publicUrl, "/api/contracts/feed-status"),
    "Contracts feed status",
  );
  const anacStatus = await fetchJson(
    routeUrl(publicUrl, "/api/contracts/anac-status"),
    "ANAC/BDNCP connection status",
  );
  const contractsStaticData = await fetchJson(
    routeUrl(publicUrl, STATIC_CONTRACTS_DATA_PATH),
    "Static contracts dataset",
  );

  console.log(`Fetched ${rootUrl} -> ${root.finalUrl}`);
  console.log(`Fetched ${contractsUrl} -> ${contracts.finalUrl}`);
  console.log(`Fetched ${organiUrl} -> ${organi.finalUrl}`);
  console.log(`Fetched ${provenanceUrl} -> ${provenance.finalUrl}`);
  console.log(`Fetched ${sitemapUrl} -> ${sitemap.finalUrl}`);
  console.log(`Fetched /api/contracts -> ${contractsApi.finalUrl}`);
  console.log(`Fetched /api/contracts/anac-status -> ${anacStatus.finalUrl}`);

  assertRoute(publicUrl, "/contratti", contracts.finalUrl);
  assertRoute(publicUrl, "/organi", organi.finalUrl);
  assertPublicText(root.text, "Root route");
  assertPublicText(contracts.text, "Contracts route");
  assertPublicText(organi.text, "Organi route");
  const commitRelation = await assertDeployProvenance(provenance.value, {
    expectedCommit,
    allowNewerMain,
  });
  assertLiveContractsData({
    contracts: contractsApi.value,
    feedStatus: contractsFeedStatus.value,
    staticDataset: contractsStaticData.value,
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
  const routeChecks = await Promise.all(
    sitemapRoutes.map(async (route) => {
      const result = await fetchHead(
        routeUrl(publicUrl, route),
        `Sitemap route ${route}`,
      );
      assertRoute(publicUrl, route, result.finalUrl);
      assertContentType(result, "text/html", `Sitemap route ${route}`);
      return { route, finalUrl: result.finalUrl };
    }),
  );
  console.log(`Verified ${routeChecks.length} sitemap route(s).`);

  for (const path of API_CONTENT_TYPE_PROBES) {
    const result = await fetchProbe(
      routeUrl(publicUrl, path),
      `API probe ${path}`,
    );
    assertContentType(result, "application/json", `API probe ${path}`);
  }

  if (
    typeof provenance.value.createdAt !== "string" ||
    Number.isNaN(Date.parse(provenance.value.createdAt))
  ) {
    throw new Error(
      `Deploy provenance has invalid createdAt: ${String(provenance.value.createdAt)}`,
    );
  }

  for (const path of FEED_CONTENT_TYPE_PROBES) {
    const result = await fetchProbe(
      routeUrl(publicUrl, path),
      `Feed probe ${path}`,
    );
    assertContentType(result, "xml", `Feed probe ${path}`);
    if (path.includes("contratti.xml") && result.status !== 200) {
      throw new Error(
        `Contracts feed ${path} returned HTTP ${result.status}; expected 200.`,
      );
    }
  }
  console.log(
    `Verified ${API_CONTENT_TYPE_PROBES.length} API and ${FEED_CONTENT_TYPE_PROBES.length} feed Content-Type contract(s).`,
  );

  const scriptPaths = extractScriptPaths(root.text, contracts.text, organi.text);
  const bundle = await fetchBundleText(publicUrl, scriptPaths);
  console.log(`Verified ${bundle.assetCount} public JavaScript asset(s).`);
  assertBundleMarkers(bundle.text);

  return commitRelation;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  let lastError;

  for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
    try {
      console.log(
        `Public contracts smoke attempt ${attempt}/${options.attempts}`,
      );
      const commitRelation = await checkPublicContractsPage(options.publicUrl, {
        expectedCommit: options.expectedCommit,
        allowNewerMain: options.allowNewerMain,
      });
      console.log(
        commitRelation.mode === "superseded"
          ? `Public contracts smoke passed on verified newer main commit ${commitRelation.observedCommit}.`
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
