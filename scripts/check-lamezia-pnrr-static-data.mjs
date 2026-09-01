import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateStaticPnrrDataset } from "./pnrr/lameziaPnrrCore.mjs";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const datasetPath = path.join(
  repoRoot,
  "artifacts/lamezia-trasparente/src/data/generated/lameziaPnrrProjects.json",
);
const [dataset, documentManifest, reviewedDocumentAllowlist] =
  await Promise.all(
    [
      datasetPath,
      path.join(repoRoot, "data/public/albo/documents-manifest.json"),
      path.join(
        repoRoot,
        "data/public/albo/reviewed-document-serving-allowlist.json",
      ),
    ].map(async (filePath) => JSON.parse(await readFile(filePath, "utf8"))),
  );

validateStaticPnrrDataset(dataset, { minimumProjects: 10 });
const allowedArchivePaths = new Set([
  ...documentManifest.documents.map((document) => document.storage_path),
  ...reviewedDocumentAllowlist.documents.map(
    (document) => document.storage_path,
  ),
]);
for (const evidence of dataset.albo_evidence) {
  if (
    evidence.archived_path &&
    !allowedArchivePaths.has(evidence.archived_path)
  ) {
    throw new Error(
      `PNRR evidence ${evidence.id} references a local PDF that is not authorised for public serving.`,
    );
  }
}
console.log(
  `Validated ${dataset.coverage.projects} municipal PNRR projects, ${dataset.coverage.projects_with_opencup} OpenCUP records (${dataset.coverage.projects_with_opencup_total_cost} with total cost; ${dataset.coverage.projects_with_opencup_public_funding} with public funding), ${dataset.coverage.albo_evidence} Albo evidence records and ${dataset.coverage.municipal_attachments} municipal attachments (${dataset.coverage.municipal_attachments_classified} classified; ${dataset.coverage.municipal_attachments_with_year} with an explicit year).`,
);
