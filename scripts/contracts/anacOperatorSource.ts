import { ANAC_CKAN_PACKAGE_SHOW_URL } from "./anacCkanDiscovery";
import { datasetConfig, type AnacOperatorDataset } from "./anacOperators";

export { ANAC_CKAN_PACKAGE_SHOW_URL };

export function canonicalOperatorArchiveUrl(dataset: AnacOperatorDataset): string {
  const id = datasetConfig(dataset).id;
  return `https://dati.anticorruzione.it/opendata/download/dataset/${id}/filesystem/${id}_csv.zip`;
}

export function selectAnacOperatorArchive(payload: unknown, dataset: AnacOperatorDataset): string | null {
  if (!isRecord(payload) || payload.success !== true || !isRecord(payload.result)) return null;
  if (!Array.isArray(payload.result.resources)) return null;
  const id = datasetConfig(dataset).id;
  const candidates = payload.result.resources
    .filter(isRecord)
    .map((resource) => ({
      url: typeof resource.url === "string" ? resource.url.trim() : "",
      name: typeof resource.name === "string" ? resource.name.toLowerCase() : "",
      format: typeof resource.format === "string" ? resource.format.toLowerCase() : "",
    }))
    .filter((resource) => isDatasetZip(resource.url, id))
    .map((resource) => ({
      ...resource,
      score: (resource.url.includes(`${id}_csv.zip`) ? 10 : 0) + (resource.name.includes("csv") || resource.format.includes("csv") ? 3 : 0),
    }))
    .filter((resource) => resource.score > 0)
    .sort((a, b) => b.score - a.score || a.url.localeCompare(b.url));
  return candidates[0]?.url ?? null;
}

export function isOfficialAnacHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "anticorruzione.it" || url.hostname.endsWith(".anticorruzione.it"));
  } catch {
    return false;
  }
}

function isDatasetZip(value: string, datasetId: string): boolean {
  if (!isOfficialAnacHttpsUrl(value)) return false;
  const url = new URL(value);
  return /\.zip$/iu.test(url.pathname) && url.pathname.includes(`/dataset/${datasetId}/`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
