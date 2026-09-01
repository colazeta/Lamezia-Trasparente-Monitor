#!/usr/bin/env tsx
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  aggregateHouseholdComposition,
  assertPublishableHouseholdComposition,
  HOUSEHOLD_COMPONENT_FIELDS,
  LAMEZIA_ISTAT_CODE,
  type HouseholdCensusRow,
  type HouseholdCompositionProfile,
} from "./istat-household-composition-core";
import {
  classifyFictitiousSection,
  normalizeHeader,
  normalizeMunicipalityCode,
  normalizeSectionSuffix,
  readXlsxRows,
} from "./istat-sezioni-censimento-lamezia-materialize";

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), "..", "..");
const DEFAULT_XLSX = path.join(
  repoRoot,
  "data/raw/territorio/istat/censimento_2023_sezioni_calabria/R18_Calabria_2023_sezioni.xlsx",
);
const DEFAULT_ARCHIVE = path.join(
  repoRoot,
  "data/raw/territorio/istat/censimento_2023_sezioni_calabria/Dati_regionali_2023.zip",
);
const DEFAULT_OUTPUT = path.join(
  repoRoot,
  "artifacts/api-server/src/data/lameziaHouseholdComposition2023.json",
);
const ARCHIVE_WORKBOOK_MEMBER =
  "Dati_regionali_2023/R18_Calabria_2023_sezioni.xlsx";

const REQUIRED_FIELDS = [
  "PROCOM",
  "SEZ21_ID",
  "PF1",
  ...HOUSEHOLD_COMPONENT_FIELDS,
] as const;

type RequiredField = (typeof REQUIRED_FIELDS)[number];

export type HouseholdCompositionArtifact = HouseholdCompositionProfile & {
  schemaVersion: 1;
  verification: {
    verifiedAt: string;
    method: "sha256-and-exact-reconciliation";
  };
  source: {
    institution: "ISTAT";
    dataset: string;
    territorialLevel: "sezione di censimento";
    referenceDate: "2023-12-31";
    sourceUpdateDate: "2026-06-09";
    pageUrl: string;
    downloadUrl: string;
    archiveFile: "Dati_regionali_2023.zip";
    archiveMember: typeof ARCHIVE_WORKBOOK_MEMBER;
    workbookFile: "R18_Calabria_2023_sezioni.xlsx";
    archiveSha256: string;
    workbookSha256: string;
    licence: string;
  };
};

function findHeaderRow(rows: string[][]): {
  index: number;
  columns: Record<RequiredField, number>;
} {
  for (let rowIndex = 0; rowIndex < Math.min(rows.length, 20); rowIndex += 1) {
    const normalized = rows[rowIndex].map(normalizeHeader);
    const entries = REQUIRED_FIELDS.map(
      (field) => [field, normalized.indexOf(normalizeHeader(field))] as const,
    );
    if (entries.every(([, columnIndex]) => columnIndex >= 0)) {
      return {
        index: rowIndex,
        columns: Object.fromEntries(entries) as Record<RequiredField, number>,
      };
    }
  }
  throw new Error(
    `ISTAT workbook is missing required headers: ${REQUIRED_FIELDS.join(", ")}`,
  );
}

function parseCount(value: string | undefined, label: string): number | null {
  const normalized = String(value ?? "").trim();
  if (!normalized) return null;
  const count = Number(normalized);
  if (!Number.isInteger(count) || count < 0) {
    throw new Error(
      `${label}: expected a non-negative integer or an empty cell`,
    );
  }
  return count;
}

function canonicalSectionId(
  rawSectionId: string | undefined,
  municipalityCode: string,
): string | null {
  const digits = String(rawSectionId ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const prefixWithoutLeadingZero = municipalityCode.replace(/^0+/, "");
  if (
    !digits.startsWith(municipalityCode) &&
    !digits.startsWith(prefixWithoutLeadingZero)
  ) {
    throw new Error(
      `ISTAT section ${digits} is inconsistent with municipality ${municipalityCode}`,
    );
  }
  const suffix = normalizeSectionSuffix(digits, municipalityCode);
  if (!suffix || suffix.length > 7) {
    throw new Error(
      `ISTAT section ${digits} has an invalid census-section suffix`,
    );
  }
  return `${municipalityCode}${suffix.padStart(7, "0")}`;
}

/**
 * Seleziona esclusivamente le righe di Lamezia e conserva i mancanti come null.
 * La verifica del prefisso avviene sul SEZ21_ID originale, prima di attribuire
 * al profilo l'etichetta comunale canonica.
 */
export function householdRowsFromWorkbook(
  workbookRows: string[][],
): HouseholdCensusRow[] {
  const header = findHeaderRow(workbookRows);
  const result: HouseholdCensusRow[] = [];
  const seenSections = new Set<string>();

  for (
    let rowIndex = header.index + 1;
    rowIndex < workbookRows.length;
    rowIndex += 1
  ) {
    const row = workbookRows[rowIndex];
    if (!row.some((cell) => String(cell ?? "").trim())) continue;
    const municipalityCode = normalizeMunicipalityCode(
      row[header.columns.PROCOM],
    );
    if (municipalityCode !== LAMEZIA_ISTAT_CODE) continue;

    const rawSectionId = row[header.columns.SEZ21_ID];
    const sectionId = canonicalSectionId(rawSectionId, municipalityCode);
    if (sectionId && seenSections.has(sectionId)) {
      throw new Error(`Duplicate ISTAT census section ${sectionId}`);
    }
    if (sectionId) seenSections.add(sectionId);

    result.push({
      sectionId,
      isFictitious:
        classifyFictitiousSection(rawSectionId, municipalityCode) !== undefined,
      PF1: parseCount(
        row[header.columns.PF1],
        `${sectionId ?? `row ${rowIndex + 1}`}.PF1`,
      ),
      PF3: parseCount(
        row[header.columns.PF3],
        `${sectionId ?? `row ${rowIndex + 1}`}.PF3`,
      ),
      PF4: parseCount(
        row[header.columns.PF4],
        `${sectionId ?? `row ${rowIndex + 1}`}.PF4`,
      ),
      PF5: parseCount(
        row[header.columns.PF5],
        `${sectionId ?? `row ${rowIndex + 1}`}.PF5`,
      ),
      PF6: parseCount(
        row[header.columns.PF6],
        `${sectionId ?? `row ${rowIndex + 1}`}.PF6`,
      ),
      PF7: parseCount(
        row[header.columns.PF7],
        `${sectionId ?? `row ${rowIndex + 1}`}.PF7`,
      ),
      PF8: parseCount(
        row[header.columns.PF8],
        `${sectionId ?? `row ${rowIndex + 1}`}.PF8`,
      ),
    });
  }

  if (!result.length) {
    throw new Error(`No rows found for municipality ${LAMEZIA_ISTAT_CODE}`);
  }
  return result;
}

export function buildHouseholdCompositionArtifact(
  rows: HouseholdCensusRow[],
  hashes: {
    archiveSha256: string;
    archiveMemberSha256: string;
    workbookSha256: string;
  },
  verifiedAt = new Date().toISOString(),
): HouseholdCompositionArtifact {
  const profile = aggregateHouseholdComposition(rows);
  assertPublishableHouseholdComposition(profile);
  for (const [label, hash] of Object.entries(hashes)) {
    if (!/^[a-f0-9]{64}$/.test(hash)) {
      throw new Error(`${label}: expected a lowercase SHA-256 digest`);
    }
  }
  if (hashes.archiveMemberSha256 !== hashes.workbookSha256) {
    throw new Error(
      `Workbook SHA-256 ${hashes.workbookSha256} does not match archive member ${ARCHIVE_WORKBOOK_MEMBER} (${hashes.archiveMemberSha256})`,
    );
  }
  const verifiedAtEpoch = Date.parse(verifiedAt);
  if (
    !Number.isFinite(verifiedAtEpoch) ||
    new Date(verifiedAtEpoch).toISOString() !== verifiedAt ||
    verifiedAtEpoch < Date.parse("2026-06-09")
  ) {
    throw new Error("verifiedAt: expected a normalized ISO-8601 timestamp");
  }
  return {
    schemaVersion: 1,
    ...profile,
    verification: {
      verifiedAt,
      method: "sha256-and-exact-reconciliation",
    },
    source: {
      institution: "ISTAT",
      dataset:
        "Dati per sezioni di censimento — Censimento permanente della popolazione e delle abitazioni 2023",
      territorialLevel: "sezione di censimento",
      referenceDate: "2023-12-31",
      sourceUpdateDate: "2026-06-09",
      pageUrl: "https://www.istat.it/notizia/dati-per-sezioni-di-censimento/",
      downloadUrl:
        "https://esploradati.istat.it/databrowser/DWL/PERMPOP/SUBCOM/Dati_regionali_2023.zip",
      archiveFile: "Dati_regionali_2023.zip",
      archiveMember: ARCHIVE_WORKBOOK_MEMBER,
      workbookFile: "R18_Calabria_2023_sezioni.xlsx",
      archiveSha256: hashes.archiveSha256,
      workbookSha256: hashes.workbookSha256,
      licence: "CC BY 4.0 unless otherwise indicated by ISTAT",
    },
  };
}

async function sha256(filePath: string): Promise<string> {
  await stat(filePath);
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

async function sha256ArchiveMember(
  archivePath: string,
  memberPath: string,
): Promise<string> {
  await stat(archivePath);
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const child = spawn("unzip", ["-p", archivePath, memberPath], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    child.stdout.on("data", (chunk) => hash.update(chunk));
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `Cannot read ${memberPath} from ${archivePath}: ${stderr.trim() || `unzip exited with ${code}`}`,
          ),
        );
        return;
      }
      resolve(hash.digest("hex"));
    });
  });
}

function parseArgs(argv: string[]) {
  const options = {
    xlsxPath: DEFAULT_XLSX,
    archivePath: DEFAULT_ARCHIVE,
    outputPath: DEFAULT_OUTPUT,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === "--variables-xlsx") {
      if (!next) throw new Error("--variables-xlsx requires a path");
      options.xlsxPath = path.resolve(next);
      index += 1;
    } else if (arg === "--archive") {
      if (!next) throw new Error("--archive requires a path");
      options.archivePath = path.resolve(next);
      index += 1;
    } else if (arg === "--output") {
      if (!next) throw new Error("--output requires a path");
      options.outputPath = path.resolve(next);
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

export async function materialize(argv = process.argv.slice(2)): Promise<void> {
  const options = parseArgs(argv);
  const [workbookRows, archiveSha256, archiveMemberSha256, workbookSha256] =
    await Promise.all([
      readXlsxRows(options.xlsxPath),
      sha256(options.archivePath),
      sha256ArchiveMember(options.archivePath, ARCHIVE_WORKBOOK_MEMBER),
      sha256(options.xlsxPath),
    ]);
  const artifact = buildHouseholdCompositionArtifact(
    householdRowsFromWorkbook(workbookRows),
    { archiveSha256, archiveMemberSha256, workbookSha256 },
  );
  await mkdir(path.dirname(options.outputPath), { recursive: true });
  const temporaryPath = `${options.outputPath}.tmp`;
  await writeFile(
    temporaryPath,
    `${JSON.stringify(artifact, null, 2)}\n`,
    "utf8",
  );
  await rename(temporaryPath, options.outputPath);
  console.log(
    `Materialized ${artifact.totalHouseholds} households from ${artifact.quality.includedRows} census sections to ${path.relative(repoRoot, options.outputPath)}`,
  );
}

if (path.resolve(process.argv[1] ?? "") === scriptPath) {
  materialize().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
