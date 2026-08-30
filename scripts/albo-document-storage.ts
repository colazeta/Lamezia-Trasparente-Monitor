import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";

export const MAX_PUBLIC_PDF_BYTES = 10 * 1024 * 1024;
export const REVIEWED_DOCUMENT_ALLOWLIST_FILE =
  "reviewed-document-serving-allowlist.json";

const PUBLIC_PDF_PATH =
  /^data\/public\/albo\/documents\/([0-9]{4})\/([a-f0-9]{64})\.pdf$/u;

export interface ReviewedDocumentServingEntry {
  storage_path: string;
  sha256: string;
  source_publication_number: string;
  review_status: "approved_public_civic_document";
  evidence_ref: string;
  reason: string;
}

export interface ReviewedDocumentServingAllowlist {
  schema_version: "albo-reviewed-document-serving.v1";
  reviewed_at: string;
  source: string;
  source_url: string;
  known_limits: string[];
  documents: ReviewedDocumentServingEntry[];
}

export function validateArchivedStoragePath(value: unknown): {
  storagePath: string;
  year: string;
  sha256: string;
} {
  if (typeof value !== "string") {
    throw new Error(`Unsafe archived PDF path: ${String(value)}`);
  }
  const match = PUBLIC_PDF_PATH.exec(value);
  if (!match?.[1] || !match[2]) {
    throw new Error(`Unsafe archived PDF path: ${value}`);
  }
  return {
    storagePath: value,
    year: match[1],
    sha256: match[2].toLowerCase(),
  };
}

export function isArchivedStoragePath(value: unknown): value is string {
  try {
    validateArchivedStoragePath(value);
    return true;
  } catch {
    return false;
  }
}

export function archivedDocumentsRoot(outDir: string): string {
  return path.resolve(outDir, "public", "albo", "documents");
}

export function archivedPdfPath(outDir: string, storagePath: string): string {
  const validated = validateArchivedStoragePath(storagePath);
  return path.join(
    archivedDocumentsRoot(outDir),
    validated.year,
    `${validated.sha256}.pdf`,
  );
}

export async function prepareArchivedPdfWritePath(
  outDir: string,
  storagePath: string,
): Promise<string> {
  const validated = validateArchivedStoragePath(storagePath);
  const root = archivedDocumentsRoot(outDir);
  await ensureDirectoryChainNoSymlinks(path.resolve(outDir), [
    "public",
    "albo",
    "documents",
    validated.year,
  ]);
  const target = archivedPdfPath(outDir, validated.storagePath);
  await rejectSymlinkOrNonFileLeaf(target, true);
  await assertRealPathContained(root, path.dirname(target));
  return target;
}

export async function resolveExistingArchivedPdfPath(
  outDir: string,
  storagePath: string,
): Promise<string> {
  const validated = validateArchivedStoragePath(storagePath);
  const root = archivedDocumentsRoot(outDir);
  await assertExistingDirectoryChainNoSymlinks(path.resolve(outDir), [
    "public",
    "albo",
    "documents",
    validated.year,
  ]);
  const target = archivedPdfPath(outDir, validated.storagePath);
  await rejectSymlinkOrNonFileLeaf(target, false);
  await assertRealPathContained(root, target);
  return target;
}

export async function assertArchivedDocumentsRootSafe(
  outDir: string,
): Promise<string | null> {
  const base = path.resolve(outDir);
  const root = archivedDocumentsRoot(outDir);
  try {
    await assertExistingDirectoryChainNoSymlinks(base, [
      "public",
      "albo",
      "documents",
    ]);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
  await assertRealPathContained(root, root);
  return root;
}

export async function assertArchiveYearDirectorySafe(
  outDir: string,
  year: string,
): Promise<string> {
  if (!/^\d{4}$/u.test(year)) {
    throw new Error(`Unsafe archived PDF year directory: ${year}`);
  }
  const root = archivedDocumentsRoot(outDir);
  await assertExistingDirectoryChainNoSymlinks(path.resolve(outDir), [
    "public",
    "albo",
    "documents",
    year,
  ]);
  const yearPath = path.join(root, year);
  await assertRealPathContained(root, yearPath);
  return yearPath;
}

export async function verifyArchivedPdfFile(
  outDir: string,
  value: {
    storage_path: unknown;
    sha256: unknown;
    size_bytes?: unknown;
    content_type?: unknown;
  },
  options: { requireSize: boolean },
): Promise<Uint8Array> {
  const validated = validateArchivedStoragePath(value.storage_path);
  if (
    typeof value.sha256 !== "string" ||
    !/^[a-f0-9]{64}$/u.test(value.sha256) ||
    value.sha256 !== validated.sha256
  ) {
    throw new Error(
      `Archived PDF digest does not match its storage path: ${validated.storagePath}`,
    );
  }
  if (
    value.content_type !== undefined &&
    value.content_type !== "application/pdf"
  ) {
    throw new Error(
      `Archived PDF has an invalid content type: ${validated.storagePath}`,
    );
  }
  if (
    options.requireSize &&
    (!Number.isSafeInteger(value.size_bytes) ||
      (value.size_bytes as number) <= 0 ||
      (value.size_bytes as number) > MAX_PUBLIC_PDF_BYTES)
  ) {
    throw new Error(
      `Archived PDF has an invalid declared size: ${validated.storagePath}`,
    );
  }

  const absolutePath = await resolveExistingArchivedPdfPath(
    outDir,
    validated.storagePath,
  );
  const physical = await stat(absolutePath);
  if (
    !physical.isFile() ||
    physical.size <= 0 ||
    physical.size > MAX_PUBLIC_PDF_BYTES ||
    (options.requireSize && physical.size !== value.size_bytes)
  ) {
    throw new Error(
      `Archived PDF physical size is invalid: ${validated.storagePath}`,
    );
  }
  const bytes = new Uint8Array(await readFile(absolutePath));
  if (!hasPdfSignature(bytes)) {
    throw new Error(
      `Archived PDF signature is invalid: ${validated.storagePath}`,
    );
  }
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (digest !== validated.sha256) {
    throw new Error(
      `Archived PDF physical digest is invalid: ${validated.storagePath}`,
    );
  }
  return bytes;
}

export async function readReviewedDocumentServingAllowlist(
  outDir: string,
): Promise<ReviewedDocumentServingAllowlist | null> {
  const filePath = path.join(
    outDir,
    "public",
    "albo",
    REVIEWED_DOCUMENT_ALLOWLIST_FILE,
  );
  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw new Error(
      `Cannot read reviewed Albo document allow-list: ${filePath}`,
      {
        cause: error,
      },
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch (error) {
    throw new Error(
      `Invalid JSON in reviewed Albo document allow-list: ${filePath}`,
      {
        cause: error,
      },
    );
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(
      `Invalid reviewed Albo document allow-list schema: ${filePath}`,
    );
  }
  const allowlist = parsed as Record<string, unknown>;
  if (
    allowlist.schema_version !== "albo-reviewed-document-serving.v1" ||
    !isIsoDate(allowlist.reviewed_at) ||
    typeof allowlist.source !== "string" ||
    !allowlist.source ||
    !isOfficialHttpsUrl(allowlist.source_url) ||
    !Array.isArray(allowlist.known_limits) ||
    !allowlist.known_limits.every(
      (entry) => typeof entry === "string" && entry.length > 0,
    ) ||
    !Array.isArray(allowlist.documents)
  ) {
    throw new Error(
      `Invalid reviewed Albo document allow-list schema: ${filePath}`,
    );
  }

  const documents = allowlist.documents.map((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(
        `Invalid reviewed Albo document at documents[${index}]: ${filePath}`,
      );
    }
    const document = entry as Record<string, unknown>;
    const validated = validateArchivedStoragePath(document.storage_path);
    if (
      typeof document.sha256 !== "string" ||
      !/^[a-f0-9]{64}$/u.test(document.sha256) ||
      document.sha256 !== validated.sha256 ||
      document.review_status !== "approved_public_civic_document" ||
      typeof document.source_publication_number !== "string" ||
      !document.source_publication_number ||
      typeof document.evidence_ref !== "string" ||
      !document.evidence_ref ||
      typeof document.reason !== "string" ||
      !document.reason
    ) {
      throw new Error(
        `Invalid reviewed Albo document at documents[${index}]: ${filePath}`,
      );
    }
    return {
      storage_path: validated.storagePath,
      sha256: validated.sha256,
      source_publication_number: document.source_publication_number,
      review_status: document.review_status,
      evidence_ref: document.evidence_ref,
      reason: document.reason,
    } as ReviewedDocumentServingEntry;
  });
  if (
    new Set(documents.map((entry) => entry.storage_path)).size !==
    documents.length
  ) {
    throw new Error(`Duplicate reviewed Albo document path: ${filePath}`);
  }

  return {
    schema_version: "albo-reviewed-document-serving.v1",
    reviewed_at: allowlist.reviewed_at as string,
    source: allowlist.source as string,
    source_url: allowlist.source_url as string,
    known_limits: allowlist.known_limits as string[],
    documents,
  };
}

export async function reviewedDocumentStoragePaths(
  outDir: string,
): Promise<Set<string>> {
  const allowlist = await readReviewedDocumentServingAllowlist(outDir);
  return new Set(
    allowlist?.documents.map((document) => document.storage_path) ?? [],
  );
}

function hasPdfSignature(bytes: Uint8Array): boolean {
  const prefix = new TextDecoder("latin1").decode(bytes.slice(0, 1024));
  return prefix.includes("%PDF-");
}

async function ensureDirectoryChainNoSymlinks(
  base: string,
  segments: string[],
): Promise<void> {
  await mkdir(base, { recursive: true });
  await assertDirectoryNoSymlink(base);
  let current = base;
  for (const segment of segments) {
    current = path.join(current, segment);
    try {
      await mkdir(current);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    }
    await assertDirectoryNoSymlink(current);
  }
}

async function assertExistingDirectoryChainNoSymlinks(
  base: string,
  segments: string[],
): Promise<void> {
  await assertDirectoryNoSymlink(base);
  let current = base;
  for (const segment of segments) {
    current = path.join(current, segment);
    await assertDirectoryNoSymlink(current);
  }
}

async function assertDirectoryNoSymlink(directory: string): Promise<void> {
  const entry = await lstat(directory);
  if (entry.isSymbolicLink() || !entry.isDirectory()) {
    throw new Error(
      `Unsafe symlink or non-directory in Albo archive path: ${directory}`,
    );
  }
}

async function rejectSymlinkOrNonFileLeaf(
  filePath: string,
  allowMissing: boolean,
): Promise<void> {
  try {
    const entry = await lstat(filePath);
    if (entry.isSymbolicLink() || !entry.isFile()) {
      throw new Error(
        `Unsafe symlink or non-file Albo archive leaf: ${filePath}`,
      );
    }
  } catch (error) {
    if (allowMissing && (error as NodeJS.ErrnoException).code === "ENOENT") {
      return;
    }
    throw error;
  }
}

async function assertRealPathContained(
  root: string,
  candidate: string,
): Promise<void> {
  const [resolvedRoot, resolvedCandidate] = await Promise.all([
    realpath(root),
    realpath(candidate),
  ]);
  const relative = path.relative(resolvedRoot, resolvedCandidate);
  if (
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new Error(`Archived PDF path escapes the archive root: ${candidate}`);
  }
}

function isIsoDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    Number.isFinite(Date.parse(value))
  );
}

function isOfficialHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" && url.hostname === "albo.tinnvision.cloud"
    );
  } catch {
    return false;
  }
}
