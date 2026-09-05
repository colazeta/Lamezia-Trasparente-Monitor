import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  normaliseLocationScopeLabel,
  streetScopeKey,
  type LtcedsPublicAnchor,
  type PointGeometry,
} from "@workspace/publication-standardisation/ltceds-location";

export const LTCEDS_PUBLIC_ANCHOR_MATERIALIZER_VERSION = "1.0.0" as const;
export const ANNCSU_RECOVERY_SOURCE_RELATIVE_PATH =
  "data/interim/geo/anncsu_lamezia_coordinate_recovery_candidates_2025.csv" as const;
export const LTCEDS_PUBLIC_ANCHOR_OUTPUT_RELATIVE_PATH =
  "data/processed/legalita/ltceds_public_anchors.json" as const;
export const LTCEDS_PUBLIC_ANCHOR_MANIFEST_RELATIVE_PATH =
  "data/processed/legalita/ltceds_public_anchors_manifest.json" as const;

export const DEFAULT_PUBLIC_ANCHOR_POLICY = {
  minimum_privacy_set_size: 8,
  minimum_distinct_coordinate_count: 3,
  minimum_spatial_span_m: 30,
  lamezia_bbox: [16.0, 38.75, 16.6, 39.15] as const,
} as const;

export type PublicAnchorPolicy = {
  minimum_privacy_set_size: number;
  minimum_distinct_coordinate_count: number;
  minimum_spatial_span_m: number;
  lamezia_bbox: readonly [west: number, south: number, east: number, north: number];
};

type CsvRecord = Record<string, string>;

type EligibleAddress = {
  address_key: string;
  scope_key: string;
  street_label: string;
  lon: number;
  lat: number;
  coordinate_source: "anncsu_source_coordinate" | "manual_coordinate_override";
};

export type LtcedsMaterializedStreetAnchor = LtcedsPublicAnchor & {
  kind: "street_anchor";
  scope_label: string;
  source_version: string;
  privacy_set_size: number;
  distinct_coordinate_count: number;
  spatial_span_m: number;
  member_set_sha256: string;
};

export type PublicAnchorSummary = {
  input_rows: number;
  eligible_rows: number;
  ineligible_rows: number;
  eligible_unique_addresses: number;
  address_coordinate_conflicts: number;
  streets_considered: number;
  streets_with_public_anchors: number;
  street_anchor_count: number;
  covered_unique_addresses: number;
  uncovered_eligible_unique_addresses: number;
  exclusion_counts: Record<string, number>;
};

export type LtcedsPublicAnchorSnapshot = {
  schema_version: "1.0";
  layer: "ltceds_public_anchors";
  materializer_version: typeof LTCEDS_PUBLIC_ANCHOR_MATERIALIZER_VERSION;
  generated_at: string;
  source: {
    provider: "ANNCSU / Lamezia Trasparente reviewed recovery layer";
    source_path: typeof ANNCSU_RECOVERY_SOURCE_RELATIVE_PATH;
    source_version: "2025";
    source_sha256: string;
    coordinate_policy: "reviewed-effective-coordinates-only";
  };
  policy: PublicAnchorPolicy & {
    partition_method: "dominant-axis-greedy-minimum-privacy-set";
    anchor_geometry: "member-coordinate-centroid";
    address_identity: "normalised-street-civic-esponente";
    event_independent: true;
    random_jitter: false;
    municipality_centroid: false;
  };
  summary: PublicAnchorSummary;
  anchors: LtcedsMaterializedStreetAnchor[];
};

export type LtcedsPublicAnchorManifest = {
  schema_version: "1.0";
  layer: "ltceds_public_anchors";
  materializer_version: typeof LTCEDS_PUBLIC_ANCHOR_MATERIALIZER_VERSION;
  generated_at: string;
  source_path: typeof ANNCSU_RECOVERY_SOURCE_RELATIVE_PATH;
  source_sha256: string;
  snapshot_sha256: string;
  policy: LtcedsPublicAnchorSnapshot["policy"];
  summary: PublicAnchorSummary;
  fallback_layers: {
    neighbourhood: "not_available";
    locality: "not_available";
  };
  limitations: string[];
};

function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function increment(counter: Record<string, number>, key: string, amount = 1): void {
  counter[key] = (counter[key] ?? 0) + amount;
}

function asText(value: string | undefined): string {
  return (value ?? "").trim();
}

function asNumber(value: string | undefined): number | null {
  const parsed = Number.parseFloat(asText(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function asBoolean(value: string | undefined): boolean {
  return ["1", "true", "yes", "y", "si", "sì"].includes(asText(value).toLowerCase());
}

export function parseCsvRecords(csv: string): CsvRecord[] {
  if (!csv.trim()) return [];

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index]!;
    if (quoted) {
      if (char === '"') {
        if (csv[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      field = "";
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      continue;
    }
    field += char;
  }
  if (quoted) throw new Error("CSV ends inside a quoted field");
  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    if (row.some((cell) => cell.length > 0)) rows.push(row);
  }
  if (rows.length === 0) return [];

  const headers = rows[0]!.map((header, index) =>
    (index === 0 ? header.replace(/^\uFEFF/, "") : header).trim(),
  );
  if (new Set(headers).size !== headers.length) {
    throw new Error("CSV contains duplicate headers");
  }

  return rows.slice(1).map((values, rowIndex) => {
    if (values.length !== headers.length) {
      throw new Error(
        `CSV row ${rowIndex + 2} has ${values.length} fields; expected ${headers.length}`,
      );
    }
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function withinBbox(
  lon: number,
  lat: number,
  bbox: PublicAnchorPolicy["lamezia_bbox"],
): boolean {
  const [west, south, east, north] = bbox;
  return lon >= west && lon <= east && lat >= south && lat <= north;
}

function normalisedCivic(value: string): string {
  return normaliseLocationScopeLabel(value);
}

function eligibility(
  row: CsvRecord,
  policy: PublicAnchorPolicy,
): { address: EligibleAddress | null; reason: string | null } {
  const street = asText(row.odonimo_raw);
  const civic = asText(row.civico);
  if (!street) return { address: null, reason: "missing_street" };
  if (!civic) return { address: null, reason: "missing_civic" };
  if (asBoolean(row.exclude_from_geometry)) {
    return { address: null, reason: "excluded_from_geometry" };
  }

  const lon = asNumber(row.effective_lon);
  const lat = asNumber(row.effective_lat);
  if (lon === null || lat === null) {
    return { address: null, reason: "missing_or_invalid_effective_coordinate" };
  }
  if (!withinBbox(lon, lat, policy.lamezia_bbox)) {
    return { address: null, reason: "effective_coordinate_outside_lamezia_bbox" };
  }

  const coordinateSource = asText(row.effective_coordinate_source);
  if (coordinateSource === "anncsu_source_coordinate") {
    if (
      asText(row.coordinate_quality_flag) !== "ok" ||
      asText(row.coordinate_recovery_status) !== "source_coordinate_unchanged"
    ) {
      return { address: null, reason: "anncsu_coordinate_not_quality_ok" };
    }
  } else if (coordinateSource === "manual_coordinate_override") {
    const confidence = asText(row.manual_decision_confidence).toLowerCase();
    if (
      !asText(row.manual_reviewed_by) ||
      !asText(row.manual_review_date) ||
      !confidence ||
      confidence === "draft"
    ) {
      return { address: null, reason: "manual_override_not_fully_reviewed" };
    }
  } else {
    return { address: null, reason: "coordinate_source_not_eligible" };
  }

  const scopeKey = streetScopeKey(street);
  const addressKey = [scopeKey, normalisedCivic(civic), normalisedCivic(asText(row.esponente))].join("|");
  return {
    address: {
      address_key: addressKey,
      scope_key: scopeKey,
      street_label: street,
      lon,
      lat,
      coordinate_source: coordinateSource,
    },
    reason: null,
  };
}

function coordinateKey(address: EligibleAddress): string {
  return `${address.lon.toFixed(7)}|${address.lat.toFixed(7)}`;
}

function deduplicateAddresses(
  addresses: readonly EligibleAddress[],
): { addresses: EligibleAddress[]; conflicts: number } {
  const grouped = new Map<string, EligibleAddress[]>();
  for (const address of addresses) {
    const values = grouped.get(address.address_key) ?? [];
    values.push(address);
    grouped.set(address.address_key, values);
  }

  const output: EligibleAddress[] = [];
  let conflicts = 0;
  for (const [addressKey, values] of [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const coordinateKeys = new Set(values.map(coordinateKey));
    if (coordinateKeys.size !== 1) {
      conflicts += 1;
      continue;
    }
    const sorted = [...values].sort(
      (left, right) =>
        left.coordinate_source.localeCompare(right.coordinate_source) ||
        left.street_label.localeCompare(right.street_label),
    );
    const selected = sorted[0]!;
    output.push({ ...selected, address_key: addressKey });
  }
  return { addresses: output, conflicts };
}

function toLocalXY(
  address: EligibleAddress,
  meanLatitude: number,
): { x: number; y: number } {
  const lonScale = 111_320 * Math.cos((meanLatitude * Math.PI) / 180);
  return {
    x: address.lon * lonScale,
    y: address.lat * 110_540,
  };
}

function spatiallySort(addresses: readonly EligibleAddress[]): EligibleAddress[] {
  const meanLatitude =
    addresses.reduce((sum, address) => sum + address.lat, 0) / addresses.length;
  const located = addresses.map((address) => ({ address, ...toLocalXY(address, meanLatitude) }));
  const xs = located.map((item) => item.x);
  const ys = located.map((item) => item.y);
  const xRange = Math.max(...xs) - Math.min(...xs);
  const yRange = Math.max(...ys) - Math.min(...ys);
  const primary: "x" | "y" = xRange >= yRange ? "x" : "y";
  const secondary: "x" | "y" = primary === "x" ? "y" : "x";
  return located
    .sort(
      (left, right) =>
        left[primary] - right[primary] ||
        left[secondary] - right[secondary] ||
        left.address.address_key.localeCompare(right.address.address_key),
    )
    .map((item) => item.address);
}

function haversineMeters(left: EligibleAddress, right: EligibleAddress): number {
  const radius = 6_371_000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const lat1 = toRadians(left.lat);
  const lat2 = toRadians(right.lat);
  const deltaLat = toRadians(right.lat - left.lat);
  const deltaLon = toRadians(right.lon - left.lon);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function spatialSpanMeters(addresses: readonly EligibleAddress[]): number {
  let maximum = 0;
  for (let left = 0; left < addresses.length; left += 1) {
    for (let right = left + 1; right < addresses.length; right += 1) {
      maximum = Math.max(maximum, haversineMeters(addresses[left]!, addresses[right]!));
    }
  }
  return maximum;
}

function distinctCoordinateCount(addresses: readonly EligibleAddress[]): number {
  return new Set(addresses.map(coordinateKey)).size;
}

function qualifiesAsPrivacySet(
  addresses: readonly EligibleAddress[],
  policy: PublicAnchorPolicy,
): boolean {
  return (
    addresses.length >= policy.minimum_privacy_set_size &&
    distinctCoordinateCount(addresses) >= policy.minimum_distinct_coordinate_count &&
    spatialSpanMeters(addresses) >= policy.minimum_spatial_span_m
  );
}

export function partitionStreetPrivacySets(
  addresses: readonly EligibleAddress[],
  policy: PublicAnchorPolicy = DEFAULT_PUBLIC_ANCHOR_POLICY,
): EligibleAddress[][] {
  if (addresses.length < policy.minimum_privacy_set_size) return [];
  const sorted = spatiallySort(addresses);
  const groups: EligibleAddress[][] = [];
  let current: EligibleAddress[] = [];

  for (let index = 0; index < sorted.length; index += 1) {
    current.push(sorted[index]!);
    const remaining = sorted.length - index - 1;
    if (
      qualifiesAsPrivacySet(current, policy) &&
      remaining >= policy.minimum_privacy_set_size
    ) {
      groups.push(current);
      current = [];
    }
  }

  if (current.length > 0) {
    if (qualifiesAsPrivacySet(current, policy)) {
      groups.push(current);
    } else if (groups.length > 0) {
      const previous = groups.pop()!;
      const merged = [...previous, ...current];
      if (qualifiesAsPrivacySet(merged, policy)) groups.push(merged);
    }
  }
  return groups;
}

function roundCoordinate(value: number): number {
  return Math.round(value * 10_000_000) / 10_000_000;
}

function centroid(addresses: readonly EligibleAddress[]): PointGeometry {
  const lon = addresses.reduce((sum, address) => sum + address.lon, 0) / addresses.length;
  const lat = addresses.reduce((sum, address) => sum + address.lat, 0) / addresses.length;
  return { type: "Point", coordinates: [roundCoordinate(lon), roundCoordinate(lat)] };
}

function buildAnchor(
  addresses: readonly EligibleAddress[],
  generatedAt: string,
): LtcedsMaterializedStreetAnchor {
  const sortedMemberKeys = addresses.map((address) => address.address_key).sort();
  const memberSetSha256 = sha256(sortedMemberKeys.join("\n"));
  const scopeKey = addresses[0]!.scope_key;
  if (addresses.some((address) => address.scope_key !== scopeKey)) {
    throw new Error("street privacy set contains multiple scope keys");
  }
  const scopeLabel = [...new Set(addresses.map((address) => address.street_label))].sort()[0]!;
  const anchorDigest = sha256(`street-anchor-v1\n${scopeKey}\n${memberSetSha256}`).slice(0, 24);
  return {
    anchor_id: `ltceds-street-${anchorDigest}`,
    kind: "street_anchor",
    scope_key: scopeKey,
    scope_label: scopeLabel,
    geometry: centroid(addresses),
    precision: "street_segment",
    source: "ANNCSU / Lamezia Trasparente reviewed recovery layer",
    source_version: "2025",
    privacy_set_size: addresses.length,
    distinct_coordinate_count: distinctCoordinateCount(addresses),
    spatial_span_m: Math.round(spatialSpanMeters(addresses) * 10) / 10,
    member_set_sha256: memberSetSha256,
    generated_at: generatedAt,
  };
}

function policyWithMetadata(policy: PublicAnchorPolicy): LtcedsPublicAnchorSnapshot["policy"] {
  return {
    ...policy,
    partition_method: "dominant-axis-greedy-minimum-privacy-set",
    anchor_geometry: "member-coordinate-centroid",
    address_identity: "normalised-street-civic-esponente",
    event_independent: true,
    random_jitter: false,
    municipality_centroid: false,
  };
}

export function buildPublicAnchorSnapshot(input: {
  csv: string;
  generatedAt: string;
  policy?: PublicAnchorPolicy;
}): LtcedsPublicAnchorSnapshot {
  if (!Number.isFinite(Date.parse(input.generatedAt))) {
    throw new Error("generatedAt must be an ISO date/date-time");
  }
  const policy = input.policy ?? DEFAULT_PUBLIC_ANCHOR_POLICY;
  if (policy.minimum_privacy_set_size < 2) {
    throw new Error("minimum_privacy_set_size must be >= 2");
  }
  if (policy.minimum_distinct_coordinate_count < 2) {
    throw new Error("minimum_distinct_coordinate_count must be >= 2");
  }
  if (policy.minimum_spatial_span_m <= 0) {
    throw new Error("minimum_spatial_span_m must be > 0");
  }

  const rows = parseCsvRecords(input.csv);
  const exclusions: Record<string, number> = {};
  const eligibleRows: EligibleAddress[] = [];
  for (const row of rows) {
    const result = eligibility(row, policy);
    if (result.address) eligibleRows.push(result.address);
    else increment(exclusions, result.reason ?? "unknown_ineligibility");
  }

  const deduped = deduplicateAddresses(eligibleRows);
  if (deduped.conflicts > 0) {
    increment(exclusions, "address_coordinate_conflict", deduped.conflicts);
  }

  const byStreet = new Map<string, EligibleAddress[]>();
  for (const address of deduped.addresses) {
    const values = byStreet.get(address.scope_key) ?? [];
    values.push(address);
    byStreet.set(address.scope_key, values);
  }

  const anchors: LtcedsMaterializedStreetAnchor[] = [];
  const coveredAddressKeys = new Set<string>();
  let streetsWithAnchors = 0;
  for (const [scopeKey, streetAddresses] of [...byStreet.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const groups = partitionStreetPrivacySets(streetAddresses, policy);
    if (groups.length === 0) {
      increment(
        exclusions,
        streetAddresses.length < policy.minimum_privacy_set_size
          ? "street_below_privacy_set_minimum"
          : "street_insufficient_spatial_diversity",
        streetAddresses.length,
      );
      continue;
    }
    streetsWithAnchors += 1;
    for (const group of groups) {
      if (group.some((address) => address.scope_key !== scopeKey)) {
        throw new Error(`scope leakage while materialising ${scopeKey}`);
      }
      const anchor = buildAnchor(group, input.generatedAt);
      anchors.push(anchor);
      group.forEach((address) => coveredAddressKeys.add(address.address_key));
    }
  }

  anchors.sort(
    (left, right) =>
      left.scope_key.localeCompare(right.scope_key) || left.anchor_id.localeCompare(right.anchor_id),
  );

  const summary: PublicAnchorSummary = {
    input_rows: rows.length,
    eligible_rows: eligibleRows.length,
    ineligible_rows: rows.length - eligibleRows.length,
    eligible_unique_addresses: deduped.addresses.length,
    address_coordinate_conflicts: deduped.conflicts,
    streets_considered: byStreet.size,
    streets_with_public_anchors: streetsWithAnchors,
    street_anchor_count: anchors.length,
    covered_unique_addresses: coveredAddressKeys.size,
    uncovered_eligible_unique_addresses: deduped.addresses.length - coveredAddressKeys.size,
    exclusion_counts: Object.fromEntries(
      Object.entries(exclusions).sort(([left], [right]) => left.localeCompare(right)),
    ),
  };

  return {
    schema_version: "1.0",
    layer: "ltceds_public_anchors",
    materializer_version: LTCEDS_PUBLIC_ANCHOR_MATERIALIZER_VERSION,
    generated_at: input.generatedAt,
    source: {
      provider: "ANNCSU / Lamezia Trasparente reviewed recovery layer",
      source_path: ANNCSU_RECOVERY_SOURCE_RELATIVE_PATH,
      source_version: "2025",
      source_sha256: sha256(input.csv),
      coordinate_policy: "reviewed-effective-coordinates-only",
    },
    policy: policyWithMetadata(policy),
    summary,
    anchors,
  };
}

export function buildPublicAnchorManifest(
  snapshot: LtcedsPublicAnchorSnapshot,
): LtcedsPublicAnchorManifest {
  const snapshotJson = `${JSON.stringify(snapshot, null, 2)}\n`;
  return {
    schema_version: "1.0",
    layer: "ltceds_public_anchors",
    materializer_version: snapshot.materializer_version,
    generated_at: snapshot.generated_at,
    source_path: snapshot.source.source_path,
    source_sha256: snapshot.source.source_sha256,
    snapshot_sha256: sha256(snapshotJson),
    policy: snapshot.policy,
    summary: snapshot.summary,
    fallback_layers: {
      neighbourhood: "not_available",
      locality: "not_available",
    },
    limitations: [
      "Street anchors are derived only from effective coordinates already allowed by the ANNCSU recovery gate; unreviewed geocoder and local-anchor candidates are excluded.",
      "The layer contains no criminal events, people, victims, suspects or event identifiers.",
      "Street privacy-set size is a publication safeguard, not a guarantee of formal statistical anonymity.",
      "Neighbourhood/locality fallback anchors remain unavailable until a separately sourced and versioned territorial layer is approved.",
      "Municipality centroids and random jitter are never used as crime-event anchors.",
    ],
  };
}

async function writeAtomically(filePath: string, content: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.tmp`;
  await writeFile(temporaryPath, content, "utf8");
  await rename(temporaryPath, filePath);
}

export async function materializePublicAnchors(options: {
  repoRoot: string;
  generatedAt?: string;
  inputPath?: string;
  outputPath?: string;
  manifestPath?: string;
  policy?: PublicAnchorPolicy;
}): Promise<{ snapshot: LtcedsPublicAnchorSnapshot; manifest: LtcedsPublicAnchorManifest }> {
  const inputPath = options.inputPath ?? path.join(options.repoRoot, ANNCSU_RECOVERY_SOURCE_RELATIVE_PATH);
  const outputPath = options.outputPath ?? path.join(options.repoRoot, LTCEDS_PUBLIC_ANCHOR_OUTPUT_RELATIVE_PATH);
  const manifestPath = options.manifestPath ?? path.join(options.repoRoot, LTCEDS_PUBLIC_ANCHOR_MANIFEST_RELATIVE_PATH);
  const csv = await readFile(inputPath, "utf8");
  const snapshot = buildPublicAnchorSnapshot({
    csv,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    policy: options.policy,
  });
  const manifest = buildPublicAnchorManifest(snapshot);
  await writeAtomically(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  await writeAtomically(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  return { snapshot, manifest };
}

async function main(): Promise<void> {
  const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "..",
    "..",
  );
  const result = await materializePublicAnchors({ repoRoot });
  console.log(
    JSON.stringify(
      {
        source: ANNCSU_RECOVERY_SOURCE_RELATIVE_PATH,
        anchors: result.snapshot.summary.street_anchor_count,
        coveredUniqueAddresses: result.snapshot.summary.covered_unique_addresses,
        output: LTCEDS_PUBLIC_ANCHOR_OUTPUT_RELATIVE_PATH,
        manifest: LTCEDS_PUBLIC_ANCHOR_MANIFEST_RELATIVE_PATH,
      },
      null,
      2,
    ),
  );
}

const invokedAsScript = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;
if (invokedAsScript) await main();
