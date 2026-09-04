import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { validateAnacBdncpSyncSnapshot } from "../../artifacts/lamezia-trasparente/src/lib/anacBdncpSync";
import type { AnacOperatorDataset } from "./anacOperators";
import { ingestVerifiedLocalAnacOperatorArchive } from "./anacOperatorLocalArchive";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const procurementPath = path.join(
  repoRoot,
  "data/public/contracts/anac-bdncp/latest.json",
);

interface CliOptions {
  dataset: AnacOperatorDataset;
  archivePath: string;
  metadataPath: string;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const procurement = validateAnacBdncpSyncSnapshot(
    JSON.parse(await readFile(procurementPath, "utf8")) as unknown,
  );
  const outputPath = path.join(
    repoRoot,
    `data/public/contracts/${
      options.dataset === "participants"
        ? "anac-participants"
        : "anac-awardees"
    }/latest.json`,
  );
  const snapshot = await ingestVerifiedLocalAnacOperatorArchive({
    dataset: options.dataset,
    archivePath: options.archivePath,
    metadataPath: options.metadataPath,
    trackedCigs: procurement.trackedCigs,
    outputPath,
  });
  console.log(
    `ANAC ${options.dataset} local archive: ${snapshot.coverage.cigsWithRecords}/${snapshot.coverage.trackedCigs} CIG collegati; ${snapshot.records.length} record normalizzati; SHA-256 ${snapshot.source.archiveSha256}.`,
  );
}

function parseArgs(argv: string[]): CliOptions {
  let dataset: AnacOperatorDataset | null = null;
  let archivePath: string | null = null;
  let metadataPath: string | null = null;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dataset") {
      dataset = parseDataset(valueAfter(argv, ++index, arg));
    } else if (arg === "--archive") {
      archivePath = path.resolve(valueAfter(argv, ++index, arg));
    } else if (arg === "--metadata") {
      metadataPath = path.resolve(valueAfter(argv, ++index, arg));
    } else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!dataset || !archivePath || !metadataPath) {
    throw new Error(`Missing required arguments.\n${usage()}`);
  }
  return { dataset, archivePath, metadataPath };
}

function parseDataset(value: string): AnacOperatorDataset {
  if (value === "participants" || value === "awardees") return value;
  throw new Error(`Invalid --dataset: ${value}`);
}

function valueAfter(argv: string[], index: number, flag: string): string {
  const value = argv[index];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${flag}`);
  }
  return value;
}

function usage(): string {
  return [
    "Usage:",
    "  pnpm run contracts:anac-operators-ingest-local -- --dataset participants --archive /path/partecipanti_csv.zip --metadata /path/partecipanti.metadata.json",
    "  pnpm run contracts:anac-operators-ingest-local -- --dataset awardees --archive /path/aggiudicatari_csv.zip --metadata /path/aggiudicatari.metadata.json",
  ].join("\n");
}

await main();
