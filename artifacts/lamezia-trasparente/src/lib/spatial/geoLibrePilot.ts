import type { SpatialLayerDefinition } from "./layerRegistry";

export type BuildGeoLibreViewerUrlOptions = {
  viewerBaseUrl: string;
  layers: SpatialLayerDefinition[];
  siteOrigin: string;
  apiBaseUrl?: string | null;
  theme?: "light" | "dark" | null;
};

export function isGeoLibrePilotEnabled(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

export function buildGeoLibreViewerUrl({
  viewerBaseUrl,
  layers,
  siteOrigin,
  apiBaseUrl = null,
  theme = null,
}: BuildGeoLibreViewerUrlOptions): string {
  const viewerUrl = new URL(viewerBaseUrl);
  viewerUrl.search = "";
  viewerUrl.searchParams.set("layout", "viewer");
  viewerUrl.searchParams.set("panels", "collapsed");

  if (theme) {
    viewerUrl.searchParams.set("theme", theme);
  }

  for (const layer of layers) {
    if (!layer.dataPath) continue;
    viewerUrl.searchParams.append(
      "data",
      resolveSpatialDataUrl(layer.dataPath, siteOrigin, apiBaseUrl),
    );
  }

  return viewerUrl.toString();
}

export function resolveSpatialDataUrl(
  dataPath: string,
  siteOrigin: string,
  apiBaseUrl?: string | null,
): string {
  if (/^https?:\/\//i.test(dataPath)) return dataPath;

  const normalizedApiBaseUrl = apiBaseUrl?.trim() ?? "";
  const baseUrl =
    dataPath.startsWith("/api/") && normalizedApiBaseUrl
      ? normalizedApiBaseUrl
      : siteOrigin;

  return appendPathToBaseUrl(baseUrl, dataPath, siteOrigin);
}

function appendPathToBaseUrl(
  baseUrl: string,
  dataPath: string,
  siteOrigin: string,
): string {
  const url = new URL(ensureTrailingSlash(baseUrl), siteOrigin);
  const basePath = url.pathname.replace(/\/$/, "");
  const suffix = dataPath.startsWith("/") ? dataPath : `/${dataPath}`;

  url.pathname = `${basePath}${suffix}`.replace(/\/{2,}/g, "/");
  url.search = "";
  url.hash = "";
  return url.toString();
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}
