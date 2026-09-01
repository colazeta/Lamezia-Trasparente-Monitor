import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { municipalBoundarySpatialCollection } from "../../artifacts/api-server/src/lib/gisSpatial";
import {
  buildConfiscatedAssetsSnapshot,
  buildSpatialPublicationManifest,
  isFeatureCollection,
  type JsonObject,
} from "./spatial-public-snapshots-core";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const outputDirectory = path.join(repoRoot, "data/processed/territorio");
const censusPath = path.join(
  outputDirectory,
  "istat_sezioni_censimento_lamezia.geojson",
);
const municipalPath = path.join(
  outputDirectory,
  "lamezia_confine_comunale.geojson",
);
const confiscatedAssetsPath = path.join(
  outputDirectory,
  "beni_confiscati_lamezia.geojson",
);
const manifestPath = path.join(outputDirectory, "spatial_layer_manifest.json");

const anbscBaseUrl = (
  process.env.ANBSC_PUBLIC_DATA_BASE_URL ??
  "https://benidestinati.anbsc.it/api/data"
).replace(/\/$/, "");
const anbscCatalogUrl = `${anbscBaseUrl}/beni/catalog`;

function stringify(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function stringifyCompact(value: unknown): string {
  return `${JSON.stringify(value)}\n`;
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Lamezia-Trasparente-Monitor/spatial-snapshot",
    },
  });
  if (!response.ok) {
    throw new Error(`ANBSC request failed (${response.status}): ${url}`);
  }
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(`ANBSC response is not JSON: ${url}`);
  }
  return response.json() as Promise<unknown>;
}

function datasetUrl(iter: "in_amministrazione" | "destinato"): string {
  const url = new URL(`${anbscBaseUrl}/beni/immobili/${iter}`);
  url.searchParams.set("comune", "Lamezia Terme");
  return url.toString();
}

function sourceModifiedFromCatalog(value: unknown): string {
  if (!value || typeof value !== "object") {
    throw new Error("ANBSC catalog is not an object");
  }
  const modified = (value as JsonObject)["dct:modified"];
  if (typeof modified !== "string" || !modified.trim()) {
    throw new Error("ANBSC catalog is missing dct:modified");
  }
  return modified;
}

async function writeAtomically(
  filePath: string,
  contents: string,
): Promise<void> {
  const temporaryPath = `${filePath}.tmp`;
  await writeFile(temporaryPath, contents, "utf8");
  await rename(temporaryPath, filePath);
}

async function main(): Promise<void> {
  const [catalog, inAdministration, destined, censusJson] = await Promise.all([
    fetchJson(anbscCatalogUrl),
    fetchJson(datasetUrl("in_amministrazione")),
    fetchJson(datasetUrl("destinato")),
    readFile(censusPath, "utf8"),
  ]);

  const censusCollection = JSON.parse(censusJson) as unknown;
  if (!isFeatureCollection(censusCollection)) {
    throw new Error(`Expected a FeatureCollection in ${censusPath}`);
  }
  if (!isFeatureCollection(municipalBoundarySpatialCollection)) {
    throw new Error("Municipal boundary source is not a FeatureCollection");
  }

  const sourceModified = sourceModifiedFromCatalog(catalog);
  const confiscatedAssetsSnapshot = buildConfiscatedAssetsSnapshot({
    inAdministration,
    destined,
    sourceModified,
    sourceDatasetUrl: anbscCatalogUrl,
  });
  const municipalJson = stringifyCompact(municipalBoundarySpatialCollection);
  const confiscatedAssetsJson = stringify(confiscatedAssetsSnapshot);
  const generatedAt = new Date().toISOString();
  const manifest = buildSpatialPublicationManifest({
    generatedAt,
    municipalBoundaryJson: municipalJson,
    municipalFeatureCount: municipalBoundarySpatialCollection.features.length,
    censusSectionsJson: censusJson,
    censusFeatureCount: censusCollection.features.length,
    confiscatedAssetsJson,
    confiscatedAssetsSnapshot,
  });

  await mkdir(outputDirectory, { recursive: true });
  await writeAtomically(municipalPath, municipalJson);
  await writeAtomically(confiscatedAssetsPath, confiscatedAssetsJson);
  await writeAtomically(manifestPath, stringify(manifest));

  console.log(
    JSON.stringify(
      {
        generatedAt,
        sourceModified,
        outputs: [municipalPath, confiscatedAssetsPath, manifestPath].map(
          (filePath) => path.relative(repoRoot, filePath),
        ),
        featureCounts: Object.fromEntries(
          manifest.layers.map((layer) => [layer.layer_id, layer.feature_count]),
        ),
        excludedConfiscatedAssets:
          confiscatedAssetsSnapshot.metadata.excluded_records,
      },
      null,
      2,
    ),
  );
}

await main();
