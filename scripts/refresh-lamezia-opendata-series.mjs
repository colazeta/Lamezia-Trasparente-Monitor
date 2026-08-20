import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const GENERATED_DIR = path.join(
  REPO_ROOT,
  "artifacts/lamezia-trasparente/src/data/generated",
);
const USER_AGENT = "Lamezia-Trasparente-Monitor source refresh";

const MUNICIPAL_SERIES = [
  {
    id: "lamezia-demographic-trend",
    output: "lameziaDemographicTrend.json",
    builder: "scripts/build-lamezia-demographic-trend-data.mjs",
    resourceId: "634c5b42-1bd4-43bd-ac0a-6fb9ace5f3e9",
    detailUrl:
      "https://dataportal.maggioli.cloud/api/v1/mgg-od/datasets/detail/be119781-22b5-4883-ae4e-7f299546c2b7?cod-ente=188067-opendata&organizations=comune-di-lamezia-terme",
  },
  {
    id: "lamezia-foreign-residents-age-sex",
    output: "lameziaForeignResidentsAgeSex.json",
    builder: "scripts/build-lamezia-foreign-residents-data.mjs",
    resourceId: "55ffccd6-5ed9-4633-a592-53dab719620b",
    detailUrl:
      "https://dataportal.maggioli.cloud/api/v1/mgg-od/datasets/detail/fc9889e0-ea84-44b1-a95d-9c6c1fa7e115?cod-ente=188067-opendata&organizations=comune-di-lamezia-terme",
  },
  {
    id: "lamezia-families-children",
    output: "lameziaFamiliesChildren.json",
    builder: "scripts/build-lamezia-families-children-data.mjs",
    resourceId: "c29d86df-a1ad-48f7-a702-1c74abcf2946",
    detailUrl:
      "https://dataportal.maggioli.cloud/api/v1/mgg-od/datasets/detail/bbd58e2a-af9f-41cb-bd32-f56410863eb4?cod-ente=188067-opendata&organizations=comune-di-lamezia-terme",
  },
];

async function main() {
  runNodeScript("scripts/check-lamezia-air-traffic-delta.mjs");
  runNodeScript("scripts/refresh-lamezia-air-traffic-data.mjs");
  runNodeScript("scripts/check-lamezia-air-traffic-delta.mjs");

  for (const series of MUNICIPAL_SERIES) {
    const local = await readGeneratedJson(series.output);
    const remote = await fetchJson(series.detailUrl);
    const resource = remote.resources?.find(
      (candidate) => candidate.id === series.resourceId,
    );

    if (!resource) {
      throw new Error(
        `${series.id}: expected resource ${series.resourceId} is missing from the official dataset metadata.`,
      );
    }

    const localMetadata = local.metadata ?? {};
    const changed =
      resource.hash !== localMetadata.resource_hash ||
      resource.lastModified !== localMetadata.resource_last_modified ||
      remote.metadataModified !== localMetadata.metadata_modified;

    if (!changed) {
      console.log(`${series.id}: official resource metadata unchanged; skipping rebuild.`);
      continue;
    }

    console.log(
      `${series.id}: official resource changed (${localMetadata.resource_hash ?? "no local hash"} -> ${resource.hash ?? "no remote hash"}); rebuilding.`,
    );
    runNodeScript(series.builder);

    const refreshed = await readGeneratedJson(series.output);
    assertMunicipalOutputMatchesSource(series, refreshed.metadata ?? {}, remote, resource);
  }

  runNodeScript("scripts/build-lamezia-opendata-series-status.mjs");
}

function assertMunicipalOutputMatchesSource(
  series,
  localMetadata,
  remote,
  resource,
) {
  const mismatches = [];
  if (localMetadata.resource_hash !== resource.hash) mismatches.push("resource hash");
  if (localMetadata.resource_last_modified !== resource.lastModified) {
    mismatches.push("resource lastModified");
  }
  if (localMetadata.metadata_modified !== remote.metadataModified) {
    mismatches.push("dataset metadataModified");
  }

  if (mismatches.length > 0) {
    throw new Error(
      `${series.id}: rebuilt output does not match official source metadata (${mismatches.join(", ")}).`,
    );
  }
}

async function readGeneratedJson(fileName) {
  return JSON.parse(await readFile(path.join(GENERATED_DIR, fileName), "utf8"));
}

function runNodeScript(relativePath) {
  const result = spawnSync(process.execPath, [path.join(REPO_ROOT, relativePath)], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`${relativePath} failed with exit code ${result.status}.`);
  }
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} while checking ${url}`);
  }

  return response.json();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
