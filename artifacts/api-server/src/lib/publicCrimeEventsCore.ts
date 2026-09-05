import {
  EVENT_FORMS,
  GEO_PRECISIONS,
  LOCATION_ROLES,
  LOCATION_SENSITIVITIES,
  LTCEDS_SCHEMA_VERSION,
  PRIVACY_TRANSFORMS,
  defaultPublicMapLocations,
  isUuidV7,
  validatePublicEventSemantics,
  type EventForm,
  type LtcedsPublicEvent,
  type LtcedsPublicLocation,
} from "@workspace/publication-standardisation/ltceds";

export const CRIME_EVENTS_DISCLAIMER =
  "Il registro rappresenta eventi criminali documentati nelle fonti censite da Lamezia Trasparente. Non rappresenta la totalità dei reati verificatisi, denunciati o perseguiti nel territorio e non deve essere interpretato come misura del rischio criminale di un'area." as const;

export const CRIME_EVENTS_PUBLIC_SCHEMA_VERSION = LTCEDS_SCHEMA_VERSION;
export const CRIME_EVENTS_DEFAULT_PAGE_SIZE = 20;
export const CRIME_EVENTS_MAX_PAGE_SIZE = 100;

const TEMPORAL_PRECISIONS = [
  "exact_datetime",
  "exact_date",
  "bounded_interval",
  "week_or_similar",
  "month",
  "year",
  "approximate",
  "unknown",
] as const;

const CLASSIFICATION_BASES = [
  "source_stated_legal",
  "istat_crosswalk",
  "behavioural_manual",
  "provisional",
] as const;

const SOURCE_TYPES = [
  "judicial_primary",
  "law_enforcement_primary",
  "public_authority_primary",
  "news_agency",
  "press_secondary",
  "academic",
  "other",
] as const;

export type CrimeEventFilters = {
  from?: string;
  to?: string;
  iccs?: string;
  istat?: string;
  eventForm?: EventForm | string;
  neighbourhood?: string;
  context?: string;
  mappable?: boolean;
};

export type CrimeEventPagination = {
  page: number;
  pageSize: number;
  offset: number;
};

export type CrimeEventListEnvelope = {
  data: LtcedsPublicEvent[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  methodology: {
    schemaVersion: typeof LTCEDS_SCHEMA_VERSION;
    disclaimer: typeof CRIME_EVENTS_DISCLAIMER;
  };
};

export type CrimeEventsGeoJson = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id: string;
    geometry: { type: "Point"; coordinates: readonly [number, number] };
    properties: {
      event_id: string;
      title: string;
      date: string | null;
      temporal_precision: LtcedsPublicEvent["temporal"]["precision"];
      iccs_codes: string[];
      neighbourhood: string | null;
      geo_precision: LtcedsPublicLocation["precision"];
      privacy_transform: LtcedsPublicLocation["privacy_transform"];
      updated_at: string;
    };
  }>;
  metadata: {
    schemaVersion: typeof LTCEDS_SCHEMA_VERSION;
    featureCount: number;
    disclaimer: typeof CRIME_EVENTS_DISCLAIMER;
  };
};

export type CrimeEventsCoverage = {
  documentedEventCount: number;
  mappableEventCount: number;
  publicMapFeatureCount: number;
  earliestDocumentedDate: string | null;
  latestDocumentedDate: string | null;
  lastUpdatedAt: string | null;
  schemaVersions: string[];
  methodology: {
    unit: "documented_event";
    completeness: "not_exhaustive";
    riskInterpretation: "prohibited";
    disclaimer: typeof CRIME_EVENTS_DISCLAIMER;
  };
};

type DateInterval = {
  start: number;
  end: number;
  startLabel: string;
  endLabel: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || value === null || typeof value === "string";
}

function isFinitePoint(value: unknown): boolean {
  if (!isRecord(value) || value.type !== "Point" || !Array.isArray(value.coordinates)) {
    return false;
  }
  if (value.coordinates.length !== 2) return false;
  const [longitude, latitude] = value.coordinates;
  return (
    typeof longitude === "number" &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180 &&
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90
  );
}

function hasTemporalShape(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.precision === "string" &&
    TEMPORAL_PRECISIONS.includes(
      value.precision as (typeof TEMPORAL_PRECISIONS)[number],
    ) &&
    isOptionalString(value.start) &&
    isOptionalString(value.end) &&
    isOptionalString(value.edtf)
  );
}

function hasPublicLocationShape(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (
    typeof value.role !== "string" ||
    !LOCATION_ROLES.includes(value.role as (typeof LOCATION_ROLES)[number]) ||
    typeof value.municipality !== "string" ||
    typeof value.precision !== "string" ||
    !GEO_PRECISIONS.includes(value.precision as (typeof GEO_PRECISIONS)[number]) ||
    typeof value.sensitivity !== "string" ||
    !LOCATION_SENSITIVITIES.includes(
      value.sensitivity as (typeof LOCATION_SENSITIVITIES)[number],
    ) ||
    typeof value.privacy_transform !== "string" ||
    !PRIVACY_TRANSFORMS.includes(
      value.privacy_transform as (typeof PRIVACY_TRANSFORMS)[number],
    ) ||
    !isOptionalString(value.place_name) ||
    !isOptionalString(value.neighbourhood) ||
    !isOptionalString(value.iccs_location_type)
  ) {
    return false;
  }
  return value.geometry === null || isFinitePoint(value.geometry);
}

function hasOffenceShape(value: unknown): boolean {
  if (
    !isRecord(value) ||
    typeof value.offence_instance_id !== "string" ||
    typeof value.classification_basis !== "string" ||
    !CLASSIFICATION_BASES.includes(
      value.classification_basis as (typeof CLASSIFICATION_BASES)[number],
    )
  ) {
    return false;
  }
  if (
    !isOptionalString(value.iccs_code) ||
    !isOptionalString(value.istat_catalogue_id) ||
    !isOptionalString(value.istat_synthetic_code) ||
    !isOptionalString(value.istat_analytical_code) ||
    !isOptionalString(value.legal_reference) ||
    !isOptionalString(value.cyber_related)
  ) {
    return false;
  }
  if (
    value.situational_context !== undefined &&
    (!Array.isArray(value.situational_context) ||
      !value.situational_context.every((item) => typeof item === "string"))
  ) {
    return false;
  }
  return true;
}

function hasSourceShape(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.source_id === "string" &&
    typeof value.source_type === "string" &&
    SOURCE_TYPES.includes(value.source_type as (typeof SOURCE_TYPES)[number]) &&
    isOptionalString(value.url) &&
    isOptionalString(value.published_at)
  );
}

/**
 * Defence-in-depth reader for already-public LTCEDS payloads. The canonical
 * JSON Schema gate remains the write-time authority; this runtime guard keeps a
 * corrupt/manual DB row from becoming public and never fills missing fields
 * from canonical/internal tables.
 */
export function parseReadablePublicCrimeEvent(
  value: unknown,
): LtcedsPublicEvent | null {
  if (!isRecord(value)) return null;
  if (
    value.schema_version !== LTCEDS_SCHEMA_VERSION ||
    value.record_status !== "published" ||
    typeof value.event_id !== "string" ||
    !isUuidV7(value.event_id) ||
    typeof value.event_form !== "string" ||
    !EVENT_FORMS.includes(value.event_form as EventForm) ||
    typeof value.title !== "string" ||
    !value.title.trim() ||
    !["open", "generalised", "suppressed"].includes(String(value.privacy_tier)) ||
    typeof value.updated_at !== "string" ||
    !Number.isFinite(Date.parse(value.updated_at)) ||
    !hasTemporalShape(value.temporal) ||
    !Array.isArray(value.offences) ||
    value.offences.length === 0 ||
    !value.offences.every(hasOffenceShape) ||
    !Array.isArray(value.sources) ||
    value.sources.length === 0 ||
    !value.sources.every(hasSourceShape) ||
    (value.locations !== undefined &&
      (!Array.isArray(value.locations) || !value.locations.every(hasPublicLocationShape)))
  ) {
    return null;
  }

  const event = value as unknown as LtcedsPublicEvent;
  return validatePublicEventSemantics(event).length === 0 ? event : null;
}

function normaliseText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLocaleLowerCase("it")
    .replace(/\s+/g, " ")
    .trim();
}

function monthEndUtc(year: number, month: number): number {
  return Date.UTC(year, month, 0, 23, 59, 59, 999);
}

function dateIntervalFromToken(raw: unknown): DateInterval | null {
  if (typeof raw !== "string") return null;
  const token = raw.trim().replace(/[?~%]$/g, "");
  let match = /^(\d{4})$/.exec(token);
  if (match) {
    const year = Number(match[1]);
    return {
      start: Date.UTC(year, 0, 1),
      end: Date.UTC(year, 11, 31, 23, 59, 59, 999),
      startLabel: `${match[1]}-01-01`,
      endLabel: `${match[1]}-12-31`,
    };
  }

  match = /^(\d{4})-(\d{2})$/.exec(token);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (month < 1 || month > 12) return null;
    return {
      start: Date.UTC(year, month - 1, 1),
      end: monthEndUtc(year, month),
      startLabel: `${match[1]}-${match[2]}-01`,
      endLabel: new Date(monthEndUtc(year, month)).toISOString().slice(0, 10),
    };
  }

  match = /^(\d{4})-(\d{2})-(\d{2})/.exec(token);
  if (match) {
    const date = `${match[1]}-${match[2]}-${match[3]}`;
    const start = Date.parse(`${date}T00:00:00.000Z`);
    if (!Number.isFinite(start)) return null;
    const parsed = new Date(start);
    if (parsed.toISOString().slice(0, 10) !== date) return null;
    return {
      start,
      end: start + 86_400_000 - 1,
      startLabel: date,
      endLabel: date,
    };
  }

  return null;
}

export function publicCrimeEventDateInterval(
  event: LtcedsPublicEvent,
): DateInterval | null {
  const explicitStart = dateIntervalFromToken(event.temporal.start);
  const explicitEnd = dateIntervalFromToken(event.temporal.end);
  if (explicitStart || explicitEnd) {
    const start = explicitStart ?? explicitEnd!;
    const end = explicitEnd ?? explicitStart!;
    if (end.end < start.start) return null;
    return {
      start: start.start,
      end: end.end,
      startLabel: start.startLabel,
      endLabel: end.endLabel,
    };
  }

  const edtf = event.temporal.edtf?.trim();
  if (!edtf) return null;
  const slash = edtf.indexOf("/");
  if (slash >= 0) {
    const left = dateIntervalFromToken(edtf.slice(0, slash));
    const right = dateIntervalFromToken(edtf.slice(slash + 1));
    if (!left || !right || right.end < left.start) return null;
    return {
      start: left.start,
      end: right.end,
      startLabel: left.startLabel,
      endLabel: right.endLabel,
    };
  }
  return dateIntervalFromToken(edtf);
}

function filterDateBoundary(value: string | undefined, endOfDay: boolean): number | null {
  if (!value) return null;
  const token = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(token);
  if (!match) return null;
  const base = Date.parse(`${token}T00:00:00.000Z`);
  if (!Number.isFinite(base) || new Date(base).toISOString().slice(0, 10) !== token) {
    return null;
  }
  return endOfDay ? base + 86_400_000 - 1 : base;
}

function iccsMatches(code: string | null | undefined, query: string): boolean {
  if (!code) return false;
  const candidate = code.trim();
  const wanted = query.trim();
  return candidate === wanted || candidate.startsWith(`${wanted}.`);
}

export function publicCrimeEventMatchesFilters(
  event: LtcedsPublicEvent,
  filters: CrimeEventFilters,
): boolean {
  if (filters.eventForm && event.event_form !== filters.eventForm) return false;

  const from = filterDateBoundary(filters.from, false);
  const to = filterDateBoundary(filters.to, true);
  if (filters.from || filters.to) {
    if ((filters.from && from === null) || (filters.to && to === null)) return false;
    const interval = publicCrimeEventDateInterval(event);
    if (!interval) return false;
    if (from !== null && interval.end < from) return false;
    if (to !== null && interval.start > to) return false;
  }

  if (
    filters.iccs &&
    !event.offences.some((offence) => iccsMatches(offence.iccs_code, filters.iccs!))
  ) {
    return false;
  }

  if (filters.istat) {
    const wanted = filters.istat.trim();
    const matches = event.offences.some((offence) =>
      [
        offence.istat_catalogue_id,
        offence.istat_synthetic_code,
        offence.istat_analytical_code,
      ].some((value) => value?.trim() === wanted),
    );
    if (!matches) return false;
  }

  if (filters.neighbourhood) {
    const wanted = normaliseText(filters.neighbourhood);
    if (
      !(event.locations ?? []).some(
        (location) => normaliseText(location.neighbourhood ?? "") === wanted,
      )
    ) {
      return false;
    }
  }

  if (filters.context) {
    const wanted = normaliseText(filters.context);
    if (
      !event.offences.some((offence) =>
        (offence.situational_context ?? []).some(
          (context) => normaliseText(context) === wanted,
        ),
      )
    ) {
      return false;
    }
  }

  if (
    filters.mappable !== undefined &&
    (defaultPublicMapLocations(event).length > 0) !== filters.mappable
  ) {
    return false;
  }

  return true;
}

export function parseCrimeEventPagination(
  query: Record<string, unknown>,
): CrimeEventPagination {
  const rawPage = Number(query.page);
  const rawPageSize = Number(query.pageSize);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const pageSize =
    Number.isFinite(rawPageSize) && rawPageSize >= 1
      ? Math.min(CRIME_EVENTS_MAX_PAGE_SIZE, Math.floor(rawPageSize))
      : CRIME_EVENTS_DEFAULT_PAGE_SIZE;
  return { page, pageSize, offset: (page - 1) * pageSize };
}

function queryString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function queryBoolean(value: unknown): boolean | undefined {
  if (value === true || value === "true" || value === "1") return true;
  if (value === false || value === "false" || value === "0") return false;
  return undefined;
}

export function crimeEventFiltersFromQuery(
  query: Record<string, unknown>,
): CrimeEventFilters {
  return {
    from: queryString(query.from),
    to: queryString(query.to),
    iccs: queryString(query.iccs),
    istat: queryString(query.istat),
    eventForm: queryString(query.eventForm),
    neighbourhood: queryString(query.neighbourhood),
    context: queryString(query.context),
    mappable: queryBoolean(query.mappable),
  };
}

function eventSortTime(event: LtcedsPublicEvent): number {
  const interval = publicCrimeEventDateInterval(event);
  if (interval) return interval.start;
  const updated = Date.parse(event.updated_at);
  return Number.isFinite(updated) ? updated : 0;
}

export function sortPublicCrimeEvents(
  events: readonly LtcedsPublicEvent[],
): LtcedsPublicEvent[] {
  return [...events].sort(
    (left, right) =>
      eventSortTime(right) - eventSortTime(left) ||
      Date.parse(right.updated_at) - Date.parse(left.updated_at) ||
      left.event_id.localeCompare(right.event_id),
  );
}

export function paginatePublicCrimeEvents(
  events: readonly LtcedsPublicEvent[],
  pagination: CrimeEventPagination,
): CrimeEventListEnvelope {
  const total = events.length;
  return {
    data: events.slice(pagination.offset, pagination.offset + pagination.pageSize),
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
      totalPages: pagination.pageSize > 0 ? Math.ceil(total / pagination.pageSize) : 0,
    },
    methodology: {
      schemaVersion: LTCEDS_SCHEMA_VERSION,
      disclaimer: CRIME_EVENTS_DISCLAIMER,
    },
  };
}

export function publicCrimeEventsToGeoJson(
  events: readonly LtcedsPublicEvent[],
): CrimeEventsGeoJson {
  const features: CrimeEventsGeoJson["features"] = [];
  for (const event of events) {
    const iccsCodes = [
      ...new Set(
        event.offences.flatMap((offence) =>
          offence.iccs_code ? [offence.iccs_code] : [],
        ),
      ),
    ].sort();
    const date = event.temporal.start ?? event.temporal.edtf ?? null;
    defaultPublicMapLocations(event).forEach((location, index) => {
      if (!location.geometry) return;
      features.push({
        type: "Feature",
        id: `${event.event_id}:${index}`,
        geometry: location.geometry,
        properties: {
          event_id: event.event_id,
          title: event.title,
          date,
          temporal_precision: event.temporal.precision,
          iccs_codes: iccsCodes,
          neighbourhood: location.neighbourhood ?? null,
          geo_precision: location.precision,
          privacy_transform: location.privacy_transform,
          updated_at: event.updated_at,
        },
      });
    });
  }

  return {
    type: "FeatureCollection",
    features,
    metadata: {
      schemaVersion: LTCEDS_SCHEMA_VERSION,
      featureCount: features.length,
      disclaimer: CRIME_EVENTS_DISCLAIMER,
    },
  };
}

export function publicCrimeEventsCoverage(
  events: readonly LtcedsPublicEvent[],
): CrimeEventsCoverage {
  const intervals = events
    .map(publicCrimeEventDateInterval)
    .filter((value): value is DateInterval => value !== null);
  const earliest = intervals.length
    ? [...intervals].sort((left, right) => left.start - right.start)[0]!
    : null;
  const latest = intervals.length
    ? [...intervals].sort((left, right) => right.end - left.end)[0]!
    : null;
  const lastUpdated =
    events
      .map((event) => event.updated_at)
      .filter((value) => Number.isFinite(Date.parse(value)))
      .sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? null;
  const mappableEventCount = events.filter(
    (event) => defaultPublicMapLocations(event).length > 0,
  ).length;
  const publicMapFeatureCount = events.reduce(
    (sum, event) => sum + defaultPublicMapLocations(event).length,
    0,
  );

  return {
    documentedEventCount: events.length,
    mappableEventCount,
    publicMapFeatureCount,
    earliestDocumentedDate: earliest?.startLabel ?? null,
    latestDocumentedDate: latest?.endLabel ?? null,
    lastUpdatedAt: lastUpdated,
    schemaVersions: [...new Set(events.map((event) => event.schema_version))].sort(),
    methodology: {
      unit: "documented_event",
      completeness: "not_exhaustive",
      riskInterpretation: "prohibited",
      disclaimer: CRIME_EVENTS_DISCLAIMER,
    },
  };
}
