#!/usr/bin/env tsx
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  buildDelibereArchive,
  isDelibereArchive,
  isPublicLatest,
  type AlboDocumentsManifest,
  type DelibereArchive,
  type PublicLatest,
} from "./albo-tinnvision";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..");
const LATEST_PATH = "data/public/albo/latest.json";
const MANIFEST_PATH = path.join(
  REPO_ROOT,
  "data",
  "public",
  "albo",
  "documents-manifest.json",
);
const OUTPUT_PATH = path.join(
  REPO_ROOT,
  "data",
  "public",
  "albo",
  "delibere-archive.json",
);
const BASELINE_PATH = path.join(
  REPO_ROOT,
  "scripts",
  "fixtures",
  "delibere-archive-seed-baseline.json",
);
const MAX_GIT_OUTPUT = 64 * 1024 * 1024;

export type HistoricalSnapshot = {
  sha: string;
  latest: PublicLatest;
};

type SeedBaselineCounts = {
  total: number;
  giunta: number;
  consiglio: number;
};

type SeedBaseline = {
  counts: SeedBaselineCounts;
  items: Array<{
    id: string;
    deliberation_body: "giunta" | "consiglio";
  }>;
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
      return [{ sha, latest }];
    })
    .sort(
      (left, right) =>
        left.latest.retrieved_at.localeCompare(right.latest.retrieved_at) ||
        left.sha.localeCompare(right.sha),
    );
}

function publicLatestFingerprint(latest: PublicLatest): string {
  return createHash("sha256").update(JSON.stringify(latest)).digest("hex");
}

export function appendCurrentPublicLatest(
  snapshots: readonly HistoricalSnapshot[],
  current: PublicLatest,
): HistoricalSnapshot[] {
  const last = snapshots.at(-1);
  if (
    last &&
    publicLatestFingerprint(last.latest) === publicLatestFingerprint(current)
  ) {
    return [...snapshots];
  }
  return [...snapshots, { sha: "worktree", latest: current }];
}

async function currentPublicLatest(): Promise<PublicLatest> {
  const latestPath = path.join(REPO_ROOT, LATEST_PATH);
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(latestPath, "utf8")) as unknown;
  } catch (error) {
    throw new Error(
      `Lo snapshot public-safe corrente non e' leggibile: ${latestPath}.`,
      { cause: error },
    );
  }
  if (!isPublicLatest(parsed)) {
    throw new Error(
      `Lo snapshot public-safe corrente non rispetta lo schema atteso: ${latestPath}.`,
    );
  }
  return parsed;
}

function isShallowRepository(): boolean {
  return gitText(["rev-parse", "--is-shallow-repository"]).trim() === "true";
}

export function assertDelibereSeedHistoryAvailable(input: {
  has_bootstrap: boolean;
  shallow_repository: boolean;
}): void {
  if (!input.has_bootstrap && input.shallow_repository) {
    throw new Error(
      "Seed delibere interrotto: bootstrap assente e cronologia Git shallow. Eseguire il comando da un clone con fetch-depth: 0 oppure ripristinare l'archivio public-safe versionato.",
    );
  }
}

export function assertDelibereSeedSourceCoverage(
  observedIds: ReadonlySet<string>,
  baselineIds: readonly string[],
): void {
  const missing = baselineIds.filter((id) => !observedIds.has(id));
  if (missing.length > 0) {
    throw new Error(
      `Seed delibere incompleto: ${missing.length} record della baseline iniziale non sono presenti nella cronologia public-safe (${missing.slice(0, 5).join(", ")}).`,
    );
  }
}

async function seedBaseline(): Promise<SeedBaseline> {
  const parsed = JSON.parse(
    await readFile(BASELINE_PATH, "utf8"),
  ) as Partial<SeedBaseline>;
  const counts = parsed.counts;
  if (
    !counts ||
    typeof counts.total !== "number" ||
    typeof counts.giunta !== "number" ||
    typeof counts.consiglio !== "number" ||
    !Array.isArray(parsed.items) ||
    !parsed.items.every(
      (item) =>
        typeof item?.id === "string" &&
        (item.deliberation_body === "giunta" ||
          item.deliberation_body === "consiglio"),
    )
  ) {
    throw new Error(`Baseline seed delibere non valida: ${BASELINE_PATH}.`);
  }
  const items = parsed.items as SeedBaseline["items"];
  const ids = new Set(items.map((item) => item.id));
  const giunta = items.filter(
    (item) => item.deliberation_body === "giunta",
  ).length;
  const consiglio = items.filter(
    (item) => item.deliberation_body === "consiglio",
  ).length;
  if (
    ids.size !== items.length ||
    items.length !== counts.total ||
    giunta !== counts.giunta ||
    consiglio !== counts.consiglio
  ) {
    throw new Error(`Baseline seed delibere incoerente: ${BASELINE_PATH}.`);
  }
  return { counts: counts as SeedBaselineCounts, items };
}

async function currentDocumentsManifest(): Promise<AlboDocumentsManifest> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(MANIFEST_PATH, "utf8")) as unknown;
  } catch (error) {
    throw new Error(
      `Il manifest corrente dei documenti non e' leggibile: ${MANIFEST_PATH}.`,
      { cause: error },
    );
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !Array.isArray((parsed as { documents?: unknown }).documents)
  ) {
    throw new Error(
      `Il manifest corrente dei documenti non rispetta lo schema atteso: ${MANIFEST_PATH}.`,
    );
  }
  const manifest = parsed as AlboDocumentsManifest;
  for (const document of manifest.documents) {
    const storagePath = document.storage_path;
    if (
      !/^data\/public\/albo\/documents\/[0-9]{4}\/[a-f0-9]{64}\.pdf$/i.test(
        storagePath,
      )
    ) {
      throw new Error(
        `Percorso PDF non autorizzato nel manifest: ${storagePath}.`,
      );
    }
    const absolutePath = path.resolve(REPO_ROOT, storagePath);
    const bytes = await readFile(absolutePath);
    const digest = createHash("sha256").update(bytes).digest("hex");
    if (
      digest !== document.sha256.toLowerCase() ||
      bytes.byteLength !== document.size_bytes ||
      document.content_type.split(";", 1)[0]?.trim().toLowerCase() !==
        "application/pdf"
    ) {
      throw new Error(
        `Il PDF ${storagePath} non coincide con digest, dimensione o MIME autorizzati dal manifest corrente.`,
      );
    }
  }
  return manifest;
}

async function existingPublicArchive(): Promise<DelibereArchive | null> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(OUTPUT_PATH, "utf8")) as unknown;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw new Error(
      `L'archivio public-safe esistente non e' leggibile: ${OUTPUT_PATH}.`,
      { cause: error },
    );
  }
  if (!isDelibereArchive(parsed)) {
    throw new Error(
      `L'archivio public-safe esistente non rispetta lo schema atteso: ${OUTPUT_PATH}.`,
    );
  }
  return parsed;
}

async function main(): Promise<void> {
  // Il bootstrap cumulativo e' esso stesso un output public-safe versionato.
  // Viene sempre riproiettato dalla policy corrente prima della riscrittura.
  let archive = await existingPublicArchive();
  const hadBootstrap = archive !== null;
  const baseline = await seedBaseline();
  assertDelibereSeedHistoryAvailable({
    has_bootstrap: hadBootstrap,
    shallow_repository: isShallowRepository(),
  });
  const snapshots = appendCurrentPublicLatest(
    historicalSnapshots(),
    await currentPublicLatest(),
  );
  const documentsManifest = await currentDocumentsManifest();
  const observedIds = new Set(archive?.items.map((item) => item.id) ?? []);

  for (const snapshot of snapshots) {
    for (const record of [
      ...snapshot.latest.items,
      ...snapshot.latest.excluded,
    ]) {
      observedIds.add(record.id);
    }
    // Ogni snapshot storico viene nuovamente proiettato dalla policy corrente.
    // I PDF sono autorizzati esclusivamente dal manifest corrente, non da
    // manifest storici che potrebbero essere stati successivamente revocati.
    archive = buildDelibereArchive(archive, snapshot.latest, documentsManifest);
  }

  if (!archive) {
    throw new Error(
      `Nessuno snapshot public-safe trovato nella cronologia di ${LATEST_PATH}.`,
    );
  }
  assertDelibereSeedSourceCoverage(
    observedIds,
    baseline.items.map((item) => item.id),
  );

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(archive, null, 2)}\n`, "utf8");
  const archivedDocuments = archive.counts.archived_documents;
  console.log(
    `Archivio delibere generato: ${archive.counts.total} atti (${archive.counts.giunta} Giunta, ${archive.counts.consiglio} Consiglio), ${archivedDocuments} PDF ${archivedDocuments === 1 ? "autorizzato" : "autorizzati"} dal manifest corrente.`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  await main();
}
