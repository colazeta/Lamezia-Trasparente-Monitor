import { createHash } from "node:crypto";

import { z } from "zod";

import {
  deterministicChildUuidV7,
  sha256CanonicalJson,
} from "./ltcedsPilotImportCore";

export const CRIME_MONITOR_INGESTION_SCHEMA = "lt-crime-monitor/1.0" as const;

const recordStatusSchema = z.enum([
  "verified_source",
  "superseded",
  "merged",
  "split",
  "withdrawn",
  "suppressed",
]);
const eventFormSchema = z.enum([
  "discrete",
  "continuous_episode",
  "course_of_conduct",
]);
const temporalPrecisionSchema = z.enum([
  "exact_datetime",
  "exact_date",
  "bounded_interval",
  "week_or_similar",
  "month",
  "year",
  "approximate",
  "unknown",
]);
const sourceTypeSchema = z.enum([
  "judicial_primary",
  "law_enforcement_primary",
  "public_authority_primary",
  "news_agency",
  "press_secondary",
  "academic",
  "other",
]);
const classificationBasisSchema = z.enum([
  "source_stated_legal",
  "istat_crosswalk",
  "behavioural_manual",
  "provisional",
]);
const attemptStatusSchema = z.enum([
  "attempted",
  "completed",
  "not_applicable",
  "unknown",
]);
const locationRoleSchema = z.enum([
  "occurrence",
  "target",
  "discovery",
  "recovery",
  "arrest",
  "search",
  "procedural",
  "other",
]);
const geoPrecisionSchema = z.enum([
  "exact_public_site",
  "exact_address",
  "street_segment",
  "neighbourhood",
  "locality",
  "municipality",
  "unknown",
]);
const locationEvidenceBasisSchema = z.enum([
  "source_stated_exact",
  "source_stated_named_site",
  "source_stated_street",
  "source_stated_neighbourhood",
  "source_stated_locality",
  "geocoder_candidate",
  "editorial_inference",
  "unknown",
]);
const locationSensitivitySchema = z.enum([
  "public_place",
  "non_sensitive",
  "private_or_sensitive",
  "unknown",
]);
const publicationRiskSchema = z.enum([
  "low_public_site",
  "non_sensitive",
  "residential",
  "victim_linked",
  "minor_or_vulnerable",
  "sexual_offence_context",
  "unknown",
]);
const sourceSupportRoleSchema = z.enum([
  "event_support",
  "classification_support",
  "location_support",
  "procedural_context",
  "corroboration",
]);

const stableKeySchema = z
  .string()
  .min(3)
  .max(180)
  .regex(/^[a-z0-9][a-z0-9:._-]*$/, "must be a stable lower-case key");

const parsableDateTimeSchema = z.string().min(1).refine(
  (value) => Number.isFinite(new Date(value).getTime()),
  "must be a valid date or date-time",
);

const temporalSchema = z
  .object({
    start: z.string().min(1).nullable().optional(),
    end: z.string().min(1).nullable().optional(),
    edtf: z.string().min(1).nullable().optional(),
    precision: temporalPrecisionSchema,
  })
  .strict();

const sourceSchema = z
  .object({
    source_key: stableKeySchema,
    source_type: sourceTypeSchema,
    provider: z.string().trim().min(1),
    title: z.string().trim().min(1),
    url: z.string().url().nullable().optional(),
    published_at: parsableDateTimeSchema.nullable().optional(),
    retrieved_at: parsableDateTimeSchema.nullable().optional(),
    support_roles: z.array(sourceSupportRoleSchema).min(1).optional(),
  })
  .strict();

const offenceSchema = z
  .object({
    offence_key: stableKeySchema,
    classification_source_key: stableKeySchema.nullable().optional(),
    classification_basis: classificationBasisSchema,
    iccs_code: z.string().trim().min(1).nullable().optional(),
    istat_catalogue_id: z.string().trim().min(1).nullable().optional(),
    istat_synthetic_code: z.string().trim().min(1).nullable().optional(),
    istat_analytical_code: z.string().trim().min(1).nullable().optional(),
    legal_reference: z.string().trim().min(1).nullable().optional(),
    attempt_status: attemptStatusSchema.nullable().optional(),
    situational_context: z.array(z.string().trim().min(1)).optional(),
    cyber_related: z.string().trim().min(1).nullable().optional(),
    affected_object_count: z.number().int().nonnegative().nullable().optional(),
  })
  .strict();

const pointSchema = z
  .object({
    type: z.literal("Point"),
    coordinates: z.tuple([
      z.number().min(-180).max(180),
      z.number().min(-90).max(90),
    ]),
  })
  .strict();

const locationSchema = z
  .object({
    location_key: stableKeySchema,
    basis_source_key: stableKeySchema.nullable().optional(),
    role: locationRoleSchema,
    municipality: z.string().trim().min(1),
    evidence_basis: locationEvidenceBasisSchema,
    evidence_precision: geoPrecisionSchema,
    resolved_precision: geoPrecisionSchema,
    sensitivity: locationSensitivitySchema,
    publication_risk: publicationRiskSchema,
    geometry: pointSchema.nullable().optional(),
    place_name: z.string().trim().min(1).nullable().optional(),
    neighbourhood: z.string().trim().min(1).nullable().optional(),
    iccs_location_type: z.string().trim().min(1).nullable().optional(),
  })
  .strict()
  .superRefine((location, ctx) => {
    if (
      location.geometry &&
      (location.resolved_precision === "municipality" ||
        location.resolved_precision === "unknown")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["geometry"],
        message: "municipality/unknown precision must not carry point geometry",
      });
    }
  });

export const crimeMonitorEventSchema = z
  .object({
    ingestion_schema: z.literal(CRIME_MONITOR_INGESTION_SCHEMA),
    event_key: stableKeySchema,
    discovered_at: parsableDateTimeSchema,
    updated_at: parsableDateTimeSchema,
    record_status: recordStatusSchema,
    event_form: eventFormSchema,
    title: z.string().trim().min(3),
    temporal: temporalSchema,
    sources: z.array(sourceSchema).min(1),
    offences: z.array(offenceSchema).min(1),
    locations: z.array(locationSchema).min(1),
  })
  .strict()
  .superRefine((event, ctx) => {
    const duplicateKeys = (values: string[]) =>
      values.filter((value, index) => values.indexOf(value) !== index);

    const duplicateSourceKeys = duplicateKeys(event.sources.map((source) => source.source_key));
    if (duplicateSourceKeys.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sources"],
        message: `duplicate source_key: ${[...new Set(duplicateSourceKeys)].join(", ")}`,
      });
    }

    const duplicateOffenceKeys = duplicateKeys(
      event.offences.map((offence) => offence.offence_key),
    );
    if (duplicateOffenceKeys.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["offences"],
        message: `duplicate offence_key: ${[...new Set(duplicateOffenceKeys)].join(", ")}`,
      });
    }

    const duplicateLocationKeys = duplicateKeys(
      event.locations.map((location) => location.location_key),
    );
    if (duplicateLocationKeys.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["locations"],
        message: `duplicate location_key: ${[...new Set(duplicateLocationKeys)].join(", ")}`,
      });
    }

    const sourceKeys = new Set(event.sources.map((source) => source.source_key));
    event.offences.forEach((offence, index) => {
      if (offence.classification_source_key && !sourceKeys.has(offence.classification_source_key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["offences", index, "classification_source_key"],
          message: "must reference a source_key in the same event artifact",
        });
      }
    });
    event.locations.forEach((location, index) => {
      if (location.basis_source_key && !sourceKeys.has(location.basis_source_key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["locations", index, "basis_source_key"],
          message: "must reference a source_key in the same event artifact",
        });
      }
    });

    const inLamezia = event.locations.some(
      (location) =>
        ["occurrence", "target"].includes(location.role) &&
        normaliseText(location.municipality) === "lamezia terme",
    );
    if (!inLamezia) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["locations"],
        message: "at least one occurrence/target location must be in Lamezia Terme",
      });
    }

    const discoveredAt = new Date(event.discovered_at).getTime();
    const updatedAt = new Date(event.updated_at).getTime();
    if (updatedAt < discoveredAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["updated_at"],
        message: "must not precede discovered_at",
      });
    }
  });

export type CrimeMonitorEventInput = z.infer<typeof crimeMonitorEventSchema>;

export interface CrimeMonitorFile {
  fileName: string;
  payload: unknown;
}

export interface CrimeMonitorEventPlan {
  fileName: string;
  artifactSha256: string;
  event: {
    eventId: string;
    schemaVersion: string;
    recordStatus: CrimeMonitorEventInput["record_status"];
    eventForm: CrimeMonitorEventInput["event_form"];
    title: string;
    temporalStart: string | null;
    temporalEnd: string | null;
    temporalEdtf: string | null;
    temporalPrecision: CrimeMonitorEventInput["temporal"]["precision"];
    temporalStartBound: string | null;
    temporalEndBound: string | null;
    updatedAt: Date;
  };
  sources: Array<{
    sourceId: string;
    sourceType: CrimeMonitorEventInput["sources"][number]["source_type"];
    provider: string;
    title: string;
    url: string | null;
    publishedAt: Date | null;
    retrievedAt: Date | null;
    canonicalSourceKey: string;
    contentSha256: null;
    updatedAt: Date;
  }>;
  offences: Array<{
    offenceInstanceId: string;
    eventId: string;
    classificationSourceId: string | null;
    classificationBasis: CrimeMonitorEventInput["offences"][number]["classification_basis"];
    iccsCode: string | null;
    istatCatalogueId: string | null;
    istatSyntheticCode: string | null;
    istatAnalyticalCode: string | null;
    legalReference: string | null;
    attemptStatus: CrimeMonitorEventInput["offences"][number]["attempt_status"] | null;
    situationalContext: string[];
    cyberRelated: string | null;
    affectedObjectCount: number | null;
    updatedAt: Date;
  }>;
  locations: Array<{
    locationId: string;
    eventId: string;
    basisSourceId: string | null;
    role: CrimeMonitorEventInput["locations"][number]["role"];
    municipality: string;
    evidenceBasis: CrimeMonitorEventInput["locations"][number]["evidence_basis"];
    evidencePrecision: CrimeMonitorEventInput["locations"][number]["evidence_precision"];
    resolvedPrecision: CrimeMonitorEventInput["locations"][number]["resolved_precision"];
    sensitivity: CrimeMonitorEventInput["locations"][number]["sensitivity"];
    publicationRisk: CrimeMonitorEventInput["locations"][number]["publication_risk"];
    longitude: string | null;
    latitude: string | null;
    placeName: string | null;
    neighbourhood: string | null;
    iccsLocationType: string | null;
    streetScopeKey: string | null;
    neighbourhoodScopeKey: string | null;
    localityScopeKey: string | null;
    updatedAt: Date;
  }>;
  eventSources: Array<{
    eventId: string;
    sourceId: string;
    supportRole: CrimeMonitorEventInput["sources"][number]["support_roles"] extends Array<infer T>
      ? T
      : never;
  }>;
}

export interface CrimeMonitorImportPlan {
  schemaVersion: "1.0";
  eventCount: number;
  sourceCount: number;
  offenceCount: number;
  locationCount: number;
  publicProjectionCount: 0;
  events: CrimeMonitorEventPlan[];
}

function normaliseText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
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

function temporalBounds(
  temporal: CrimeMonitorEventInput["temporal"],
): { start: string | null; end: string | null } {
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  if (temporal.precision === "exact_date" && temporal.start && isoDate.test(temporal.start)) {
    const end = temporal.end && isoDate.test(temporal.end) ? temporal.end : temporal.start;
    return { start: temporal.start, end };
  }
  if (
    temporal.precision === "bounded_interval" &&
    temporal.start &&
    temporal.end &&
    isoDate.test(temporal.start) &&
    isoDate.test(temporal.end)
  ) {
    return { start: temporal.start, end: temporal.end };
  }
  return { start: null, end: null };
}

function encodeUuid(bytes: Uint8Array): string {
  const hex = Buffer.from(bytes).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function deterministicEventUuidV7(discoveredAt: string, eventKey: string): string {
  const timestampMs = new Date(discoveredAt).getTime();
  if (!Number.isSafeInteger(timestampMs) || timestampMs < 0 || timestampMs > 0xffffffffffff) {
    throw new RangeError("discovered_at is outside the UUIDv7 timestamp range");
  }
  const bytes = new Uint8Array(16);
  let timestamp = BigInt(timestampMs);
  for (let index = 5; index >= 0; index -= 1) {
    bytes[index] = Number(timestamp & 0xffn);
    timestamp >>= 8n;
  }
  const digest = createHash("sha256").update(eventKey).digest();
  bytes.set(digest.subarray(0, 10), 6);
  bytes[6] = (bytes[6]! & 0x0f) | 0x70;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  return encodeUuid(bytes);
}

function parseDate(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null;
}

export function buildCrimeMonitorEventPlan(input: CrimeMonitorFile): CrimeMonitorEventPlan {
  const payload = crimeMonitorEventSchema.parse(input.payload);
  const eventId = deterministicEventUuidV7(payload.discovered_at, payload.event_key);
  const updatedAt = new Date(payload.updated_at);
  const bounds = temporalBounds(payload.temporal);

  const sourceIds = new Map<string, string>();
  for (const source of payload.sources) {
    sourceIds.set(
      source.source_key,
      deterministicChildUuidV7(eventId, `source:${source.source_key}`),
    );
  }
  const firstSourceId = sourceIds.get(payload.sources[0]!.source_key)!;

  const sources = payload.sources.map((source) => {
    const url = canonicalSourceUrl(source.url);
    return {
      sourceId: sourceIds.get(source.source_key)!,
      sourceType: source.source_type,
      provider: source.provider,
      title: source.title,
      url,
      publishedAt: parseDate(source.published_at),
      retrievedAt: parseDate(source.retrieved_at),
      canonicalSourceKey: url ?? `monitor:${payload.event_key}:${source.source_key}`,
      contentSha256: null,
      updatedAt,
    };
  });

  const offences = payload.offences.map((offence) => ({
    offenceInstanceId: deterministicChildUuidV7(
      eventId,
      `offence:${offence.offence_key}`,
    ),
    eventId,
    classificationSourceId: offence.classification_source_key
      ? sourceIds.get(offence.classification_source_key)!
      : firstSourceId,
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

  const locations = payload.locations.map((location) => {
    const geometry = location.geometry;
    return {
      locationId: deterministicChildUuidV7(
        eventId,
        `location:${location.location_key}`,
      ),
      eventId,
      basisSourceId: location.basis_source_key
        ? sourceIds.get(location.basis_source_key)!
        : firstSourceId,
      role: location.role,
      municipality: location.municipality,
      evidenceBasis: location.evidence_basis,
      evidencePrecision: location.evidence_precision,
      resolvedPrecision: location.resolved_precision,
      sensitivity: location.sensitivity,
      publicationRisk: location.publication_risk,
      longitude: geometry ? String(geometry.coordinates[0]) : null,
      latitude: geometry ? String(geometry.coordinates[1]) : null,
      placeName: location.place_name ?? null,
      neighbourhood: location.neighbourhood ?? null,
      iccsLocationType: location.iccs_location_type ?? null,
      streetScopeKey:
        ["street_segment", "exact_address"].includes(location.resolved_precision)
          ? normaliseScope(location.place_name)
          : null,
      neighbourhoodScopeKey: normaliseScope(location.neighbourhood),
      localityScopeKey:
        location.resolved_precision === "locality"
          ? normaliseScope(location.place_name)
          : null,
      updatedAt,
    };
  });

  const eventSources = payload.sources.flatMap((source) =>
    (source.support_roles ?? ["event_support" as const]).map((supportRole) => ({
      eventId,
      sourceId: sourceIds.get(source.source_key)!,
      supportRole,
    })),
  );

  return {
    fileName: input.fileName,
    artifactSha256: sha256CanonicalJson(payload),
    event: {
      eventId,
      schemaVersion: payload.ingestion_schema,
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
    },
    sources,
    offences,
    locations,
    eventSources,
  };
}

export function buildCrimeMonitorImportPlan(
  files: CrimeMonitorFile[],
): CrimeMonitorImportPlan {
  const events = files
    .map(buildCrimeMonitorEventPlan)
    .sort((a, b) => a.fileName.localeCompare(b.fileName));

  const eventIds = new Set<string>();
  for (const event of events) {
    if (eventIds.has(event.event.eventId)) {
      throw new Error(
        `Duplicate monitored event identity ${event.event.eventId}; keep one authoritative artifact per event_key`,
      );
    }
    eventIds.add(event.event.eventId);
  }

  return {
    schemaVersion: "1.0",
    eventCount: events.length,
    sourceCount: events.reduce((sum, event) => sum + event.sources.length, 0),
    offenceCount: events.reduce((sum, event) => sum + event.offences.length, 0),
    locationCount: events.reduce((sum, event) => sum + event.locations.length, 0),
    publicProjectionCount: 0,
    events,
  };
}
