import { spawn } from "node:child_process";
import {
  open,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { execFile } from "node:child_process";

import { classifyProcurementIdentifier } from "../../artifacts/lamezia-trasparente/src/lib/procurementIdentifiers";
import {
  validateAnacBdncpSyncSnapshot,
  type AnacBdncpFailureCategory,
  type AnacBdncpSyncSnapshot,
} from "../../artifacts/lamezia-trasparente/src/lib/anacBdncpSync";
import {
  AnacCsvMatcher,
  buildAnacCigArchiveCandidates,
  mergeAnacSyncAttempt,
  type AnacArchiveCandidate,
  type SuccessfulArchiveSync,
} from "./anacBdncpSyncCore";
import {
  ANAC_CKAN_PACKAGE_SHOW_URL,
  buildAnacCigPackageIds,
  selectAnacCigArchiveCandidates,
} from "./anacCkanDiscovery";
import {
  extractCig,
  type AlboPublicSnapshot,
} from "../../artifacts/lamezia-trasparente/src/lib/staticContractsDataset";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const alboSnapshotPath = path.join(repoRoot, "data/public/albo/latest.json");
const outputPath = path.join(
  repoRoot,
  "data/public/contracts/anac-bdncp/latest.json",
);

const lookbackMonths = integerEnvironment("ANAC_LOOKBACK_MONTHS", 12, 1, 60);
const maxSuccessfulArchives = integerEnvironment(
  "ANAC_MAX_SUCCESSFUL_ARCHIVES",
  3,
  1,
  12,
);
const maxArchiveBytes = integerEnvironment(
  "ANAC_ARCHIVE_MAX_BYTES",
  300 * 1024 * 1024,
  1_000_000,
  1_000_000_000,
);
const maxCkanBytes = 5 * 1024 * 1024;
const userAgent =
  "Mozilla/5.0 (compatible; Lamezia-Trasparente-Monitor/1.0; +https://lamezia-trasparente.pages.dev/metodologia)";

async function main(): Promise<void> {
  const attemptedAt = new Date().toISOString();
  const [alboSnapshot, previous] = await Promise.all([
    readJson<AlboPublicSnapshot>(alboSnapshotPath),
    readPreviousSnapshot(outputPath),
  ]);
  const trackedCigs = currentFormalCigs(alboSnapshot);
  const referenceDate = new Date(attemptedAt);
  const fallbackCandidates = buildAnacCigArchiveCandidates(
    referenceDate,
    lookbackMonths,
  );
  const candidates = await discoverAnacCigArchiveCandidates(
    referenceDate,
    lookbackMonths,
    fallbackCandidates,
  );
  const tempDirectory = await mkdtemp(
    path.join(tmpdir(), "lamezia-anac-bdncp-"),
  );
  const successfulArchives: SuccessfulArchiveSync[] = [];
  let attemptedArchives = 0;
  let unavailableArchives = 0;
  let unexpectedFormat = false;
  let sourceUnavailable = false;

  try {
    for (const candidate of candidates) {
      if (successfulArchives.length >= maxSuccessfulArchives) break;
      attemptedArchives += 1;
      const archivePath = path.join(
        tempDirectory,
        `${candidate.period}-cig_csv.zip`,
      );

      try {
        const outcome = await downloadArchive(candidate.url, archivePath);
        if (outcome === "not-published") {
          unavailableArchives += 1;
          console.log(`ANAC ${candidate.period}: pacchetto non pubblicato.`);
          continue;
        }

        const parsed = await parseArchive(
          archivePath,
          new Set(trackedCigs),
          candidate,
          attemptedAt,
        );
        successfulArchives.push({
          period: candidate.period,
          url: candidate.url,
          retrievedAt: attemptedAt,
          recordsScanned: parsed.recordsScanned,
          records: parsed.records,
        });
        console.log(
          `ANAC ${candidate.period}: ${parsed.recordsScanned} righe consultate, ${parsed.records.length} CIG locali collegati.`,
        );
      } catch (error) {
        unavailableArchives += 1;
        if (error instanceof UnexpectedArchiveError) {
          unexpectedFormat = true;
          console.warn(`ANAC ${candidate.period}: formato non utilizzabile.`);
        } else {
          sourceUnavailable = true;
          console.warn(`ANAC ${candidate.period}: fonte non raggiungibile.`);
        }
      } finally {
        await rm(archivePath, { force: true });
      }
    }
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }

  const failureCategory: AnacBdncpFailureCategory =
    successfulArchives.length > 0
      ? null
      : unexpectedFormat
        ? "unexpected-format"
        : sourceUnavailable
          ? "source-unavailable"
          : "no-published-archive";
  const next = mergeAnacSyncAttempt({
    previous,
    trackedCigs,
    attemptedAt,
    lookbackMonths,
    attemptedArchives,
    unavailableArchives,
    successfulArchives,
    failureCategory,
  });
  validateAnacBdncpSyncSnapshot(next);
  await writeJsonAtomically(outputPath, next);

  console.log(
    `Snapshot ANAC/BDNCP: stato ${next.status}; ${next.records.length}/${trackedCigs.length} CIG con record strutturato in cache.`,
  );
}

async function discoverAnacCigArchiveCandidates(
  referenceDate: Date,
  lookback: number,
  fallbackCandidates: AnacArchiveCandidate[],
): Promise<AnacArchiveCandidate[]> {
  const discovered = new Map<string, AnacArchiveCandidate>();
  const packageIds = buildAnacCigPackageIds(referenceDate, lookback);

  for (const packageId of packageIds) {
    try {
      const payload = await fetchCkanPackage(packageId);
      if (payload === null) continue;
      for (const candidate of selectAnacCigArchiveCandidates(
        payload,
        referenceDate,
        lookback,
      )) {
        discovered.set(candidate.period, candidate);
      }
    } catch (error) {
      console.warn(
        `ANAC CKAN ${packageId}: discovery non disponibile (${error instanceof Error ? error.message : "errore sconosciuto"}).`,
      );
    }
  }

  if (discovered.size === 0) {
    console.warn(
      "ANAC CKAN: nessuna risorsa mensile CSV/ZIP scoperta; uso il pattern URL storico come fallback.",
    );
    return fallbackCandidates;
  }

  console.log(
    `ANAC CKAN: ${discovered.size} risorse mensili risolte dal catalogo ufficiale.`,
  );
  return fallbackCandidates.map(
    (fallback) => discovered.get(fallback.period) ?? fallback,
  );
}

async function fetchCkanPackage(packageId: string): Promise<unknown | null> {
  const url = new URL(ANAC_CKAN_PACKAGE_SHOW_URL);
  url.searchParams.set("id", packageId);
  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
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
    } catch (error) {
      lastError = error;
      if (attempt === 2) throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
}

async function downloadArchive(
  url: string,
  destination: string,
): Promise<"downloaded" | "not-published"> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/zip, application/octet-stream;q=0.9, */*;q=0.1",
          "User-Agent": userAgent,
        },
      });
      if (response.status === 404) {
        await response.body?.cancel();
        return "not-published";
      }
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
      let bytes = 0;
      let signature = Buffer.alloc(0);
      const reader = response.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const buffer = Buffer.from(value);
          bytes += buffer.length;
          if (bytes > maxArchiveBytes) {
            throw new UnexpectedArchiveError(
              "Archive exceeds compressed size cap",
            );
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
      if (
        signature.length < 4 ||
        signature[0] !== 0x50 ||
        signature[1] !== 0x4b
      ) {
        throw new UnexpectedArchiveError("Response is not a ZIP archive");
      }
      return "downloaded";
    } catch (error) {
      await rm(destination, { force: true });
      lastError = error;
      if (error instanceof UnexpectedArchiveError || attempt === 2) throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError;
}

async function parseArchive(
  archivePath: string,
  trackedCigs: ReadonlySet<string>,
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
  if (!csvEntry) {
    throw new UnexpectedArchiveError("ZIP contains no CSV entry");
  }

  const matcher = new AnacCsvMatcher(trackedCigs, {
    ...source,
    acquiredAt,
  });
  const decoder = new TextDecoder("utf-8");

  try {
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
        if (code === 0) {
          try {
            matcher.push(decoder.decode());
            resolve();
          } catch (error) {
            reject(error);
          }
        } else {
          reject(
            new Error(`unzip exited with ${code}: ${stderr.slice(0, 200)}`),
          );
        }
      });
    });
    return matcher.finish();
  } catch (error) {
    if (error instanceof UnexpectedArchiveError) throw error;
    throw new UnexpectedArchiveError(
      error instanceof Error ? error.message : "CSV cannot be parsed",
    );
  }
}

function currentFormalCigs(snapshot: AlboPublicSnapshot): string[] {
  const cigs = (snapshot.items ?? [])
    .filter(
      (item) =>
        item.public_visibility === "publishable" &&
        item.verification_status === "official_source_acquired",
    )
    .map((item) => extractCig(item.subject))
    .map((cig) => classifyProcurementIdentifier(cig))
    .filter(
      (classification) =>
        classification.type === "cig" && classification.formallyValid,
    )
    .map((classification) => classification.normalized);
  return Array.from(new Set(cigs)).sort();
}

async function readPreviousSnapshot(
  filePath: string,
): Promise<AnacBdncpSyncSnapshot> {
  return validateAnacBdncpSyncSnapshot(await readJson<unknown>(filePath));
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

async function writeJsonAtomically(
  filePath: string,
  value: AnacBdncpSyncSnapshot,
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
    throw new Error("ANAC download redirected outside the official domain");
  }
}

function integerEnvironment(
  name: string,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(
      `${name} must be an integer between ${minimum} and ${maximum}`,
    );
  }
  return parsed;
}

class UnexpectedArchiveError extends Error {}

await main();
