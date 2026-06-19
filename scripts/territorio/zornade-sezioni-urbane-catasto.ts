#!/usr/bin/env tsx
import { createWriteStream } from "node:fs";
import {
  access,
  copyFile,
  mkdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream } from "node:stream/web";
import { fileURLToPath } from "node:url";

type DatasetFormat = "gpkg" | "geojson";

interface DatasetDownload {
  url: string;
  fileName: string;
  advertisedSize: string;
}

interface CliOptions {
  format: DatasetFormat;
  rawDir: string;
  processedDir: string;
  force: boolean;
  download: boolean;
  extractGeojson: boolean;
  lameziaSubset: boolean;
  sourceUrl?: string;
}

interface GeoJsonFeature {
  type: "Feature";
  properties?: Record<string, unknown> | null;
  geometry?: unknown;
  [key: string]: unknown;
}

interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
  [key: string]: unknown;
}

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), "..", "..");

const rawDirDefault = path.join(
  repoRoot,
  "data",
  "raw",
  "territorio",
  "zornade",
  "sezioni_urbane_catasto",
);
const processedDirDefault = path.join(repoRoot, "data", "processed", "territorio");

const downloads: Record<DatasetFormat, DatasetDownload> = {
  gpkg: {
    url: "https://wupqwfqjfpwrapgnogjv.supabase.co/storage/v1/object/public/parcel-data-access/sezioni/sezioni.gpkg",
    fileName: "sezioni.gpkg",
    advertisedSize: "12.5 MB",
  },
  geojson: {
    url: "https://wupqwfqjfpwrapgnogjv.supabase.co/storage/v1/object/public/parcel-data-access/sezioni/sezioni.geojson",
    fileName: "sezioni.geojson",
    advertisedSize: "18.2 MB",
  },
};

const processedGeoJsonName = "zornade_sezioni_urbane_catasto.geojson";
const lameziaSubsetName = "zornade_sezioni_urbane_catasto_lamezia.geojson";
const lameziaComuneNames = ["lamezia terme"];
const lameziaComuneCodes = ["079160", "79160", "M208"];

function usage(): string {
  return [
    "Usage: tsx scripts/territorio/zornade-sezioni-urbane-catasto.ts [options]",
    "",
    "Options:",
    "  --format <gpkg|geojson>     Raw source format to download (default: gpkg)",
    "  --raw-dir <path>            Raw output directory",
    "  --processed-dir <path>      Processed output directory",
    "  --url <url>                 Override the selected direct download URL",
    "  --skip-download            Only verify that the selected raw file exists",
    "  --extract-geojson          Download/copy the source GeoJSON for web workflows",
    "  --lamezia-subset           Filter the GeoJSON to Lamezia Terme when identifiers are present",
    "  --force                    Re-download or overwrite existing generated files",
    "  --help                     Show this help",
  ].join("\n");
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    format: "gpkg",
    rawDir: rawDirDefault,
    processedDir: processedDirDefault,
    force: false,
    download: true,
    extractGeojson: false,
    lameziaSubset: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--help") {
      console.log(usage());
      process.exit(0);
    }

    if (arg === "--force") {
      options.force = true;
      continue;
    }

    if (arg === "--skip-download") {
      options.download = false;
      continue;
    }

    if (arg === "--extract-geojson") {
      options.extractGeojson = true;
      continue;
    }

    if (arg === "--lamezia-subset") {
      options.lameziaSubset = true;
      options.extractGeojson = true;
      continue;
    }

    if (arg === "--format") {
      if (next !== "gpkg" && next !== "geojson") {
        throw new Error("--format must be either gpkg or geojson");
      }
      options.format = next;
      index += 1;
      continue;
    }

    if (arg === "--raw-dir") {
      if (!next) throw new Error("--raw-dir requires a path");
      options.rawDir = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--processed-dir") {
      if (!next) throw new Error("--processed-dir requires a path");
      options.processedDir = path.resolve(next);
      index += 1;
      continue;
    }

    if (arg === "--url") {
      if (!next) throw new Error("--url requires a value");
      options.sourceUrl = next;
      index += 1;
      continue;
    }

    throw new Error(`Unknown option: ${arg}\n\n${usage()}`);
  }

  return options;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function formatBytes(bytes: number): string {
  const mib = bytes / 1024 / 1024;
  return `${bytes.toLocaleString("en-US")} bytes (${mib.toFixed(1)} MiB)`;
}

async function downloadFile(
  url: string,
  targetPath: string,
  force: boolean,
): Promise<void> {
  await mkdir(path.dirname(targetPath), { recursive: true });

  if (!force && (await exists(targetPath))) {
    const current = await stat(targetPath);
    console.log(`Using existing ${targetPath} (${formatBytes(current.size)})`);
    return;
  }

  const tmpPath = `${targetPath}.tmp`;
  await rm(tmpPath, { force: true });

  console.log(`Downloading ${url}`);
  const response = await fetch(url, {
    headers: {
      "user-agent": "Lamezia Trasparente Monitor data foundation",
    },
  });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error("Download failed: response body is empty");
  }

  await pipeline(
    Readable.fromWeb(response.body as unknown as ReadableStream<Uint8Array>),
    createWriteStream(tmpPath),
  );

  const downloaded = await stat(tmpPath);
  if (downloaded.size === 0) {
    throw new Error("Download failed: downloaded file is empty");
  }

  await rename(tmpPath, targetPath);
  console.log(`Saved ${targetPath} (${formatBytes(downloaded.size)})`);
}

async function verifyFile(filePath: string): Promise<void> {
  const file = await stat(filePath);
  if (!file.isFile() || file.size === 0) {
    throw new Error(`Expected a non-empty file at ${filePath}`);
  }
  console.log(`Verified ${filePath} (${formatBytes(file.size)})`);
}

async function prepareGeoJson(options: CliOptions): Promise<string> {
  const rawGeoJsonPath = path.join(options.rawDir, downloads.geojson.fileName);
  await downloadFile(downloads.geojson.url, rawGeoJsonPath, options.force);
  await verifyFile(rawGeoJsonPath);

  await mkdir(options.processedDir, { recursive: true });
  const processedGeoJsonPath = path.join(options.processedDir, processedGeoJsonName);

  if (options.force || !(await exists(processedGeoJsonPath))) {
    await copyFile(rawGeoJsonPath, processedGeoJsonPath);
    console.log(`Prepared web GeoJSON ${processedGeoJsonPath}`);
  } else {
    console.log(`Using existing web GeoJSON ${processedGeoJsonPath}`);
  }

  await verifyFile(processedGeoJsonPath);
  return processedGeoJsonPath;
}

function isFeatureCollection(value: unknown): value is GeoJsonFeatureCollection {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<GeoJsonFeatureCollection>;
  return candidate.type === "FeatureCollection" && Array.isArray(candidate.features);
}

function normalizeValue(value: unknown): string {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function featureLooksLikeLamezia(feature: GeoJsonFeature): boolean {
  const properties = feature.properties ?? {};
  const values = Object.values(properties).map(normalizeValue);

  return values.some((value) => {
    const compact = value.replace(/\s+/g, " ");
    const code = compact.replace(/^0+/, "");
    return (
      lameziaComuneNames.some((name) => compact.includes(name)) ||
      lameziaComuneCodes.includes(compact.toUpperCase()) ||
      lameziaComuneCodes.includes(code)
    );
  });
}

async function writeLameziaSubset(
  geoJsonPath: string,
  processedDir: string,
): Promise<void> {
  const parsed: unknown = JSON.parse(await readFile(geoJsonPath, "utf8"));
  if (!isFeatureCollection(parsed)) {
    throw new Error(`Expected FeatureCollection in ${geoJsonPath}`);
  }

  const subset: GeoJsonFeatureCollection = {
    ...parsed,
    features: parsed.features.filter(featureLooksLikeLamezia),
  };

  if (subset.features.length === 0) {
    throw new Error(
      "No Lamezia Terme features matched. Inspect source properties before publishing a subset.",
    );
  }

  const subsetPath = path.join(processedDir, lameziaSubsetName);
  await writeFile(`${subsetPath}.tmp`, JSON.stringify(subset), "utf8");
  await rename(`${subsetPath}.tmp`, subsetPath);
  await verifyFile(subsetPath);
  console.log(`Prepared Lamezia-only subset with ${subset.features.length} features`);
}

export async function run(argv = process.argv.slice(2)): Promise<void> {
  const options = parseArgs(argv);
  const selected = downloads[options.format];
  const sourceUrl = options.sourceUrl ?? selected.url;
  const rawTarget = path.join(options.rawDir, selected.fileName);

  console.log(
    `Selected ${options.format} source (${selected.advertisedSize} advertised): ${sourceUrl}`,
  );

  if (options.download) {
    await downloadFile(sourceUrl, rawTarget, options.force);
  }

  await verifyFile(rawTarget);

  if (options.extractGeojson) {
    const geoJsonPath = await prepareGeoJson(options);
    if (options.lameziaSubset) {
      await writeLameziaSubset(geoJsonPath, options.processedDir);
    }
  }
}

if (path.resolve(process.argv[1] ?? "") === scriptPath) {
  run().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
