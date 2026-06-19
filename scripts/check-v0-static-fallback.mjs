#!/usr/bin/env node
import { access, readFile, stat } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import process from "node:process";

const DEFAULT_DIST_DIR = "artifacts/lamezia-trasparente/dist/public";
const STATIC_HEALTHZ_MARKER = "healthz.json";
const EXPECTED_HEALTHZ_NOT_CHECKED = [
  "api",
  "worker",
  "liveData",
  "sourceCompleteness",
];
const REQUIRED_ROUTES = [
  "/",
  "/convocazioni",
  "/convocazioni/demo-consiglio-comunale-v0",
  "/fonti-dati",
  "/metodologia",
];
const REQUIRED_PUBLIC_TEXT = [
  "rendiamoLameziaTrasparente",
  "Osservatorio Civico Indipendente",
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
      "Static healthz marker must report checks.staticFrontendReachability as true.",
    );
  }

  for (const checkName of EXPECTED_HEALTHZ_NOT_CHECKED) {
    if (checks[checkName] !== "not-checked") {
      throw new Error(
        `Static healthz marker must report checks.${checkName} as "not-checked".`,
      );
    }
  }

  if (!Array.isArray(healthz.limitations) || healthz.limitations.length === 0) {
    throw new Error("Static healthz marker limitations must be a non-empty array.");
  }
}

async function readJsonFile(filePath, label) {
  await assertReadableFile(filePath, label);
  const raw = await readFile(filePath, "utf8");
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `${label} is not valid JSON: ${filePath} (${
        error instanceof Error ? error.message : String(error)
      })`,
    );
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
  const content = await readFile(filePath, "utf8");
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(
      `${label} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
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

function routeFallbackPath(distDir, route) {
  const clean = route.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!clean) return path.join(distDir, "index.html");
  return path.join(distDir, clean, "index.html");
}

async function main() {
  const { distDir, routes } = parseArgs(process.argv.slice(2));
  const absoluteDistDir = path.resolve(distDir);
  const indexPath = path.join(absoluteDistDir, "index.html");
  const healthzPath = path.join(absoluteDistDir, STATIC_HEALTHZ_MARKER);

  await assertDirectory(absoluteDistDir, "Static build directory");
  await assertReadableFile(indexPath, "Static fallback index.html");
  await assertReadableFile(healthzPath, "Static fallback healthz.json");

  const healthz = await readJsonFile(healthzPath, "Static fallback healthz.json");
  assertHealthzMarker(healthz, healthzPath);

  const healthzPath = path.join(absoluteDistDir, STATIC_HEALTHZ_MARKER);
  const healthz = await readJsonFile(healthzPath, "Static healthz marker");
  assertHealthzMarker(healthz, healthzPath);

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

  const routeResults = [];
  for (const route of routes) {
    const fallback = routeFallbackPath(absoluteDistDir, route);
    try {
      await assertReadableFile(fallback, `Route-specific fallback for ${route}`);
      routeResults.push({ route, mode: "route-index", path: fallback });
    } catch {
      routeResults.push({ route, mode: "spa-index", path: indexPath });
    }
  }

  const result = {
    ok: true,
    mode: "static-fallback",
    distDir: absoluteDistDir,
    index: indexPath,
    staticHealthz: healthzPath,
    assetsChecked: assets.length,
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
