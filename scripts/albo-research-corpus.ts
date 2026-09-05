import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  ALBO_RESEARCH_CORPUS_DATA_PATH,
  buildCanonicalAlboResearchCorpus,
  type AlboResearchSourceSnapshot,
} from "@workspace/publication-standardisation/albo-research-corpus";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const inputPath = path.join(repoRoot, "data/public/albo/latest.json");
const outputPath = path.join(repoRoot, ALBO_RESEARCH_CORPUS_DATA_PATH);

const snapshot = JSON.parse(
  await readFile(inputPath, "utf8"),
) as AlboResearchSourceSnapshot;
const corpus = buildCanonicalAlboResearchCorpus(snapshot);

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(corpus, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify({
    output: ALBO_RESEARCH_CORPUS_DATA_PATH,
    schemaVersion: corpus.schema_version,
    recordsMaterialised: corpus.coverage.records_materialised,
    taxonomyCoverage: corpus.coverage.taxonomy_coverage,
    publicProcurementCandidates: corpus.coverage.public_procurement_candidates,
    publicProcurementUnresolved: corpus.coverage.public_procurement_unresolved,
  }),
);
