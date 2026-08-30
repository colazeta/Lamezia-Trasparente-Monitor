import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, unlinkSync } from "node:fs";
import path from "node:path";

export const ALBO_DOCUMENT_PREFIX = "data/public/albo/documents/";

const PUBLIC_PDF_PATH =
  /^data\/public\/albo\/documents\/[0-9]{4}\/([a-f0-9]{64})\.pdf$/iu;

export function alboDocumentServingFiles(repoRoot: string): string[] {
  const manifest = readJsonObject(
    path.join(repoRoot, "data/public/albo/documents-manifest.json"),
  );
  const reviewed = readJsonObject(
    path.join(
      repoRoot,
      "data/public/albo/reviewed-document-serving-allowlist.json",
    ),
  );

  const currentDocuments = arrayValue(manifest.documents)
    .map(currentManifestDocumentPath)
    .filter((value): value is string => value !== null);
  const reviewedDocuments = arrayValue(reviewed.documents)
    .map(reviewedDocumentPath)
    .filter((value): value is string => value !== null);

  return [...new Set([...currentDocuments, ...reviewedDocuments])].sort();
}

export function pruneUnallowlistedAlboDocumentFiles(
  repoRoot: string,
  outputDir: string,
): string[] {
  const resolvedRepoRoot = path.resolve(repoRoot);
  const resolvedOutputDir = path.resolve(outputDir);
  if (resolvedOutputDir === resolvedRepoRoot) {
    throw new Error(
      "Refusing to prune Albo documents from the repository root",
    );
  }

  const documentRoot = path.join(resolvedOutputDir, ALBO_DOCUMENT_PREFIX);
  if (!existsSync(documentRoot)) return [];

  const allowed = new Set(alboDocumentServingFiles(repoRoot));
  const removed: string[] = [];
  const visit = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(absolutePath);
        continue;
      }
      if (!entry.isFile() || !/\.pdf$/iu.test(entry.name)) continue;

      const relativePath = path
        .relative(resolvedOutputDir, absolutePath)
        .replace(/\\/gu, "/");
      if (allowed.has(relativePath)) continue;
      unlinkSync(absolutePath);
      removed.push(relativePath);
    }
  };

  visit(documentRoot);
  return removed.sort();
}

export function readVerifiedAlboDocument(
  repoRoot: string,
  relativePath: string,
): Buffer | null {
  if (!alboDocumentServingFiles(repoRoot).includes(relativePath)) return null;

  const match = PUBLIC_PDF_PATH.exec(relativePath);
  const expectedSha256 = match?.[1]?.toLowerCase();
  if (!expectedSha256) return null;

  const absolutePath = path.join(repoRoot, relativePath);
  if (!existsSync(absolutePath)) return null;
  const source = readFileSync(absolutePath);
  const actualSha256 = createHash("sha256").update(source).digest("hex");
  return actualSha256 === expectedSha256 ? source : null;
}

function currentManifestDocumentPath(value: unknown): string | null {
  const document = objectValue(value);
  if (
    !document ||
    document.preservation_status !== "archived" ||
    document.reason !== "eligible_low_risk_publishable_pdf" ||
    document.content_type !== "application/pdf"
  ) {
    return null;
  }
  return verifiedStoragePath(document.storage_path, document.sha256);
}

function reviewedDocumentPath(value: unknown): string | null {
  const document = objectValue(value);
  if (
    !document ||
    document.review_status !== "approved_public_civic_document"
  ) {
    return null;
  }
  return verifiedStoragePath(document.storage_path, document.sha256);
}

function verifiedStoragePath(
  storagePath: unknown,
  sha256: unknown,
): string | null {
  if (typeof storagePath !== "string" || typeof sha256 !== "string") {
    return null;
  }
  const match = PUBLIC_PDF_PATH.exec(storagePath);
  return match?.[1]?.toLowerCase() === sha256.toLowerCase()
    ? storagePath
    : null;
}

function readJsonObject(filePath: string): Record<string, unknown> {
  const parsed = JSON.parse(readFileSync(filePath, "utf8")) as unknown;
  const object = objectValue(parsed);
  if (!object) throw new Error(`Invalid Albo document allow-list: ${filePath}`);
  return object;
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
