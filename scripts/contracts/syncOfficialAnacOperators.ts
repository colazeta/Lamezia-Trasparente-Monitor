import { execFile, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, open, readFile, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { validateAnacBdncpSyncSnapshot } from "../../artifacts/lamezia-trasparente/src/lib/anacBdncpSync";
import {
  buildAnacOperatorsSnapshot,
  datasetConfig,
  type AnacOperatorDataset,
  type AnacOperatorSourceSelection,
} from "./anacOperators";
import {
  ANAC_CKAN_PACKAGE_SHOW_URL,
  canonicalOperatorArchiveUrl,
  isOfficialAnacHttpsUrl,
  selectAnacOperatorArchive,
} from "./anacOperatorSource";
import { AnacOperatorsCsvMatcher } from "./anacOperatorsStreaming";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const procurementPath = path.join(repoRoot, "data/public/contracts/anac-bdncp/latest.json");
const maxArchiveBytes = 1_500_000_000;
const maxCkanBytes = 5 * 1024 * 1024;
const userAgent = "Mozilla/5.0 (compatible; Lamezia-Trasparente-Monitor/1.0; +https://lamezia-trasparente.pages.dev/metodologia)";
const datasets: readonly AnacOperatorDataset[] = ["participants", "awardees"];

async function main(): Promise<void> {
  const procurement = validateAnacBdncpSyncSnapshot(
    JSON.parse(await readFile(procurementPath, "utf8")) as unknown,
  );
  const failures: string[] = [];
  for (const dataset of datasets) {
    try {
      await syncDataset(dataset, procurement.trackedCigs);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${dataset}: ${message}`);
      console.error(`ANAC ${dataset}: ${message}`);
    }
  }
  if (failures.length) throw new Error(`ANAC operator sync incomplete: ${failures.join(" | ")}`);
}

async function syncDataset(dataset: AnacOperatorDataset, trackedCigs: string[]): Promise<void> {
  const acquiredAt = new Date().toISOString();
  const discovered = await discoverArchive(dataset);
  const archiveUrl = discovered ?? canonicalOperatorArchiveUrl(dataset);
  const selection: AnacOperatorSourceSelection = discovered ? "ckan" : "canonical-fallback";
  const id = datasetConfig(dataset).id;
  const tempDirectory = await mkdtemp(path.join(tmpdir(), `lamezia-anac-${id}-`));
  const archivePath = path.join(tempDirectory, `${id}_csv.zip`);
  try {
    const archive = await downloadArchive(archiveUrl, archivePath, id);
    const parsed = await parseArchive(
      archivePath,
      dataset,
      new Set(trackedCigs),
      archiveUrl,
      acquiredAt,
    );
    const snapshot = buildAnacOperatorsSnapshot({
      dataset,
      generatedAt: acquiredAt,
      trackedCigs,
      parsed: parsed.parsed,
      source: {
        archiveUrl,
        archiveSha256: archive.sha256,
        archiveBytes: archive.bytes,
        csvEntry: parsed.csvEntry,
        acquiredAt,
        selection,
      },
    });
    const outputPath = path.join(
      repoRoot,
      `data/public/contracts/${dataset === "participants" ? "anac-participants" : "anac-awardees"}/latest.json`,
    );
    await writeJsonAtomically(outputPath, snapshot);
    console.log(
      `ANAC ${id}: ${snapshot.coverage.cigsWithRecords}/${trackedCigs.length} CIG collegati; ${snapshot.records.length} record normalizzati; ${snapshot.recordsScanned} record consultati.`,
    );
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
}

async function discoverArchive(dataset: AnacOperatorDataset): Promise<string | null> {
  const url = new URL(ANAC_CKAN_PACKAGE_SHOW_URL);
  url.searchParams.set("id", datasetConfig(dataset).id);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": userAgent },
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok || !isOfficialAnacHttpsUrl(response.url)) return null;
    const text = await response.text();
    if (Buffer.byteLength(text, "utf8") > maxCkanBytes) return null;
    return selectAnacOperatorArchive(JSON.parse(text) as unknown, dataset);
  } catch {
    return null;
  }
}

async function downloadArchive(
  url: string,
  destination: string,
  datasetId: string,
): Promise<{ bytes: number; sha256: string }> {
  if (!isOfficialAnacHttpsUrl(url)) throw new Error(`ANAC ${datasetId} archive is outside official HTTPS domain`);
  const response = await fetch(url, {
    headers: {
      Accept: "application/zip, application/octet-stream;q=0.9, */*;q=0.1",
      "User-Agent": userAgent,
    },
    signal: AbortSignal.timeout(90_000),
  });
  if (!response.ok || !response.body) throw new Error(`ANAC ${datasetId} download failed: HTTP ${response.status}`);
  if (!isOfficialAnacHttpsUrl(response.url)) throw new Error(`ANAC ${datasetId} request redirected outside official HTTPS domain`);
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxArchiveBytes) {
    await response.body.cancel();
    throw new Error(`ANAC ${datasetId} archive exceeds size cap`);
  }

  const file = await open(destination, "w");
  const reader = response.body.getReader();
  const hash = createHash("sha256");
  let bytes = 0;
  let signature = Buffer.alloc(0);
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const buffer = Buffer.from(value);
      bytes += buffer.length;
      if (bytes > maxArchiveBytes) throw new Error(`ANAC ${datasetId} archive exceeds size cap`);
      hash.update(buffer);
      if (signature.length < 4) signature = Buffer.concat([signature, buffer]).subarray(0, 4);
      await file.write(buffer);
    }
  } finally {
    reader.releaseLock();
    await file.close();
  }
  if (signature.length < 2 || signature[0] !== 0x50 || signature[1] !== 0x4b) {
    throw new Error(`ANAC ${datasetId} response is not a ZIP archive`);
  }
  return { bytes, sha256: hash.digest("hex") };
}

async function parseArchive(
  archivePath: string,
  dataset: AnacOperatorDataset,
  trackedCigs: ReadonlySet<string>,
  url: string,
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
    .filter((entry) => entry && !entry.startsWith("__MACOSX/") && /\.csv$/iu.test(entry))
    .sort((a, b) => Number(b.toLowerCase().includes(id)) - Number(a.toLowerCase().includes(id)) || a.localeCompare(b))[0];
  if (!csvEntry) throw new Error(`ANAC ${id} ZIP contains no CSV entry`);

  const matcher = new AnacOperatorsCsvMatcher(dataset, trackedCigs, { url, acquiredAt });
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
  const temporaryPath = `${filePath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryPath, filePath);
}

await main();
