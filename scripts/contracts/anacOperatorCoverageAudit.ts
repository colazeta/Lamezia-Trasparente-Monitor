import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { validateAnacBdncpSyncSnapshot } from "../../artifacts/lamezia-trasparente/src/lib/anacBdncpSync";
import type { AnacOperatorsSnapshot } from "./anacOperators";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const procurementPath = path.join(repoRoot, "data/public/contracts/anac-bdncp/latest.json");
const participantPath = path.join(repoRoot, "data/public/contracts/anac-participants/latest.json");
const awardeePath = path.join(repoRoot, "data/public/contracts/anac-awardees/latest.json");
const outputPath = process.argv[2]
  ? path.resolve(repoRoot, process.argv[2])
  : path.join(repoRoot, ".artifacts/anac-operator-audit/coverage.json");

async function readOptionalSnapshot(filePath: string): Promise<AnacOperatorsSnapshot | null> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as AnacOperatorsSnapshot;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function assertSnapshot(snapshot: AnacOperatorsSnapshot, dataset: "participants" | "awardees") {
  if (snapshot.schemaVersion !== "anac-operators.v1" || snapshot.dataset !== dataset) {
    throw new Error(`Unexpected ANAC ${dataset} snapshot schema`);
  }
  if (!/^https:\/\/[^/]*anticorruzione\.it\//u.test(snapshot.source.archiveUrl)) {
    throw new Error(`ANAC ${dataset} archive URL is not an official HTTPS source`);
  }
  if (!/^[0-9a-f]{64}$/u.test(snapshot.source.archiveSha256) || snapshot.source.archiveBytes <= 0) {
    throw new Error(`ANAC ${dataset} archive provenance is incomplete`);
  }
  if (!snapshot.source.csvEntry.toLowerCase().endsWith(".csv")) {
    throw new Error(`ANAC ${dataset} CSV member is missing`);
  }
}

function summarise(snapshot: AnacOperatorsSnapshot | null, dataset: "participants" | "awardees") {
  if (!snapshot) return { dataset, status: "not-materialized" as const };
  assertSnapshot(snapshot, dataset);
  return {
    dataset,
    status: "materialized" as const,
    generatedAt: snapshot.generatedAt,
    source: snapshot.source,
    coverage: snapshot.coverage,
    recordsScanned: snapshot.recordsScanned,
    matchedSourceRecords: snapshot.matchedSourceRecords,
  };
}

function sample(snapshot: AnacOperatorsSnapshot | null, limit = 5) {
  if (!snapshot) return [];
  return [...snapshot.records]
    .sort((a, b) =>
      a.cig.localeCompare(b.cig) ||
      (a.operatorKey ?? "").localeCompare(b.operatorKey ?? "") ||
      (a.role ?? "").localeCompare(b.role ?? ""),
    )
    .slice(0, limit)
    .map((record) => ({
      cig: record.cig,
      relation: record.relation,
      operatorKey: record.operatorKey,
      name: record.name,
      role: record.role,
      groupId: record.groupId,
      sourceRecordNumbers: record.sourceRecordNumbers,
      sourceArchiveUrl: record.sourceArchiveUrl,
    }));
}

const procurement = validateAnacBdncpSyncSnapshot(
  JSON.parse(await readFile(procurementPath, "utf8")) as unknown,
);
const participants = await readOptionalSnapshot(participantPath);
const awardees = await readOptionalSnapshot(awardeePath);

const report = {
  schemaVersion: "anac-operator-coverage-audit.v1",
  generatedAt: new Date().toISOString(),
  procurementBaseline: {
    status: procurement.status,
    trackedCigs: procurement.trackedCigs.length,
    structuredCigs: procurement.records.length,
    lastSuccessAt: procurement.lastSuccessAt,
    failureCategory: procurement.failureCategory,
  },
  datasets: [summarise(participants, "participants"), summarise(awardees, "awardees")],
  provenanceSample: {
    participants: sample(participants),
    awardees: sample(awardees),
  },
  safeguards: [
    "Missing snapshots are reported as not-materialized, never as zero coverage.",
    "Operator names alone are not treated as canonical identity.",
    "Participation, award and recurrence are descriptive facts, not evidence of irregularity.",
  ],
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
