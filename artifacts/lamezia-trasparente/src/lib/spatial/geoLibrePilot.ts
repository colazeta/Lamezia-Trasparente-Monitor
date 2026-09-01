import type { SpatialLayerDefinition } from "./layerRegistry";

export type BuildGeoLibreViewerUrlOptions = {
  viewerBaseUrl: string;
  layers: SpatialLayerDefinition[];
  siteOrigin: string;
  apiBaseUrl?: string | null;
  theme?: "light" | "dark" | null;
};

export type GeoLibreLayerAvailabilityStatus = "ready" | "unavailable";

export type GeoLibreLayerAvailability = {
  layer: SpatialLayerDefinition;
  dataUrl: string | null;
  status: GeoLibreLayerAvailabilityStatus;
  httpStatus: number | null;
  contentType: string | null;
  reason:
    | "missing_data_path"
    | "http_error"
    | "invalid_content_type"
    | "network_error"
    | null;
};

export type CheckGeoLibreLayerAvailabilityOptions = {
  layers: SpatialLayerDefinition[];
  siteOrigin: string;
  apiBaseUrl?: string | null;
  signal?: AbortSignal;
  fetcher?: typeof fetch;
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

/**
 * Verifica i feed prima di passarli al viewer ospitato su un'altra origine.
 * Un errore resta esplicito e il layer non viene trasformato in un dataset vuoto.
 */
export async function checkGeoLibreLayerAvailability({
  layers,
  siteOrigin,
  apiBaseUrl = null,
  signal,
  fetcher = fetch,
}: CheckGeoLibreLayerAvailabilityOptions): Promise<
  GeoLibreLayerAvailability[]
> {
  return Promise.all(
    layers.map(async (layer): Promise<GeoLibreLayerAvailability> => {
      if (!layer.dataPath) {
        return {
          layer,
          dataUrl: null,
          status: "unavailable",
          httpStatus: null,
          contentType: null,
          reason: "missing_data_path",
        };
      }

      const dataUrl = resolveSpatialDataUrl(
        layer.dataPath,
        siteOrigin,
        apiBaseUrl,
      );

      try {
        const response = await fetcher(dataUrl, {
          method: "HEAD",
          cache: "no-store",
          credentials: "omit",
          signal,
        });
        const contentType = response.headers.get("content-type");

        if (!response.ok) {
          return {
            layer,
            dataUrl,
            status: "unavailable",
            httpStatus: response.status,
            contentType,
            reason: "http_error",
          };
        }

        if (!isGeoJsonContentType(contentType)) {
          return {
            layer,
            dataUrl,
            status: "unavailable",
            httpStatus: response.status,
            contentType,
            reason: "invalid_content_type",
          };
        }

        return {
          layer,
          dataUrl,
          status: "ready",
          httpStatus: response.status,
          contentType,
          reason: null,
        };
      } catch {
        return {
          layer,
          dataUrl,
          status: "unavailable",
          httpStatus: null,
          contentType: null,
          reason: "network_error",
        };
      }
    }),
  );
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

function isGeoJsonContentType(value: string | null): boolean {
  const normalized = value?.toLowerCase() ?? "";
  return (
    normalized.includes("application/json") || normalized.includes("geo+json")
  );
}
