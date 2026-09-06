import { createHash } from "node:crypto";

import {
  isUuidV7,
  validatePublicEventSemantics,
  type LtcedsPublicEvent,
  type LtcedsPublicLocation,
} from "@workspace/publication-standardisation/ltceds";
import {
  localityScopeKey,
  neighbourhoodScopeKey,
  projectPublicLocation,
  streetScopeKey,
  validateInternalLocationPrecision,
  type LtcedsInternalLocation,
  type LtcedsPublicAnchor,
} from "@workspace/publication-standardisation/ltceds-location";

import {
  canonicalizeLtcedsSourceUrl,
  sourceMaySolelySupportPublicEvent,
  type LtcedsSourceDefinition,
} from "./ltceds-source-registry";

export const REVIEWED_BUNDLE_SCHEMA_VERSION = "ltceds-reviewed-bundle/1.0" as const;
export const REVIEWED_PLAN_SCHEMA_VERSION = "ltceds-reviewed-plan/1.0" as const;
export const REVIEWED_PUBLICATION_GATE_VERSION =
  "ltceds-reviewed-publication-gate/1.0-draft.1" as const;

export type ReviewedPublicationIntent = "publish" | "canonical_only" | "suppress";
export type ReviewedRecordStatus =
  | "verified_source"
  | "published"
  | "superseded"
  | "merged"
  | "split"
  | "withdrawn"
  | "suppressed";
export type ReviewedEventForm = "discrete" | "continuous_episode" | "course_of_conduct";
export type ReviewedTemporalPrecision =
  | "exact_datetime"
  | "exact_date"
  | "bounded_interval"
  | "week_or_similar"
  | "month"
  | "year"
  | "approximate"
  | "unknown";
export type ReviewedSourceType =
  | "judicial_primary"
  | "law_enforcement_primary"
  | "public_authority_primary"
  | "news_agency"
  | "press_secondary"
  | "academic"
  | "other";
export type ReviewedRisk = "low" | "medium" | "high";
export type ReviewedPublicationSupport =
  | "primary_possible"
  | "corroboration_only"
  | "discovery_only"
  | "context_only";
export type ReviewedCandidatePolicy = "automatic" | "human_gate" | "disabled";

export interface ReviewedTemporal {
  start?: string | null;
  end?: string | null;
  edtf?: string | null;
  precision: ReviewedTemporalPrecision;
}

export interface ReviewedOffence {
  offence_instance_id: string;
  classification_source_id?: string | null;
  iccs_code?: string | null;
  istat_catalogue_id?: string | null;
  istat_synthetic_code?: string | null;
  istat_analytical_code?: string | null;
  legal_reference?: string | null;
  classification_basis:
    | "source_stated_legal"
    | "istat_crosswalk"
    | "behavioural_manual"
    | "provisional";
  attempt_status?: "attempted" | "completed" | "not_applicable" | "unknown";
  situational_context?: string[];
  cyber_related?: string | null;
  affected_object_count?: number | null;
}

export interface ReviewedLocation {
  location_id: string;
  basis_source_id: string | null;
  role:
    | "occurrence"
    | "target"
    | "discovery"
    | "recovery"
    | "arrest"
    | "search"
    | "procedural"
    | "other";
  municipality: string;
  evidence_basis:
    | "source_stated_exact"
    | "source_stated_named_site"
    | "source_stated_street"
    | "source_stated_neighbourhood"
    | "source_stated_locality"
    | "geocoder_candidate"
    | "editorial_inference"
    | "unknown";
  evidence_precision:
    | "exact_public_site"
    | "exact_address"
    | "street_segment"
    | "neighbourhood"
    | "locality"
    | "municipality"
    | "unknown";
  resolved_precision:
    | "exact_public_site"
    | "exact_address"
    | "street_segment"
    | "neighbourhood"
    | "locality"
    | "municipality"
    | "unknown";
  sensitivity: "public_place" | "non_sensitive" | "private_or_sensitive" | "unknown";
  publication_risk:
    | "low_public_site"
    | "non_sensitive"
    | "residential"
    | "victim_linked"
    | "minor_or_vulnerable"
    | "sexual_offence_context"
    | "unknown";
  geometry: null | { type: "Point"; coordinates: [number, number] };
  place_name?: string | null;
  neighbourhood?: string | null;
  iccs_location_type?: string | null;
  street_scope_key?: string | null;
  neighbourhood_scope_key?: string | null;
  locality_scope_key?: string | null;
}

export interface ReviewedSource {
  source_id: string;
  source_type: ReviewedSourceType;
  provider: string;
  title: string;
  url?: string | null;
  published_at?: string | null;
  retrieved_at?: string | null;
  canonical_source_key?: string | null;
  content_sha256?: string | null;
  publication_support: ReviewedPublicationSupport;
  candidate_policy: ReviewedCandidatePolicy;
  personal_data_risk: ReviewedRisk;
  reputational_risk: ReviewedRisk;
  requires_corroboration: boolean;
}

export interface ReviewedEventBundle {
  bundle_schema_version: typeof REVIEWED_BUNDLE_SCHEMA_VERSION;
  event_id: string;
  record_status: ReviewedRecordStatus;
  event_form: ReviewedEventForm;
  title: string;
  public_summary?: string | null;
  procedural_summary?: string | null;
  temporal: ReviewedTemporal;
  offences: ReviewedOffence[];
  locations: ReviewedLocation[];
  sources: ReviewedSource[];
  cluster_ids: string[];
  review: {
    reviewer_role: "researcher" | "editor" | "senior_editor";
    reviewer_id: string;
    reviewed_at: string;
    decision: "approved" | "canonical_only" | "rejected";
    rationale_codes: string[];
    public_text_checked: boolean;
  };
  publication_intent: ReviewedPublicationIntent;
}

export interface CompiledReviewedPlan {
  plan_schema_version: typeof REVIEWED_PLAN_SCHEMA_VERSION;
  bundle_sha256: string;
  event_id: string;
  publication_intent: ReviewedPublicationIntent;
  reviewed_at: string;
  gates: {
    bundle_schema: "passed";
    source_capacity: "passed" | "not_applicable";
    geoprivacy: "passed";
    public_schema: "pending" | "passed" | "not_applicable";
    public_semantic: "passed" | "not_applicable";
  };
  canonical: {
    event: Record<string, unknown>;
    sources: Record<string, unknown>[];
    offences: Record<string, unknown>[];
    locations: Record<string, unknown>[];
    event_sources: Record<string, unknown>[];
    cluster_memberships: string[];
  };
  public_projection: null | {
    eventId: string;
    schemaVersion: "1.0-draft.1";
    payload: Record<string, unknown>;
    payloadSha256: string;
    publicationGateVersion: typeof REVIEWED_PUBLICATION_GATE_VERSION;
    updatedAt: string;
  };
  selected_anchor_ids: string[];
  geoprivacy: Array<{
    location_id: string;
    selected_anchor_id: string | null;
    map_default: boolean;
    reasons: readonly string[];
  }>;
}

const FORBIDDEN_PERSON_KEYS = new Set([
  "person",
  "person_id",
  "person_name",
  "suspect",
  "suspect_id",
  "suspect_name",
  "victim",
  "victim_id",
  "victim_name",
  "offender",
  "offender_id",
  "offender_name",
  "accused",
  "accused_id",
  "accused_name",
  "defendant",
  "defendant_id",
  "defendant_name",
  "first_name",
  "last_name",
  "full_name",
  "birth_date",
  "date_of_birth",
  "age",
  "initials",
  "codice_fiscale",
  "tax_code",
]);

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function sortedValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortedValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, sortedValue(child)]),
    );
  }
  return value;
}

export function canonicalReviewedJson(value: unknown): string {
  return JSON.stringify(sortedValue(value));
}

export function sha256ReviewedJson(value: unknown): string {
  return createHash("sha256").update(canonicalReviewedJson(value)).digest("hex");
}

function requireUuidV7(value: string, label: string): void {
  if (!isUuidV7(value)) throw new Error(`${label} must be UUIDv7: ${value}`);
}

function assertUnique(values: readonly string[], label: string): void {
  if (new Set(values).size !== values.length) throw new Error(`${label} must be unique`);
}

function assertDateTime(value: string, label: string): void {
  if (!Number.isFinite(Date.parse(value))) throw new Error(`${label} must be a valid date-time`);
}

function assertNoPersonIdentityKeys(value: unknown, path = "$" ): void {
  if (Array.isArray(value)) {
    value.forEach((child, index) => assertNoPersonIdentityKeys(child, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_PERSON_KEYS.has(key.toLowerCase())) {
      throw new Error(`person identity field is out of scope in reviewed bundle v1: ${path}.${key}`);
    }
    assertNoPersonIdentityKeys(child, `${path}.${key}`);
  }
}

function temporalBounds(
  temporal: ReviewedTemporal,
  eventForm: ReviewedEventForm,
): { start: string | null; end: string | null } {
  if (temporal.precision === "exact_date" && temporal.start && ISO_DATE_RE.test(temporal.start)) {
    const end = temporal.end && ISO_DATE_RE.test(temporal.end) ? temporal.end : temporal.start;
    return { start: temporal.start, end };
  }
  if (
    temporal.precision === "bounded_interval" &&
    temporal.start &&
    temporal.end &&
    ISO_DATE_RE.test(temporal.start) &&
    ISO_DATE_RE.test(temporal.end)
  ) {
    if (temporal.end < temporal.start) throw new Error("temporal end precedes start");
    return { start: temporal.start, end: temporal.end };
  }
  if (
    eventForm === "course_of_conduct" &&
    !temporal.start &&
    temporal.end &&
    ISO_DATE_RE.test(temporal.end)
  ) {
    return { start: null, end: temporal.end };
  }
  return { start: null, end: null };
}

function scopeKeyOrNull(
  kind: "street" | "neighbourhood" | "locality",
  explicit: string | null | undefined,
  label: string | null | undefined,
): string | null {
  if (explicit?.trim()) return explicit.trim();
  if (!label?.trim()) return null;
  if (kind === "street") return streetScopeKey(label);
  if (kind === "neighbourhood") return neighbourhoodScopeKey(label);
  return localityScopeKey(label);
}

function toInternalLocation(location: ReviewedLocation): LtcedsInternalLocation {
  const internal: LtcedsInternalLocation = {
    role: location.role,
    municipality: location.municipality,
    evidence_basis: location.evidence_basis,
    evidence_precision: location.evidence_precision,
    resolved_precision: location.resolved_precision,
    sensitivity: location.sensitivity,
    publication_risk: location.publication_risk,
    geometry: location.geometry,
    place_name: location.place_name ?? null,
    neighbourhood: location.neighbourhood ?? null,
    iccs_location_type: location.iccs_location_type ?? null,
    street_scope_key: scopeKeyOrNull(
      "street",
      location.street_scope_key,
      location.evidence_precision === "exact_address" ||
        location.evidence_precision === "street_segment"
        ? location.place_name
        : null,
    ),
    neighbourhood_scope_key: scopeKeyOrNull(
      "neighbourhood",
      location.neighbourhood_scope_key,
      location.neighbourhood,
    ),
    locality_scope_key: scopeKeyOrNull(
      "locality",
      location.locality_scope_key,
      location.evidence_precision === "locality" ? location.place_name : null,
    ),
  };
  const issues = validateInternalLocationPrecision(internal);
  if (issues.length) {
    throw new Error(`invalid internal location ${location.location_id}: ${issues.join("; ")}`);
  }
  return internal;
}

function reviewedSourceDefinition(source: ReviewedSource): LtcedsSourceDefinition {
  const authorityType = source.source_type === "academic" ? "academic_archive" : source.source_type;
  const evidenceRole =
    source.publication_support === "context_only"
      ? "context_only"
      : source.publication_support === "discovery_only"
        ? "discovery_only"
        : source.publication_support === "corroboration_only"
          ? "corroboration"
          : "occurrence_primary";
  return {
    sourceId: source.source_id,
    name: source.provider,
    authorityType,
    acquisitionMode: "manual",
    contentMode: "narrative",
    evidenceRole,
    candidatePolicy: source.candidate_policy,
    publicationSupport: source.publication_support,
    reuseStatus: "public_access",
    personalDataRisk: source.personal_data_risk,
    reputationalRisk: source.reputational_risk,
    requiresCorroboration: source.requires_corroboration,
    limitations: [],
  };
}

export function evaluateReviewedSourceCapacity(bundle: ReviewedEventBundle): {
  status: "passed" | "not_applicable";
  override_codes: string[];
} {
  if (bundle.publication_intent !== "publish") {
    return { status: "not_applicable", override_codes: [] };
  }
  const rationale = new Set(bundle.review.rationale_codes);
  const senior = bundle.review.reviewer_role === "senior_editor";
  const sourceDefinitions = bundle.sources.map(reviewedSourceDefinition);
  const highRisk = bundle.sources.some(
    (source) =>
      source.personal_data_risk === "high" ||
      source.reputational_risk === "high" ||
      source.candidate_policy === "human_gate",
  );
  const hasPrimaryCapacity = sourceDefinitions.some(sourceMaySolelySupportPublicEvent);
  const overrides: string[] = [];

  if (highRisk) {
    if (!(senior && rationale.has("HIGH_RISK_SOURCE_REVIEW"))) {
      throw new Error(
        "high-risk publication source combination requires senior_editor + HIGH_RISK_SOURCE_REVIEW",
      );
    }
    overrides.push("HIGH_RISK_SOURCE_REVIEW");
  }
  if (!hasPrimaryCapacity) {
    if (!(senior && rationale.has("SOURCE_CAPACITY_OVERRIDE"))) {
      throw new Error(
        "publish intent requires a source with primary publication capacity or senior SOURCE_CAPACITY_OVERRIDE",
      );
    }
    overrides.push("SOURCE_CAPACITY_OVERRIDE");
  }
  return { status: "passed", override_codes: overrides };
}

function buildSuppressedPublicLocation(location: ReviewedLocation): LtcedsPublicLocation {
  const coarsePrecision =
    location.evidence_precision === "exact_address" ||
    location.evidence_precision === "exact_public_site" ||
    location.evidence_precision === "street_segment"
      ? "neighbourhood"
      : location.evidence_precision;
  return {
    role: location.role,
    municipality: location.municipality,
    precision: coarsePrecision,
    sensitivity: location.sensitivity,
    privacy_transform: "suppressed",
    geometry: null,
    place_name: null,
    neighbourhood:
      coarsePrecision === "neighbourhood" ? location.neighbourhood ?? null : null,
    iccs_location_type: location.iccs_location_type ?? null,
  };
}

function privacyTier(
  intent: ReviewedPublicationIntent,
  locations: readonly LtcedsPublicLocation[],
): "open" | "generalised" | "suppressed" {
  if (intent === "suppress") return "suppressed";
  if (locations.some((location) => location.privacy_transform !== "none")) {
    return "generalised";
  }
  return "open";
}

function canonicalSourceKey(source: ReviewedSource): string | null {
  if (source.canonical_source_key?.trim()) return source.canonical_source_key.trim();
  if (!source.url) return null;
  return canonicalizeLtcedsSourceUrl(source.url);
}

export function assertReviewedBundleSemantics(bundle: ReviewedEventBundle): void {
  assertNoPersonIdentityKeys(bundle);
  if (bundle.bundle_schema_version !== REVIEWED_BUNDLE_SCHEMA_VERSION) {
    throw new Error(`unsupported reviewed bundle version: ${bundle.bundle_schema_version}`);
  }
  requireUuidV7(bundle.event_id, "event_id");
  bundle.offences.forEach((offence) => requireUuidV7(offence.offence_instance_id, "offence_instance_id"));
  bundle.locations.forEach((location) => requireUuidV7(location.location_id, "location_id"));
  bundle.sources.forEach((source) => requireUuidV7(source.source_id, "source_id"));
  bundle.cluster_ids.forEach((clusterId) => requireUuidV7(clusterId, "cluster_id"));
  assertUnique(bundle.offences.map((item) => item.offence_instance_id), "offence IDs");
  assertUnique(bundle.locations.map((item) => item.location_id), "location IDs");
  assertUnique(bundle.sources.map((item) => item.source_id), "source IDs");
  assertUnique(bundle.cluster_ids, "cluster IDs");
  assertDateTime(bundle.review.reviewed_at, "review.reviewed_at");
  if (bundle.review.decision === "rejected") {
    throw new Error("rejected reviewed bundle cannot become a canonical EVENT");
  }
  if (bundle.publication_intent === "publish") {
    if (bundle.record_status !== "published" || bundle.review.decision !== "approved") {
      throw new Error("publish intent requires published status and approved review");
    }
    if (!bundle.review.public_text_checked) {
      throw new Error("publish intent requires public_text_checked=true");
    }
  }
  if (bundle.publication_intent === "canonical_only" && bundle.record_status !== "verified_source") {
    throw new Error("canonical_only intent requires verified_source status");
  }
  if (bundle.publication_intent === "suppress" && bundle.record_status !== "suppressed") {
    throw new Error("suppress intent requires suppressed status");
  }

  const sourceIds = new Set(bundle.sources.map((source) => source.source_id));
  for (const offence of bundle.offences) {
    if (offence.classification_source_id && !sourceIds.has(offence.classification_source_id)) {
      throw new Error(
        `offence ${offence.offence_instance_id} classification_source_id is not in bundle sources`,
      );
    }
  }
  for (const location of bundle.locations) {
    if (location.basis_source_id && !sourceIds.has(location.basis_source_id)) {
      throw new Error(`location ${location.location_id} basis_source_id is not in bundle sources`);
    }
    toInternalLocation(location);
  }
  temporalBounds(bundle.temporal, bundle.event_form);
}

export function compileReviewedBundle(
  bundle: ReviewedEventBundle,
  anchors: readonly LtcedsPublicAnchor[] = [],
): CompiledReviewedPlan {
  assertReviewedBundleSemantics(bundle);
  const sourceCapacity = evaluateReviewedSourceCapacity(bundle);
  const reviewedAt = bundle.review.reviewed_at;
  const bounds = temporalBounds(bundle.temporal, bundle.event_form);
  const bundleSha256 = sha256ReviewedJson(bundle);

  const canonicalLocations = bundle.locations.map((location) => {
    const internal = toInternalLocation(location);
    return {
      locationId: location.location_id,
      eventId: bundle.event_id,
      basisSourceId: location.basis_source_id,
      role: internal.role,
      municipality: internal.municipality,
      evidenceBasis: internal.evidence_basis,
      evidencePrecision: internal.evidence_precision,
      resolvedPrecision: internal.resolved_precision,
      sensitivity: internal.sensitivity,
      publicationRisk: internal.publication_risk,
      longitude: internal.geometry ? String(internal.geometry.coordinates[0]) : null,
      latitude: internal.geometry ? String(internal.geometry.coordinates[1]) : null,
      placeName: internal.place_name ?? null,
      neighbourhood: internal.neighbourhood ?? null,
      iccsLocationType: internal.iccs_location_type ?? null,
      streetScopeKey: internal.street_scope_key ?? null,
      neighbourhoodScopeKey: internal.neighbourhood_scope_key ?? null,
      localityScopeKey: internal.locality_scope_key ?? null,
      updatedAt: reviewedAt,
    };
  });

  const geoprivacy = bundle.locations.map((location) => {
    if (bundle.publication_intent === "suppress") {
      return {
        location_id: location.location_id,
        public_location: buildSuppressedPublicLocation(location),
        selected_anchor_id: null,
        map_default: false,
        reasons: ["publication_intent=suppress forces null public geometry"] as readonly string[],
      };
    }
    const decision = projectPublicLocation(toInternalLocation(location), anchors);
    return {
      location_id: location.location_id,
      public_location: decision.public_location,
      selected_anchor_id: decision.selected_anchor_id,
      map_default: decision.map_default,
      reasons: decision.reasons,
    };
  });

  const publicLocations = geoprivacy.map((item) => item.public_location);
  const publicPayload: (LtcedsPublicEvent & Record<string, unknown>) | null =
    bundle.publication_intent === "canonical_only"
      ? null
      : {
          event_id: bundle.event_id,
          schema_version: "1.0-draft.1",
          record_status: bundle.publication_intent === "suppress" ? "suppressed" : "published",
          event_form: bundle.event_form,
          title: bundle.title,
          ...(bundle.public_summary ? { summary: bundle.public_summary } : {}),
          temporal: {
            start: bundle.temporal.start ?? null,
            end: bundle.temporal.end ?? null,
            edtf: bundle.temporal.edtf ?? null,
            precision: bundle.temporal.precision,
          },
          privacy_tier: privacyTier(bundle.publication_intent, publicLocations),
          locations: publicLocations,
          offences: bundle.offences.map((offence) => ({
            offence_instance_id: offence.offence_instance_id,
            classification_basis: offence.classification_basis,
            iccs_code: offence.iccs_code ?? null,
            istat_catalogue_id: offence.istat_catalogue_id ?? null,
            istat_synthetic_code: offence.istat_synthetic_code ?? null,
            istat_analytical_code: offence.istat_analytical_code ?? null,
            legal_reference: offence.legal_reference ?? null,
            ...(offence.attempt_status ? { attempt_status: offence.attempt_status } : {}),
            situational_context: [...(offence.situational_context ?? [])],
            cyber_related: offence.cyber_related ?? null,
            affected_object_count: offence.affected_object_count ?? null,
          })),
          sources: bundle.sources.map((source) => ({
            source_id: source.source_id,
            source_type: source.source_type,
            url: source.url ?? null,
            published_at: source.published_at ?? null,
          })),
          ...(bundle.procedural_summary
            ? { procedural_summary: bundle.procedural_summary }
            : {}),
          updated_at: reviewedAt,
        };

  if (publicPayload) {
    const semanticIssues = validatePublicEventSemantics(publicPayload);
    if (semanticIssues.length) {
      throw new Error(
        `public semantic gate failed: ${semanticIssues
          .map((issue) => `${issue.code}@${issue.path}`)
          .join(", ")}`,
      );
    }
  }

  const plan: CompiledReviewedPlan = {
    plan_schema_version: REVIEWED_PLAN_SCHEMA_VERSION,
    bundle_sha256: bundleSha256,
    event_id: bundle.event_id,
    publication_intent: bundle.publication_intent,
    reviewed_at: reviewedAt,
    gates: {
      bundle_schema: "passed",
      source_capacity: sourceCapacity.status,
      geoprivacy: "passed",
      public_schema: publicPayload ? "pending" : "not_applicable",
      public_semantic: publicPayload ? "passed" : "not_applicable",
    },
    canonical: {
      event: {
        eventId: bundle.event_id,
        schemaVersion: "1.0-draft.1",
        recordStatus: bundle.record_status,
        eventForm: bundle.event_form,
        title: bundle.title,
        temporalStart: bundle.temporal.start ?? null,
        temporalEnd: bundle.temporal.end ?? null,
        temporalEdtf: bundle.temporal.edtf ?? null,
        temporalPrecision: bundle.temporal.precision,
        temporalStartBound: bounds.start,
        temporalEndBound: bounds.end,
        updatedAt: reviewedAt,
      },
      sources: bundle.sources.map((source) => ({
        sourceId: source.source_id,
        sourceType: source.source_type,
        provider: source.provider,
        title: source.title,
        url: source.url ? canonicalizeLtcedsSourceUrl(source.url) : null,
        publishedAt: source.published_at ?? null,
        retrievedAt: source.retrieved_at ?? null,
        canonicalSourceKey: canonicalSourceKey(source),
        contentSha256: source.content_sha256 ?? null,
        updatedAt: reviewedAt,
      })),
      offences: bundle.offences.map((offence) => ({
        offenceInstanceId: offence.offence_instance_id,
        eventId: bundle.event_id,
        classificationSourceId: offence.classification_source_id ?? null,
        classificationBasis: offence.classification_basis,
        iccsCode: offence.iccs_code ?? null,
        istatCatalogueId: offence.istat_catalogue_id ?? null,
        istatSyntheticCode: offence.istat_synthetic_code ?? null,
        istatAnalyticalCode: offence.istat_analytical_code ?? null,
        legalReference: offence.legal_reference ?? null,
        attemptStatus: offence.attempt_status ?? null,
        situationalContext: [...(offence.situational_context ?? [])],
        cyberRelated: offence.cyber_related ?? null,
        affectedObjectCount: offence.affected_object_count ?? null,
        updatedAt: reviewedAt,
      })),
      locations: canonicalLocations,
      event_sources: bundle.sources.map((source) => ({
        eventId: bundle.event_id,
        sourceId: source.source_id,
        supportRole: "event_support",
      })),
      cluster_memberships: [...bundle.cluster_ids],
    },
    public_projection: publicPayload
      ? {
          eventId: bundle.event_id,
          schemaVersion: "1.0-draft.1",
          payload: publicPayload as Record<string, unknown>,
          payloadSha256: sha256ReviewedJson(publicPayload),
          publicationGateVersion: REVIEWED_PUBLICATION_GATE_VERSION,
          updatedAt: reviewedAt,
        }
      : null,
    selected_anchor_ids: geoprivacy
      .map((item) => item.selected_anchor_id)
      .filter((value): value is string => Boolean(value)),
    geoprivacy: geoprivacy.map((item) => ({
      location_id: item.location_id,
      selected_anchor_id: item.selected_anchor_id,
      map_default: item.map_default,
      reasons: item.reasons,
    })),
  };
  return plan;
}

export function markReviewedPublicSchemaPassed(
  plan: CompiledReviewedPlan,
): CompiledReviewedPlan {
  if (!plan.public_projection) return plan;
  return {
    ...plan,
    gates: { ...plan.gates, public_schema: "passed" },
  };
}

export function reviewedPlanReadyForWrite(plan: CompiledReviewedPlan): boolean {
  return (
    plan.gates.bundle_schema === "passed" &&
    (plan.gates.source_capacity === "passed" ||
      plan.gates.source_capacity === "not_applicable") &&
    plan.gates.geoprivacy === "passed" &&
    (plan.gates.public_schema === "passed" ||
      plan.gates.public_schema === "not_applicable") &&
    (plan.gates.public_semantic === "passed" ||
      plan.gates.public_semantic === "not_applicable")
  );
}
