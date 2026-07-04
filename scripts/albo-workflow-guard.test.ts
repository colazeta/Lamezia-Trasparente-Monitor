import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const workflow = readFileSync(
  new URL("../.github/workflows/albo-ingestion.yml", import.meta.url),
  "utf8",
);
const deploySmokeWorkflow = readFileSync(
  new URL("../.github/workflows/deploy-smoke.yml", import.meta.url),
  "utf8",
);
const pagesStaticFallbackWorkflow = readFileSync(
  new URL("../.github/workflows/pages-static-fallback.yml", import.meta.url),
  "utf8",
);

function stagedPathsFromGitAddBlocks(contents: string) {
  const paths: string[] = [];
  let inGitAdd = false;

  function addArgs(args: string) {
    const cleaned = args.replace(/\\$/, "").trim();
    if (!cleaned || cleaned === "\\") return;

    for (const path of cleaned.split(/\s+/)) {
      paths.push(path.replace(/^["']|["']$/g, ""));
    }
  }

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith("git add")) {
      inGitAdd = true;
      addArgs(trimmed.replace(/^git add\s*/, ""));
      if (!trimmed.endsWith("\\")) {
        inGitAdd = false;
      }
      continue;
    }

    if (!inGitAdd) continue;
    if (!trimmed || /^(if|then|fi|git|echo)\b/.test(trimmed)) {
      inGitAdd = false;
      continue;
    }

    addArgs(trimmed);
    if (!trimmed.endsWith("\\")) {
      inGitAdd = false;
    }
  }

  return paths;
}

test("Albo ingestion workflow stages only public-safe Albo outputs", () => {
  const stagedPaths = stagedPathsFromGitAddBlocks(workflow);
  const forbiddenPrefixes = ["data/snapshots/albo", "data/processed/albo"];

  assert.ok(
    stagedPaths.some((path) => path === "data/public/albo"),
    "workflow should stage the generated public Albo directory",
  );

  for (const path of stagedPaths) {
    assert.ok(
      !forbiddenPrefixes.some(
        (prefix) => path === prefix || path.startsWith(`${prefix}/`),
      ),
      `workflow must not stage non-minimised Albo artifact path: ${path}`,
    );
  }
});

test("Albo public output commits are eligible for frontend rebuilds", () => {
  assert.ok(
    !workflow.includes("[skip ci]"),
    "Albo output commits must not skip CI/deploy; the frontend embeds public Albo data at build time",
  );

  for (const [name, contents] of [
    ["deploy smoke", deploySmokeWorkflow],
    ["GitHub Pages static fallback", pagesStaticFallbackWorkflow],
  ] as const) {
    assert.match(
      contents,
      /data\/public\/albo\/\*\*/,
      `${name} workflow should rebuild when public Albo outputs change`,
    );
  }
});
