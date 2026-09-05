import { createHash } from "node:crypto";

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

export const LTCEDS_PILOT_SCHEMA_VERSION = "1.0-draft.1" as const;
export const LTCEDS_PILOT_PUBLICATION_GATE_VERSION =
  "ltceds-publication-gate/1.0-draft.1" as const;

const UUID_V7_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface LtcedsPilotTemporal {
  start?: string | null;
  end?: string | null;
  edtf?: string | null;
  precision: CrimeTemporalPrecision;
}

export interface LtcedsPilotLocation {
  role: CrimeLocationRole;
  place_name?: string | null;
  municipality: string;
  neighbourhood?: string | null;
  precision: CrimeGeoPrecision;
  sensitivity: CrimeLocationSensitivity;
  privacy_transform: string;
  iccs_location_type?: string | null;
  geometry: null | {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface LtcedsPilotOffence {
  offence_instance_id: string;
  iccs_code?: string | null;
  istat_catalogue_id?: string | null;
  istat_synthetic_code?: string | null;
  istat_analytical_code?: string | null;
  legal_reference?: string | null;
  classification_basis: CrimeClassificationBasis;
  attempt_status?: CrimeAttemptStatus;
  situational_context?: string[];
  cyber_related?: string | null;
  affected_object_count?: number | null;
}

export interface LtcedsPilotSource {
  source_id: string;
  source_type: CrimeSourceType;
  url?: string | null;
  published_at?: string | null;
}

export interface LtcedsPilotPublicEvent {
  event_id: string;
  schema_version: typeof LTCEDS_PILOT_SCHEMA_VERSION;
  record_status: CrimeEventRecordStatus;
  event_form: CrimeEventForm;
  title: string;
  summary?: string;
  temporal: LtcedsPilotTemporal;
  privacy_tier: "open" | "generalised" | "suppressed";
  locations?: LtcedsPilotLocation[];
  offences: LtcedsPilotOffence[];
  sources: LtcedsPilotSource[];
  procedural_summary?: string | null;
  quality?: Record<string, unknown>;
  updated_at: string;
}

export interface PlannedCrimeEventRow {
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
  updatedAt: Date;
}

export interface PlannedCrimeSourceRow {
  sourceId: string;
  sourceType: CrimeSourceType;
  provider: string;
  title: string;
  url: string | null;
  publishedAt: Date | null;
  canonicalSourceKey: string | null;
  contentSha256: null;
  updatedAt: Date;
}

export interface PlannedCrimeOffenceRow {
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
  updatedAt: Date;
}

export interface PlannedCrimeLocationRow {
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
  updatedAt: Date;
}

export interface PlannedCrimeEventSourceRow {
  eventId: string;
  sourceId: string;
  supportRole: "event_support";
}

export interface PlannedCrimePublicEventRow {
  eventId: string;
  schemaVersion: string;
  payload: Record<string, unknown>;
  payloadSha256: string;
  publicationGateVersion: typeof LTCEDS_PILOT_PUBLICATION_GATE_VERSION;
  updatedAt: Date;
}

export interface LtcedsPilotEventPlan {
  fileName: string;
  payloadSha256: string;
  event: PlannedCrimeEventRow;
  sources: PlannedCrimeSourceRow[];
  offences: PlannedCrimeOffenceRow[];
  locations: PlannedCrimeLocationRow[];
  eventSources: PlannedCrimeEventSourceRow[];
  publicEvent: PlannedCrimePublicEventRow;
}

export interface LtcedsPilotImportPlan {
  schemaVersion: "1.0";
  mode: "dry-run" | "execute";
  databaseState: "unchecked" | "checked";
  eventCount: number;
  sourceCount: number;
  offenceCount: number;
  locationCount: number;
  publicProjectionCount: number;
  events: LtcedsPilotEventPlan[];
}

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

export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortedValue(value));
}

export function sha256CanonicalJson(value: unknown): string {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

function assertUuidV7(value: string, label: string): void {
  if (!UUID_V7_RE.test(value)) throw new Error(`${label} must be UUIDv7: ${value}`);
}

function assertIsoDateTime(value: string, label: string): Date {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) throw new Error(`${label} is not a valid date-time`);
  return parsed;
}

function canonicalSourceUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  const url = new URL(value);
  url.hash = "";
  const params = [...url.searchParams.entries()]
    .filter(([key]) => !/^utm_/i.test(key))
    .sort(([a, av], [b, bv]) => a.localeCompare(b) || av.localeCompare(bv));
  url.search = "";
  for (const [key, val] of params) url.searchParams.append(key, val);
  return url.toString();
}

export function providerFromSourceUrl(value: string | null | undefined): string {
  if (!value) return "Fonte istituzionale";
  const host = new URL(value).hostname.toLowerCase();
  if (host === "www.carabinieri.it" || host.endsWith(".carabinieri.it")) {
    return "Arma dei Carabinieri";
  }
  if (host === "questure.poliziadistato.it") {
    return "Polizia di Stato — Questura di Catanzaro";
  }
  throw new Error(`Unrecognised pilot institutional source host: ${host}`);
}

function temporalBounds(
  temporal: LtcedsPilotTemporal,
  eventForm: CrimeEventForm,
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

export function evidenceBasisForPrecision(
  precision: CrimeGeoPrecision,
): CrimeLocationEvidenceBasis {
  switch (precision) {
    case "exact_public_site":
      return "source_stated_named_site";
    case "exact_address":
      return "source_stated_exact";
    case "street_segment":
      return "source_stated_street";
    case "neighbourhood":
      return "source_stated_neighbourhood";
    case "locality":
      return "source_stated_locality";
    case "municipality":
    case "unknown":
      return "unknown";
  }
}

export function publicationRiskForLocation(
  location: LtcedsPilotLocation,
): CrimePublicationRisk {
  if (location.sensitivity === "private_or_sensitive") return "residential";
  if (location.sensitivity === "public_place") return "low_public_site";
  if (location.sensitivity === "non_sensitive") return "non_sensitive";
  return "unknown";
}

function normaliseScope(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || null;
}

/**
 * Deterministic child UUIDv7. It preserves the parent event's 48-bit v7
 * timestamp prefix and derives only the random portion from a stable label.
 */
export function deterministicChildUuidV7(eventId: string, label: string): string {
  assertUuidV7(eventId, "eventId");
  const eventHex = eventId.replaceAll("-", "").toLowerCase();
  const timestampHex = eventHex.slice(0, 12);
  const digest = createHash("sha256").update(`${eventId}:${label}`).digest("hex");
  const variantNibble = (8 + (Number.parseInt(digest[3]!, 16) & 0x3)).toString(16);
  return [
    timestampHex.slice(0, 8),
    timestampHex.slice(8, 12),
    `7${digest.slice(0, 3)}`,
    `${variantNibble}${digest.slice(4, 7)}`,
    digest.slice(7, 19),
  ].join("-");
}

export function assertPilotPublicEvent(payload: LtcedsPilotPublicEvent): void {
  assertUuidV7(payload.event_id, "event_id");
  if (payload.schema_version !== LTCEDS_PILOT_SCHEMA_VERSION) {
    throw new Error(`Unsupported pilot schema version: ${payload.schema_version}`);
  }
  if (payload.record_status !== "published") {
    throw new Error(`Pilot import requires published payloads: ${payload.event_id}`);
  }
  if (!payload.title.trim()) throw new Error(`Pilot event ${payload.event_id} has empty title`);
  if (!payload.offences.length) throw new Error(`Pilot event ${payload.event_id} has no offences`);
  if (!payload.sources.length) throw new Error(`Pilot event ${payload.event_id} has no sources`);
  assertIsoDateTime(payload.updated_at, `${payload.event_id}.updated_at`);
  for (const offence of payload.offences) assertUuidV7(offence.offence_instance_id, "offence_instance_id");
  for (const source of payload.sources) assertUuidV7(source.source_id, "source_id");
}

export function buildPilotEventPlan(input: {
  fileName: string;
  payload: LtcedsPilotPublicEvent;
}): LtcedsPilotEventPlan {
  const { payload } = input;
  assertPilotPublicEvent(payload);
  const updatedAt = assertIsoDateTime(payload.updated_at, `${payload.event_id}.updated_at`);
  const bounds = temporalBounds(payload.temporal, payload.event_form);
  const firstSourceId = payload.sources[0]?.source_id ?? null;
  const payloadSha256 = sha256CanonicalJson(payload);

  const sources: PlannedCrimeSourceRow[] = payload.sources.map((source) => ({
    sourceId: source.source_id,
    sourceType: source.source_type,
    provider: providerFromSourceUrl(source.url),
    title: source.source_type === "law_enforcement_primary" ? "Comunicato istituzionale" : "Fonte istituzionale",
    url: canonicalSourceUrl(source.url),
    publishedAt: source.published_at ? assertIsoDateTime(source.published_at, `${source.source_id}.published_at`) : null,
    canonicalSourceKey: canonicalSourceUrl(source.url),
    contentSha256: null,
    updatedAt,
  }));

  const event: PlannedCrimeEventRow = {
    eventId: payload.event_id,
    schemaVersion: payload.schema_version,
    recordStatus: payload.record_status,
    eventForm: payload.event_form,
    title: payload.title,
    temporalStart: payload.temporal.start ?? null,
    temporalEnd: payload.temporal.end ?? null,
    temporalEdtf: payload.temporal.edtf ?? null,
    temporalPrecision: payload.temporal.precision,
    temporalStartBound: bounds.start,
    temporalEndBound: bounds.end,
    updatedAt,
  };

  const offences: PlannedCrimeOffenceRow[] = payload.offences.map((offence) => ({
    offenceInstanceId: offence.offence_instance_id,
    eventId: payload.event_id,
    classificationSourceId: firstSourceId,
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
    updatedAt,
  }));

  const locations: PlannedCrimeLocationRow[] = (payload.locations ?? []).map((location, index) => {
    const streetScopeKey =
      location.precision === "street_segment" || location.precision === "exact_address"
        ? normaliseScope(location.place_name)
        : null;
    const neighbourhoodScopeKey = normaliseScope(location.neighbourhood);
    const localityScopeKey =
      location.precision === "locality" ? normaliseScope(location.place_name) : null;
    const geometry = location.geometry;
    return {
      locationId: deterministicChildUuidV7(payload.event_id, `location:${index}:${location.role}`),
      eventId: payload.event_id,
      basisSourceId: firstSourceId,
      role: location.role,
      municipality: location.municipality,
      evidenceBasis: evidenceBasisForPrecision(location.precision),
      evidencePrecision: location.precision,
      resolvedPrecision: location.precision,
      sensitivity: location.sensitivity,
      publicationRisk: publicationRiskForLocation(location),
      longitude: geometry ? String(geometry.coordinates[0]) : null,
      latitude: geometry ? String(geometry.coordinates[1]) : null,
      placeName: location.place_name ?? null,
      neighbourhood: location.neighbourhood ?? null,
      iccsLocationType: location.iccs_location_type ?? null,
      streetScopeKey,
      neighbourhoodScopeKey,
      localityScopeKey,
      updatedAt,
    };
  });

  const eventSources: PlannedCrimeEventSourceRow[] = payload.sources.map((source) => ({
    eventId: payload.event_id,
    sourceId: source.source_id,
    supportRole: "event_support",
  }));

  const publicEvent: PlannedCrimePublicEventRow = {
    eventId: payload.event_id,
    schemaVersion: payload.schema_version,
    payload: payload as unknown as Record<string, unknown>,
    payloadSha256,
    publicationGateVersion: LTCEDS_PILOT_PUBLICATION_GATE_VERSION,
    updatedAt,
  };

  return {
    fileName: input.fileName,
    payloadSha256,
    event,
    sources,
    offences,
    locations,
    eventSources,
    publicEvent,
  };
}

export function buildPilotImportPlan(input: {
  files: Array<{ fileName: string; payload: LtcedsPilotPublicEvent }>;
  mode?: "dry-run" | "execute";
  databaseState?: "unchecked" | "checked";
}): LtcedsPilotImportPlan {
  const events = input.files
    .map(buildPilotEventPlan)
    .sort((a, b) => a.event.eventId.localeCompare(b.event.eventId));
  const ids = new Set<string>();
  for (const plan of events) {
    if (ids.has(plan.event.eventId)) throw new Error(`Duplicate pilot event ID: ${plan.event.eventId}`);
    ids.add(plan.event.eventId);
  }
  const sourceIds = new Set(events.flatMap((event) => event.sources.map((source) => source.sourceId)));
  return {
    schemaVersion: "1.0",
    mode: input.mode ?? "dry-run",
    databaseState: input.databaseState ?? "unchecked",
    eventCount: events.length,
    sourceCount: sourceIds.size,
    offenceCount: events.reduce((sum, event) => sum + event.offences.length, 0),
    locationCount: events.reduce((sum, event) => sum + event.locations.length, 0),
    publicProjectionCount: events.length,
    events,
  };
}

export type PublicProjectionOperation = "insert" | "update" | "noop";

export function classifyPublicProjectionOperation(
  existingHash: string | null | undefined,
  nextHash: string,
): PublicProjectionOperation {
  if (!existingHash) return "insert";
  return existingHash === nextHash ? "noop" : "update";
}
