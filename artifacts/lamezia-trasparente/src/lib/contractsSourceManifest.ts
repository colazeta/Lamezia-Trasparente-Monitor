import manifestPayload from "../../../../data/sources/contracts/contracts-source-manifest.json";

export const CONTRACT_SOURCE_ACCESS_TYPES = [
  "open_data",
  "portal_search",
  "documented_api",
  "manual_download",
  "unknown",
] as const;

export const CONTRACT_SOURCE_AXES = [
  "procedure",
  "contract",
  "lot",
  "publication",
  "operator",
  "project_work",
  "payment",
  "mixed",
] as const;

export const CONTRACT_SOURCE_IDENTIFIERS = [
  "CIG",
  "CUP",
  "publication_id",
  "operator_id",
  "procedure_id",
  "lot_id",
  "internal_id",
  "project_id",
  "award_id",
  "contract_id",
  "ocid",
  "work_id",
] as const;

export const CONTRACT_SOURCE_FORMATS = [
  "csv",
  "json",
  "xml",
  "ocds_json",
  "zip",
  "html_search",
  "unknown",
] as const;

export const CONTRACT_SOURCE_UPDATE_MODES = [
  "full_dump",
  "delta",
  "daily",
  "periodic",
  "manual",
  "unknown",
] as const;

export const CONTRACT_SOURCE_LIFECYCLE_PHASES = [
  "programmazione",
  "progettazione",
  "gara_pubblicazione",
  "affidamento",
  "esecuzione",
  "valutazione_collaudo_esito",
] as const;

export const CONTRACT_SOURCE_INGESTION_STATUSES = [
  "not_implemented",
  "link_bridge",
  "discovery_manifest",
  "parser_skeleton",
  "ready_for_parser",
  "implemented",
] as const;

export const CONTRACT_SOURCE_PUBLIC_CLAIM_LEVELS = [
  "none",
  "linked_only",
  "fixture_only",
  "ingestion_ready",
  "ingested",
] as const;

export const CONTRACT_SOURCE_DISCOVERY_STATUSES = [
  "not_checked",
  "verified",
  "needs_manual_verification",
  "unavailable",
  "failed",
] as const;

export const CONTRACT_SOURCE_DISCOVERY_CHECKED_BY = [
  "codex",
  "manual",
  "ci",
] as const;

export const CONTRACT_SOURCE_DISCOVERY_FORMATS = [
  "csv",
  "json",
  "xml",
  "zip",
  "ocds_json",
  "html",
  "unknown",
] as const;

export const CONTRACT_SOURCE_DISCOVERY_FRESHNESS_LABELS = [
  "daily",
  "periodic",
  "annual",
  "delta",
  "unknown",
] as const;

export const CONTRACT_SOURCE_MANUAL_VERIFICATION_LIMIT =
  "URL ufficiale da verificare manualmente prima dell'ingestione";

export type ContractSourceAccessType =
  (typeof CONTRACT_SOURCE_ACCESS_TYPES)[number];
export type ContractSourceAxis = (typeof CONTRACT_SOURCE_AXES)[number];
export type ContractSourceIdentifier =
  (typeof CONTRACT_SOURCE_IDENTIFIERS)[number];
export type ContractSourceFormat = (typeof CONTRACT_SOURCE_FORMATS)[number];
export type ContractSourceUpdateMode =
  (typeof CONTRACT_SOURCE_UPDATE_MODES)[number];
export type ContractSourceLifecyclePhase =
  (typeof CONTRACT_SOURCE_LIFECYCLE_PHASES)[number];
export type ContractSourceIngestionStatus =
  (typeof CONTRACT_SOURCE_INGESTION_STATUSES)[number];
export type ContractSourcePublicClaimLevel =
  (typeof CONTRACT_SOURCE_PUBLIC_CLAIM_LEVELS)[number];
export type ContractSourceDiscoveryStatus =
  (typeof CONTRACT_SOURCE_DISCOVERY_STATUSES)[number];
export type ContractSourceDiscoveryCheckedBy =
  (typeof CONTRACT_SOURCE_DISCOVERY_CHECKED_BY)[number];
export type ContractSourceDiscoveryFormat =
  (typeof CONTRACT_SOURCE_DISCOVERY_FORMATS)[number];
export type ContractSourceDiscoveryFreshnessLabel =
  (typeof CONTRACT_SOURCE_DISCOVERY_FRESHNESS_LABELS)[number];

export type ContractSourceLifecycleCoverage = Record<
  ContractSourceLifecyclePhase,
  boolean
>;

export interface ContractSourceDiscoveryMetadata {
  discovery_status: ContractSourceDiscoveryStatus;
  checked_at: string | null;
  checked_by: ContractSourceDiscoveryCheckedBy;
  verified_url: string | null;
  landing_page_url: string | null;
  package_url: string | null;
  sample_file_url: string | null;
  detected_format: ContractSourceDiscoveryFormat;
  freshness_label: ContractSourceDiscoveryFreshnessLabel;
  version_hint: string | null;
  notes: string[];
}

export interface ContractSourceFamily {
  id: string;
  label: string;
  authority: string;
  official_url: string | null;
  access_type: ContractSourceAccessType;
  source_axis: ContractSourceAxis;
  primary_identifiers: ContractSourceIdentifier[];
  expected_formats: ContractSourceFormat[];
  update_mode: ContractSourceUpdateMode;
  lifecycle_coverage: ContractSourceLifecycleCoverage;
  ingestion_status: ContractSourceIngestionStatus;
  public_claim_level: ContractSourcePublicClaimLevel;
  limitations: string[];
  next_action: string;
  discovery_metadata?: ContractSourceDiscoveryMetadata;
}

export interface ContractSourceManifest {
  schema_version: string;
  updated_at: string;
  scope: string;
  manual_verification_phrase: string;
  sources: ContractSourceFamily[];
}

export interface ContractSourceManifestSummary {
  totalSources: number;
  byIngestionStatus: Record<ContractSourceIngestionStatus, number>;
  byPublicClaimLevel: Record<ContractSourcePublicClaimLevel, number>;
  bySourceAxis: Record<ContractSourceAxis, number>;
  byIdentifier: Record<ContractSourceIdentifier, number>;
  byLifecyclePhase: Record<ContractSourceLifecyclePhase, number>;
  byDiscoveryStatus: Record<ContractSourceDiscoveryStatus, number>;
  manualDiscoveryRequired: string[];
}

export function validateContractSourceManifest(
  rawManifest: unknown,
): ContractSourceManifest {
  const manifest = requireRecord(rawManifest, "contracts source manifest");
  const sources = requireArray(manifest.sources, "sources").map(
    (source, index) =>
      validateContractSourceFamily(source, `sources[${index}]`),
  );
  const seenIds = new Set<string>();

  for (const source of sources) {
    if (seenIds.has(source.id)) {
      throw new Error(`Duplicate contract source id: ${source.id}`);
    }
    seenIds.add(source.id);
  }

  return {
    schema_version: requireString(manifest.schema_version, "schema_version"),
    updated_at: requireString(manifest.updated_at, "updated_at"),
    scope: requireString(manifest.scope, "scope"),
    manual_verification_phrase: requireString(
      manifest.manual_verification_phrase,
      "manual_verification_phrase",
    ),
    sources,
  };
}

export const contractsSourceManifest =
  validateContractSourceManifest(manifestPayload);

export function getContractSourceById(
  id: string,
  manifest: ContractSourceManifest = contractsSourceManifest,
): ContractSourceFamily | undefined {
  return manifest.sources.find((source) => source.id === id);
}

export function listSourcesByIdentifier(
  identifier: ContractSourceIdentifier,
  manifest: ContractSourceManifest = contractsSourceManifest,
): ContractSourceFamily[] {
  return manifest.sources.filter((source) =>
    source.primary_identifiers.includes(identifier),
  );
}

export function listSourcesByLifecyclePhase(
  phase: ContractSourceLifecyclePhase,
  manifest: ContractSourceManifest = contractsSourceManifest,
): ContractSourceFamily[] {
  return manifest.sources.filter((source) => source.lifecycle_coverage[phase]);
}

export function listIngestionReadySources(
  manifest: ContractSourceManifest = contractsSourceManifest,
): ContractSourceFamily[] {
  return manifest.sources.filter((source) =>
    ["ready_for_parser", "implemented"].includes(source.ingestion_status),
  );
}

export function summariseSourceManifest(
  manifest: ContractSourceManifest = contractsSourceManifest,
): ContractSourceManifestSummary {
  const summary: ContractSourceManifestSummary = {
    totalSources: manifest.sources.length,
    byIngestionStatus: emptyCounter(CONTRACT_SOURCE_INGESTION_STATUSES),
    byPublicClaimLevel: emptyCounter(CONTRACT_SOURCE_PUBLIC_CLAIM_LEVELS),
    bySourceAxis: emptyCounter(CONTRACT_SOURCE_AXES),
    byIdentifier: emptyCounter(CONTRACT_SOURCE_IDENTIFIERS),
    byLifecyclePhase: emptyCounter(CONTRACT_SOURCE_LIFECYCLE_PHASES),
    byDiscoveryStatus: emptyCounter(CONTRACT_SOURCE_DISCOVERY_STATUSES),
    manualDiscoveryRequired: [],
  };

  for (const source of manifest.sources) {
    summary.byIngestionStatus[source.ingestion_status] += 1;
    summary.byPublicClaimLevel[source.public_claim_level] += 1;
    summary.bySourceAxis[source.source_axis] += 1;

    for (const identifier of source.primary_identifiers) {
      summary.byIdentifier[identifier] += 1;
    }

    for (const phase of CONTRACT_SOURCE_LIFECYCLE_PHASES) {
      if (source.lifecycle_coverage[phase]) {
        summary.byLifecyclePhase[phase] += 1;
      }
    }

    if (source.discovery_metadata) {
      summary.byDiscoveryStatus[source.discovery_metadata.discovery_status] +=
        1;
    } else {
      summary.byDiscoveryStatus.not_checked += 1;
    }

    if (
      source.official_url === null ||
      source.discovery_metadata?.discovery_status ===
        "needs_manual_verification"
    ) {
      summary.manualDiscoveryRequired.push(source.id);
    }
  }

  return summary;
}

function validateContractSourceFamily(
  rawSource: unknown,
  path: string,
): ContractSourceFamily {
  const source = requireRecord(rawSource, path);
  const officialUrl = requireOfficialUrl(
    source.official_url,
    `${path}.official_url`,
  );
  const accessType = requireEnum(
    source.access_type,
    `${path}.access_type`,
    CONTRACT_SOURCE_ACCESS_TYPES,
  );
  const ingestionStatus = requireEnum(
    source.ingestion_status,
    `${path}.ingestion_status`,
    CONTRACT_SOURCE_INGESTION_STATUSES,
  );
  const publicClaimLevel = requireEnum(
    source.public_claim_level,
    `${path}.public_claim_level`,
    CONTRACT_SOURCE_PUBLIC_CLAIM_LEVELS,
  );
  const limitations = requireStringArray(
    source.limitations,
    `${path}.limitations`,
  );
  const discoveryMetadata = validateOptionalDiscoveryMetadata(
    source.discovery_metadata,
    `${path}.discovery_metadata`,
  );

  if (
    officialUrl === null &&
    !limitations.some((limitation) =>
      limitation.includes(CONTRACT_SOURCE_MANUAL_VERIFICATION_LIMIT),
    )
  ) {
    throw new Error(
      `${path}.limitations must explain manual URL verification when official_url is null`,
    );
  }

  if (
    officialUrl === null &&
    accessType === "unknown" &&
    ingestionStatus !== "not_implemented"
  ) {
    throw new Error(
      `${path}.ingestion_status must be not_implemented when an unknown source URL is unresolved`,
    );
  }

  if (publicClaimLevel === "ingested" && ingestionStatus !== "implemented") {
    throw new Error(
      `${path}.public_claim_level cannot be ingested unless ingestion_status is implemented`,
    );
  }

  if (
    publicClaimLevel === "ingestion_ready" &&
    !["ready_for_parser", "implemented"].includes(ingestionStatus)
  ) {
    throw new Error(
      `${path}.public_claim_level cannot be ingestion_ready before the source is parser-ready`,
    );
  }

  if (
    ingestionStatus === "ready_for_parser" &&
    discoveryMetadata?.discovery_status !== "verified"
  ) {
    throw new Error(
      `${path}.ingestion_status cannot be ready_for_parser without verified discovery metadata`,
    );
  }

  return {
    id: requireString(source.id, `${path}.id`),
    label: requireString(source.label, `${path}.label`),
    authority: requireString(source.authority, `${path}.authority`),
    official_url: officialUrl,
    access_type: accessType,
    source_axis: requireEnum(
      source.source_axis,
      `${path}.source_axis`,
      CONTRACT_SOURCE_AXES,
    ),
    primary_identifiers: requireEnumArray(
      source.primary_identifiers,
      `${path}.primary_identifiers`,
      CONTRACT_SOURCE_IDENTIFIERS,
    ),
    expected_formats: requireEnumArray(
      source.expected_formats,
      `${path}.expected_formats`,
      CONTRACT_SOURCE_FORMATS,
    ),
    update_mode: requireEnum(
      source.update_mode,
      `${path}.update_mode`,
      CONTRACT_SOURCE_UPDATE_MODES,
    ),
    lifecycle_coverage: requireLifecycleCoverage(
      source.lifecycle_coverage,
      `${path}.lifecycle_coverage`,
    ),
    ingestion_status: ingestionStatus,
    public_claim_level: publicClaimLevel,
    limitations,
    next_action: requireString(source.next_action, `${path}.next_action`),
    ...(discoveryMetadata ? { discovery_metadata: discoveryMetadata } : {}),
  };
}

function validateOptionalDiscoveryMetadata(
  rawValue: unknown,
  path: string,
): ContractSourceDiscoveryMetadata | undefined {
  if (rawValue === undefined) {
    return undefined;
  }

  const metadata = requireRecord(rawValue, path);
  const discoveryStatus = requireEnum(
    metadata.discovery_status,
    `${path}.discovery_status`,
    CONTRACT_SOURCE_DISCOVERY_STATUSES,
  );
  const verifiedUrl = requireNullableUrl(
    metadata.verified_url,
    `${path}.verified_url`,
  );
  const packageUrl = requireNullableUrl(
    metadata.package_url,
    `${path}.package_url`,
  );
  const sampleFileUrl = requireNullableUrl(
    metadata.sample_file_url,
    `${path}.sample_file_url`,
  );
  const notes = requireStringArray(metadata.notes, `${path}.notes`);

  if (discoveryStatus === "verified" && !verifiedUrl && !packageUrl) {
    throw new Error(
      `${path}.verified discovery requires a verified_url or package_url`,
    );
  }

  if (
    discoveryStatus === "needs_manual_verification" &&
    !notes.some(
      (note) =>
        note.toLowerCase().includes("manual") ||
        note.toLowerCase().includes("verific"),
    )
  ) {
    throw new Error(`${path}.notes must explain the manual verification need`);
  }

  return {
    discovery_status: discoveryStatus,
    checked_at: requireNullableString(
      metadata.checked_at,
      `${path}.checked_at`,
    ),
    checked_by: requireEnum(
      metadata.checked_by,
      `${path}.checked_by`,
      CONTRACT_SOURCE_DISCOVERY_CHECKED_BY,
    ),
    verified_url: verifiedUrl,
    landing_page_url: requireNullableUrl(
      metadata.landing_page_url,
      `${path}.landing_page_url`,
    ),
    package_url: packageUrl,
    sample_file_url: sampleFileUrl,
    detected_format: requireEnum(
      metadata.detected_format,
      `${path}.detected_format`,
      CONTRACT_SOURCE_DISCOVERY_FORMATS,
    ),
    freshness_label: requireEnum(
      metadata.freshness_label,
      `${path}.freshness_label`,
      CONTRACT_SOURCE_DISCOVERY_FRESHNESS_LABELS,
    ),
    version_hint: requireNullableString(
      metadata.version_hint,
      `${path}.version_hint`,
    ),
    notes,
  };
}

function requireRecord(
  rawValue: unknown,
  path: string,
): Record<string, unknown> {
  if (
    rawValue === null ||
    typeof rawValue !== "object" ||
    Array.isArray(rawValue)
  ) {
    throw new Error(`${path} must be an object`);
  }

  return rawValue as Record<string, unknown>;
}

function requireArray(rawValue: unknown, path: string): unknown[] {
  if (!Array.isArray(rawValue)) {
    throw new Error(`${path} must be an array`);
  }

  if (rawValue.length === 0) {
    throw new Error(`${path} must not be empty`);
  }

  return rawValue;
}

function requireString(rawValue: unknown, path: string): string {
  if (typeof rawValue !== "string" || rawValue.trim().length === 0) {
    throw new Error(`${path} must be a non-empty string`);
  }

  return rawValue;
}

function requireNullableString(rawValue: unknown, path: string): string | null {
  if (rawValue === null) {
    return null;
  }

  return requireString(rawValue, path);
}

function requireOfficialUrl(rawValue: unknown, path: string): string | null {
  if (rawValue === null) {
    return null;
  }

  const url = requireString(rawValue, path);

  validateHttpsUrl(url, path);

  return url;
}

function requireNullableUrl(rawValue: unknown, path: string): string | null {
  if (rawValue === null) {
    return null;
  }

  const url = requireString(rawValue, path);

  validateHttpsUrl(url, path);

  return url;
}

function validateHttpsUrl(url: string, path: string): void {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      throw new Error("Only https URLs are allowed");
    }
  } catch (error) {
    throw new Error(`${path} must be a valid https URL: ${String(error)}`);
  }
}

function requireStringArray(rawValue: unknown, path: string): string[] {
  const values = requireArray(rawValue, path);

  return values.map((value, index) =>
    requireString(value, `${path}[${index}]`),
  );
}

function requireEnum<TValue extends string>(
  rawValue: unknown,
  path: string,
  allowedValues: readonly TValue[],
): TValue {
  if (
    typeof rawValue !== "string" ||
    !allowedValues.includes(rawValue as TValue)
  ) {
    throw new Error(
      `${path} must be one of: ${allowedValues.map((value) => value).join(", ")}`,
    );
  }

  return rawValue as TValue;
}

function requireEnumArray<TValue extends string>(
  rawValue: unknown,
  path: string,
  allowedValues: readonly TValue[],
): TValue[] {
  return requireArray(rawValue, path).map((value, index) =>
    requireEnum(value, `${path}[${index}]`, allowedValues),
  );
}

function requireLifecycleCoverage(
  rawValue: unknown,
  path: string,
): ContractSourceLifecycleCoverage {
  const coverage = requireRecord(rawValue, path);
  const result = {} as ContractSourceLifecycleCoverage;

  for (const phase of CONTRACT_SOURCE_LIFECYCLE_PHASES) {
    const value = coverage[phase];
    if (typeof value !== "boolean") {
      throw new Error(`${path}.${phase} must be a boolean`);
    }
    result[phase] = value;
  }

  for (const key of Object.keys(coverage)) {
    if (
      !CONTRACT_SOURCE_LIFECYCLE_PHASES.includes(
        key as ContractSourceLifecyclePhase,
      )
    ) {
      throw new Error(`${path}.${key} is not a supported lifecycle phase`);
    }
  }

  return result;
}

function emptyCounter<TValue extends string>(
  values: readonly TValue[],
): Record<TValue, number> {
  return values.reduce(
    (counter, value) => {
      counter[value] = 0;
      return counter;
    },
    {} as Record<TValue, number>,
  );
}
