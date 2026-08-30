import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  alboDocumentServingFiles,
  pruneUnallowlistedAlboDocumentFiles,
  readVerifiedAlboDocument,
} from "../artifacts/lamezia-trasparente/albo-document-serving";

test("serves only valid manifest or explicitly reviewed Albo PDFs", async () => {
  const repoRoot = await mkdtemp(path.join(tmpdir(), "albo-document-serving-"));
  const publicDir = path.join(repoRoot, "data", "public", "albo");
  const documentsDir = path.join(publicDir, "documents", "2026");
  const outputDir = path.join(repoRoot, "dist", "public");
  const outputDocumentsDir = path.join(
    outputDir,
    "data",
    "public",
    "albo",
    "documents",
    "2026",
  );
  const currentSource = Buffer.from("current fixture");
  const reviewedSource = Buffer.from("reviewed fixture");
  const orphanSource = Buffer.from("orphan fixture");
  const currentHash = sha256(currentSource);
  const reviewedHash = sha256(reviewedSource);
  const orphanHash = sha256(orphanSource);
  const wrongHash = "d".repeat(64);
  const currentPath = `data/public/albo/documents/2026/${currentHash}.pdf`;
  const reviewedPath = `data/public/albo/documents/2026/${reviewedHash}.pdf`;

  await Promise.all([
    mkdir(documentsDir, { recursive: true }),
    mkdir(outputDocumentsDir, { recursive: true }),
  ]);
  await Promise.all([
    writeFile(path.join(documentsDir, `${currentHash}.pdf`), currentSource),
    writeFile(path.join(documentsDir, `${reviewedHash}.pdf`), reviewedSource),
    writeFile(path.join(documentsDir, `${orphanHash}.pdf`), orphanSource),
    writeFile(
      path.join(outputDocumentsDir, `${currentHash}.pdf`),
      currentSource,
    ),
    writeFile(
      path.join(outputDocumentsDir, `${reviewedHash}.pdf`),
      reviewedSource,
    ),
    writeFile(path.join(outputDocumentsDir, `${orphanHash}.pdf`), orphanSource),
  ]);
  await writeJson(path.join(publicDir, "documents-manifest.json"), {
    documents: [
      {
        storage_path: currentPath,
        sha256: currentHash,
        preservation_status: "archived",
        reason: "eligible_low_risk_publishable_pdf",
        content_type: "application/pdf",
      },
      {
        storage_path: `data/public/albo/documents/2026/${orphanHash}.pdf`,
        sha256: orphanHash,
        preservation_status: "excluded",
        reason: "privacy_excluded",
        content_type: "application/pdf",
      },
      {
        storage_path: "data/public/albo/documents/../../private.pdf",
        sha256: wrongHash,
        preservation_status: "archived",
        reason: "eligible_low_risk_publishable_pdf",
        content_type: "application/pdf",
      },
      {
        storage_path: `data/public/albo/documents/2026/${wrongHash}.pdf`,
        sha256: currentHash,
        preservation_status: "archived",
        reason: "eligible_low_risk_publishable_pdf",
        content_type: "application/pdf",
      },
    ],
  });
  await writeJson(
    path.join(publicDir, "reviewed-document-serving-allowlist.json"),
    {
      documents: [
        {
          storage_path: reviewedPath,
          sha256: reviewedHash,
          review_status: "approved_public_civic_document",
        },
        {
          storage_path: `data/public/albo/documents/2026/${orphanHash}.pdf`,
          sha256: orphanHash,
          review_status: "pending",
        },
      ],
    },
  );

  try {
    assert.deepEqual(alboDocumentServingFiles(repoRoot), [
      currentPath,
      reviewedPath,
    ]);
    assert.deepEqual(
      readVerifiedAlboDocument(repoRoot, currentPath),
      currentSource,
    );
    assert.deepEqual(
      readVerifiedAlboDocument(repoRoot, reviewedPath),
      reviewedSource,
    );
    assert.equal(
      readVerifiedAlboDocument(
        repoRoot,
        `data/public/albo/documents/2026/${orphanHash}.pdf`,
      ),
      null,
    );
    await writeFile(
      path.join(documentsDir, `${currentHash}.pdf`),
      "tampered fixture",
      "utf8",
    );
    assert.equal(readVerifiedAlboDocument(repoRoot, currentPath), null);
    assert.throws(() =>
      pruneUnallowlistedAlboDocumentFiles(repoRoot, repoRoot),
    );
    assert.deepEqual(pruneUnallowlistedAlboDocumentFiles(repoRoot, outputDir), [
      `data/public/albo/documents/2026/${orphanHash}.pdf`,
    ]);
    await readFile(path.join(outputDocumentsDir, `${currentHash}.pdf`));
    await readFile(path.join(outputDocumentsDir, `${reviewedHash}.pdf`));
    await assert.rejects(
      readFile(path.join(outputDocumentsDir, `${orphanHash}.pdf`)),
    );
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function sha256(value: Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}
