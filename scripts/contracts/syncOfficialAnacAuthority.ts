import { spawn } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  open,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import {
  createPendingAnacAuthorityDiscoverySnapshot,
  LAMEZIA_CONTRACTING_AUTHORITY_TAX_ID,
  validateAnacAuthorityDiscoverySnapshot,
  type AnacAuthorityDiscoveryFailureCategory,
  type AnacAuthorityDiscoverySnapshot,
} from "../../artifacts/lamezia-trasparente/src/lib/anacAuthorityDiscovery";
import {
  ANAC_CKAN_PACKAGE_SHOW_URL,
  selectAnacCigArchiveCandidates,
} from "./anacCkanDiscovery";
import { AnacAuthorityCsvMatcher } from "./anacAuthorityCsv";
import {
  buildRequestedYears,
  mergeAuthorityDiscoveryAttempt,
  periodsToProcess,
  selectHistoricalYearsForRun,
  type SuccessfulAuthorityArchive,
} from "./anacAuthorityDiscoveryCore";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const outputPath = path.join(
  repoRoot,
  "data/public/contracts/anac-authority/latest.json",
);

const targetTaxId = environmentTaxId(
  "ANAC_AUTHORITY_TAX_ID",
  LAMEZIA_CONTRACTING_AUTHORITY_TAX_ID,
);
const targetLabel =
  process.env.ANAC_AUTHORITY_LABEL?.trim() || "Comune di Lamezia Terme";
const startYear = integerEnvironment("ANAC_AUTHORITY_START_YEAR", 2007, 2000, 2100);
const historicalYearsPerRun = integerEnvironment(
  "ANAC_AUTHORITY_HISTORICAL_YEARS_PER_RUN",
  1,
  0,
  10,
);
const maxResourcesPerRun = integerEnvironment(
  "ANAC_AUTHORITY_MAX_RESOURCES_PER_RUN",
  4,
  1,
  24,
);
const refreshCurrentMonths = integerEnvironment(
  "ANAC_AUTHORITY_REFRESH_CURRENT_MONTHS",
  2,
  0,
  12,
);
const maxArchiveBytes = integerEnvironment(
  "ANAC_AUTHORITY_ARCHIVE_MAX_BYTES",
  300 * 1024 * 1024,
  1_000_000,
  1_000_000_000,
);
const maxCkanBytes = 5 * 1024 * 1024;
const userAgent =
  "Mozilla/5.0 (compatible; Lamezia-Trasparente-Monitor/1.0; +https://lamezia-trasparente.pages.dev/metodologia)";

async function main(): Promise<void> {
  const attemptedAt = new Date().toISOString();
  const referenceDate = new Date(attemptedAt);
  const currentYear = referenceDate.getUTCFullYear();
  const currentPeriod = `${currentYear}-${String(referenceDate.getUTCMonth() + 1).padStart(2, "0")}`;
  const previous = await readPreviousSnapshot(outputPath, attemptedAt);
  const effectiveStartYear = Math.min(startYear, currentYear);
  const requestedYears = buildRequestedYears(referenceDate, effectiveStartYear);
  const historicalYears = selectHistoricalYearsForRun(
    requestedYears,
    previous.completedYears,
    currentYear,
    historicalYearsPerRun,
  );
  const targetYears = Array.from(new Set([currentYear, ...historicalYears]));
  const catalogPeriodsByYear = new Map<number, string[]>();
  const candidates: Array<{ period: string; year: number; url: string }> = [];
  let catalogUnavailable = false;

  for (const year of targetYears) {
    try {
      const payload = await fetchCkanPackage(`cig-${year}`);
      if (payload === null) {
        catalogPeriodsByYear.set(year, []);
        continue;
      }
      const yearCandidates = selectAnacCigArchiveCandidates(
        payload,
        new Date(Date.UTC(year, 11, 31)),
        12,
      );
      const catalogPeriods = yearCandidates.map((candidate) => candidate.period);
      catalogPeriodsByYear.set(year, catalogPeriods);
      const selectedPeriods =
        year === currentYear
          ? periodsToProcess({
              catalogPeriods,
              completedPeriods: previous.completedPeriods,
              currentPeriod,
              refreshCurrentMonths,
            })
          : catalogPeriods.filter(
              (period) => !previous.completedPeriods.includes(period),
            );
      const selected = new Set(selectedPeriods);
      for (const candidate of yearCandidates) {
        if (selected.has(candidate.period)) {
          candidates.push({ ...candidate, year });
        }
      }
    } catch (error) {
      catalogUnavailable = true;
      console.warn(
        `ANAC authority CKAN ${year}: catalogo non disponibile (${error instanceof Error ? error.message : "errore sconosciuto"}).`,
      );
    }
  }

  const selectedCandidates = candidates
    .sort((a, b) => b.period.localeCompare(a.period))
    .slice(0, maxResourcesPerRun);
  const tempDirectory = await mkdtemp(
    path.join(tmpdir(), "lamezia-anac-authority-"),
  );
  const successfulArchives: SuccessfulAuthorityArchive[] = [];
  let attemptedResources = 0;
  let failedResources = 0;
  let unexpectedFormat = false;
  let sourceUnavailable = catalogUnavailable;

  try {
    for (const candidate of selectedCandidates) {
      attemptedResources += 1;
      const archivePath = path.join(
        tempDirectory,
        `${candidate.period}-authority-cig.zip`,
      );
      try {
        await downloadArchive(candidate.url, archivePath);
        const parsed = await parseArchive(
          archivePath,
          targetTaxId,
          candidate,
          attemptedAt,
        );
        successfulArchives.push({
          period: candidate.period,
          year: candidate.year,
          url: candidate.url,
          retrievedAt: attemptedAt,
          recordsScanned: parsed.recordsScanned,
          records: parsed.records,
        });
        console.log(
          `ANAC authority ${candidate.period}: ${parsed.recordsScanned} righe consultate, ${parsed.records.length} CIG del Comune individuati.`,
        );
      } catch (error) {
        failedResources += 1;
        if (error instanceof UnexpectedArchiveError) {
          unexpectedFormat = true;
          console.warn(
            `ANAC authority ${candidate.period}: formato non utilizzabile (${error.message}).`,
          );
        } else {
          sourceUnavailable = true;
          console.warn(
            `ANAC authority ${candidate.period}: fonte non raggiungibile (${error instanceof Error ? error.message : "errore sconosciuto"}).`,
          );
        }
      } finally {
        await rm(archivePath, { force: true });
      }
    }
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }

  const failureCategory: AnacAuthorityDiscoveryFailureCategory =
    successfulArchives.length > 0
      ? null
      : unexpectedFormat
        ? "unexpected-format"
        : sourceUnavailable
          ? "source-unavailable"
          : "no-published-resource";
  const next = mergeAuthorityDiscoveryAttempt({
    previous,
    attemptedAt,
    requestedYears,
    targetTaxId,
    targetLabel,
    successfulArchives,
    catalogPeriodsByYear,
    attemptedResources,
    failedResources,
    failureCategory,
    currentYear,
  });
  validateAnacAuthorityDiscoverySnapshot(next);
  await writeJsonAtomically(outputPath, next);

  console.log(
    `ANAC authority census: ${next.records.length} CIG unici; ${next.completedYears.length}/${next.requestedYears.length} anni storici completati; ${next.completedPeriods.length} periodi acquisiti.`,
  );
}

async function fetchCkanPackage(packageId: string): Promise<unknown | null> {
  const url = new URL(ANAC_CKAN_PACKAGE_SHOW_URL);
  url.searchParams.set("id", packageId);
  const response = await fetch(url, {
    signal: AbortSignal.timeout(20_000),
    headers: {
      Accept: "application/json",
      "User-Agent": userAgent,
    },
  });
  if (response.status === 404) {
    await response.body?.cancel();
    return null;
  }
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`HTTP ${response.status}`);
  }
  assertOfficialAnacUrl(response.url);
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxCkanBytes) {
    await response.body?.cancel();
    throw new Error("CKAN response exceeds size cap");
  }
  const text = await response.text();
  if (Buffer.byteLength(text, "utf8") > maxCkanBytes) {
    throw new Error("CKAN response exceeds size cap");
  }
  return JSON.parse(text) as unknown;
}

async function downloadArchive(url: string, destination: string): Promise<void> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(60_000),
    headers: {
      Accept: "application/zip, application/octet-stream;q=0.9, */*;q=0.1",
      "User-Agent": userAgent,
    },
  });
  if (!response.ok || !response.body) {
    await response.body?.cancel();
    throw new Error(`HTTP ${response.status}`);
  }
  assertOfficialAnacUrl(response.url);
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxArchiveBytes) {
    await response.body.cancel();
    throw new UnexpectedArchiveError("Archive exceeds compressed size cap");
  }

  const file = await open(destination, "w");
  const reader = response.body.getReader();
  let bytes = 0;
  let signature = Buffer.alloc(0);
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const buffer = Buffer.from(value);
      bytes += buffer.length;
      if (bytes > maxArchiveBytes) {
        throw new UnexpectedArchiveError("Archive exceeds compressed size cap");
      }
      if (signature.length < 4) {
        signature = Buffer.concat([signature, buffer]).subarray(0, 4);
      }
      await file.write(buffer);
    }
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    throw error;
  } finally {
    reader.releaseLock();
    await file.close();
  }
  if (signature.length < 2 || signature[0] !== 0x50 || signature[1] !== 0x4b) {
    throw new UnexpectedArchiveError("Response is not a ZIP archive");
  }
}

async function parseArchive(
  archivePath: string,
  authorityTaxId: string,
  source: { url: string; period: string },
  acquiredAt: string,
) {
  let stdout: string;
  try {
    ({ stdout } = await execFileAsync("unzip", ["-Z1", archivePath], {
      maxBuffer: 2 * 1024 * 1024,
      encoding: "utf8",
    }));
  } catch {
    throw new UnexpectedArchiveError("ZIP index cannot be read");
  }
  const csvEntry = stdout
    .split(/\r?\n/u)
    .map((entry) => entry.trim())
    .find(
      (entry) =>
        entry && !entry.startsWith("__MACOSX/") && /\.csv$/iu.test(entry),
    );
  if (!csvEntry) throw new UnexpectedArchiveError("ZIP contains no CSV entry");

  const matcher = new AnacAuthorityCsvMatcher(authorityTaxId, {
    ...source,
    acquiredAt,
  });
  const decoder = new TextDecoder("utf-8");
  await new Promise<void>((resolve, reject) => {
    const child = spawn("unzip", ["-p", archivePath, csvEntry], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let settled = false;
    let stderr = "";
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
      if (stderr.length < 4_096) stderr += chunk.toString("utf8");
    });
    child.on("error", fail);
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      if (code !== 0) {
        reject(new Error(`unzip exited with ${code}: ${stderr.slice(0, 200)}`));
        return;
      }
      try {
        matcher.push(decoder.decode());
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
  return matcher.finish();
}

async function readPreviousSnapshot(
  filePath: string,
  generatedAt: string,
): Promise<AnacAuthorityDiscoverySnapshot> {
  try {
    return validateAnacAuthorityDiscoverySnapshot(
      JSON.parse(await readFile(filePath, "utf8")) as unknown,
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return createPendingAnacAuthorityDiscoverySnapshot(generatedAt, targetTaxId);
    }
    throw error;
  }
}

async function writeJsonAtomically(
  filePath: string,
  value: AnacAuthorityDiscoverySnapshot,
): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryPath, filePath);
}

function assertOfficialAnacUrl(value: string): void {
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    !(
      url.hostname === "anticorruzione.it" ||
      url.hostname.endsWith(".anticorruzione.it")
    )
  ) {
    throw new Error("ANAC authority request redirected outside official HTTPS domain");
  }
}

function environmentTaxId(name: string, fallback: string): string {
  const value = (process.env[name] ?? fallback)
    .replace(/[^A-Z0-9]/giu, "")
    .toUpperCase();
  if (!/^\d{11}$/u.test(value)) {
    throw new Error(`${name} must be an 11-digit Italian tax id`);
  }
  return value;
}

function integerEnvironment(
  name: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`);
  }
  return value;
}

class UnexpectedArchiveError extends Error {}

await main();
