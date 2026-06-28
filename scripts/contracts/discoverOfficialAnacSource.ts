import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type {
  ContractSourceDiscoveryCheckedBy,
  ContractSourceDiscoveryFormat,
  ContractSourceDiscoveryFreshnessLabel,
  ContractSourceDiscoveryMetadata,
  ContractSourceDiscoveryStatus,
} from "../../artifacts/lamezia-trasparente/src/lib/contractsSourceManifest";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, "..", "..");
const DEFAULT_MANIFEST_PATH = join(
  REPO_ROOT,
  "data",
  "sources",
  "contracts",
  "contracts-source-manifest.json",
);
const DEFAULT_REPORT_DIR = join(
  REPO_ROOT,
  "data",
  "interim",
  "contracts",
  "source-discovery",
);
const MAX_METADATA_BYTES = 16_384;
const DEFAULT_TIMEOUT_MS = 15_000;

export type DiscoveryVerificationResult = ContractSourceDiscoveryStatus;

export interface ManifestSourceForDiscovery {
  id: string;
  label: string;
  authority: string;
  official_url: string | null;
  ingestion_status: string;
  public_claim_level: string;
}

export interface DiscoveryCandidate {
  source_id: string;
  landing_page_url: string | null;
  package_search_url: string | null;
  checked_by: ContractSourceDiscoveryCheckedBy;
  freshness_label: ContractSourceDiscoveryFreshnessLabel;
  version_hint: string | null;
  notes: string[];
  next_parser_action: string;
}

export interface SourceDiscoveryProbeRequest {
  method: "HEAD" | "GET";
  maxBytes: number;
  timeoutMs: number;
}

export interface SourceDiscoveryProbe {
  url: string;
  method: "HEAD" | "GET";
  ok: boolean;
  status: number | null;
  content_type: string | null;
  content_length: number | null;
  detected_format: ContractSourceDiscoveryFormat;
  body_preview?: string;
  rejected_by_gateway?: boolean;
  error?: string;
}

export interface OfficialAnacDiscoveryReport {
  schema_version: "contracts-source-discovery-report.v1";
  source_id: string;
  checked_at: string;
  checked_by: ContractSourceDiscoveryCheckedBy;
  official_url_used: string | null;
  landing_page_url: string | null;
  package_url: string | null;
  sample_file_url: string | null;
  verification_result: DiscoveryVerificationResult;
  detected_content_type: string | null;
  detected_format: ContractSourceDiscoveryFormat;
  freshness_label: ContractSourceDiscoveryFreshnessLabel;
  version_hint: string | null;
  suitable_for_parser: boolean;
  production_records_written: false;
  public_app_data_written: false;
  limitations: string[];
  next_parser_action: string;
  discovery_metadata: ContractSourceDiscoveryMetadata;
  probes: SourceDiscoveryProbe[];
}

export interface DiscoverOfficialAnacSourceResult {
  report: OfficialAnacDiscoveryReport;
  reportPath: string;
}

export interface DiscoverOfficialAnacSourceOptions {
  manifestPath?: string;
  reportDir?: string;
  now?: Date;
  probeUrl?: (
    url: string,
    request: SourceDiscoveryProbeRequest,
  ) => Promise<SourceDiscoveryProbe>;
  candidateCatalog?: Record<string, DiscoveryCandidate>;
}

export const DEFAULT_ANAC_DISCOVERY_CANDIDATES: Record<
  string,
  DiscoveryCandidate
> = {
  "anac-open-data-cig-annual": {
    source_id: "anac-open-data-cig-annual",
    landing_page_url: "https://dati.anticorruzione.it/opendata/",
    package_search_url:
      "https://dati.anticorruzione.it/opendata/api/3/action/package_search?q=CIG",
    checked_by: "codex",
    freshness_label: "annual",
    version_hint: null,
    notes: [
      "Discovery spike limitato a metadata e disponibilita, senza download di record reali.",
      "Endpoint/pacchetto annuale CIG da confermare su fonte ufficiale prima del parser.",
    ],
    next_parser_action:
      "Verificare manualmente il pacchetto annuale ufficiale, quindi fissare schema, versione e fixture metadata-only prima del parser reale.",
  },
};

export async function discoverOfficialAnacSource(
  sourceId: string,
  options: DiscoverOfficialAnacSourceOptions = {},
): Promise<DiscoverOfficialAnacSourceResult> {
  const manifestPath = options.manifestPath ?? DEFAULT_MANIFEST_PATH;
  const reportDir = options.reportDir ?? DEFAULT_REPORT_DIR;
  const source = await readManifestSource(manifestPath, sourceId);
  const candidate =
    options.candidateCatalog?.[sourceId] ??
    DEFAULT_ANAC_DISCOVERY_CANDIDATES[sourceId] ??
    candidateFromManifestSource(source);
  const probeUrl = options.probeUrl ?? defaultProbeUrl;
  const checkedAt = (options.now ?? new Date()).toISOString();
  const probes: SourceDiscoveryProbe[] = [];

  if (!source.authority.toLowerCase().includes("anac")) {
    throw new Error(
      `Source ${sourceId} is not an ANAC source family and is out of scope for this spike.`,
    );
  }

  if (candidate.landing_page_url) {
    probes.push(
      await probeUrl(candidate.landing_page_url, {
        method: "HEAD",
        maxBytes: 0,
        timeoutMs: DEFAULT_TIMEOUT_MS,
      }),
    );
  }

  if (candidate.package_search_url) {
    probes.push(
      await probeUrl(candidate.package_search_url, {
        method: "GET",
        maxBytes: MAX_METADATA_BYTES,
        timeoutMs: DEFAULT_TIMEOUT_MS,
      }),
    );
  }

  const report = buildDiscoveryReport({
    source,
    candidate,
    probes,
    checkedAt,
  });
  const reportPath = await writeDiscoveryReport(report, reportDir);

  return { report, reportPath };
}

export function buildDiscoveryReport(input: {
  source: ManifestSourceForDiscovery;
  candidate: DiscoveryCandidate;
  probes: SourceDiscoveryProbe[];
  checkedAt: string;
}): OfficialAnacDiscoveryReport {
  const { source, candidate, probes, checkedAt } = input;
  const metadataResult = deriveVerifiedPackageFromProbes(probes);
  const landingProbe = probes.find(
    (probe) => probe.url === candidate.landing_page_url,
  );
  const packageProbe = probes.find(
    (probe) => probe.url === candidate.package_search_url,
  );
  const failedProbe = probes.find((probe) => probe.error);
  const unavailableProbe = probes.find(
    (probe) => probe.status !== null && probe.status >= 400,
  );
  const gatewayRejected = probes.find((probe) => probe.rejected_by_gateway);
  const verified = metadataResult !== null;
  const verificationResult: DiscoveryVerificationResult = verified
    ? "verified"
    : unavailableProbe
      ? "unavailable"
      : failedProbe
        ? "needs_manual_verification"
        : "needs_manual_verification";
  const detectedContentType =
    metadataResult?.content_type ??
    packageProbe?.content_type ??
    landingProbe?.content_type ??
    null;
  const detectedFormat =
    metadataResult?.detected_format ??
    packageProbe?.detected_format ??
    landingProbe?.detected_format ??
    "unknown";
  const limitations = [
    ...candidate.notes,
    ...limitationsForProbeState({
      verified,
      gatewayRejected: Boolean(gatewayRejected),
      failedProbe,
      unavailableProbe,
      source,
    }),
  ];
  const discoveryMetadata: ContractSourceDiscoveryMetadata = {
    discovery_status: verificationResult,
    checked_at: checkedAt,
    checked_by: candidate.checked_by,
    verified_url: metadataResult?.verified_url ?? null,
    landing_page_url: candidate.landing_page_url,
    package_url: metadataResult?.package_url ?? null,
    sample_file_url: metadataResult?.sample_file_url ?? null,
    detected_format: detectedFormat,
    freshness_label: candidate.freshness_label,
    version_hint: metadataResult?.version_hint ?? candidate.version_hint,
    notes: limitations,
  };

  return {
    schema_version: "contracts-source-discovery-report.v1",
    source_id: source.id,
    checked_at: checkedAt,
    checked_by: candidate.checked_by,
    official_url_used: source.official_url,
    landing_page_url: candidate.landing_page_url,
    package_url: discoveryMetadata.package_url,
    sample_file_url: discoveryMetadata.sample_file_url,
    verification_result: verificationResult,
    detected_content_type: detectedContentType,
    detected_format: detectedFormat,
    freshness_label: candidate.freshness_label,
    version_hint: discoveryMetadata.version_hint,
    suitable_for_parser: verified,
    production_records_written: false,
    public_app_data_written: false,
    limitations,
    next_parser_action: verified
      ? "Creare parser schema-specifico con fixture minimali metadata-only e gate di revisione umana prima della pubblicazione."
      : candidate.next_parser_action,
    discovery_metadata: discoveryMetadata,
    probes,
  };
}

export async function defaultProbeUrl(
  url: string,
  request: SourceDiscoveryProbeRequest,
): Promise<SourceDiscoveryProbe> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), request.timeoutMs);

  try {
    const response = await fetch(url, {
      method: request.method,
      redirect: "follow",
      signal: controller.signal,
      headers:
        request.method === "GET"
          ? {
              Range: `bytes=0-${request.maxBytes - 1}`,
              Accept: "application/json, text/plain;q=0.9, */*;q=0.1",
            }
          : undefined,
    });
    const contentType = response.headers.get("content-type");
    const contentLength = parseContentLength(
      response.headers.get("content-length"),
    );
    const rawBodyPreview =
      request.method === "GET"
        ? (await response.text()).slice(0, request.maxBytes)
        : undefined;
    const rejectedByGateway = isGatewayRejection(rawBodyPreview);
    const bodyPreview = rejectedByGateway
      ? "Request Rejected by gateway"
      : rawBodyPreview;

    return {
      url,
      method: request.method,
      ok: response.ok,
      status: response.status,
      content_type: contentType,
      content_length: contentLength,
      detected_format: detectFormat(contentType, url),
      ...(bodyPreview ? { body_preview: bodyPreview } : {}),
      rejected_by_gateway: rejectedByGateway,
    };
  } catch (error) {
    return {
      url,
      method: request.method,
      ok: false,
      status: null,
      content_type: null,
      content_length: null,
      detected_format: "unknown",
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function readManifestSource(
  manifestPath: string,
  sourceId: string,
): Promise<ManifestSourceForDiscovery> {
  const payload = JSON.parse(await readFile(manifestPath, "utf8")) as {
    sources?: unknown;
  };

  if (!Array.isArray(payload.sources)) {
    throw new Error(`Manifest ${manifestPath} does not contain sources[].`);
  }

  const source = payload.sources.find(
    (item): item is ManifestSourceForDiscovery =>
      isManifestSource(item) && item.id === sourceId,
  );

  if (!source) {
    throw new Error(`Source ${sourceId} not found in ${manifestPath}.`);
  }

  return source;
}

function isManifestSource(value: unknown): value is ManifestSourceForDiscovery {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "authority" in value
  );
}

function candidateFromManifestSource(
  source: ManifestSourceForDiscovery,
): DiscoveryCandidate {
  return {
    source_id: source.id,
    landing_page_url: source.official_url,
    package_search_url: null,
    checked_by: "codex",
    freshness_label: "unknown",
    version_hint: null,
    notes: [
      "Nessun endpoint strutturato noto nello spike: discovery metadata da verificare manualmente.",
    ],
    next_parser_action:
      "Identificare URL ufficiale stabile e schema prima di implementare un parser.",
  };
}

async function writeDiscoveryReport(
  report: OfficialAnacDiscoveryReport,
  reportDir: string,
): Promise<string> {
  assertSafeReportDir(reportDir);
  await mkdir(reportDir, { recursive: true });

  const reportPath = join(reportDir, `${report.source_id}.discovery.json`);
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  return reportPath;
}

function assertSafeReportDir(reportDir: string): void {
  const normalized = resolve(reportDir).toLowerCase();
  const forbiddenFragments = [
    `${resolve(REPO_ROOT, "data", "public").toLowerCase()}`,
    `${resolve(REPO_ROOT, "artifacts", "lamezia-trasparente", "public").toLowerCase()}`,
    `${resolve(REPO_ROOT, "artifacts", "lamezia-trasparente", "src", "data").toLowerCase()}`,
  ];

  if (forbiddenFragments.some((fragment) => normalized.startsWith(fragment))) {
    throw new Error(
      "Discovery reports must stay out of public app data directories.",
    );
  }
}

function deriveVerifiedPackageFromProbes(probes: SourceDiscoveryProbe[]): {
  verified_url: string;
  package_url: string;
  sample_file_url: string | null;
  detected_format: ContractSourceDiscoveryFormat;
  content_type: string | null;
  version_hint: string | null;
} | null {
  for (const probe of probes) {
    if (!probe.ok || probe.rejected_by_gateway) {
      continue;
    }

    const ckanResource = extractCkanResource(probe.body_preview);
    if (ckanResource) {
      return {
        verified_url: ckanResource.url,
        package_url: probe.url,
        sample_file_url: ckanResource.url,
        detected_format: ckanResource.detected_format,
        content_type: probe.content_type,
        version_hint: ckanResource.version_hint,
      };
    }

    if (isStructuredFileFormat(probe.detected_format)) {
      return {
        verified_url: probe.url,
        package_url: probe.url,
        sample_file_url: null,
        detected_format: probe.detected_format,
        content_type: probe.content_type,
        version_hint: null,
      };
    }
  }

  return null;
}

function extractCkanResource(bodyPreview: string | undefined): {
  url: string;
  detected_format: ContractSourceDiscoveryFormat;
  version_hint: string | null;
} | null {
  if (!bodyPreview) {
    return null;
  }

  try {
    const payload = JSON.parse(bodyPreview) as {
      success?: boolean;
      result?: {
        results?: Array<{
          title?: string;
          name?: string;
          version?: string;
          resources?: Array<{
            url?: string;
            format?: string;
            mimetype?: string;
            name?: string;
          }>;
        }>;
      };
    };

    if (payload.success === false || !Array.isArray(payload.result?.results)) {
      return null;
    }

    for (const result of payload.result.results) {
      for (const resource of result.resources ?? []) {
        if (!resource.url || !resource.url.startsWith("https://")) {
          continue;
        }

        const detectedFormat = detectFormat(
          resource.mimetype ?? resource.format ?? null,
          resource.url,
        );

        if (isStructuredFileFormat(detectedFormat)) {
          return {
            url: resource.url,
            detected_format: detectedFormat,
            version_hint: result.version ?? result.name ?? result.title ?? null,
          };
        }
      }
    }
  } catch {
    return null;
  }

  return null;
}

function limitationsForProbeState(input: {
  verified: boolean;
  gatewayRejected: boolean;
  failedProbe: SourceDiscoveryProbe | undefined;
  unavailableProbe: SourceDiscoveryProbe | undefined;
  source: ManifestSourceForDiscovery;
}): string[] {
  if (input.verified) {
    return [
      "Metadata strutturati individuati: la discovery non scarica e non pubblica record reali.",
      "La pubblicazione di record in /contratti richiede parser dedicato e gate di revisione umana.",
    ];
  }

  const limitations = [
    "URL ufficiale da verificare manualmente prima dell'ingestione",
    "La discovery non ha verificato un endpoint strutturato stabile per parser reale.",
    "Nessun record ANAC reale e stato scritto in directory pubbliche o dati applicativi.",
  ];

  if (input.gatewayRejected) {
    limitations.push(
      "Il gateway del portale ANAC ha respinto la query metadata leggera in questo ambiente.",
    );
  }

  if (input.failedProbe) {
    limitations.push(`Probe non riuscito: ${input.failedProbe.error}`);
  }

  if (input.unavailableProbe) {
    limitations.push(
      `Probe non disponibile: HTTP ${input.unavailableProbe.status}.`,
    );
  }

  if (input.source.public_claim_level === "ingested") {
    limitations.push(
      "Lo stato pubblico ingested della fonte esistente non deriva da questa discovery ANAC.",
    );
  }

  return limitations;
}

function detectFormat(
  contentType: string | null,
  url: string,
): ContractSourceDiscoveryFormat {
  const haystack = `${contentType ?? ""} ${url}`.toLowerCase();

  if (haystack.includes("ocds")) return "ocds_json";
  if (haystack.includes("json")) return "json";
  if (haystack.includes("csv")) return "csv";
  if (haystack.includes("xml")) return "xml";
  if (haystack.includes("zip")) return "zip";
  if (haystack.includes("html")) return "html";

  return "unknown";
}

function isStructuredFileFormat(
  format: ContractSourceDiscoveryFormat,
): boolean {
  return ["csv", "json", "xml", "zip", "ocds_json"].includes(format);
}

function isGatewayRejection(bodyPreview: string | undefined): boolean {
  return /request rejected|support id/i.test(bodyPreview ?? "");
}

function parseContentLength(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function main(): Promise<void> {
  const sourceId = process.argv[2];

  if (!sourceId) {
    throw new Error(
      "Usage: node scripts/contracts/discoverOfficialAnacSource.ts <source-id>",
    );
  }

  const { report, reportPath } = await discoverOfficialAnacSource(sourceId);
  console.log(
    JSON.stringify(
      {
        report_path: reportPath,
        source_id: report.source_id,
        verification_result: report.verification_result,
        suitable_for_parser: report.suitable_for_parser,
        public_app_data_written: report.public_app_data_written,
      },
      null,
      2,
    ),
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
