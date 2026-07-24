#!/usr/bin/env node
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const repoRoot = path.resolve(import.meta.dirname, "..");
const distDir = path.join(
  repoRoot,
  "artifacts",
  "lamezia-trasparente",
  "dist",
  "public",
);
const assetsDir = path.join(distDir, "assets");
const indexPath = path.join(distDir, "index.html");
const PUBLIC_INITIAL_JS_BUDGET_BYTES = 600_000;
const MINIMUM_ISOLATED_ASSISTANT_DEPENDENCY_BYTES = 50_000;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function javascriptAssetsFromHtml(html) {
  return [
    ...new Set(
      Array.from(html.matchAll(/(?:src|href)=["']([^"']+\.js)["']/g)).map(
        ([, asset]) => asset.replace(/^\//, ""),
      ),
    ),
  ];
}

function importedJavascriptAssets(source) {
  return [
    ...new Set(
      Array.from(source.matchAll(/["']\.\/([^"']+\.js)["']/g)).map(
        ([, asset]) => asset,
      ),
    ),
  ];
}

async function measureAsset(asset) {
  const assetPath = path.join(assetsDir, asset);
  const source = await readFile(assetPath);
  return {
    asset,
    bytes: (await stat(assetPath)).size,
    gzipBytes: gzipSync(source).byteLength,
  };
}

async function main() {
  const html = await readFile(indexPath, "utf8");
  const initialAssets = javascriptAssetsFromHtml(html);
  assert(initialAssets.length > 0, "index.html does not reference JavaScript");

  const emittedAssets = await readdir(assetsDir);
  const assistantChunk = emittedAssets.find((asset) =>
    /^CivicAssistant-.+\.js$/.test(asset),
  );
  const welcomeChunk = emittedAssets.find((asset) =>
    /^CivicWelcome-.+\.js$/.test(asset),
  );
  assert(assistantChunk, "CivicAssistant lazy chunk was not emitted");
  assert(welcomeChunk, "CivicWelcome lazy chunk was not emitted");

  for (const chunk of [assistantChunk, welcomeChunk]) {
    assert(
      !initialAssets.some((asset) => asset.endsWith(chunk)),
      `${chunk} is referenced directly by the public HTML`,
    );
  }

  const assistantSource = await readFile(
    path.join(assetsDir, assistantChunk),
    "utf8",
  );
  const assistantDependencies = importedJavascriptAssets(assistantSource);
  const isolatedAssistantDependencies = await Promise.all(
    assistantDependencies
      .filter(
        (dependency) =>
          !initialAssets.some((asset) => asset.endsWith(dependency)),
      )
      .map(measureAsset),
  );
  assert(
    isolatedAssistantDependencies.some(
      (dependency) =>
        dependency.bytes >= MINIMUM_ISOLATED_ASSISTANT_DEPENDENCY_BYTES,
    ),
    "The assistant has no substantial dependency isolated from public startup",
  );

  const initialMeasurements = await Promise.all(
    initialAssets.map(async (asset) => {
      const assetPath = path.join(distDir, asset);
      const source = await readFile(assetPath);
      return {
        asset,
        bytes: (await stat(assetPath)).size,
        gzipBytes: gzipSync(source).byteLength,
      };
    }),
  );
  const initialBytes = initialMeasurements.reduce(
    (total, asset) => total + asset.bytes,
    0,
  );
  const initialGzipBytes = initialMeasurements.reduce(
    (total, asset) => total + asset.gzipBytes,
    0,
  );
  assert(
    initialBytes <= PUBLIC_INITIAL_JS_BUDGET_BYTES,
    `Public initial JS is ${initialBytes} bytes; budget is ${PUBLIC_INITIAL_JS_BUDGET_BYTES}`,
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        initialAssets: initialMeasurements,
        initialBytes,
        initialGzipBytes,
        publicBudgetBytes: PUBLIC_INITIAL_JS_BUDGET_BYTES,
        assistantChunk,
        welcomeChunk,
        isolatedAssistantDependencies,
        note: "Validates emitted build structure only; component tests cover deferred guide loading and helper activation.",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
