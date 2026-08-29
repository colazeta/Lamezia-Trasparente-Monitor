#!/usr/bin/env tsx
import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildDelibereArchive,
  type AlboDocumentsManifest,
  type DelibereArchive,
  type PublicLatest,
  type VerificationStatus,
} from "./albo-tinnvision";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..");
const LATEST_PATH = "data/public/albo/latest.json";
const MANIFEST_PATH = "data/public/albo/documents-manifest.json";
const OUTPUT_PATH = path.join(
  REPO_ROOT,
  "data",
  "public",
  "albo",
  "delibere-archive.json",
);
const MAX_GIT_OUTPUT = 64 * 1024 * 1024;

type HistoricalSnapshot = {
  sha: string;
  latest: PublicLatest;
  documentsManifest: AlboDocumentsManifest;
};

function gitText(args: string[]): string {
  return execFileSync("git", args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: MAX_GIT_OUTPUT,
  });
}

function gitJson<T>(sha: string, filePath: string): T | null {
  try {
    return JSON.parse(gitText(["show", `${sha}:${filePath}`])) as T;
  } catch {
    return null;
  }
}

function verificationStatus(value: unknown): VerificationStatus {
  return value === "official_source_acquired" ||
    value === "normalised_automatically" ||
    value === "verification_required"
    ? value
    : "verification_required";
}

function emptyDocumentsManifest(latest: PublicLatest): AlboDocumentsManifest {
  const source =
    typeof latest.source === "string"
      ? latest.source
      : "Albo Pretorio Comune di Lamezia Terme";
  const sourceUrl =
    typeof latest.source_url === "string"
      ? latest.source_url
      : "https://albo.tinnvision.cloud/?ente=00301390795";
  const status = verificationStatus(latest.verification_status);
  return {
    generated_at: latest.retrieved_at,
    source,
    source_url: sourceUrl,
    retrieved_at: latest.retrieved_at,
    verification_status: status,
    policy: {
      eligibility:
        "Seed storico limitato ai manifest public-safe gia' versionati.",
      official_url_host: "albo.tinnvision.cloud",
      requires_https: true,
      content_type: "application/pdf",
      max_size_bytes: 10 * 1024 * 1024,
      storage_path_template: "data/public/albo/documents/<year>/<sha>.pdf",
      sha256_deduplication: true,
      no_ocr: true,
      no_pdf_parsing: true,
      no_summaries: true,
      no_rankings: true,
      paid_storage: false,
    },
    counts: {
      considered: 0,
      eligible: 0,
      archived: 0,
      skipped: 0,
      excluded: 0,
      human_review_required: 0,
    },
    warnings: [],
    documents: [],
    decisions: [],
  };
}

function historicalSnapshots(): HistoricalSnapshot[] {
  const shas = gitText(["log", "--format=%H", "--", LATEST_PATH])
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return shas
    .flatMap((sha) => {
      const latest = gitJson<PublicLatest>(sha, LATEST_PATH);
      if (
        !latest ||
        !Array.isArray(latest.items) ||
        !Array.isArray(latest.excluded)
      ) {
        return [];
      }
      const manifest =
        gitJson<AlboDocumentsManifest>(sha, MANIFEST_PATH) ??
        emptyDocumentsManifest(latest);
      return [{ sha, latest, documentsManifest: manifest }];
    })
    .sort(
      (left, right) =>
        left.latest.retrieved_at.localeCompare(right.latest.retrieved_at) ||
        left.sha.localeCompare(right.sha),
    );
}

async function main(): Promise<void> {
  let archive: DelibereArchive | null = null;
  const snapshots = historicalSnapshots();

  for (const snapshot of snapshots) {
    archive = buildDelibereArchive(
      archive,
      snapshot.latest,
      snapshot.documentsManifest,
    );
  }

  if (!archive) {
    throw new Error(
      `Nessuno snapshot public-safe trovato nella cronologia di ${LATEST_PATH}.`,
    );
  }

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(archive, null, 2)}\n`, "utf8");
  console.log(
    `Archivio delibere generato: ${archive.counts.total} atti (${archive.counts.giunta} Giunta, ${archive.counts.consiglio} Consiglio), ${archive.counts.archived_documents} PDF archiviati.`,
  );
}

await main();
