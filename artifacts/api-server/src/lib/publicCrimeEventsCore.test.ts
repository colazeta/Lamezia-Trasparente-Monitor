import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  CRIME_EVENTS_DISCLAIMER,
  crimeEventFiltersFromQuery,
  paginatePublicCrimeEvents,
  parseCrimeEventPagination,
  parseReadablePublicCrimeEvent,
  publicCrimeEventMatchesFilters,
  publicCrimeEventsCoverage,
  publicCrimeEventsToGeoJson,
  sortPublicCrimeEvents,
} from "./publicCrimeEventsCore";
import { withCrimeEventsOpenApi } from "./publicCrimeOpenapi";

type MutableEvent = Record<string, unknown>;

const EVENT_ID = "01890f3e-1000-7000-8000-000000000001";
const OFFENCE_ID = "01890f3e-1000-7000-8000-000000000002";
const SOURCE_ID = "01890f3e-1000-7000-8000-000000000003";

function validEvent(overrides: Partial<MutableEvent> = {}): MutableEvent {
  return {
    event_id: EVENT_ID,
    schema_version: "1.0-draft.1",
    record_status: "published",
    event_form: "discrete",
    title: "Evento sintetico documentato",
    temporal: {
      start: "2025-10-09",
      precision: "exact_date",
    },
    privacy_tier: "generalised",
    locations: [
      {
        role: "occurrence",
        municipality: "Lamezia Terme",
        neighbourhood: "Centro",
        precision: "street_segment",
        sensitivity: "private_or_sensitive",
        privacy_transform: "street_generalisation",
        geometry: { type: "Point", coordinates: [16.25, 38.95] },
      },
      {
        role: "arrest",
        municipality: "Lamezia Terme",
        neighbourhood: "Centro",
        precision: "exact_public_site",
        sensitivity: "public_place",
        privacy_transform: "none",
        geometry: { type: "Point", coordinates: [16.3, 38.98] },
      },
    ],
    offences: [
      {
        offence_instance_id: OFFENCE_ID,
        classification_basis: "provisional",
        iccs_code: "05.01.01",
        istat_synthetic_code: "SYN-05",
        situational_context: ["organised_crime_related"],
      },
    ],
    sources: [
      {
        source_id: SOURCE_ID,
        source_type: "public_authority_primary",
        url: "https://example.test/source",
      },
    ],
    updated_at: "2026-09-05T22:30:00Z",
    ...overrides,
  };
}

describe("LTCEDS public crime reader core", () => {
  it("accepts a valid already-public LTCEDS payload", () => {
    const parsed = parseReadablePublicCrimeEvent(validEvent());
    expect(parsed?.event_id).toBe(EVENT_ID);
    expect(parsed?.record_status).toBe("published");
  });

  it("fails closed on unpublished, malformed or non-v7 records", () => {
    expect(
      parseReadablePublicCrimeEvent(validEvent({ record_status: "verified_source" })),
    ).toBeNull();
    expect(
      parseReadablePublicCrimeEvent(
        validEvent({ event_id: "550e8400-e29b-41d4-a716-446655440000" }),
      ),
    ).toBeNull();
    expect(parseReadablePublicCrimeEvent(validEvent({ sources: [] }))).toBeNull();
    expect(parseReadablePublicCrimeEvent(validEvent({ offences: [] }))).toBeNull();
  });

  it("matches hierarchical ICCS, exact Istat, context, neighbourhood and date overlap", () => {
    const event = parseReadablePublicCrimeEvent(validEvent())!;
    expect(
      publicCrimeEventMatchesFilters(event, {
        from: "2025-10-01",
        to: "2025-10-31",
        iccs: "05",
        istat: "SYN-05",
        eventForm: "discrete",
        neighbourhood: "centro",
        context: "organised_crime_related",
        mappable: true,
      }),
    ).toBe(true);
    expect(publicCrimeEventMatchesFilters(event, { iccs: "06" })).toBe(false);
    expect(
      publicCrimeEventMatchesFilters(event, { from: "2026-01-01" }),
    ).toBe(false);
  });

  it("excludes unknown-date events from a requested date window rather than guessing", () => {
    const event = parseReadablePublicCrimeEvent(
      validEvent({ temporal: { precision: "unknown" } }),
    )!;
    expect(publicCrimeEventMatchesFilters(event, { from: "2025-01-01" })).toBe(
      false,
    );
  });

  it("GeoJSON contains only public occurrence map points, never arrest points", () => {
    const event = parseReadablePublicCrimeEvent(validEvent())!;
    const geojson = publicCrimeEventsToGeoJson([event]);
    expect(geojson.features).toHaveLength(1);
    expect(geojson.features[0]?.geometry.coordinates).toEqual([16.25, 38.95]);
    expect(geojson.features[0]?.properties.event_id).toBe(EVENT_ID);
    expect(JSON.stringify(geojson)).not.toContain("16.3,38.98");
    expect(geojson.metadata.disclaimer).toBe(CRIME_EVENTS_DISCLAIMER);
  });

  it("coverage is explicitly documentary/non-exhaustive", () => {
    const event = parseReadablePublicCrimeEvent(validEvent())!;
    const coverage = publicCrimeEventsCoverage([event]);
    expect(coverage).toMatchObject({
      documentedEventCount: 1,
      mappableEventCount: 1,
      publicMapFeatureCount: 1,
      earliestDocumentedDate: "2025-10-09",
      latestDocumentedDate: "2025-10-09",
      methodology: {
        unit: "documented_event",
        completeness: "not_exhaustive",
        riskInterpretation: "prohibited",
        disclaimer: CRIME_EVENTS_DISCLAIMER,
      },
    });
  });

  it("pagination is bounded at 100 and methodology travels with every list", () => {
    const event = parseReadablePublicCrimeEvent(validEvent())!;
    const pagination = parseCrimeEventPagination({ page: "1", pageSize: "5000" });
    expect(pagination.pageSize).toBe(100);
    const result = paginatePublicCrimeEvents([event], pagination);
    expect(result.pagination).toMatchObject({ page: 1, pageSize: 100, total: 1 });
    expect(result.methodology.disclaimer).toBe(CRIME_EVENTS_DISCLAIMER);
  });

  it("query parsing does not create hidden person-search semantics", () => {
    const filters = crimeEventFiltersFromQuery({
      iccs: "05.01",
      neighbourhood: "Centro",
      mappable: "true",
      person: "Someone",
      suspect: "Someone",
    });
    expect(filters).toEqual({
      from: undefined,
      to: undefined,
      iccs: "05.01",
      istat: undefined,
      eventForm: undefined,
      neighbourhood: "Centro",
      context: undefined,
      mappable: true,
    });
  });

  it("sorts by documented event time before update time", () => {
    const older = parseReadablePublicCrimeEvent(
      validEvent({
        event_id: "01890f3e-1000-7000-8000-000000000011",
        temporal: { start: "2020-01-01", precision: "exact_date" },
        updated_at: "2026-09-06T00:00:00Z",
      }),
    )!;
    const newer = parseReadablePublicCrimeEvent(
      validEvent({
        event_id: "01890f3e-1000-7000-8000-000000000012",
        temporal: { start: "2025-01-01", precision: "exact_date" },
        updated_at: "2025-01-02T00:00:00Z",
      }),
    )!;
    expect(sortPublicCrimeEvents([older, newer]).map((event) => event.event_id)).toEqual([
      newer.event_id,
      older.event_id,
    ]);
  });

  it("OpenAPI overlay documents crime endpoints without replacing the base spec", () => {
    const base = {
      openapi: "3.1.0",
      tags: [{ name: "documents" }],
      paths: { "/documents": { get: {} } },
      components: { schemas: { Pagination: { type: "object" }, Error: { type: "object" } } },
    };
    const spec = withCrimeEventsOpenApi(base);
    expect((spec.paths as Record<string, unknown>)["/documents"]).toBeDefined();
    expect((spec.paths as Record<string, unknown>)["/crime-events"]).toBeDefined();
    expect((spec.paths as Record<string, unknown>)["/crime-events.geojson"]).toBeDefined();
    expect((spec.paths as Record<string, unknown>)["/crime-events/coverage"]).toBeDefined();
    expect(JSON.stringify(spec)).toContain(CRIME_EVENTS_DISCLAIMER);
  });

  it("the DB reader source references only the public LTCEDS table", async () => {
    const filePath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "publicCrimeEvents.ts",
    );
    const source = await readFile(filePath, "utf8");
    expect(source).toContain("crimePublicEventsTable");
    for (const forbidden of [
      "crimeEventsTable",
      "crimeEventLocationsTable",
      "crimeSourcesTable",
      "crimeEventOffencesTable",
      "crimeEventSourcesTable",
      "crimeEventClustersTable",
    ]) {
      expect(source, forbidden).not.toContain(forbidden);
    }
  });
});
