#!/usr/bin/env tsx
import { readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  reapplyAlboPublicSafety,
  type PublicRecord,
  type PublicVisibility,
} from "./albo-tinnvision";
import {
  ALBO_PUBLICATION_STANDARDISATION,
  ALBO_PUBLICATION_STANDARDISATION_KNOWN_LIMIT,
} from "./albo-publication-standardisation";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_OUT_DIR = path.resolve(SCRIPT_DIR, "..", "data");

interface SanitiseResult {
  records: number;
  revoked_documents: string[];
}

export async function sanitiseAlboPublicArtifacts(
  outDir = DEFAULT_OUT_DIR,
): Promise<SanitiseResult> {
  const publicDir = path.join(outDir, "public", "albo");
  const paths = {
    latest: path.join(publicDir, "latest.json"),
    diff: path.join(publicDir, "diff-latest.json"),
    manifest: path.join(publicDir, "documents-manifest.json"),
    status: path.join(publicDir, "status.json"),
    runLog: path.join(publicDir, "run-latest.md"),
  };
  const [latest, diff, manifest, status, runLog] = await Promise.all([
    readJsonObject(paths.latest),
    readJsonObject(paths.diff),
    readJsonObject(paths.manifest),
    readJsonObject(paths.status),
    readFile(paths.runLog, "utf8"),
  ]);

  const records = [
    ...publicRecordArray(latest.items, "latest.items"),
    ...publicRecordArray(latest.excluded, "latest.excluded"),
  ].map(reapplyAlboPublicSafety);
  const items = records.filter(
    (record) => record.public_visibility !== "do_not_publish",
  );
  const excluded = records.filter(
    (record) => record.public_visibility === "do_not_publish",
  );
  const counts = updateRunCounts(latest.counts, records);

  latest.items = items;
  latest.excluded = excluded;
  latest.counts = counts;
  latest.standardisation = ALBO_PUBLICATION_STANDARDISATION;
  latest.known_limits = withStandardisationLimit(latest.known_limits);

  const diffValue = objectValue(diff.diff, "diff.diff");
  diffValue.new = sanitiseRecordArray(diffValue.new, "diff.new");
  diffValue.removed = sanitiseRecordArray(diffValue.removed, "diff.removed");
  diffValue.unchanged = sanitiseRecordArray(
    diffValue.unchanged,
    "diff.unchanged",
  );
  diffValue.changed = arrayValue(diffValue.changed, "diff.changed").map(
    (entry, index) => {
      const value = objectValue(entry, `diff.changed[${index}]`);
      return {
        before: reapplyAlboPublicSafety(
          publicRecord(value.before, `diff.changed[${index}].before`),
        ),
        after: reapplyAlboPublicSafety(
          publicRecord(value.after, `diff.changed[${index}].after`),
        ),
      };
    },
  );
  diff.diff = diffValue;
  diff.counts = counts;
  diff.standardisation = ALBO_PUBLICATION_STANDARDISATION;
  diff.known_limits = withStandardisationLimit(diff.known_limits);

  const recordById = new Map(records.map((record) => [record.id, record]));
  const documents = objectArray(manifest.documents, "manifest.documents");
  const revokedDocuments = documents.filter((document) => {
    const record = recordById.get(stringValue(document.id));
    return !record || !isPdfEligible(record);
  });
  const revokedPaths = [
    ...new Set(
      revokedDocuments.map((document) =>
        validatedStoragePath(document.storage_path),
      ),
    ),
  ];

  for (const storagePath of revokedPaths) {
    const absolutePath = path.join(
      outDir,
      ...storagePath.replace(/^data\//, "").split("/"),
    );
    try {
      await unlink(absolutePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }

  const retainedDocuments = documents.filter(
    (document) => !revokedDocuments.includes(document),
  );
  const decisions = objectArray(manifest.decisions, "manifest.decisions")
    .filter((decision) => recordById.has(stringValue(decision.id)))
    .map((decision) => {
      const record = recordById.get(stringValue(decision.id));
      return record && !isPdfEligible(record)
        ? privacySafeDecision(decision, record)
        : decision;
    });
  const previousManifestCounts = optionalObject(manifest.counts);
  manifest.policy = {
    ...optionalObject(manifest.policy),
    privacy_revocation_cleanup: true,
  };
  manifest.documents = retainedDocuments;
  manifest.decisions = decisions;
  manifest.counts = {
    considered: decisions.length,
    eligible: decisions.filter(
      (decision) => decision.reason === "eligible_low_risk_publishable_pdf",
    ).length,
    archived: retainedDocuments.length,
    skipped: decisions.filter(
      (decision) => decision.preservation_status === "skipped",
    ).length,
    excluded: decisions.filter(
      (decision) => decision.preservation_status === "excluded",
    ).length,
    human_review_required: decisions.filter(
      (decision) => decision.preservation_status === "human_review_required",
    ).length,
    revoked: numberValue(previousManifestCounts.revoked) + revokedPaths.length,
  };

  status.counts = counts;
  status.standardisation = ALBO_PUBLICATION_STANDARDISATION;
  status.known_limits = withStandardisationLimit(status.known_limits);

  await Promise.all([
    writeJsonAtomic(paths.latest, latest),
    writeJsonAtomic(paths.diff, diff),
    writeJsonAtomic(paths.manifest, manifest),
    writeJsonAtomic(paths.status, status),
    writeTextAtomic(paths.runLog, updateRunLog(runLog, counts)),
  ]);

  return { records: records.length, revoked_documents: revokedPaths };
}

function sanitiseRecordArray(value: unknown, label: string): PublicRecord[] {
  return publicRecordArray(value, label).map(reapplyAlboPublicSafety);
}

function publicRecordArray(value: unknown, label: string): PublicRecord[] {
  return arrayValue(value, label).map((entry, index) =>
    publicRecord(entry, `${label}[${index}]`),
  );
}

function publicRecord(value: unknown, label: string): PublicRecord {
  const record = objectValue(value, label);
  if (
    typeof record.id !== "string" ||
    typeof record.source !== "string" ||
    typeof record.retrieved_at !== "string" ||
    typeof record.verification_status !== "string" ||
    !Array.isArray(record.known_limits)
  ) {
    throw new Error(`Invalid public Albo record at ${label}`);
  }
  return record as PublicRecord;
}

function objectArray(value: unknown, label: string): Record<string, unknown>[] {
  return arrayValue(value, label).map((entry, index) =>
    objectValue(entry, `${label}[${index}]`),
  );
}

function arrayValue(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`Expected array at ${label}`);
  return value;
}

function objectValue(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Expected object at ${label}`);
  }
  return value as Record<string, unknown>;
}

function optionalObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function updateRunCounts(
  current: unknown,
  records: PublicRecord[],
): Record<string, number> {
  const existing = optionalObject(current);
  const count = (visibility: PublicVisibility) =>
    records.filter((record) => record.public_visibility === visibility).length;
  return {
    acquired: numberValue(existing.acquired) || records.length,
    new: numberValue(existing.new),
    changed: numberValue(existing.changed),
    removed: numberValue(existing.removed),
    unchanged: numberValue(existing.unchanged),
    publishable: count("publishable"),
    minimised: count("publishable_with_minimisation"),
    metadata_only: count("metadata_only"),
    excluded: count("do_not_publish"),
  };
}

function isPdfEligible(record: PublicRecord): boolean {
  return (
    record.public_visibility === "publishable" && record.privacy_risk === "low"
  );
}

function privacySafeDecision(
  decision: Record<string, unknown>,
  record: PublicRecord,
): Record<string, unknown> {
  const humanReview =
    record.public_visibility === "publishable_with_minimisation" ||
    record.privacy_risk === "medium";
  return {
    id: record.id,
    publication_number:
      stringValue(record.publication_number) ||
      stringValue(decision.publication_number),
    source: record.source,
    source_url:
      stringValue(record.source_url) || stringValue(decision.source_url),
    retrieved_at: record.retrieved_at,
    public_visibility: record.public_visibility,
    privacy_risk: record.privacy_risk,
    verification_status: record.verification_status,
    preservation_status: humanReview ? "human_review_required" : "excluded",
    reason: humanReview ? "human_review_required" : "privacy_excluded",
  };
}

function validatedStoragePath(value: unknown): string {
  if (
    typeof value !== "string" ||
    !/^data\/public\/albo\/documents\/[0-9]{4}\/[a-f0-9]{64}\.pdf$/iu.test(
      value,
    )
  ) {
    throw new Error(
      `Unsafe archived PDF path for privacy revocation: ${String(value)}`,
    );
  }
  return value;
}

function withStandardisationLimit(value: unknown): string[] {
  const existing = Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
  return [
    ...new Set([...existing, ALBO_PUBLICATION_STANDARDISATION_KNOWN_LIMIT]),
  ];
}

function updateRunLog(runLog: string, counts: Record<string, number>): string {
  const replacements: Array<[string, number]> = [
    ["Atti acquisiti", counts.acquired ?? 0],
    ["Nuovi atti", counts.new ?? 0],
    ["Modificati", counts.changed ?? 0],
    ["Rimossi/non piu' presenti", counts.removed ?? 0],
    ["Invariati", counts.unchanged ?? 0],
    ["Pubblicabili", counts.publishable ?? 0],
    ["Minimizzati", counts.minimised ?? 0],
    ["Solo metadato", counts.metadata_only ?? 0],
    ["Esclusi dal public layer", counts.excluded ?? 0],
  ];
  return replacements.reduce(
    (current, [label, value]) =>
      current.replace(
        new RegExp(`^${escapeRegExp(label)}:.*$`, "mu"),
        `${label}: ${value}`,
      ),
    runLog,
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

async function readJsonObject(
  filePath: string,
): Promise<Record<string, unknown>> {
  return objectValue(JSON.parse(await readFile(filePath, "utf8")), filePath);
}

async function writeJsonAtomic(
  filePath: string,
  value: unknown,
): Promise<void> {
  await writeTextAtomic(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeTextAtomic(filePath: string, value: string): Promise<void> {
  const temporaryPath = `${filePath}.tmp-${process.pid}`;
  await writeFile(temporaryPath, value, "utf8");
  await rename(temporaryPath, filePath);
}

function parseOutDir(argv: string[]): string {
  if (!argv.length) return DEFAULT_OUT_DIR;
  if (argv.length === 2 && argv[0] === "--out-dir" && argv[1]) {
    return path.resolve(argv[1]);
  }
  throw new Error("Usage: sanitise-albo-public-artifacts [--out-dir data]");
}

async function main(): Promise<void> {
  const result = await sanitiseAlboPublicArtifacts(
    parseOutDir(process.argv.slice(2)),
  );
  console.log(`Sanitised public Albo records: ${result.records}`);
  console.log(`Revoked public PDFs: ${result.revoked_documents.length}`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
