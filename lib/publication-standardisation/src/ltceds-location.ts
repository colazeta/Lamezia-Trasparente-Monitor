import {
  isDefaultPublicMapLocation,
  type GeoPrecision,
  type LocationRole,
  type LocationSensitivity,
  type LtcedsPublicLocation,
  type PointGeometry,
} from "./ltceds";

export const LOCATION_EVIDENCE_BASES = [
  "source_stated_exact",
  "source_stated_named_site",
  "source_stated_street",
  "source_stated_neighbourhood",
  "source_stated_locality",
  "geocoder_candidate",
  "editorial_inference",
  "unknown",
] as const;
export type LocationEvidenceBasis = (typeof LOCATION_EVIDENCE_BASES)[number];

export const PUBLICATION_RISKS = [
  "low_public_site",
  "non_sensitive",
  "residential",
  "victim_linked",
  "minor_or_vulnerable",
  "sexual_offence_context",
  "unknown",
] as const;
export type PublicationRisk = (typeof PUBLICATION_RISKS)[number];

export const GEOCODE_MATCH_LEVELS = [
  "exact_civic",
  "named_site",
  "street",
  "neighbourhood",
  "locality",
  "municipality",
  "unknown",
] as const;
export type GeocodeMatchLevel = (typeof GEOCODE_MATCH_LEVELS)[number];

export const PUBLIC_ANCHOR_KINDS = [
  "street_anchor",
  "neighbourhood_anchor",
  "locality_anchor",
] as const;
export type PublicAnchorKind = (typeof PUBLIC_ANCHOR_KINDS)[number];

export const DEFAULT_MINIMUM_RESIDENTIAL_PRIVACY_SET_SIZE = 8 as const;

export type LtcedsGeocodeCandidate = {
  provider: string;
  query_variant: string;
  geometry: PointGeometry;
  precision: GeoPrecision;
  match_level: GeocodeMatchLevel;
  within_municipality: boolean;
  provider_confidence?: number | null;
};

export type LtcedsInternalLocation = {
  role: LocationRole;
  municipality: string;
  evidence_basis: LocationEvidenceBasis;
  evidence_precision: GeoPrecision;
  resolved_precision: GeoPrecision;
  sensitivity: LocationSensitivity;
  publication_risk: PublicationRisk;
  geometry: PointGeometry | null;
  place_name?: string | null;
  neighbourhood?: string | null;
  iccs_location_type?: string | null;
  street_scope_key?: string | null;
  neighbourhood_scope_key?: string | null;
  locality_scope_key?: string | null;
};

export type LtcedsPublicAnchor = {
  anchor_id: string;
  kind: PublicAnchorKind;
  scope_key: string;
  geometry: PointGeometry;
  precision: "street_segment" | "neighbourhood" | "locality";
  source: string;
  privacy_set_size?: number | null;
  generated_at: string;
  scope_label?: string | null;
  source_version?: string | null;
  distinct_coordinate_count?: number | null;
  spatial_span_m?: number | null;
  member_set_sha256?: string | null;
};

export type GeocodeCandidateDecision = {
  status: "candidate" | "needs_review" | "rejected";
  capped_precision: GeoPrecision;
  reasons: readonly string[];
};

export type PublicProjectionPolicy = {
  minimum_residential_privacy_set_size: number;
};

export type PublicProjectionDecision = {
  public_location: LtcedsPublicLocation;
  selected_anchor_id: string | null;
  map_default: boolean;
  reasons: readonly string[];
};

const PRECISION_RANK: Record<GeoPrecision, number> = {
  exact_public_site: 0,
  exact_address: 0,
  street_segment: 1,
  neighbourhood: 2,
  locality: 3,
  municipality: 4,
  unknown: 5,
};

export function normaliseLocationScopeLabel(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toUpperCase()
    .replace(/[’'`]/g, " ")
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function locationScopeKey(
  kind: "street" | "neighbourhood" | "locality",
  label: string,
): string {
  const normalised = normaliseLocationScopeLabel(label);
  if (!normalised) throw new Error(`${kind} scope label must not be empty`);
  return `${kind}:${normalised}`;
}

export function streetScopeKey(label: string): string {
  return locationScopeKey("street", label);
}

export function neighbourhoodScopeKey(label: string): string {
  return locationScopeKey("neighbourhood", label);
}

export function localityScopeKey(label: string): string {
  return locationScopeKey("locality", label);
}

function finitePoint(geometry: PointGeometry | null): geometry is PointGeometry {
  return Boolean(
    geometry &&
      geometry.type === "Point" &&
      Number.isFinite(geometry.coordinates[0]) &&
      Number.isFinite(geometry.coordinates[1]) &&
      geometry.coordinates[0] >= -180 &&
      geometry.coordinates[0] <= 180 &&
      geometry.coordinates[1] >= -90 &&
      geometry.coordinates[1] <= 90,
  );
}

/**
 * A geocoder can reduce confidence/precision but can never create evidentiary
 * precision that the source did not contain. When two exact precision labels
 * have equal rank, the evidence-side label wins so a named public site is not
 * silently reinterpreted as a residential exact address, or vice versa.
 */
export function capGeocodePrecision(
  evidencePrecision: GeoPrecision,
  candidatePrecision: GeoPrecision,
): GeoPrecision {
  const evidenceRank = PRECISION_RANK[evidencePrecision];
  const candidateRank = PRECISION_RANK[candidatePrecision];
  if (evidenceRank >= candidateRank) return evidencePrecision;
  return candidatePrecision;
}

export function validateInternalLocationPrecision(
  location: LtcedsInternalLocation,
): readonly string[] {
  const issues: string[] = [];
  const capped = capGeocodePrecision(
    location.evidence_precision,
    location.resolved_precision,
  );
  if (capped !== location.resolved_precision) {
    issues.push(
      `resolved_precision ${location.resolved_precision} is more specific than evidence_precision ${location.evidence_precision}`,
    );
  }
  if (
    (location.resolved_precision === "municipality" ||
      location.resolved_precision === "unknown") &&
    location.geometry !== null
  ) {
    issues.push("municipality/unknown resolution must not be represented by a point");
  }
  if (location.geometry !== null && !finitePoint(location.geometry)) {
    issues.push("geometry must be a finite WGS84 point");
  }
  return issues;
}

export function evaluateGeocodeCandidate(
  evidence: Pick<
    LtcedsInternalLocation,
    "evidence_basis" | "evidence_precision" | "municipality"
  >,
  candidate: LtcedsGeocodeCandidate,
): GeocodeCandidateDecision {
  const reasons: string[] = [];
  const cappedPrecision = capGeocodePrecision(
    evidence.evidence_precision,
    candidate.precision,
  );

  if (!candidate.within_municipality) {
    return {
      status: "rejected",
      capped_precision: cappedPrecision,
      reasons: ["candidate lies outside the event municipality"],
    };
  }
  if (!finitePoint(candidate.geometry)) {
    return {
      status: "rejected",
      capped_precision: cappedPrecision,
      reasons: ["candidate geometry is not a valid WGS84 point"],
    };
  }
  if (candidate.precision !== cappedPrecision) {
    reasons.push(
      `candidate precision capped from ${candidate.precision} to ${cappedPrecision} by source evidence`,
    );
  }
  if (
    evidence.evidence_basis === "editorial_inference" ||
    evidence.evidence_basis === "unknown"
  ) {
    reasons.push("inferred/unknown location evidence always requires human review");
    return { status: "needs_review", capped_precision: cappedPrecision, reasons };
  }
  if (
    candidate.match_level === "unknown" ||
    candidate.match_level === "municipality"
  ) {
    reasons.push("coarse or unknown geocoder match cannot resolve an event point");
    return { status: "needs_review", capped_precision: cappedPrecision, reasons };
  }

  reasons.push("geocoder output remains a candidate until explicit resolution/review");
  return { status: "candidate", capped_precision: cappedPrecision, reasons };
}

function coarserOrEqual(anchor: LtcedsPublicAnchor, precision: GeoPrecision): boolean {
  return PRECISION_RANK[anchor.precision] >= PRECISION_RANK[precision];
}

function sortedAnchors(anchors: readonly LtcedsPublicAnchor[]): LtcedsPublicAnchor[] {
  const rank: Record<PublicAnchorKind, number> = {
    street_anchor: 0,
    neighbourhood_anchor: 1,
    locality_anchor: 2,
  };
  return [...anchors].sort(
    (left, right) =>
      rank[left.kind] - rank[right.kind] ||
      left.scope_key.localeCompare(right.scope_key) ||
      left.anchor_id.localeCompare(right.anchor_id),
  );
}

function scopeKeyForLocation(
  location: LtcedsInternalLocation,
  kind: PublicAnchorKind,
): string | null {
  if (kind === "street_anchor") return location.street_scope_key ?? null;
  if (kind === "neighbourhood_anchor") {
    return location.neighbourhood_scope_key ?? null;
  }
  return location.locality_scope_key ?? null;
}

export function anchorMatchesLocation(
  location: LtcedsInternalLocation,
  anchor: LtcedsPublicAnchor,
): boolean {
  const expectedScope = scopeKeyForLocation(location, anchor.kind);
  return Boolean(expectedScope && anchor.scope_key === expectedScope);
}

function publicAnchorFor(
  location: LtcedsInternalLocation,
  anchors: readonly LtcedsPublicAnchor[],
  policy: PublicProjectionPolicy,
): { anchor: LtcedsPublicAnchor | null; reasons: string[] } {
  const reasons: string[] = [];
  const candidates = sortedAnchors(anchors).filter(
    (anchor) =>
      coarserOrEqual(anchor, location.evidence_precision) &&
      anchorMatchesLocation(location, anchor),
  );

  if (candidates.length === 0 && anchors.length > 0) {
    reasons.push("no public anchor matches the location scope key");
  }

  const skipStreet =
    location.publication_risk === "unknown" ||
    location.publication_risk === "minor_or_vulnerable" ||
    location.publication_risk === "sexual_offence_context";

  for (const anchor of candidates) {
    if (anchor.kind === "street_anchor") {
      if (skipStreet) {
        reasons.push("street anchor skipped for unknown/high-vulnerability publication risk");
        continue;
      }
      const privacySet = anchor.privacy_set_size ?? 0;
      if (privacySet < policy.minimum_residential_privacy_set_size) {
        reasons.push(
          `street anchor ${anchor.anchor_id} privacy set ${privacySet} is below minimum ${policy.minimum_residential_privacy_set_size}`,
        );
        continue;
      }
    }
    return { anchor, reasons };
  }
  reasons.push("no sufficiently coarse safe public anchor available");
  return { anchor: null, reasons };
}

function suppressedLocation(
  location: LtcedsInternalLocation,
  precision: GeoPrecision,
): LtcedsPublicLocation {
  return {
    role: location.role,
    municipality: location.municipality,
    precision,
    sensitivity: location.sensitivity,
    privacy_transform: "suppressed",
    geometry: null,
    place_name: null,
    neighbourhood:
      precision === "neighbourhood" ? location.neighbourhood ?? null : null,
    iccs_location_type: location.iccs_location_type ?? null,
  };
}

function projectionFromAnchor(
  location: LtcedsInternalLocation,
  anchor: LtcedsPublicAnchor,
): LtcedsPublicLocation {
  if (anchor.kind === "street_anchor") {
    return {
      role: location.role,
      municipality: location.municipality,
      precision: "street_segment",
      sensitivity: location.sensitivity,
      privacy_transform: "street_generalisation",
      geometry: anchor.geometry,
      place_name: null,
      neighbourhood: location.neighbourhood ?? null,
      iccs_location_type: location.iccs_location_type ?? null,
    };
  }
  if (anchor.kind === "neighbourhood_anchor") {
    return {
      role: location.role,
      municipality: location.municipality,
      precision: "neighbourhood",
      sensitivity: location.sensitivity,
      privacy_transform: "neighbourhood_centroid",
      geometry: anchor.geometry,
      place_name: null,
      neighbourhood: location.neighbourhood ?? null,
      iccs_location_type: location.iccs_location_type ?? null,
    };
  }

  // The current LTCEDS public schema has no locality-centroid transform enum.
  // Preserve locality knowledge but fail closed on geometry until a future
  // schema version explicitly represents that transform.
  return suppressedLocation(location, "locality");
}

export function projectPublicLocation(
  location: LtcedsInternalLocation,
  anchors: readonly LtcedsPublicAnchor[],
  policy: PublicProjectionPolicy = {
    minimum_residential_privacy_set_size:
      DEFAULT_MINIMUM_RESIDENTIAL_PRIVACY_SET_SIZE,
  },
): PublicProjectionDecision {
  const reasons = [...validateInternalLocationPrecision(location)];
  if (reasons.length > 0) {
    const publicLocation = suppressedLocation(location, "unknown");
    return {
      public_location: publicLocation,
      selected_anchor_id: null,
      map_default: false,
      reasons: [...reasons, "invalid internal precision fails closed"],
    };
  }

  if (
    location.evidence_precision === "municipality" ||
    location.evidence_precision === "unknown" ||
    location.geometry === null
  ) {
    const publicLocation = suppressedLocation(
      location,
      location.evidence_precision,
    );
    return {
      public_location: publicLocation,
      selected_anchor_id: null,
      map_default: false,
      reasons: ["coarse or unresolved evidence is never converted to a point"],
    };
  }

  if (
    location.publication_risk === "minor_or_vulnerable" ||
    location.publication_risk === "sexual_offence_context"
  ) {
    const publicLocation = suppressedLocation(location, "municipality");
    return {
      public_location: publicLocation,
      selected_anchor_id: null,
      map_default: false,
      reasons: ["high-vulnerability context suppresses public point geometry"],
    };
  }

  if (
    location.publication_risk === "low_public_site" &&
    location.sensitivity === "public_place" &&
    location.evidence_precision === "exact_public_site" &&
    location.resolved_precision === "exact_public_site"
  ) {
    const publicLocation: LtcedsPublicLocation = {
      role: location.role,
      municipality: location.municipality,
      precision: "exact_public_site",
      sensitivity: "public_place",
      privacy_transform: "none",
      geometry: location.geometry,
      place_name: location.place_name ?? null,
      neighbourhood: location.neighbourhood ?? null,
      iccs_location_type: location.iccs_location_type ?? null,
    };
    return {
      public_location: publicLocation,
      selected_anchor_id: null,
      map_default: isDefaultPublicMapLocation(publicLocation),
      reasons: ["source-supported low-risk public site may retain exact geometry"],
    };
  }

  const anchorSelection = publicAnchorFor(location, anchors, policy);
  const publicLocation = anchorSelection.anchor
    ? projectionFromAnchor(location, anchorSelection.anchor)
    : suppressedLocation(
        location,
        location.evidence_precision === "exact_address" ||
          location.evidence_precision === "exact_public_site" ||
          location.evidence_precision === "street_segment"
          ? "neighbourhood"
          : location.evidence_precision,
      );

  return {
    public_location: publicLocation,
    selected_anchor_id: anchorSelection.anchor?.anchor_id ?? null,
    map_default: isDefaultPublicMapLocation(publicLocation),
    reasons: [
      ...anchorSelection.reasons,
      anchorSelection.anchor
        ? `public geometry projected to deterministic ${anchorSelection.anchor.kind}`
        : "public point geometry suppressed",
    ],
  };
}
