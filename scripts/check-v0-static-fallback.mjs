#!/usr/bin/env node
import { access, readFile, readdir, stat } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const DEFAULT_DIST_DIR = "artifacts/lamezia-trasparente/dist/public";
const CLOUDFLARE_REDIRECTS_FILE = "_redirects";
const CLOUDFLARE_WORKER_FILE = "_worker.js";
const CLOUDFLARE_HEADERS_FILE = "_headers";
const DEPLOY_PROVENANCE_FILE = "deploy-provenance.json";
const STATIC_HEALTHZ_MARKER = "healthz.json";
const STATIC_CONTRACTS_DATA_FILE =
  "data/processed/contracts/lamezia-contracts-current.json";
const EXPECTED_HEALTHZ_NOT_CHECKED = [
  "api",
  "worker",
  "liveData",
  "sourceCompleteness",
];
const REQUIRED_ROUTES = [
  "/",
  "/contratti",
  "/convocazioni",
  "/convocazioni/demo-consiglio-comunale-v0",
  "/organi",
  "/amministratori",
  "/fonti-dati",
  "/stato-monitoraggio",
  "/metodologia",
];
const SOURCE_HEALTH_CHUNK_PREFIX = "StatoMonitoraggio-";
const SOURCE_HEALTH_CHUNK_MAX_BYTES = 40_000;
const SOURCE_HEALTH_REQUIRED_TEXT = "Copertura del catalogo Open Data";
const ENTRY_CHUNK_MAX_BYTES = 700_000;
const HOME_CHUNK_MAX_BYTES = 50_000;
const OPEN_DATA_INDEX_CHUNK_MAX_BYTES = 50_000;
const SOURCE_HEALTH_FORBIDDEN_TEXT = [
  '"monthly_rows"',
  '"passengers_national"',
  '"tMean"',
];
const REQUIRED_PUBLIC_TEXT = [
  "rendiamoLameziaTrasparente",
  "Osservatorio Civico Indipendente",
];
const REQUIRED_CONTRACT_BUNDLE_TEXT = [
  "Contratti pubblici sotto osservazione",
  "Fonti dei contratti",
  "Dati pubblici, con la fonte sempre raggiungibile",
  "La storia documentale del contratto",
  "Consulta ANAC",
  "Programmazione",
  "Progettazione",
  "Gara / pubblicazione",
  "Esecuzione della gara",
  "Affidamento",
  "Esecuzione del contratto",
  "Conclusione, collaudi e verifiche",
];
const REQUIRED_ORGANI_BUNDLE_TEXT = [
  "Organi del Comune",
  "Componenti correnti",
  "Righe storiche",
  "Commissioni Consiliari",
];
const REQUIRED_EDGE_FALLBACK_MARKERS = [
  'pathname === "/api"',
  "pathname.startsWith(API_PREFIX)",
  "pathname.startsWith(FEED_PREFIX)",
  '"Content-Type": "application/json; charset=utf-8"',
  '"Content-Type": "application/xml; charset=utf-8"',
  "lamezia-contracts-current.json",
  'const CONTRACTS_API_PATH = "/api/contracts"',
  'const ANAC_STATUS_API_PATH = "/api/contracts/anac-status"',
  "status: 503",
];

function usage() {
  return [
    "Usage: node scripts/check-v0-static-fallback.mjs [--dist <dir>] [--route <path>]...",
    "",
    "Provider-neutral v0 static fallback smoke check.",
    "Run after: pnpm --filter @workspace/lamezia-trasparente run build",
    "",
    "Options:",
    `  --dist <dir>   Static build directory (default: ${DEFAULT_DIST_DIR})`,
    "  --route <path> Route expected to be handled by the SPA fallback; repeatable",
    "  --help         Show this help",
  ].join("\n");
}

function parseArgs(argv) {
  const routes = [];
  let distDir = DEFAULT_DIST_DIR;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dist") {
      const value = argv[(i += 1)];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --dist.");
      }
      distDir = value;
    } else if (arg === "--route") {
      const value = argv[(i += 1)];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --route.");
      }
      routes.push(normalizeRoute(value));
    } else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return {
    distDir,
    routes: routes.length > 0 ? routes : REQUIRED_ROUTES,
  };
}

function normalizeRoute(route) {
  const trimmed = route.trim();
  if (!trimmed) throw new Error("Static fallback route cannot be blank.");
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

async function assertReadableFile(filePath, label) {
  try {
    await access(filePath, constants.R_OK);
  } catch {
    throw new Error(`${label} is not readable: ${filePath}`);
  }
}

async function assertDirectory(dirPath, label) {
  let info;
  try {
    info = await stat(dirPath);
  } catch {
    throw new Error(`${label} does not exist: ${dirPath}`);
  }
  if (!info.isDirectory()) {
    throw new Error(`${label} is not a directory: ${dirPath}`);
  }
}

function assertHealthzMarker(healthz, healthzPath) {
  if (!healthz || typeof healthz !== "object" || Array.isArray(healthz)) {
    throw new Error(
      `Static healthz marker must be a JSON object: ${healthzPath}`,
    );
  }

  if (healthz.status !== "static-fallback-available") {
    throw new Error(
      `Static healthz marker has unexpected status: ${String(healthz.status)}`,
    );
  }

  if (healthz.scope !== "v0-public-fallback") {
    throw new Error(
      `Static healthz marker has unexpected scope: ${String(healthz.scope)}`,
    );
  }

  const checks = healthz.checks;
  if (!checks || typeof checks !== "object" || Array.isArray(checks)) {
    throw new Error(
      `Static healthz marker checks must be a JSON object: ${healthzPath}`,
    );
  }

  if (checks.staticFrontendReachability !== true) {
    throw new Error(
      "Static healthz marker must explicitly confirm staticFrontendReachability: true",
    );
  }

  for (const key of EXPECTED_HEALTHZ_NOT_CHECKED) {
    if (checks[key] !== "not-checked") {
      throw new Error(
        `Static healthz marker checks.${key} must remain not-checked for the static fallback smoke.`,
      );
    }
  }

  if (!Array.isArray(healthz.limitations) || healthz.limitations.length === 0) {
    throw new Error(
      "Static healthz marker must declare non-empty limitations.",
    );
  }

  for (const [index, limitation] of healthz.limitations.entries()) {
    if (typeof limitation !== "string" || limitation.trim().length === 0) {
      throw new Error(
        `Static healthz marker limitations[${index}] must be a non-empty string.`,
      );
    }
  }
}

function assertStaticContractsDataset(dataset, datasetPath) {
  if (
    !dataset ||
    typeof dataset !== "object" ||
    Array.isArray(dataset) ||
    dataset.schemaVersion !== "lamezia-contracts-current.v1" ||
    !Array.isArray(dataset.contracts) ||
    dataset.anacConnection?.schemaVersion !== "anac-bdncp-connection.v1" ||
    !dataset.storylines ||
    typeof dataset.storylines !== "object"
  ) {
    throw new Error(
      `Static contracts dataset has an invalid schema: ${datasetPath}`,
    );
  }

  if (
    dataset.source?.scope !== "current-albo-window" ||
    dataset.source?.publicClaim !== "atti correnti con CIG" ||
    !Array.isArray(dataset.source?.limitations) ||
    dataset.source.limitations.length === 0
  ) {
    throw new Error(
      `Static contracts dataset must declare its current-Albo scope and limitations: ${datasetPath}`,
    );
  }

  if (
    !["pending", "current", "stale", "degraded"].includes(
      dataset.anacConnection.status,
    ) ||
    !Number.isInteger(dataset.anacConnection.coverage?.directCigLinks) ||
    !Number.isInteger(dataset.anacConnection.coverage?.structuredMatches) ||
    dataset.anacConnection.coverage.directCigLinks < 0 ||
    dataset.anacConnection.coverage.structuredMatches < 0 ||
    dataset.anacConnection.coverage?.directCigLinks >
      dataset.contracts.length ||
    dataset.anacConnection.coverage?.structuredMatches >
      dataset.anacConnection.coverage?.directCigLinks
  ) {
    throw new Error(
      `Static contracts dataset has an invalid ANAC/BDNCP connection status: ${datasetPath}`,
    );
  }

  if (
    dataset.coverage?.contracts !== dataset.contracts.length ||
    dataset.coverage?.cigBearingItems !== dataset.contracts.length ||
    dataset.feedStatus?.itemsTotal !== dataset.contracts.length
  ) {
    throw new Error(
      `Static contracts coverage and feed totals are inconsistent: ${datasetPath}`,
    );
  }

  for (const contract of dataset.contracts) {
    if (
      !Number.isInteger(contract.id) ||
      !/^[A-Z0-9]{10}$/u.test(contract.cig ?? "") ||
      typeof contract.title !== "string" ||
      !contract.title.trim() ||
      typeof contract.amount !== "number" ||
      contract.amount < 0 ||
      contract.withoutMepa !== false ||
      !dataset.storylines[String(contract.id)]
    ) {
      throw new Error(
        `Static contracts dataset contains an invalid or unsupported contract record: ${datasetPath}`,
      );
    }
  }

  return {
    schemaVersion: dataset.schemaVersion,
    contracts: dataset.contracts.length,
    withCup: dataset.coverage.withCup,
    withExplicitAmount: dataset.coverage.withExplicitAmount,
    source: dataset.source.id,
  };
}

async function readJsonFile(filePath, label) {
  await assertReadableFile(filePath, label);
  const content = await readFile(filePath, "utf8");
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(
      `${label} is not valid JSON: ${filePath} (${
        error instanceof Error ? error.message : String(error)
      })`,
    );
  }
}

function extractAssetPaths(indexHtml) {
  const assetPaths = new Set();
  for (const match of indexHtml.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const value = match[1];
    if (!value || value.startsWith("http://") || value.startsWith("https://")) {
      continue;
    }
    if (value.startsWith("data:") || value.startsWith("#")) continue;
    const withoutQuery = value.split(/[?#]/, 1)[0];
    if (withoutQuery && withoutQuery !== "/") assetPaths.add(withoutQuery);
  }
  return [...assetPaths];
}

function toDistPath(distDir, assetPath) {
  const clean = assetPath.replace(/^\/+/, "");
  return path.join(distDir, clean);
}

async function assertGeneratedBundleText(distDir, assetPaths, requiredText) {
  const referencedJsAssetPaths = assetPaths
    .filter(
      (assetPath) =>
        assetPath.startsWith("/assets/") || assetPath.startsWith("assets/"),
    )
    .filter((assetPath) => assetPath.endsWith(".js"));

  if (referencedJsAssetPaths.length === 0) {
    throw new Error(
      "index.html does not reference any generated JavaScript assets.",
    );
  }

  const assetsDir = path.join(distDir, "assets");
  const emittedJsAssetPaths = (
    await readdir(assetsDir, { withFileTypes: true })
  )
    .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
    .map((entry) => `/assets/${entry.name}`);
  const jsAssetPaths = [
    ...new Set([...referencedJsAssetPaths, ...emittedJsAssetPaths]),
  ];

  const bundleText = (
    await Promise.all(
      jsAssetPaths.map(async (assetPath) =>
        readFile(toDistPath(distDir, assetPath), "utf8"),
      ),
    )
  ).join("\n");

  for (const expectedText of requiredText) {
    if (!bundleText.includes(expectedText)) {
      throw new Error(
        `Generated bundle does not contain expected contract marker: ${expectedText}`,
      );
    }
  }

  return jsAssetPaths.length;
}

async function assertSourceHealthBundle(distDir) {
  const assetsDir = path.join(distDir, "assets");
  const matches = (await readdir(assetsDir, { withFileTypes: true })).filter(
    (entry) =>
      entry.isFile() &&
      entry.name.startsWith(SOURCE_HEALTH_CHUNK_PREFIX) &&
      entry.name.endsWith(".js"),
  );

  if (matches.length !== 1) {
    throw new Error(
      `Expected one generated source-health chunk, found ${matches.length}.`,
    );
  }

  const chunkPath = path.join(assetsDir, matches[0].name);
  const chunkStat = await stat(chunkPath);
  if (chunkStat.size > SOURCE_HEALTH_CHUNK_MAX_BYTES) {
    throw new Error(
      `Source-health chunk exceeds ${SOURCE_HEALTH_CHUNK_MAX_BYTES} bytes: ${chunkStat.size}.`,
    );
  }

  const chunkText = await readFile(chunkPath, "utf8");
  if (!chunkText.includes(SOURCE_HEALTH_REQUIRED_TEXT)) {
    throw new Error(
      `Source-health chunk does not contain expected marker: ${SOURCE_HEALTH_REQUIRED_TEXT}`,
    );
  }
  for (const forbiddenText of SOURCE_HEALTH_FORBIDDEN_TEXT) {
    if (chunkText.includes(forbiddenText)) {
      throw new Error(
        `Source-health chunk contains full dataset marker: ${forbiddenText}`,
      );
    }
  }

  return {
    asset: matches[0].name,
    bytes: chunkStat.size,
    maxBytes: SOURCE_HEALTH_CHUNK_MAX_BYTES,
  };
}

function routeFallbackPath(distDir, route) {
  const clean = route.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!clean) return path.join(distDir, "index.html");
  return path.join(distDir, clean, "index.html");
}

function parseRedirectRules(redirectsText) {
  return redirectsText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const [source, target, status] = line.split(/\s+/);
      return { source, target, status };
    });
}

function extractSitemapRoutes(sitemapText) {
  return Array.from(
    sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g),
    ([, loc]) => new URL(loc).pathname,
  );
}

function assertEdgeFallback(workerText, workerPath) {
  for (const marker of REQUIRED_EDGE_FALLBACK_MARKERS) {
    if (!workerText.includes(marker)) {
      throw new Error(
        `Cloudflare worker is missing the API/feed fallback marker ${marker}: ${workerPath}`,
      );
    }
  }
}

async function assertEdgeFallbackBehavior(workerPath, contractsDataset) {
  const workerModule = await import(
    `${pathToFileURL(workerPath).href}?smoke=${Date.now()}`
  );
  const workerFetch = workerModule.default?.fetch;
  if (typeof workerFetch !== "function") {
    throw new Error(
      `Cloudflare worker must export default.fetch: ${workerPath}`,
    );
  }

  let assetRequests = 0;
  const workerDataset = structuredClone(contractsDataset);
  workerDataset.anacConnection.status = "current";
  workerDataset.anacConnection.lastAttemptAt = "2000-01-01T00:00:00.000Z";
  workerDataset.anacConnection.lastSuccessAt = "2000-01-01T00:00:00.000Z";
  workerDataset.anacConnection.failureCategory = null;
  const env = {
    ASSETS: {
      fetch: async (assetRequest) => {
        if (
          new URL(assetRequest.url).pathname ===
          `/${STATIC_CONTRACTS_DATA_FILE}`
        ) {
          return new Response(JSON.stringify(workerDataset), {
            status: 200,
            headers: { "Content-Type": "application/json; charset=utf-8" },
          });
        }
        assetRequests += 1;
        return new Response("asset-fallback", {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      },
    },
  };

  const contractsResponse = await workerFetch(
    new Request("https://public.example/api/contracts"),
    env,
  );
  const contracts = await contractsResponse.json();
  if (
    contractsResponse.status !== 200 ||
    !Array.isArray(contracts) ||
    contracts.length !== contractsDataset.contracts.length
  ) {
    throw new Error(
      "Cloudflare worker contracts API must return the generated static dataset.",
    );
  }

  const contractsStatusResponse = await workerFetch(
    new Request("https://public.example/api/contracts/feed-status"),
    env,
  );
  if (contractsStatusResponse.status !== 200) {
    throw new Error(
      "Cloudflare worker contracts feed-status endpoint must return HTTP 200.",
    );
  }

  const anacStatusResponse = await workerFetch(
    new Request("https://public.example/api/contracts/anac-status"),
    env,
  );
  const anacStatus = await anacStatusResponse.json();
  if (
    anacStatusResponse.status !== 200 ||
    anacStatus?.schemaVersion !== "anac-bdncp-connection.v1" ||
    anacStatus?.status !== "stale" ||
    anacStatus?.coverage?.directCigLinks !==
      contractsDataset.anacConnection.coverage.directCigLinks
  ) {
    throw new Error(
      "Cloudflare worker ANAC/BDNCP status endpoint must expose the generated connection status.",
    );
  }

  const analyticsResponse = await workerFetch(
    new Request("https://public.example/api/contracts/analytics"),
    env,
  );
  const analytics = await analyticsResponse.json();
  if (
    analyticsResponse.status !== 200 ||
    analytics.totalCount !== contracts.length
  ) {
    throw new Error(
      "Cloudflare worker contracts analytics must match the static list.",
    );
  }

  if (contracts.length > 0) {
    const firstContract = contracts[0];
    const detailResponse = await workerFetch(
      new Request(`https://public.example/api/contracts/${firstContract.id}`),
      env,
    );
    const storylineResponse = await workerFetch(
      new Request(
        `https://public.example/api/contracts/${firstContract.id}/storyline`,
      ),
      env,
    );
    if (detailResponse.status !== 200 || storylineResponse.status !== 200) {
      throw new Error(
        "Cloudflare worker contracts detail and storyline endpoints must return HTTP 200.",
      );
    }
  }

  const apiResponse = await workerFetch(
    new Request("https://public.example/api/healthz"),
    env,
  );
  if (
    apiResponse.status !== 503 ||
    !apiResponse.headers.get("content-type")?.includes("application/json")
  ) {
    throw new Error(
      "Cloudflare worker API fallback must return JSON HTTP 503.",
    );
  }

  const feedResponse = await workerFetch(
    new Request("https://public.example/feeds/albo.xml"),
    env,
  );
  if (
    feedResponse.status !== 503 ||
    !feedResponse.headers.get("content-type")?.includes("application/xml")
  ) {
    throw new Error(
      "Cloudflare worker feed fallback must return XML HTTP 503.",
    );
  }

  const contractsFeedResponse = await workerFetch(
    new Request("https://public.example/feeds/contratti.xml"),
    env,
  );
  if (
    contractsFeedResponse.status !== 200 ||
    !contractsFeedResponse.headers
      .get("content-type")
      ?.includes("application/xml")
  ) {
    throw new Error(
      "Cloudflare worker contracts feed must return XML HTTP 200.",
    );
  }

  const assetResponse = await workerFetch(
    new Request("https://public.example/contratti/"),
    env,
  );
  if (assetResponse.status !== 200 || assetRequests !== 1) {
    throw new Error(
      "Cloudflare worker must delegate public routes to env.ASSETS.",
    );
  }

  return {
    apiStatus: apiResponse.status,
    unavailableFeedStatus: feedResponse.status,
    contractsStatus: contractsResponse.status,
    contractsFeedStatus: contractsFeedResponse.status,
    contracts: contracts.length,
  };
}

async function assertChunkBudget(distDir, prefix, maxBytes) {
  const assetsDir = path.join(distDir, "assets");
  const matches = (await readdir(assetsDir, { withFileTypes: true })).filter(
    (entry) =>
      entry.isFile() &&
      entry.name.startsWith(prefix) &&
      entry.name.endsWith(".js"),
  );
  if (matches.length !== 1) {
    throw new Error(
      `Expected one ${prefix} JavaScript chunk, found ${matches.length}.`,
    );
  }
  const bytes = (await stat(path.join(assetsDir, matches[0].name))).size;
  if (bytes > maxBytes) {
    throw new Error(`${prefix} chunk exceeds ${maxBytes} bytes: ${bytes}.`);
  }
  return { asset: matches[0].name, bytes, maxBytes };
}

function assertDeployProvenance(provenance, provenancePath) {
  if (
    !provenance ||
    typeof provenance !== "object" ||
    Array.isArray(provenance)
  ) {
    throw new Error(
      `Deploy provenance must be a JSON object: ${provenancePath}`,
    );
  }
  if (
    provenance.repository !== "colazeta/Lamezia-Trasparente-Monitor" ||
    typeof provenance.commitSha !== "string" ||
    !/^[0-9a-f]{40}$/i.test(provenance.commitSha) ||
    typeof provenance.createdAt !== "string" ||
    Number.isNaN(Date.parse(provenance.createdAt))
  ) {
    throw new Error(
      `Deploy provenance is missing a valid repository, commitSha or createdAt: ${provenancePath}`,
    );
  }
}

function assertDirectoryRouteRedirectPolicy(
  redirectsText,
  redirectsPath,
  route,
) {
  const rules = parseRedirectRules(redirectsText);
  const exactRule = rules.find((rule) => rule.source === route);
  const canonicalTarget = `${route}/`;

  if (!exactRule) {
    throw new Error(
      `Cloudflare _redirects must declare an exact ${route} rule: ${redirectsPath}`,
    );
  }

  if (exactRule.target === "/index.html" && exactRule.status === "200") {
    throw new Error(
      `Cloudflare redirects ${route} to / when ${route} rewrites to /index.html; use ${route} -> ${canonicalTarget} instead.`,
    );
  }

  if (
    exactRule.target !== canonicalTarget ||
    !["301", "302", "307", "308"].includes(exactRule.status)
  ) {
    throw new Error(
      `Cloudflare _redirects must canonicalize ${route} to ${canonicalTarget}: ${redirectsPath}`,
    );
  }

  const fallbackRule = rules.find(
    (rule) =>
      rule.source === `${route}/*` &&
      rule.target === "/index.html" &&
      rule.status === "200",
  );
  if (!fallbackRule) {
    throw new Error(
      `Cloudflare _redirects must keep ${route}/* as an SPA fallback: ${redirectsPath}`,
    );
  }
}

async function main() {
  const { distDir, routes } = parseArgs(process.argv.slice(2));
  const absoluteDistDir = path.resolve(distDir);
  const indexPath = path.join(absoluteDistDir, "index.html");
  const healthzPath = path.join(absoluteDistDir, STATIC_HEALTHZ_MARKER);
  const redirectsPath = path.join(absoluteDistDir, CLOUDFLARE_REDIRECTS_FILE);
  const workerPath = path.join(absoluteDistDir, CLOUDFLARE_WORKER_FILE);
  const headersPath = path.join(absoluteDistDir, CLOUDFLARE_HEADERS_FILE);
  const sitemapPath = path.join(absoluteDistDir, "sitemap.xml");
  const provenancePath = path.join(absoluteDistDir, DEPLOY_PROVENANCE_FILE);
  const contractsDatasetPath = path.join(
    absoluteDistDir,
    STATIC_CONTRACTS_DATA_FILE,
  );

  await assertDirectory(absoluteDistDir, "Static build directory");
  await assertReadableFile(indexPath, "Static fallback index.html");
  await assertReadableFile(healthzPath, "Static fallback healthz.json");
  await assertReadableFile(redirectsPath, "Cloudflare Pages _redirects");
  await assertReadableFile(workerPath, "Cloudflare Pages _worker.js");
  await assertReadableFile(headersPath, "Cloudflare Pages _headers");
  await assertReadableFile(sitemapPath, "Public sitemap.xml");
  await assertReadableFile(provenancePath, "Deploy provenance");
  await assertReadableFile(contractsDatasetPath, "Static contracts dataset");

  const healthz = await readJsonFile(
    healthzPath,
    "Static fallback healthz.json",
  );
  assertHealthzMarker(healthz, healthzPath);
  const provenance = await readJsonFile(provenancePath, "Deploy provenance");
  assertDeployProvenance(provenance, provenancePath);
  const contractsDataset = await readJsonFile(
    contractsDatasetPath,
    "Static contracts dataset",
  );
  const staticContracts = assertStaticContractsDataset(
    contractsDataset,
    contractsDatasetPath,
  );
  const redirectsText = await readFile(redirectsPath, "utf8");
  const sitemapText = await readFile(sitemapPath, "utf8");
  const sitemapRoutes = extractSitemapRoutes(sitemapText);
  for (const route of sitemapRoutes) {
    if (route === "/" || path.posix.extname(route)) continue;
    const canonicalSource = route.replace(/\/+$/, "");
    if (!canonicalSource) continue;
    assertDirectoryRouteRedirectPolicy(
      redirectsText,
      redirectsPath,
      canonicalSource,
    );
  }
  const workerText = await readFile(workerPath, "utf8");
  assertEdgeFallback(workerText, workerPath);
  const edgeFallback = await assertEdgeFallbackBehavior(
    workerPath,
    contractsDataset,
  );

  for (const route of ["/albo", "/contratti", "/organi", "/amministratori"]) {
    assertDirectoryRouteRedirectPolicy(redirectsText, redirectsPath, route);
  }

  const indexHtml = await readFile(indexPath, "utf8");
  for (const expectedText of REQUIRED_PUBLIC_TEXT) {
    if (!indexHtml.includes(expectedText)) {
      throw new Error(
        `index.html does not contain expected public marker: ${expectedText}`,
      );
    }
  }

  const assets = extractAssetPaths(indexHtml).filter(
    (assetPath) =>
      assetPath.startsWith("/assets/") || assetPath.startsWith("assets/"),
  );
  if (assets.length === 0) {
    throw new Error("index.html does not reference any generated Vite assets.");
  }

  for (const assetPath of assets) {
    await assertReadableFile(
      toDistPath(absoluteDistDir, assetPath),
      "Static asset",
    );
  }
  const bundleAssetsChecked = await assertGeneratedBundleText(
    absoluteDistDir,
    assets,
    [...REQUIRED_CONTRACT_BUNDLE_TEXT, ...REQUIRED_ORGANI_BUNDLE_TEXT],
  );
  const sourceHealthBundle = await assertSourceHealthBundle(absoluteDistDir);
  const entryAsset = assets.find((assetPath) => assetPath.endsWith(".js"));
  if (!entryAsset) {
    throw new Error("index.html does not reference a JavaScript entry chunk.");
  }
  const entryBytes = (await stat(toDistPath(absoluteDistDir, entryAsset))).size;
  if (entryBytes > ENTRY_CHUNK_MAX_BYTES) {
    throw new Error(
      `Entry chunk exceeds ${ENTRY_CHUNK_MAX_BYTES} bytes: ${entryBytes}.`,
    );
  }
  const chunkBudgets = {
    entry: {
      asset: entryAsset,
      bytes: entryBytes,
      maxBytes: ENTRY_CHUNK_MAX_BYTES,
    },
    home: await assertChunkBudget(
      absoluteDistDir,
      "Home-",
      HOME_CHUNK_MAX_BYTES,
    ),
    openDataIndex: await assertChunkBudget(
      absoluteDistDir,
      "Opendata-",
      OPEN_DATA_INDEX_CHUNK_MAX_BYTES,
    ),
  };

  const routeResults = [];
  for (const route of routes) {
    const fallback = routeFallbackPath(absoluteDistDir, route);
    if (route === "/") {
      routeResults.push({ route, mode: "root-index", path: indexPath });
      continue;
    }
    try {
      await assertReadableFile(
        fallback,
        `Route-specific fallback for ${route}`,
      );
      routeResults.push({ route, mode: "route-index", path: fallback });
    } catch {
      throw new Error(
        `Route-specific fallback for ${route} is required for static hosting: ${fallback}`,
      );
    }
  }

  const result = {
    ok: true,
    mode: "static-fallback",
    distDir: absoluteDistDir,
    index: indexPath,
    staticHealthz: healthzPath,
    redirects: redirectsPath,
    worker: workerPath,
    headers: headersPath,
    deployProvenance: provenancePath,
    contractsDataset: contractsDatasetPath,
    staticContracts,
    edgeFallback,
    sitemapRoutesChecked: sitemapRoutes.length,
    assetsChecked: assets.length,
    bundleAssetsChecked,
    sourceHealthBundle,
    chunkBudgets,
    routes: routeResults,
    note: "This smoke check validates the local static artifact and executes the bundled edge worker against generated assets. It does not call the live deployment or certify historical completeness.",
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});