import type {
  CrimeAttemptStatus,
  CrimeClassificationBasis,
  CrimeEventForm,
  CrimeEventRecordStatus,
  CrimeGeoPrecision,
  CrimeLocationEvidenceBasis,
  CrimeLocationRole,
  CrimeLocationSensitivity,
  CrimePublicationRisk,
  CrimeSourceType,
  CrimeTemporalPrecision,
} from "./schema/crimeEvents";

export const LTCEDS_REVIEWED_PLAN_SCHEMA_VERSION = "ltceds-reviewed-plan/1.0" as const;
const UUID_V7_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_RE = /^[0-9a-f]{64}$/;

export type ReviewedPlanPublicationIntent = "publish" | "canonical_only" | "suppress";
export type ReviewedPublicAction =
  | "inserted"
  | "updated"
  | "unchanged"
  | "canonical_only"
  | "suppressed";

export interface AttestedReviewedPlan {
  plan_schema_version: typeof LTCEDS_REVIEWED_PLAN_SCHEMA_VERSION;
  bundle_sha256: string;
  event_id: string;
  publication_intent: ReviewedPlanPublicationIntent;
  reviewed_at: string;
  gates: {
    bundle_schema: "passed";
    source_capacity: "passed" | "not_applicable";
    geoprivacy: "passed";
    public_schema: "passed" | "not_applicable";
    public_semantic: "passed" | "not_applicable";
  };
  canonical: {
    event: {
      eventId: string;
      schemaVersion: string;
      recordStatus: CrimeEventRecordStatus;
      eventForm: CrimeEventForm;
      title: string;
      temporalStart: string | null;
      temporalEnd: string | null;
      temporalEdtf: string | null;
      temporalPrecision: CrimeTemporalPrecision;
      temporalStartBound: string | null;
      temporalEndBound: string | null;
      updatedAt: string;
    };
    sources: Array<{
      sourceId: string;
      sourceType: CrimeSourceType;
      provider: string;
      title: string;
      url: string | null;
      publishedAt: string | null;
      retrievedAt: string | null;
      canonicalSourceKey: string | null;
      contentSha256: string | null;
      updatedAt: string;
    }>;
    offences: Array<{
      offenceInstanceId: string;
      eventId: string;
      classificationSourceId: string | null;
      classificationBasis: CrimeClassificationBasis;
      iccsCode: string | null;
      istatCatalogueId: string | null;
      istatSyntheticCode: string | null;
      istatAnalyticalCode: string | null;
      legalReference: string | null;
      attemptStatus: CrimeAttemptStatus | null;
      situationalContext: string[];
      cyberRelated: string | null;
      affectedObjectCount: number | null;
      updatedAt: string;
    }>;
    locations: Array<{
      locationId: string;
      eventId: string;
      basisSourceId: string | null;
      role: CrimeLocationRole;
      municipality: string;
      evidenceBasis: CrimeLocationEvidenceBasis;
      evidencePrecision: CrimeGeoPrecision;
      resolvedPrecision: CrimeGeoPrecision;
      sensitivity: CrimeLocationSensitivity;
      publicationRisk: CrimePublicationRisk;
      longitude: string | null;
      latitude: string | null;
      placeName: string | null;
      neighbourhood: string | null;
      iccsLocationType: string | null;
      streetScopeKey: string | null;
      neighbourhoodScopeKey: string | null;
      localityScopeKey: string | null;
      updatedAt: string;
    }>;
    event_sources: Array<{
      eventId: string;
      sourceId: string;
      supportRole: "event_support";
    }>;
    cluster_memberships: string[];
  };
  public_projection: null | {
    eventId: string;
    schemaVersion: string;
    payload: Record<string, unknown>;
    payloadSha256: string;
    publicationGateVersion: string;
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

function assertUuidV7(value: string, label: string): void {
  if (!UUID_V7_RE.test(value)) throw new Error(`${label} must be UUIDv7: ${value}`);
}

function assertSha256(value: string, label: string): void {
  if (!SHA256_RE.test(value)) throw new Error(`${label} must be lowercase SHA-256`);
}

function assertDateTime(value: string, label: string): void {
  if (!Number.isFinite(Date.parse(value))) throw new Error(`${label} must be a date-time`);
}

function assertUnique(values: readonly string[], label: string): void {
  if (new Set(values).size !== values.length) throw new Error(`${label} must be unique`);
}

export function assertAttestedReviewedPlan(value: unknown): asserts value is AttestedReviewedPlan {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("reviewed plan must be an object");
  }
  const plan = value as Partial<AttestedReviewedPlan>;
  if (plan.plan_schema_version !== LTCEDS_REVIEWED_PLAN_SCHEMA_VERSION) {
    throw new Error(`unsupported reviewed plan version: ${String(plan.plan_schema_version)}`);
  }
  if (!plan.bundle_sha256) throw new Error("bundle_sha256 is required");
  assertSha256(plan.bundle_sha256, "bundle_sha256");
  if (!plan.event_id) throw new Error("event_id is required");
  assertUuidV7(plan.event_id, "event_id");
  if (!plan.reviewed_at) throw new Error("reviewed_at is required");
  assertDateTime(plan.reviewed_at, "reviewed_at");

  const gates = plan.gates;
  if (!gates || gates.bundle_schema !== "passed" || gates.geoprivacy !== "passed") {
    throw new Error("reviewed plan is not attested by bundle/geoprivacy gates");
  }
  if (gates.source_capacity !== "passed" && gates.source_capacity !== "not_applicable") {
    throw new Error("reviewed plan source-capacity gate is not passed");
  }
  if (gates.public_schema !== "passed" && gates.public_schema !== "not_applicable") {
    throw new Error("reviewed plan public-schema gate is not passed");
  }
  if (gates.public_semantic !== "passed" && gates.public_semantic !== "not_applicable") {
    throw new Error("reviewed plan public-semantic gate is not passed");
  }

  if (!plan.canonical?.event) throw new Error("canonical event is required");
  if (plan.canonical.event.eventId !== plan.event_id) {
    throw new Error("canonical event ID does not match plan event_id");
  }
  assertUuidV7(plan.canonical.event.eventId, "canonical.event.eventId");
  assertDateTime(plan.canonical.event.updatedAt, "canonical.event.updatedAt");

  const sources = plan.canonical.sources ?? [];
  const offences = plan.canonical.offences ?? [];
  const locations = plan.canonical.locations ?? [];
  if (!sources.length) throw new Error("reviewed canonical event requires at least one source");
  if (!offences.length) throw new Error("reviewed canonical event requires at least one offence");

  sources.forEach((source) => {
    assertUuidV7(source.sourceId, "canonical source ID");
    if (source.contentSha256) assertSha256(source.contentSha256, "source contentSha256");
    assertDateTime(source.updatedAt, `source ${source.sourceId} updatedAt`);
  });
  offences.forEach((offence) => {
    assertUuidV7(offence.offenceInstanceId, "canonical offence ID");
    if (offence.eventId !== plan.event_id) throw new Error("offence eventId does not match plan event_id");
    assertDateTime(offence.updatedAt, `offence ${offence.offenceInstanceId} updatedAt`);
  });
  locations.forEach((location) => {
    assertUuidV7(location.locationId, "canonical location ID");
    if (location.eventId !== plan.event_id) throw new Error("location eventId does not match plan event_id");
    if ((location.longitude === null) !== (location.latitude === null)) {
      throw new Error(`location ${location.locationId} must contain both coordinates or neither`);
    }
    assertDateTime(location.updatedAt, `location ${location.locationId} updatedAt`);
  });
  plan.canonical.cluster_memberships.forEach((clusterId) => assertUuidV7(clusterId, "cluster membership ID"));

  assertUnique(sources.map((source) => source.sourceId), "canonical source IDs");
  assertUnique(offences.map((offence) => offence.offenceInstanceId), "canonical offence IDs");
  assertUnique(locations.map((location) => location.locationId), "canonical location IDs");
  assertUnique(plan.canonical.cluster_memberships, "cluster memberships");

  const sourceIds = new Set(sources.map((source) => source.sourceId));
  for (const link of plan.canonical.event_sources) {
    if (link.eventId !== plan.event_id) throw new Error("event-source link eventId mismatch");
    if (!sourceIds.has(link.sourceId)) throw new Error("event-source link references a source outside the plan");
  }

  if (plan.publication_intent === "canonical_only") {
    if (plan.public_projection !== null) {
      throw new Error("canonical_only plan must not contain a public projection");
    }
    if (gates.public_schema !== "not_applicable" || gates.public_semantic !== "not_applicable") {
      throw new Error("canonical_only plan requires not_applicable public gates");
    }
    return;
  }

  if (!plan.public_projection) {
    throw new Error(`${plan.publication_intent} plan requires a public projection`);
  }
  if (plan.public_projection.eventId !== plan.event_id) {
    throw new Error("public projection eventId does not match plan event_id");
  }
  assertSha256(plan.public_projection.payloadSha256, "public payloadSha256");
  assertDateTime(plan.public_projection.updatedAt, "public projection updatedAt");
  if (plan.public_projection.payload.event_id !== plan.event_id) {
    throw new Error("public payload event_id does not match plan event_id");
  }
  if (plan.public_projection.payload.schema_version !== plan.public_projection.schemaVersion) {
    throw new Error("public payload schema version does not match projection schemaVersion");
  }
  if (gates.public_schema !== "passed" || gates.public_semantic !== "passed") {
    throw new Error("public projection requires passed schema and semantic gates");
  }
  if (plan.publication_intent === "publish" && plan.public_projection.payload.record_status !== "published") {
    throw new Error("publish plan requires published public payload");
  }
  if (plan.publication_intent === "suppress" && plan.public_projection.payload.record_status !== "suppressed") {
    throw new Error("suppress plan requires suppressed public payload");
  }
}

export function classifyReviewedPublicAction(
  existingHash: string | null | undefined,
  plan: Pick<AttestedReviewedPlan, "publication_intent" | "public_projection">,
): ReviewedPublicAction {
  if (plan.publication_intent === "canonical_only") return "canonical_only";
  if (plan.publication_intent === "suppress") return "suppressed";
  if (!plan.public_projection) throw new Error("publish plan is missing public projection");
  if (!existingHash) return "inserted";
  return existingHash === plan.public_projection.payloadSha256 ? "unchanged" : "updated";
}

export function shouldWriteReviewedPublicProjection(
  existingHash: string | null | undefined,
  plan: Pick<AttestedReviewedPlan, "publication_intent" | "public_projection">,
): boolean {
  if (plan.publication_intent === "canonical_only") return false;
  if (!plan.public_projection) return false;
  return existingHash !== plan.public_projection.payloadSha256;
}
