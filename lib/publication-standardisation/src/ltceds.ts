export const LTCEDS_SCHEMA_VERSION = "1.0-draft.1" as const;

export const EVENT_FORMS = [
  "discrete",
  "continuous_episode",
  "course_of_conduct",
] as const;
export type EventForm = (typeof EVENT_FORMS)[number];

export const LOCATION_ROLES = [
  "occurrence",
  "target",
  "discovery",
  "recovery",
  "arrest",
  "search",
  "procedural",
  "other",
] as const;
export type LocationRole = (typeof LOCATION_ROLES)[number];

export const GEO_PRECISIONS = [
  "exact_public_site",
  "exact_address",
  "street_segment",
  "neighbourhood",
  "locality",
  "municipality",
  "unknown",
] as const;
export type GeoPrecision = (typeof GEO_PRECISIONS)[number];

export const PRIVACY_TRANSFORMS = [
  "none",
  "public_place_centroid",
  "street_generalisation",
  "neighbourhood_centroid",
  "municipality_centroid",
  "suppressed",
] as const;
export type PrivacyTransform = (typeof PRIVACY_TRANSFORMS)[number];

export const LOCATION_SENSITIVITIES = [
  "public_place",
  "non_sensitive",
  "private_or_sensitive",
  "unknown",
] as const;
export type LocationSensitivity = (typeof LOCATION_SENSITIVITIES)[number];

export const EVENT_RECORD_STATUSES = [
  "verified_source",
  "published",
  "superseded",
  "merged",
  "split",
  "withdrawn",
  "suppressed",
] as const;
export type EventRecordStatus = (typeof EVENT_RECORD_STATUSES)[number];

export type PointGeometry = {
  type: "Point";
  coordinates: readonly [longitude: number, latitude: number];
};

export type LtcedsPublicLocation = {
  role: LocationRole;
  municipality: string;
  precision: GeoPrecision;
  sensitivity: LocationSensitivity;
  privacy_transform: PrivacyTransform;
  geometry: PointGeometry | null;
  place_name?: string | null;
  neighbourhood?: string | null;
  iccs_location_type?: string | null;
};

export type LtcedsPublicOffence = {
  offence_instance_id: string;
  classification_basis:
    | "source_stated_legal"
    | "istat_crosswalk"
    | "behavioural_manual"
    | "provisional";
  iccs_code?: string | null;
  istat_catalogue_id?: string | null;
  istat_synthetic_code?: string | null;
  istat_analytical_code?: string | null;
  legal_reference?: string | null;
  attempt_status?: "attempted" | "completed" | "not_applicable" | "unknown";
  situational_context?: readonly string[];
  cyber_related?: string | null;
  affected_object_count?: number | null;
};

export type LtcedsSourceRef = {
  source_id: string;
  source_type:
    | "judicial_primary"
    | "law_enforcement_primary"
    | "public_authority_primary"
    | "news_agency"
    | "press_secondary"
    | "academic"
    | "other";
  url?: string | null;
  published_at?: string | null;
};

export type LtcedsPublicEvent = {
  event_id: string;
  schema_version: typeof LTCEDS_SCHEMA_VERSION;
  record_status: EventRecordStatus;
  event_form: EventForm;
  title: string;
  temporal: {
    start?: string | null;
    end?: string | null;
    edtf?: string | null;
    precision:
      | "exact_datetime"
      | "exact_date"
      | "bounded_interval"
      | "week_or_similar"
      | "month"
      | "year"
      | "approximate"
      | "unknown";
  };
  privacy_tier: "open" | "generalised" | "suppressed";
  locations?: readonly LtcedsPublicLocation[];
  offences: readonly LtcedsPublicOffence[];
  sources: readonly LtcedsSourceRef[];
  updated_at: string;
};

export type LtcedsEventCluster = {
  cluster_id: string;
  reported_event_count: number | null;
  count_precision: "exact" | "minimum" | "approximate" | "unknown";
  resolution_status: "unresolved" | "partially_resolved" | "resolved";
  resolved_event_ids: readonly string[];
};

export type SemanticIssue = {
  code:
    | "EVENT_ID_NOT_UUIDV7"
    | "OFFENCE_ID_NOT_UUIDV7"
    | "SOURCE_ID_NOT_UUIDV7"
    | "NO_OFFENCES"
    | "NO_SOURCES"
    | "SUPPRESSED_EVENT_HAS_GEOMETRY"
    | "SUPPRESSED_LOCATION_HAS_GEOMETRY"
    | "PRIVATE_EXACT_LOCATION_NOT_GENERALISED"
    | "COARSE_MUNICIPALITY_POINT"
    | "NON_OCCURRENCE_CANNOT_BE_DEFAULT_MAP_POINT";
  path: string;
  message: string;
};

const UUID_V7_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuidV7(value: string): boolean {
  return UUID_V7_RE.test(value);
}

/**
 * Public map policy is intentionally stricter than schema validity.
 * Only offence occurrence locations can become default crime-map points.
 * Municipality centroids and unknown/coarse locations are excluded because
 * they would visually assert a precision the evidence does not support.
 */
export function isDefaultPublicMapLocation(
  location: LtcedsPublicLocation,
): boolean {
  if (location.role !== "occurrence") return false;
  if (!location.geometry) return false;
  if (location.privacy_transform === "suppressed") return false;
  if (location.privacy_transform === "municipality_centroid") return false;
  if (location.precision === "municipality" || location.precision === "unknown") {
    return false;
  }
  if (
    location.sensitivity === "private_or_sensitive" &&
    location.precision === "exact_address" &&
    location.privacy_transform === "none"
  ) {
    return false;
  }
  if (location.sensitivity === "unknown" && location.precision === "exact_address") {
    return false;
  }
  return true;
}

export function defaultPublicMapLocations(
  event: LtcedsPublicEvent,
): readonly LtcedsPublicLocation[] {
  if (event.privacy_tier === "suppressed") return [];
  return (event.locations ?? []).filter(isDefaultPublicMapLocation);
}

/**
 * Clusters are an anti-false-precision object. They must never be expanded
 * automatically into synthetic individual events merely because a count is
 * known. Resolution happens only after event-level distinguishing evidence is
 * available in a separate resolver/review step.
 */
export function canAutoMintClusterMembers(_cluster: LtcedsEventCluster): false {
  return false;
}

export function validateClusterSemantics(cluster: LtcedsEventCluster): string[] {
  const issues: string[] = [];
  if (
    cluster.reported_event_count !== null &&
    (!Number.isInteger(cluster.reported_event_count) || cluster.reported_event_count < 1)
  ) {
    issues.push("reported_event_count must be null or an integer >= 1");
  }
  if (cluster.count_precision === "exact" && cluster.reported_event_count === null) {
    issues.push("exact count_precision requires reported_event_count");
  }
  if (cluster.resolution_status === "unresolved" && cluster.resolved_event_ids.length > 0) {
    issues.push("unresolved cluster cannot contain resolved_event_ids");
  }
  if (
    cluster.resolution_status === "resolved" &&
    cluster.count_precision === "exact" &&
    cluster.reported_event_count !== null &&
    cluster.resolved_event_ids.length !== cluster.reported_event_count
  ) {
    issues.push("resolved exact-count cluster must resolve to the reported number of events");
  }
  if (new Set(cluster.resolved_event_ids).size !== cluster.resolved_event_ids.length) {
    issues.push("resolved_event_ids must be unique");
  }
  return issues;
}

export function validatePublicEventSemantics(
  event: LtcedsPublicEvent,
): readonly SemanticIssue[] {
  const issues: SemanticIssue[] = [];

  if (!isUuidV7(event.event_id)) {
    issues.push({
      code: "EVENT_ID_NOT_UUIDV7",
      path: "event_id",
      message: "event_id must be an immutable UUIDv7",
    });
  }
  if (event.offences.length === 0) {
    issues.push({
      code: "NO_OFFENCES",
      path: "offences",
      message: "a public event must contain at least one offence instance",
    });
  }
  if (event.sources.length === 0) {
    issues.push({
      code: "NO_SOURCES",
      path: "sources",
      message: "a public event must cite at least one source",
    });
  }

  event.offences.forEach((offence, index) => {
    if (!isUuidV7(offence.offence_instance_id)) {
      issues.push({
        code: "OFFENCE_ID_NOT_UUIDV7",
        path: `offences[${index}].offence_instance_id`,
        message: "offence_instance_id must be UUIDv7",
      });
    }
  });

  event.sources.forEach((source, index) => {
    if (!isUuidV7(source.source_id)) {
      issues.push({
        code: "SOURCE_ID_NOT_UUIDV7",
        path: `sources[${index}].source_id`,
        message: "source_id must be UUIDv7",
      });
    }
  });

  const locations = event.locations ?? [];
  if (event.privacy_tier === "suppressed") {
    locations.forEach((location, index) => {
      if (location.geometry !== null) {
        issues.push({
          code: "SUPPRESSED_EVENT_HAS_GEOMETRY",
          path: `locations[${index}].geometry`,
          message: "suppressed public events cannot expose geometry",
        });
      }
    });
  }

  locations.forEach((location, index) => {
    const prefix = `locations[${index}]`;
    if (location.privacy_transform === "suppressed" && location.geometry !== null) {
      issues.push({
        code: "SUPPRESSED_LOCATION_HAS_GEOMETRY",
        path: `${prefix}.geometry`,
        message: "suppressed locations must have null public geometry",
      });
    }
    if (
      location.sensitivity === "private_or_sensitive" &&
      location.precision === "exact_address" &&
      location.privacy_transform === "none" &&
      location.geometry !== null
    ) {
      issues.push({
        code: "PRIVATE_EXACT_LOCATION_NOT_GENERALISED",
        path: prefix,
        message: "private or sensitive exact locations must be generalised or suppressed",
      });
    }
    if (
      location.geometry !== null &&
      (location.precision === "municipality" ||
        location.privacy_transform === "municipality_centroid")
    ) {
      issues.push({
        code: "COARSE_MUNICIPALITY_POINT",
        path: prefix,
        message: "municipality-level evidence must not be published as a point event",
      });
    }
    if (location.role !== "occurrence" && isDefaultPublicMapLocation(location)) {
      issues.push({
        code: "NON_OCCURRENCE_CANNOT_BE_DEFAULT_MAP_POINT",
        path: prefix,
        message: "only occurrence locations may appear as default crime-map points",
      });
    }
  });

  return issues;
}
