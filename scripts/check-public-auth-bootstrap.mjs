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
const PUBLIC_INITIAL_JS_BUDGET_BYTES = 650_000;

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

async function main() {
  const html = await readFile(indexPath, "utf8");
  const initialAssets = javascriptAssetsFromHtml(html);
  assert(initialAssets.length > 0, "index.html does not reference JavaScript");

  const emittedAssets = await readdir(assetsDir);
  const protectedChunk = emittedAssets.find((asset) =>
    /^ClerkProtectedRoutes-.+\.js$/.test(asset),
  );
  assert(protectedChunk, "Clerk protected route chunk was not emitted");
  assert(
    !initialAssets.some((asset) => asset.endsWith(protectedChunk)),
    "Clerk protected route chunk is referenced by the public HTML",
  );

  const protectedSource = await readFile(
    path.join(assetsDir, protectedChunk),
    "utf8",
  );
  const protectedDependencies = importedJavascriptAssets(protectedSource);
  const lazyOnlyDependencies = protectedDependencies.filter(
    (dependency) => !initialAssets.some((asset) => asset.endsWith(dependency)),
  );
  assert(
    lazyOnlyDependencies.length > 0,
    "Protected bootstrap has no dependency isolated from the public entry",
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
        protectedChunk,
        lazyOnlyDependencies,
        note: "Validates emitted build structure only; it does not authenticate a real Clerk user.",
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
