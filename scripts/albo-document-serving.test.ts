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

test("serves the reviewed September commission attachments", () => {
  const repoRoot = path.resolve(import.meta.dirname, "..");
  const expected = [
    "data/public/albo/documents/2026/a1dad36522921833ac71b994a73032d3454227d0a2c00f57156a8d7059d94baf.pdf",
    "data/public/albo/documents/2026/dee314eb1f7e9133848be4b48c1c0b5e06ddd60371a92acc40ef9e290a62e411.pdf",
    "data/public/albo/documents/2026/feb500c847880bf03ab1cd09190b961828f5b3873d60bea800e93367a3c74468.pdf",
    "data/public/albo/documents/2026/57731fbea7c4cdd31d8ff82175a0f84fc4fb053c0d71cb073d00ce38b33c74b5.pdf",
    "data/public/albo/documents/2026/674f8c685f04e85674e4530e180cc45bca76b0256d06397040c2a024afb8f440.pdf",
    "data/public/albo/documents/2026/f311abbc9e4c6e3d0b9cfe4d4d0225548be713cef74686ec2556148e8c1901e5.pdf",
    "data/public/albo/documents/2026/08f1075950b3e90994c2c5353cb0b1dc0992a4c6f4d55b27ba2e5ddcb99f5c40.pdf",
    "data/public/albo/documents/2026/588fe94ce804d0f1699cb42f41eee4390e4ecb3f3fab21379b100b5c84e3e4eb.pdf",
    "data/public/albo/documents/2026/b23e5a278fa5550657c3804e2a60a37ad09a1bdad2efcff6a7ece4f68a6b15e1.pdf",
    "data/public/albo/documents/2026/8eebc4e71f5def4118e620b94ea9855319f39f9c548aedb7d4860d19a42b6f7f.pdf",
  ];

  const served = alboDocumentServingFiles(repoRoot);
  for (const documentPath of expected) {
    assert.ok(served.includes(documentPath));
    assert.ok(readVerifiedAlboDocument(repoRoot, documentPath));
  }
});
