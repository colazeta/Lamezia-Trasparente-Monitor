#!/usr/bin/env node
import process from "node:process";

const DEFAULT_PUBLIC_URL = "https://lamezia-trasparente.pages.dev";
const DEFAULT_ATTEMPTS = 1;
const DEFAULT_DELAY_MS = 10_000;
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

function usage() {
  return [
    "Usage: node scripts/check-public-contracts-page.mjs [--url <public-url>] [--attempts <n>] [--delay-ms <ms>]",
    "",
    "Checks the production/public contracts route and generated bundle markers.",
    "Defaults to https://lamezia-trasparente.pages.dev.",
  ].join("\n");
}

function parseArgs(argv) {
  const options = {
    attempts: DEFAULT_ATTEMPTS,
    delayMs: DEFAULT_DELAY_MS,
    publicUrl: DEFAULT_PUBLIC_URL,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--url") {
      const value = argv[(i += 1)];
      if (!value || value.startsWith("--")) throw new Error("Missing value for --url.");
      options.publicUrl = value;
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
    throw new Error(`${label} returned HTTP ${response.status}: ${response.url}`);
  }

  return {
    finalUrl: response.url,
    text: await response.text(),
  };
}

function normalizeRouteForCompare(url) {
  const parsed = new URL(url);
  return `${parsed.origin}${parsed.pathname.replace(/\/+$/, "")}`;
}

function assertContractsRoute(publicUrl, finalUrl) {
  const expected = normalizeRouteForCompare(routeUrl(publicUrl, "/contratti"));
  const actual = normalizeRouteForCompare(finalUrl);
  if (actual !== expected) {
    throw new Error(`Direct /contratti resolved to ${finalUrl}; expected ${expected}.`);
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

function extractScriptPaths(...htmlDocuments) {
  const scriptPaths = new Set();
  for (const html of htmlDocuments) {
    for (const match of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
      const scriptPath = match[1];
      if (scriptPath) scriptPaths.add(scriptPath);
    }
  }
  return [...scriptPaths];
}

async function fetchBundleText(publicUrl, scriptPaths) {
  if (scriptPaths.length === 0) {
    throw new Error("No generated JavaScript assets found on public URL.");
  }

  const bundleParts = [];
  for (const scriptPath of scriptPaths) {
    const scriptUrl = new URL(scriptPath, `${publicUrl}/`).href;
    const { text } = await fetchText(scriptUrl, `JavaScript asset ${scriptUrl}`);
    bundleParts.push(text);
  }
  return bundleParts.join("\n");
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
}

async function checkPublicContractsPage(publicUrl) {
  const rootUrl = routeUrl(publicUrl, "/");
  const contractsUrl = routeUrl(publicUrl, "/contratti");
  const root = await fetchText(rootUrl, "Root route");
  const contracts = await fetchText(contractsUrl, "Contracts route");

  console.log(`Fetched ${rootUrl} -> ${root.finalUrl}`);
  console.log(`Fetched ${contractsUrl} -> ${contracts.finalUrl}`);

  assertContractsRoute(publicUrl, contracts.finalUrl);
  assertPublicText(root.text, "Root route");
  assertPublicText(contracts.text, "Contracts route");

  const scriptPaths = extractScriptPaths(root.text, contracts.text);
  console.log(`Found ${scriptPaths.length} public JavaScript asset(s).`);
  const bundleText = await fetchBundleText(publicUrl, scriptPaths);
  assertBundleMarkers(bundleText);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  let lastError;

  for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
    try {
      console.log(`Public contracts smoke attempt ${attempt}/${options.attempts}`);
      await checkPublicContractsPage(options.publicUrl);
      console.log("Public contracts smoke passed.");
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
