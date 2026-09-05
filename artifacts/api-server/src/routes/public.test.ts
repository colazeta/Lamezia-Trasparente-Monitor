import { createHash } from "node:crypto";

import { describe, it, expect, afterAll, afterEach } from "vitest";
import { inArray } from "drizzle-orm";

import request from "supertest";
import app from "../app";
import {
  crimeEventsTable,
  crimePublicEventsTable,
  db,
  pool,
  publicationsTable,
} from "@workspace/db";
import { publicActPublicId } from "@workspace/publication-standardisation/public-act";
import { attestPublicationAtIngestion } from "../lib/publicActProjection";
import { CRIME_EVENTS_DISCLAIMER } from "../lib/publicCrimeEventsCore";

const createdIds: number[] = [];
const createdCrimeEventIds: string[] = [];
let crimeSequence = 1;

function uuidV7(): string {
  const tail = (crimeSequence++).toString(16).padStart(12, "0").slice(-12);
  return `01890f3e-1000-7000-8000-${tail}`;
}

async function createPublication(
  overrides: Partial<typeof publicationsTable.$inferInsert> = {},
): Promise<number> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [row] = await db
    .insert(publicationsTable)
    .values({
      progressivo: `test/${unique}`,
      tipologia: "DETERMINAZIONE DIRIGENZIALE",
      category: "albo",
      oggetto: `Atto di test ${unique}`,
      pubStart: new Date("2026-01-15T00:00:00.000Z"),
      ...overrides,
    })
    .returning();
  createdIds.push(row.id);
  return row.id;
}

async function createCrimeEvent(
  overrides: Record<string, unknown> = {},
): Promise<string> {
  const eventId = uuidV7();
  const payload: Record<string, unknown> = {
    event_id: eventId,
    schema_version: "1.0-draft.1",
    record_status: "published",
    event_form: "discrete",
    title: `Evento sintetico ${eventId.slice(-4)}`,
    temporal: { start: "2025-10-09", precision: "exact_date" },
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
        offence_instance_id: uuidV7(),
        classification_basis: "provisional",
        iccs_code: "05.01.01",
        istat_synthetic_code: "SYN-05",
        situational_context: ["organised_crime_related"],
      },
    ],
    sources: [
      {
        source_id: uuidV7(),
        source_type: "public_authority_primary",
        url: "https://example.test/source",
      },
    ],
    updated_at: "2026-09-05T22:30:00Z",
    ...overrides,
  };

  await db.insert(crimeEventsTable).values({
    eventId,
    schemaVersion: "1.0-draft.1",
    recordStatus: "published",
    eventForm: "discrete",
    title: String(payload.title),
    temporalStart: "2025-10-09",
    temporalPrecision: "exact_date",
  });
  await db.insert(crimePublicEventsTable).values({
    eventId,
    schemaVersion: "1.0-draft.1",
    payload,
    payloadSha256: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    publicationGateVersion: "test-ltceds-1",
  });
  createdCrimeEventIds.push(eventId);
  return eventId;
}

afterEach(async () => {
  const crimeIds = createdCrimeEventIds.splice(0);
  if (crimeIds.length) {
    await db
      .delete(crimeEventsTable)
      .where(inArray(crimeEventsTable.eventId, crimeIds));
  }

  const ids = createdIds.splice(0);
  if (ids.length) {
    await db
      .delete(publicationsTable)
      .where(inArray(publicationsTable.id, ids));
  }
});

afterAll(async () => {
  await pool.end();
});

describe("Public API v1", () => {
  it("returns a paginated envelope for documents", async () => {
    await createPublication();
    const res = await request(app).get("/api/public/v1/documents?pageSize=1");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toMatchObject({ page: 1, pageSize: 1 });
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
    expect(res.body.data.length).toBeLessThanOrEqual(1);
  });

  it("caps pageSize at 100", async () => {
    const res = await request(app).get(
      "/api/public/v1/documents?pageSize=5000",
    );
    expect(res.status).toBe(200);
    expect(res.body.pagination.pageSize).toBe(100);
  });

  it("does not publish stored Markdown without an explicit attestation", async () => {
    const id = await createPublication({
      markdownText: "# Titolo\n\nCorpo del documento.",
      markdownSource: "allegato.pdf",
      markdownExtractedAt: new Date(),
    });

    const list = await request(app).get(
      "/api/public/v1/documents?hasMarkdown=true&pageSize=100",
    );
    expect(list.status).toBe(200);
    const found = (
      list.body.data as { id: number; hasMarkdown: boolean }[]
    ).find((d) => d.id === id);
    expect(found).toBeUndefined();

    const safeList = await request(app).get(
      "/api/public/v1/documents?hasMarkdown=false&pageSize=100",
    );
    const safeFound = (
      safeList.body.data as { id: number; hasMarkdown: boolean }[]
    ).find((d) => d.id === id);
    expect(safeFound).toBeDefined();
    expect(safeFound!.hasMarkdown).toBe(false);

    const md = await request(app).get(
      `/api/public/v1/documents/${id}/markdown`,
    );
    expect(md.status).toBe(404);

    const raw = await request(app).get(
      `/api/public/v1/documents/${id}/markdown?format=md`,
    );
    expect(raw.status).toBe(404);
    expect(JSON.stringify(raw.body)).not.toContain("# Titolo");
  });

  it("returns 404 for a missing document and missing markdown", async () => {
    const missing = await request(app).get(
      "/api/public/v1/documents/999999999",
    );
    expect(missing.status).toBe(404);

    const id = await createPublication();
    const noMd = await request(app).get(
      `/api/public/v1/documents/${id}/markdown`,
    );
    expect(noMd.status).toBe(404);
  });

  it("dereferences the stable publicId in both public detail routes", async () => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const progressivo = `lookup/${unique}`;
    const oggetto = `Atto lookup ${unique}`;
    const pubStart = new Date("2026-01-15T00:00:00.000Z");
    const publicSafetyDecision = attestPublicationAtIngestion({
      source: {
        progressivo,
        tipologia: "DETERMINAZIONE DIRIGENZIALE",
        category: "albo",
        subcategory: null,
        provenienza: null,
        oggetto,
        dataAtto: null,
        pubStart,
        pubEnd: null,
        numRegSet: null,
        numRegGen: null,
        cups: [],
        pnrrMission: null,
        isPnrr: false,
      },
      evaluatedAt: new Date("2026-08-30T09:00:00.000Z"),
      previous: null,
    });
    const id = await createPublication({
      progressivo,
      oggetto,
      pubStart,
      publicSafetyDecision,
    });
    const publicId = publicActPublicId(progressivo)!;

    const publicDetail = await request(app).get(
      `/api/public/v1/documents/${publicId}`,
    );
    expect(publicDetail.status).toBe(200);
    expect(publicDetail.body).toMatchObject({ id, publicId, progressivo });

    const publicationDetail = await request(app).get(
      `/api/publications/${publicId}`,
    );
    expect(publicationDetail.status).toBe(200);
    expect(publicationDetail.body).toMatchObject({ id, publicId, progressivo });
  });

  it("serves the index and the OpenAPI document", async () => {
    const index = await request(app).get("/api/public/v1/");
    expect(index.status).toBe(200);
    expect(index.body.resources).toHaveProperty("documents");
    expect(index.body.resources).toHaveProperty("crimeEvents");
    expect(index.body.resources).toHaveProperty("crimeEventsGeoJson");
    expect(index.body.resources).toHaveProperty("crimeEventsCoverage");
    expect(index.body.mcp).toHaveProperty("endpoint");

    const spec = await request(app).get("/api/public/v1/openapi.json");
    expect(spec.status).toBe(200);
    expect(spec.body.openapi).toBe("3.1.0");
    expect(spec.body.paths).toHaveProperty("/documents");
    expect(spec.body.paths).toHaveProperty("/contracts");
    expect(spec.body.paths).toHaveProperty("/crime-events");
    expect(spec.body.paths).toHaveProperty("/crime-events.geojson");
    expect(spec.body.paths).toHaveProperty("/crime-events/coverage");
  });

  it("serves LTCEDS list, detail, filters, GeoJSON and coverage from the public projection", async () => {
    const eventId = await createCrimeEvent();

    const list = await request(app).get(
      "/api/public/v1/crime-events?iccs=05&istat=SYN-05&eventForm=discrete&neighbourhood=centro&context=organised_crime_related&mappable=true&from=2025-10-01&to=2025-10-31&pageSize=1",
    );
    expect(list.status).toBe(200);
    expect(list.body.pagination).toMatchObject({ page: 1, pageSize: 1, total: 1 });
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0]).toMatchObject({ event_id: eventId });
    expect(list.body.methodology.disclaimer).toBe(CRIME_EVENTS_DISCLAIMER);

    const detail = await request(app).get(`/api/public/v1/crime-events/${eventId}`);
    expect(detail.status).toBe(200);
    expect(detail.body).toMatchObject({ event_id: eventId, record_status: "published" });

    const geojson = await request(app).get("/api/public/v1/crime-events.geojson?iccs=05");
    expect(geojson.status).toBe(200);
    expect(geojson.body.type).toBe("FeatureCollection");
    expect(geojson.body.features).toHaveLength(1);
    expect(geojson.body.features[0].geometry.coordinates).toEqual([16.25, 38.95]);
    expect(JSON.stringify(geojson.body)).not.toContain("16.3,38.98");

    const coverage = await request(app).get("/api/public/v1/crime-events/coverage");
    expect(coverage.status).toBe(200);
    expect(coverage.body.documentedEventCount).toBe(1);
    expect(coverage.body.mappableEventCount).toBe(1);
    expect(coverage.body.publicMapFeatureCount).toBe(1);
    expect(coverage.body.methodology).toMatchObject({
      completeness: "not_exhaustive",
      riskInterpretation: "prohibited",
      disclaimer: CRIME_EVENTS_DISCLAIMER,
    });
  });

  it("fails closed for invalid crime-event identifiers and nonmatching filters", async () => {
    await createCrimeEvent();

    const invalid = await request(app).get(
      "/api/public/v1/crime-events/550e8400-e29b-41d4-a716-446655440000",
    );
    expect(invalid.status).toBe(404);

    const noMatch = await request(app).get("/api/public/v1/crime-events?iccs=06");
    expect(noMatch.status).toBe(200);
    expect(noMatch.body.data).toHaveLength(0);
  });

  it("does not expose a public-store row whose payload is not in published state", async () => {
    const eventId = await createCrimeEvent({ record_status: "verified_source" });
    const list = await request(app).get("/api/public/v1/crime-events?pageSize=100");
    expect(list.status).toBe(200);
    expect(
      (list.body.data as Array<{ event_id: string }>).some(
        (event) => event.event_id === eventId,
      ),
    ).toBe(false);
    const detail = await request(app).get(`/api/public/v1/crime-events/${eventId}`);
    expect(detail.status).toBe(404);
  });

  it("returns paginated envelopes for the other collections", async () => {
    for (const path of ["contracts", "themes", "pnrr"]) {
      const res = await request(app).get(`/api/public/v1/${path}?pageSize=2`);
      expect(res.status, path).toBe(200);
      expect(res.body.pagination, path).toMatchObject({ page: 1, pageSize: 2 });
      expect(Array.isArray(res.body.data), path).toBe(true);
    }

    const perf = await request(app).get("/api/public/v1/performance");
    expect(perf.status).toBe(200);
    expect(Array.isArray(perf.body)).toBe(true);
  });
});
