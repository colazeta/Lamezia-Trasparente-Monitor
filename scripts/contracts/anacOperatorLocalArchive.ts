import { execFile, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import {
  buildAnacOperatorsSnapshot,
  datasetConfig,
  type AnacOperatorDataset,
  type AnacOperatorsSnapshot,
} from "./anacOperators";
import { isOfficialAnacHttpsUrl } from "./anacOperatorSource";
import { AnacOperatorsCsvMatcher } from "./anacOperatorsStreaming";

const execFileAsync = promisify(execFile);
export const VERIFIED_LOCAL_ANAC_METADATA_SCHEMA =
  "anac-operator-local-archive.v1";
export const MAX_ANAC_OPERATOR_ARCHIVE_BYTES = 1_500_000_000;

export interface VerifiedLocalAnacArchiveMetadata {
  schema_version: typeof VERIFIED_LOCAL_ANAC_METADATA_SCHEMA;
  dataset: AnacOperatorDataset;
  official_archive_url: string;
  acquired_at: string;
  catalog_resource_id?: string;
  catalog_metadata_url?: string;
}

export interface VerifiedLocalAnacArchiveInspection {
  bytes: number;
  sha256: string;
}

export async function ingestVerifiedLocalAnacOperatorArchive(input: {
  dataset: AnacOperatorDataset;
  archivePath: string;
  metadataPath: string;
  trackedCigs: string[];
  outputPath: string;
  generatedAt?: string;
}): Promise<AnacOperatorsSnapshot> {
  const metadata = await readVerifiedLocalAnacArchiveMetadata(
    input.metadataPath,
    input.dataset,
  );
  const archive = await inspectVerifiedLocalAnacArchive(input.archivePath);
  const parsed = await parseVerifiedLocalAnacArchive(
    input.archivePath,
    input.dataset,
    new Set(input.trackedCigs.map((value) => value.trim().toUpperCase())),
    metadata.official_archive_url,
    metadata.acquired_at,
  );
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  if (!isIsoDate(generatedAt)) {
    throw new Error(`Invalid ANAC local ingestion generatedAt: ${generatedAt}`);
  }
  const snapshot = buildAnacOperatorsSnapshot({
    dataset: input.dataset,
    generatedAt,
    trackedCigs: input.trackedCigs,
    parsed: parsed.parsed,
    source: {
      archiveUrl: metadata.official_archive_url,
      archiveSha256: archive.sha256,
      archiveBytes: archive.bytes,
      csvEntry: parsed.csvEntry,
      acquiredAt: metadata.acquired_at,
      selection: "verified-local-archive",
    },
  });
  await writeJsonAtomically(input.outputPath, snapshot);
  return snapshot;
}

export async function readVerifiedLocalAnacArchiveMetadata(
  metadataPath: string,
  expectedDataset: AnacOperatorDataset,
): Promise<VerifiedLocalAnacArchiveMetadata> {
  let raw: string;
  try {
    raw = await readFile(metadataPath, "utf8");
  } catch (error) {
    throw new Error(`Cannot read verified local ANAC metadata: ${metadataPath}`, {
      cause: error,
    });
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch (error) {
    throw new Error(`Invalid JSON in verified local ANAC metadata: ${metadataPath}`, {
      cause: error,
    });
  }
  return validateVerifiedLocalAnacArchiveMetadata(parsed, expectedDataset);
}

export function validateVerifiedLocalAnacArchiveMetadata(
  value: unknown,
  expectedDataset: AnacOperatorDataset,
): VerifiedLocalAnacArchiveMetadata {
  if (!isRecord(value)) {
    throw new Error("Invalid verified local ANAC metadata: top-level object required");
  }
  if (value.schema_version !== VERIFIED_LOCAL_ANAC_METADATA_SCHEMA) {
    throw new Error("Invalid verified local ANAC metadata: schema_version");
  }
  if (value.dataset !== "participants" && value.dataset !== "awardees") {
    throw new Error("Invalid verified local ANAC metadata: dataset");
  }
  if (value.dataset !== expectedDataset) {
    throw new Error(
      `Verified local ANAC metadata dataset mismatch: expected ${expectedDataset}, got ${value.dataset}`,
    );
  }
  if (
    typeof value.official_archive_url !== "string" ||
    !isOfficialArchiveZipUrl(value.official_archive_url)
  ) {
    throw new Error(
      "Invalid verified local ANAC metadata: official_archive_url must be an official ANAC HTTPS ZIP",
    );
  }
  if (typeof value.acquired_at !== "string" || !isIsoDate(value.acquired_at)) {
    throw new Error("Invalid verified local ANAC metadata: acquired_at");
  }
  if (
    value.catalog_resource_id !== undefined &&
    (typeof value.catalog_resource_id !== "string" ||
      !value.catalog_resource_id.trim())
  ) {
    throw new Error("Invalid verified local ANAC metadata: catalog_resource_id");
  }
  if (
    value.catalog_metadata_url !== undefined &&
    (typeof value.catalog_metadata_url !== "string" ||
      !isAllowedCatalogMetadataUrl(value.catalog_metadata_url))
  ) {
    throw new Error("Invalid verified local ANAC metadata: catalog_metadata_url");
  }

  return {
    schema_version: VERIFIED_LOCAL_ANAC_METADATA_SCHEMA,
    dataset: value.dataset,
    official_archive_url: value.official_archive_url,
    acquired_at: value.acquired_at,
    ...(typeof value.catalog_resource_id === "string"
      ? { catalog_resource_id: value.catalog_resource_id.trim() }
      : {}),
    ...(typeof value.catalog_metadata_url === "string"
      ? { catalog_metadata_url: value.catalog_metadata_url }
      : {}),
  };
}

export async function inspectVerifiedLocalAnacArchive(
  archivePath: string,
): Promise<VerifiedLocalAnacArchiveInspection> {
  const before = await stat(archivePath);
  if (!before.isFile() || before.size <= 0) {
    throw new Error(`Verified local ANAC archive is not a non-empty file: ${archivePath}`);
  }
  if (before.size > MAX_ANAC_OPERATOR_ARCHIVE_BYTES) {
    throw new Error("Verified local ANAC archive exceeds size cap");
  }

  const hash = createHash("sha256");
  let bytes = 0;
  let signature = Buffer.alloc(0);
  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(archivePath);
    stream.on("data", (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > MAX_ANAC_OPERATOR_ARCHIVE_BYTES) {
        stream.destroy(new Error("Verified local ANAC archive exceeds size cap"));
        return;
      }
      hash.update(chunk);
      if (signature.length < 4) {
        signature = Buffer.concat([signature, chunk]).subarray(0, 4);
      }
    });
    stream.once("error", reject);
    stream.once("end", resolve);
  });
  const after = await stat(archivePath);
  if (bytes !== before.size || after.size !== before.size) {
    throw new Error("Verified local ANAC archive changed while being inspected");
  }
  if (signature.length < 2 || signature[0] !== 0x50 || signature[1] !== 0x4b) {
    throw new Error("Verified local ANAC archive is not a ZIP archive");
  }
  return { bytes, sha256: hash.digest("hex") };
}

async function parseVerifiedLocalAnacArchive(
  archivePath: string,
  dataset: AnacOperatorDataset,
  trackedCigs: ReadonlySet<string>,
  officialArchiveUrl: string,
  acquiredAt: string,
) {
  const id = datasetConfig(dataset).id;
  const { stdout } = await execFileAsync("unzip", ["-Z1", archivePath], {
    maxBuffer: 2 * 1024 * 1024,
    encoding: "utf8",
  });
  const csvEntry = stdout
    .split(/\r?\n/u)
    .map((entry) => entry.trim())
    .filter(
      (entry) =>
        entry && !entry.startsWith("__MACOSX/") && /\.csv$/iu.test(entry),
    )
    .sort(
      (left, right) =>
        Number(right.toLowerCase().includes(id)) -
          Number(left.toLowerCase().includes(id)) ||
        left.localeCompare(right),
    )[0];
  if (!csvEntry) {
    throw new Error(`ANAC ${id} ZIP contains no CSV entry`);
  }

  const matcher = new AnacOperatorsCsvMatcher(dataset, trackedCigs, {
    url: officialArchiveUrl,
    acquiredAt,
  });
  const decoder = new TextDecoder("utf-8");
  await new Promise<void>((resolve, reject) => {
    const child = spawn("unzip", ["-p", archivePath, csvEntry], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    let settled = false;
    const fail = (error: unknown) => {
      if (settled) return;
      settled = true;
      child.kill("SIGKILL");
      reject(error);
    };
    child.stdout.on("data", (chunk: Buffer) => {
      try {
        matcher.push(decoder.decode(chunk, { stream: true }));
      } catch (error) {
        fail(error);
      }
    });
    child.stderr.on("data", (chunk: Buffer) => {
      if (stderr.length < 4096) stderr += chunk.toString("utf8");
    });
    child.on("error", fail);
    child.on("close", (code) => {
      if (settled) return;
      if (code !== 0) {
        fail(new Error(`unzip exited with ${code}: ${stderr.slice(0, 200)}`));
        return;
      }
      try {
        matcher.push(decoder.decode());
        settled = true;
        resolve();
      } catch (error) {
        fail(error);
      }
    });
  });
  return { csvEntry, parsed: matcher.finish() };
}

async function writeJsonAtomically(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  try {
    await writeFile(
      temporaryPath,
      `${JSON.stringify(value, null, 2)}\n`,
      "utf8",
    );
    await rename(temporaryPath, filePath);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

function isOfficialArchiveZipUrl(value: string): boolean {
  if (!isOfficialAnacHttpsUrl(value)) return false;
  try {
    return /\.zip$/iu.test(new URL(value).pathname);
  } catch {
    return false;
  }
}

function isAllowedCatalogMetadataUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "data.europa.eu" || isOfficialAnacHttpsUrl(value))
    );
  } catch {
    return false;
  }
}

function isIsoDate(value: string): boolean {
  return value.length > 0 && Number.isFinite(Date.parse(value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
