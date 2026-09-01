import type { SpatialLayerDefinition } from "./layerRegistry";

export type BuildGeoLibreViewerUrlOptions = {
  viewerBaseUrl: string;
  layers: SpatialLayerDefinition[];
  siteOrigin: string;
  apiBaseUrl?: string | null;
  publicBaseUrl?: string | null;
  theme?: "light" | "dark" | null;
};

export type GeoLibreLayerAvailabilityStatus = "ready" | "unavailable";

export type GeoLibreLayerAvailabilityReason =
  | "missing_data_path"
  | "http_error"
  | "invalid_content_type"
  | "invalid_url"
  | "network_error"
  | "timeout"
  | null;

export type GeoLibreLayerAvailability = {
  layer: SpatialLayerDefinition;
  dataUrl: string | null;
  status: GeoLibreLayerAvailabilityStatus;
  httpStatus: number | null;
  contentType: string | null;
  reason: GeoLibreLayerAvailabilityReason;
  distribution: "primary" | "continuity_fallback" | null;
  primaryDataUrl: string | null;
  primaryHttpStatus: number | null;
  primaryReason: GeoLibreLayerAvailabilityReason;
};

export type CheckGeoLibreLayerAvailabilityOptions = {
  layers: SpatialLayerDefinition[];
  siteOrigin: string;
  apiBaseUrl?: string | null;
  publicBaseUrl?: string | null;
  signal?: AbortSignal;
  timeoutMs?: number;
  fetcher?: typeof fetch;
};

export type SpatialPublicationManifestLayer = {
  layer_id: string;
  primary_data_path: string;
  data_path: string;
  distribution_role: "primary" | "continuity_fallback";
  media_type: "application/geo+json";
  distribution_status: "published";
  content_status: "populated" | "empty_by_policy";
  feature_count: number;
  excluded_feature_count: number;
  sha256: string;
  source_label: string;
  licence: string;
  source_modified: string | null;
  publication_note: string;
};

export type SpatialPublicationManifest = {
  schema_version: "1.0";
  generated_at: string;
  scope: {
    municipality: "Lamezia Terme";
    istat_code: "079160";
  };
  publication_policy: "default-deny";
  layers: SpatialPublicationManifestLayer[];
};

export type LoadSpatialPublicationManifestOptions = {
  layers: SpatialLayerDefinition[];
  siteOrigin: string;
  publicBaseUrl?: string | null;
  signal?: AbortSignal;
  fetcher?: typeof fetch;
};

const DEFAULT_LAYER_AVAILABILITY_TIMEOUT_MS = 8_000;
export const SPATIAL_PUBLICATION_MANIFEST_PATH =
  "/data/processed/territorio/spatial_layer_manifest.json";

export function isGeoLibrePilotEnabled(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

export function buildGeoLibreViewerUrl({
  viewerBaseUrl,
  layers,
  siteOrigin,
  apiBaseUrl = null,
  publicBaseUrl = null,
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
      resolveSpatialDataUrl(
        layer.dataPath,
        siteOrigin,
        apiBaseUrl,
        publicBaseUrl,
      ),
    );
  }

  return viewerUrl.toString();
}

/**
 * Verifica i feed prima di passarli al viewer ospitato su un'altra origine.
 * La sorgente primaria resta preferita. Un fallback viene usato soltanto quando
 * è dichiarato nel registry e supera autonomamente la verifica GeoJSON.
 */
export async function checkGeoLibreLayerAvailability({
  layers,
  siteOrigin,
  apiBaseUrl = null,
  publicBaseUrl = null,
  signal,
  timeoutMs = DEFAULT_LAYER_AVAILABILITY_TIMEOUT_MS,
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
          distribution: null,
          primaryDataUrl: null,
          primaryHttpStatus: null,
          primaryReason: "missing_data_path",
        };
      }

      const primary = await probeGeoJsonDistribution({
        dataPath: layer.dataPath,
        siteOrigin,
        apiBaseUrl,
        publicBaseUrl,
        signal,
        timeoutMs,
        fetcher,
      });
      if (
        primary.status === "ready" ||
        !layer.fallbackDataPath ||
        layer.fallbackDataPath === layer.dataPath ||
        signal?.aborted
      ) {
        return {
          layer,
          ...primary,
          distribution: primary.status === "ready" ? "primary" : null,
          primaryDataUrl: primary.dataUrl,
          primaryHttpStatus: primary.httpStatus,
          primaryReason: primary.reason,
        };
      }

      const fallback = await probeGeoJsonDistribution({
        dataPath: layer.fallbackDataPath,
        siteOrigin,
        apiBaseUrl,
        publicBaseUrl,
        signal,
        timeoutMs,
        fetcher,
      });
      return {
        layer,
        ...fallback,
        distribution:
          fallback.status === "ready" ? "continuity_fallback" : null,
        primaryDataUrl: primary.dataUrl,
        primaryHttpStatus: primary.httpStatus,
        primaryReason: primary.reason,
      };
    }),
  );
}

type GeoJsonDistributionProbe = Pick<
  GeoLibreLayerAvailability,
  "dataUrl" | "status" | "httpStatus" | "contentType" | "reason"
>;

async function probeGeoJsonDistribution({
  dataPath,
  siteOrigin,
  apiBaseUrl,
  publicBaseUrl,
  signal,
  timeoutMs,
  fetcher,
}: {
  dataPath: string;
  siteOrigin: string;
  apiBaseUrl: string | null;
  publicBaseUrl: string | null;
  signal?: AbortSignal;
  timeoutMs: number;
  fetcher: typeof fetch;
}): Promise<GeoJsonDistributionProbe> {
  let dataUrl: string;
  try {
    dataUrl = resolveSpatialDataUrl(
      dataPath,
      siteOrigin,
      apiBaseUrl,
      publicBaseUrl,
    );
  } catch {
    return {
      dataUrl: null,
      status: "unavailable",
      httpStatus: null,
      contentType: null,
      reason: "invalid_url",
    };
  }

  const requestController = new AbortController();
  const abortRequest = () => requestController.abort(signal?.reason);
  if (signal?.aborted) abortRequest();
  else signal?.addEventListener("abort", abortRequest, { once: true });

  let didTimeout = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      didTimeout = true;
      requestController.abort();
      reject(new Error("GeoLibre layer availability timeout"));
    }, normalizeTimeoutMs(timeoutMs));
  });

  try {
    const response = await Promise.race([
      fetcher(dataUrl, {
        method: "HEAD",
        cache: "no-store",
        credentials: "omit",
        signal: requestController.signal,
      }),
      timeoutPromise,
    ]);
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      return {
        dataUrl,
        status: "unavailable",
        httpStatus: response.status,
        contentType,
        reason: "http_error",
      };
    }

    if (!isGeoJsonContentType(contentType)) {
      return {
        dataUrl,
        status: "unavailable",
        httpStatus: response.status,
        contentType,
        reason: "invalid_content_type",
      };
    }

    return {
      dataUrl,
      status: "ready",
      httpStatus: response.status,
      contentType,
      reason: null,
    };
  } catch {
    return {
      dataUrl,
      status: "unavailable",
      httpStatus: null,
      contentType: null,
      reason: didTimeout ? "timeout" : "network_error",
    };
  } finally {
    if (timeoutId !== null) clearTimeout(timeoutId);
    signal?.removeEventListener("abort", abortRequest);
  }
}

/**
 * Legge il manifest corredato dai digest degli snapshot e verifica il legame
 * tra sorgente primaria e distribuzione statica dichiarate nel registry.
 */
export async function loadSpatialPublicationManifest({
  layers,
  siteOrigin,
  publicBaseUrl = null,
  signal,
  fetcher = fetch,
}: LoadSpatialPublicationManifestOptions): Promise<SpatialPublicationManifest> {
  const manifestUrl = resolveSpatialDataUrl(
    SPATIAL_PUBLICATION_MANIFEST_PATH,
    siteOrigin,
    null,
    publicBaseUrl,
  );
  const response = await fetcher(manifestUrl, {
    method: "GET",
    cache: "no-store",
    credentials: "omit",
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(
      `Spatial publication manifest unavailable (${response.status})`,
    );
  }
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("Spatial publication manifest is not JSON");
  }

  const value = (await response.json()) as unknown;
  if (!isSpatialPublicationManifest(value)) {
    throw new Error("Invalid spatial publication manifest");
  }

  const manifestByLayerId = new Map(
    value.layers.map((manifestLayer) => [
      manifestLayer.layer_id,
      manifestLayer,
    ]),
  );
  if (manifestByLayerId.size !== value.layers.length) {
    throw new Error("Spatial publication manifest contains duplicate layers");
  }
  if (manifestByLayerId.size !== layers.length) {
    throw new Error("Spatial publication manifest layer count mismatch");
  }
  for (const layer of layers) {
    const manifestLayer = manifestByLayerId.get(layer.id);
    const snapshotPath = layer.fallbackDataPath ?? layer.dataPath;
    const expectedRole = layer.fallbackDataPath
      ? "continuity_fallback"
      : "primary";
    if (
      !manifestLayer ||
      manifestLayer.primary_data_path !== layer.dataPath ||
      manifestLayer.data_path !== snapshotPath ||
      manifestLayer.distribution_role !== expectedRole
    ) {
      throw new Error(`Spatial publication manifest mismatch for ${layer.id}`);
    }
  }

  return value;
}

export function resolveSpatialDataUrl(
  dataPath: string,
  siteOrigin: string,
  apiBaseUrl?: string | null,
  publicBaseUrl?: string | null,
): string {
  if (/^https?:\/\//i.test(dataPath)) return dataPath;

  const normalizedApiBaseUrl = apiBaseUrl?.trim() ?? "";
  const normalizedPublicBaseUrl = publicBaseUrl?.trim() ?? "";
  const baseUrl = dataPath.startsWith("/api/")
    ? normalizedApiBaseUrl || siteOrigin
    : normalizedPublicBaseUrl || siteOrigin;

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

function isSpatialPublicationManifest(
  value: unknown,
): value is SpatialPublicationManifest {
  if (!value || typeof value !== "object") return false;
  const manifest = value as Partial<SpatialPublicationManifest>;
  if (
    manifest.schema_version !== "1.0" ||
    manifest.publication_policy !== "default-deny" ||
    manifest.scope?.municipality !== "Lamezia Terme" ||
    manifest.scope.istat_code !== "079160" ||
    typeof manifest.generated_at !== "string" ||
    !Number.isFinite(Date.parse(manifest.generated_at)) ||
    !Array.isArray(manifest.layers)
  ) {
    return false;
  }

  return manifest.layers.every((layer) => {
    if (!layer || typeof layer !== "object") return false;
    return (
      typeof layer.layer_id === "string" &&
      typeof layer.primary_data_path === "string" &&
      (layer.primary_data_path.startsWith("/api/") ||
        layer.primary_data_path.startsWith("/data/processed/territorio/")) &&
      typeof layer.data_path === "string" &&
      layer.data_path.startsWith("/data/processed/territorio/") &&
      (layer.distribution_role === "primary" ||
        layer.distribution_role === "continuity_fallback") &&
      layer.media_type === "application/geo+json" &&
      layer.distribution_status === "published" &&
      (layer.content_status === "populated" ||
        layer.content_status === "empty_by_policy") &&
      Number.isInteger(layer.feature_count) &&
      layer.feature_count >= 0 &&
      Number.isInteger(layer.excluded_feature_count) &&
      layer.excluded_feature_count >= 0 &&
      /^[a-f0-9]{64}$/.test(layer.sha256) &&
      typeof layer.source_label === "string" &&
      typeof layer.licence === "string" &&
      (layer.source_modified === null ||
        typeof layer.source_modified === "string") &&
      typeof layer.publication_note === "string"
    );
  });
}

function normalizeTimeoutMs(value: number): number {
  return Number.isFinite(value) && value >= 0
    ? value
    : DEFAULT_LAYER_AVAILABILITY_TIMEOUT_MS;
}
