import { spawn } from "node:child_process";
import { mkdir, mkdtemp, open, readFile, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { validateAnacBdncpSyncSnapshot, type AnacBdncpSyncSnapshot } from "../../artifacts/lamezia-trasparente/src/lib/anacBdncpSync";
import { ANAC_CKAN_PACKAGE_SHOW_URL } from "./anacCkanDiscovery";
import { buildAnacAwardsSnapshot } from "./anacAwards";
import { AnacAwardsCsvMatcher } from "./anacAwardsStreaming";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const procurementPath = path.join(repoRoot, "data/public/contracts/anac-bdncp/latest.json");
const outputPath = path.join(repoRoot, "data/public/contracts/anac-awards/latest.json");
const fallbackArchiveUrl = "https://dati.anticorruzione.it/opendata/download/dataset/aggiudicazioni/filesystem/aggiudicazioni_csv.zip";
const maxArchiveBytes = 1_000_000_000;
const maxCkanBytes = 5 * 1024 * 1024;
const userAgent = "Mozilla/5.0 (compatible; Lamezia-Trasparente-Monitor/1.0; +https://lamezia-trasparente.pages.dev/metodologia)";

async function main(): Promise<void> {
  const acquiredAt = new Date().toISOString();
  const procurement = validateAnacBdncpSyncSnapshot(
    JSON.parse(await readFile(procurementPath, "utf8")) as unknown,
  );
  const trackedCigs = procurement.trackedCigs;
  const archiveUrl = (await discoverAwardsArchive()) ?? fallbackArchiveUrl;
  const tempDirectory = await mkdtemp(path.join(tmpdir(), "lamezia-anac-awards-"));
  const archivePath = path.join(tempDirectory, "aggiudicazioni_csv.zip");
  try {
    await downloadArchive(archiveUrl, archivePath);
    const parsed = await parseArchive(archivePath, new Set(trackedCigs), archiveUrl, acquiredAt);
    const snapshot = buildAnacAwardsSnapshot({ generatedAt: acquiredAt, trackedCigs, archiveUrl, parsed });
    await writeJsonAtomically(outputPath, snapshot);
    console.log(`ANAC Aggiudicazioni: ${snapshot.records.length}/${trackedCigs.length} CIG locali collegati; ${snapshot.recordsScanned} righe consultate.`);
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
}

async function discoverAwardsArchive(): Promise<string | null> {
  const url = new URL(ANAC_CKAN_PACKAGE_SHOW_URL);
  url.searchParams.set("id", "aggiudicazioni");
  try {
    const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": userAgent }, signal: AbortSignal.timeout(20_000) });
    if (!response.ok) return null;
    assertOfficialAnacUrl(response.url);
    const text = await response.text();
    if (Buffer.byteLength(text, "utf8") > maxCkanBytes) return null;
    const payload = JSON.parse(text) as unknown;
    return selectAwardsArchive(payload);
  } catch {
    return null;
  }
}

export function selectAwardsArchive(payload: unknown): string | null {
  if (!isRecord(payload) || payload.success !== true || !isRecord(payload.result) || !Array.isArray(payload.result.resources)) return null;
  const candidates = payload.result.resources
    .filter(isRecord)
    .map((resource) => ({
      url: typeof resource.url === "string" ? resource.url.trim() : "",
      name: typeof resource.name === "string" ? resource.name.toLowerCase() : "",
      format: typeof resource.format === "string" ? resource.format.toLowerCase() : "",
    }))
    .filter((resource) => isOfficialAnacArchive(resource.url))
    .map((resource) => ({ ...resource, score: (resource.name.includes("aggiudicazioni") ? 4 : 0) + (resource.name.includes("csv") || resource.format.includes("csv") ? 3 : 0) + (resource.url.includes("aggiudicazioni_csv.zip") ? 5 : 0) }))
    .filter((resource) => resource.score > 0)
    .sort((a, b) => b.score - a.score);
  return candidates[0]?.url ?? null;
}

async function downloadArchive(url: string, destination: string): Promise<void> {
  const response = await fetch(url, { headers: { Accept: "application/zip, application/octet-stream;q=0.9, */*;q=0.1", "User-Agent": userAgent }, signal: AbortSignal.timeout(60_000) });
  if (!response.ok || !response.body) throw new Error(`ANAC Aggiudicazioni download failed: HTTP ${response.status}`);
  assertOfficialAnacUrl(response.url);
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxArchiveBytes) { await response.body.cancel(); throw new Error("ANAC Aggiudicazioni archive exceeds size cap"); }
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
      if (bytes > maxArchiveBytes) throw new Error("ANAC Aggiudicazioni archive exceeds size cap");
      if (signature.length < 4) signature = Buffer.concat([signature, buffer]).subarray(0, 4);
      await file.write(buffer);
    }
  } finally {
    reader.releaseLock();
    await file.close();
  }
  if (signature.length < 2 || signature[0] !== 0x50 || signature[1] !== 0x4b) throw new Error("ANAC Aggiudicazioni response is not a ZIP archive");
}

async function parseArchive(archivePath: string, trackedCigs: ReadonlySet<string>, url: string, acquiredAt: string) {
  const { stdout } = await execFileAsync("unzip", ["-Z1", archivePath], { maxBuffer: 2 * 1024 * 1024, encoding: "utf8" });
  const csvEntry = stdout.split(/\r?\n/u).map((entry) => entry.trim()).find((entry) => entry && !entry.startsWith("__MACOSX/") && /\.csv$/iu.test(entry));
  if (!csvEntry) throw new Error("ANAC Aggiudicazioni ZIP contains no CSV entry");
  const matcher = new AnacAwardsCsvMatcher(trackedCigs, { url, acquiredAt });
  const decoder = new TextDecoder("utf-8");
  await new Promise<void>((resolve, reject) => {
    const child = spawn("unzip", ["-p", archivePath, csvEntry], { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => {
      try { matcher.push(decoder.decode(chunk, { stream: true })); } catch (error) { child.kill("SIGKILL"); reject(error); }
    });
    child.stderr.on("data", (chunk: Buffer) => { if (stderr.length < 4096) stderr += chunk.toString("utf8"); });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) { reject(new Error(`unzip exited with ${code}: ${stderr.slice(0, 200)}`)); return; }
      try { matcher.push(decoder.decode()); resolve(); } catch (error) { reject(error); }
    });
  });
  return matcher.finish();
}

async function writeJsonAtomically(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryPath, filePath);
}

function isOfficialAnacArchive(value: string): boolean {
  try { const url = new URL(value); return url.protocol === "https:" && (url.hostname === "anticorruzione.it" || url.hostname.endsWith(".anticorruzione.it")) && /\.zip$/iu.test(url.pathname); } catch { return false; }
}
function assertOfficialAnacUrl(value: string): void { if (!isOfficialAnacHttps(value)) throw new Error("ANAC request redirected outside official HTTPS domain"); }
function isOfficialAnacHttps(value: string): boolean { try { const url = new URL(value); return url.protocol === "https:" && (url.hostname === "anticorruzione.it" || url.hostname.endsWith(".anticorruzione.it")); } catch { return false; } }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }

await main();
