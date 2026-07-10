#!/usr/bin/env node
import { access, readFile, readdir, stat } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import process from "node:process";

const DEFAULT_DIST_DIR = "artifacts/lamezia-trasparente/dist/public";
const CLOUDFLARE_REDIRECTS_FILE = "_redirects";
const STATIC_HEALTHZ_MARKER = "healthz.json";
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
  "/metodologia",
];
const REQUIRED_PUBLIC_TEXT = [
  "rendiamoLameziaTrasparente",
  "Osservatorio Civico Indipendente",
];
const REQUIRED_CONTRACT_BUNDLE_TEXT = [
  "Contratti pubblici sotto osservazione",
  "Contratti protagonisti",
  "Stato dei fascicoli contrattuali",
  "Copertura fasi",
  "Copertura stato fasi dei fascicoli",
  "Ponte BDNCP",
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
const REQUIRED_CANONICAL_DIRECTORY_ROUTES = [
  "/albo",
  "/contratti",
  "/organi",
  "/amministratori",
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
    throw new Error(`Static healthz marker must be a JSON object: ${healthzPath}`);
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
    throw new Error(`Static healthz marker checks must be a JSON object: ${healthzPath}`);
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
    throw new Error("Static healthz marker must declare non-empty limitations.");
  }

  for (const [index, limitation] of healthz.limitations.entries()) {
    if (typeof limitation !== "string" || limitation.trim().length === 0) {
      throw new Error(
        `Static healthz marker limitations[${index}] must be a non-empty string.`,
      );
    }
  }
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
  const emittedJsAssetPaths = (await readdir(assetsDir, { withFileTypes: true }))
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

function assertDirectoryRouteRedirectPolicy(redirectsText, redirectsPath, route) {
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

  await assertDirectory(absoluteDistDir, "Static build directory");
  await assertReadableFile(indexPath, "Static fallback index.html");
  await assertReadableFile(healthzPath, "Static fallback healthz.json");
  await assertReadableFile(redirectsPath, "Cloudflare Pages _redirects");

  const healthz = await readJsonFile(healthzPath, "Static fallback healthz.json");
  assertHealthzMarker(healthz, healthzPath);
  const redirectsText = await readFile(redirectsPath, "utf8");
  for (const route of REQUIRED_CANONICAL_DIRECTORY_ROUTES) {
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

  const assets = extractAssetPaths(indexHtml).filter((assetPath) =>
    assetPath.startsWith("/assets/") || assetPath.startsWith("assets/"),
  );
  if (assets.length === 0) {
    throw new Error("index.html does not reference any generated Vite assets.");
  }

  for (const assetPath of assets) {
    await assertReadableFile(toDistPath(absoluteDistDir, assetPath), "Static asset");
  }
  const bundleAssetsChecked = await assertGeneratedBundleText(
    absoluteDistDir,
    assets,
    [...REQUIRED_CONTRACT_BUNDLE_TEXT, ...REQUIRED_ORGANI_BUNDLE_TEXT],
  );

  const routeResults = [];
  for (const route of routes) {
    const fallback = routeFallbackPath(absoluteDistDir, route);
    if (route === "/") {
      routeResults.push({ route, mode: "root-index", path: indexPath });
      continue;
    }
    try {
      await assertReadableFile(fallback, `Route-specific fallback for ${route}`);
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
    assetsChecked: assets.length,
    bundleAssetsChecked,
    routes: routeResults,
    note:
      "This smoke check validates a local static artifact only. It does not choose a provider, call live APIs, run workers or certify civic data as current.",
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
