import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  COMUNE_PNRR_INDEX_URL,
  buildAlboEvidenceArchive,
  buildStaticPnrrDataset,
  extractProjectLinks,
  parseMunicipalPnrrProject,
  stableDatasetPayload,
  stableStringify,
  validateCoverageRegression,
  validateStaticPnrrDataset,
} from "./pnrr/lameziaPnrrCore.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const outputPath = path.join(
  repoRoot,
  "artifacts/lamezia-trasparente/src/data/generated/lameziaPnrrProjects.json",
);
const latestAlboPath = path.join(repoRoot, "data/public/albo/latest.json");
const deliberationArchivePath = path.join(
  repoRoot,
  "data/public/albo/delibere-archive.json",
);
const documentManifestPath = path.join(
  repoRoot,
  "data/public/albo/documents-manifest.json",
);
const reviewedDocumentAllowlistPath = path.join(
  repoRoot,
  "data/public/albo/reviewed-document-serving-allowlist.json",
);
const minimumProjectCount = Number.parseInt(
  process.env.LAMEZIA_PNRR_MIN_PROJECTS ?? "10",
  10,
);
const concurrency = Number.parseInt(
  process.env.LAMEZIA_PNRR_FETCH_CONCURRENCY ?? "5",
  10,
);

if (!Number.isInteger(minimumProjectCount) || minimumProjectCount < 1) {
  throw new Error(`Invalid LAMEZIA_PNRR_MIN_PROJECTS: ${minimumProjectCount}`);
}
if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 10) {
  throw new Error(
    `Invalid LAMEZIA_PNRR_FETCH_CONCURRENCY: ${concurrency}; expected 1-10.`,
  );
}

const [
  indexHtml,
  latestAlbo,
  deliberationArchive,
  documentManifest,
  reviewedDocumentAllowlist,
  existing,
] = await Promise.all([
  fetchText(COMUNE_PNRR_INDEX_URL),
  readJson(latestAlboPath),
  readJson(deliberationArchivePath),
  readJson(documentManifestPath),
  readJson(reviewedDocumentAllowlistPath),
  readJson(outputPath, null),
]);

const links = extractProjectLinks(indexHtml);
if (links.length < minimumProjectCount) {
  throw new Error(
    `Municipal PNRR index exposed ${links.length} project links; expected at least ${minimumProjectCount}. Previous output was not changed.`,
  );
}

const projects = await mapWithConcurrency(links, concurrency, async (link) => {
  const html = await fetchText(link.source_url);
  return parseMunicipalPnrrProject({
    sourceId: link.source_id,
    sourceUrl: link.source_url,
    html,
  });
});

const officialProjectCups = projects
  .map((project) => project.cup)
  .filter(Boolean);
const alboEvidence = buildAlboEvidenceArchive({
  currentSources: [deliberationArchive, latestAlbo],
  existingEvidence: existing?.albo_evidence ?? [],
  officialProjectCups,
  documentManifest,
  reviewedDocumentAllowlist,
});
const candidate = buildStaticPnrrDataset({
  projects,
  alboEvidence,
  materializedAt: new Date().toISOString(),
  alboSnapshotGeneratedAt: latestAlbo.generated_at ?? null,
});
validateStaticPnrrDataset(candidate, { minimumProjects: minimumProjectCount });
validateCoverageRegression(candidate, existing);

if (
  existing &&
  stableStringify(stableDatasetPayload(existing)) ===
    stableStringify(stableDatasetPayload(candidate))
) {
  console.log(
    `PNRR static feed already matches ${links.length} official municipal project pages and ${alboEvidence.length} retained Albo evidence records.`,
  );
  process.exit(0);
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(candidate, null, 2)}\n`, "utf8");
console.log(
  `Wrote ${candidate.coverage.projects} projects and ${candidate.coverage.albo_evidence} Albo evidence records to ${path.relative(repoRoot, outputPath)}.`,
);

async function fetchText(url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent":
            "Lamezia-Trasparente-Monitor pnrr-static-feed/1.0 (+https://github.com/colazeta/Lamezia-Trasparente-Monitor)",
        },
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
      }
    }
  }
  const detail =
    lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(`Unable to fetch ${url}: ${detail}`);
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT" && arguments.length > 1) return fallback;
    throw error;
  }
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return results;
}
