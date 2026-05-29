import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { eq } from "drizzle-orm";

import request from "supertest";
import app from "../app";
import {
  db,
  pool,
  publicationsTable,
  sessionReportsTable,
  sessionInterventionsTable,
} from "@workspace/db";

const INGEST_TOKEN = "test-ingest-token";

async function createPublication(category: string): Promise<number> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [publication] = await db
    .insert(publicationsTable)
    .values({
      progressivo: `test/${unique}`,
      tipologia: "TEST",
      category,
      subcategory: "consiglio",
      oggetto: `Seduta di test ${unique}`,
    })
    .returning();
  return publication.id;
}

async function deleteReportFor(publicationId: number): Promise<void> {
  const reports = await db
    .select()
    .from(sessionReportsTable)
    .where(eq(sessionReportsTable.publicationId, publicationId));
  for (const report of reports) {
    await db
      .delete(sessionInterventionsTable)
      .where(eq(sessionInterventionsTable.reportId, report.id));
  }
  await db
    .delete(sessionReportsTable)
    .where(eq(sessionReportsTable.publicationId, publicationId));
}

const createdPublicationIds: number[] = [];

beforeAll(() => {
  process.env.INGEST_API_TOKEN = INGEST_TOKEN;
});

afterAll(async () => {
  await pool.end();
});

afterEach(async () => {
  for (const id of createdPublicationIds.splice(0)) {
    await deleteReportFor(id);
    await db.delete(publicationsTable).where(eq(publicationsTable.id, id));
  }
});

async function makeConvocazione(): Promise<number> {
  const id = await createPublication("convocazione");
  createdPublicationIds.push(id);
  return id;
}

describe("GET /api/convocazioni/:id", () => {
  it("returns the seduta with an empty report state when none exists", async () => {
    const id = await makeConvocazione();

    const res = await request(app).get(`/api/convocazioni/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.hasReport).toBe(false);
    expect(res.body.summary).toBeNull();
    expect(res.body.interventions).toEqual([]);
  });

  it("returns 404 for a publication that is not a convocazione", async () => {
    const id = await createPublication("delibera");
    createdPublicationIds.push(id);

    const res = await request(app).get(`/api/convocazioni/${id}`);

    expect(res.status).toBe(404);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app).get("/api/convocazioni/99999999");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/convocazioni/:id/report", () => {
  it("rejects writes without the ingest token", async () => {
    const id = await makeConvocazione();

    const res = await request(app)
      .post(`/api/convocazioni/${id}/report`)
      .send({ interventions: [{ speakerName: "Mario", content: "Ciao" }] });

    expect(res.status).toBe(401);
    const reports = await db
      .select()
      .from(sessionReportsTable)
      .where(eq(sessionReportsTable.publicationId, id));
    expect(reports).toHaveLength(0);
  });

  it("creates a report with ordered interventions", async () => {
    const id = await makeConvocazione();

    const res = await request(app)
      .post(`/api/convocazioni/${id}/report`)
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send({
        summary: "Sintesi della seduta",
        interventions: [
          { speakerName: "Mario Rossi", speakerRole: "Presidente", content: "Apro la seduta." },
          { speakerName: "Giulia Bianchi", content: "Intervengo sul punto 1." },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.hasReport).toBe(true);
    expect(res.body.summary).toBe("Sintesi della seduta");
    expect(res.body.interventions).toHaveLength(2);
    expect(res.body.interventions[0].speakerName).toBe("Mario Rossi");
    expect(res.body.interventions[0].position).toBe(0);
    expect(res.body.interventions[1].position).toBe(1);
    expect(res.body.interventions[1].speakerRole).toBeNull();
  });

  it("replaces interventions on a second upsert", async () => {
    const id = await makeConvocazione();

    await request(app)
      .post(`/api/convocazioni/${id}/report`)
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send({
        interventions: [
          { speakerName: "A", content: "Primo" },
          { speakerName: "B", content: "Secondo" },
        ],
      });

    const res = await request(app)
      .post(`/api/convocazioni/${id}/report`)
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send({ interventions: [{ speakerName: "C", content: "Terzo" }] });

    expect(res.status).toBe(200);
    expect(res.body.interventions).toHaveLength(1);
    expect(res.body.interventions[0].speakerName).toBe("C");

    const stored = await db
      .select()
      .from(sessionReportsTable)
      .where(eq(sessionReportsTable.publicationId, id));
    expect(stored).toHaveLength(1);
  });

  it("strips HTML/script from stored text", async () => {
    const id = await makeConvocazione();

    const res = await request(app)
      .post(`/api/convocazioni/${id}/report`)
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send({
        summary: "<script>alert('x')</script>Sintesi",
        interventions: [
          {
            speakerName: "<b>Mario</b> Rossi",
            speakerRole: "<i>Presidente</i>",
            content: "<img src=x onerror=alert(1)>Dichiaro aperta la seduta.",
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.summary).toBe("Sintesi");
    const intervention = res.body.interventions[0];
    expect(intervention.speakerName).toBe("Mario Rossi");
    expect(intervention.speakerRole).toBe("Presidente");
    expect(intervention.content).toBe("Dichiaro aperta la seduta.");
    expect(intervention.content).not.toContain("<");
  });

  it("returns 400 when an intervention is blank after sanitization", async () => {
    const id = await makeConvocazione();

    const res = await request(app)
      .post(`/api/convocazioni/${id}/report`)
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send({
        interventions: [{ speakerName: "<b></b>", content: "   " }],
      });

    expect(res.status).toBe(400);
    const reports = await db
      .select()
      .from(sessionReportsTable)
      .where(eq(sessionReportsTable.publicationId, id));
    expect(reports).toHaveLength(0);
  });

  it("returns 404 when posting to a non-convocazione publication", async () => {
    const id = await createPublication("delibera");
    createdPublicationIds.push(id);

    const res = await request(app)
      .post(`/api/convocazioni/${id}/report`)
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send({ interventions: [{ speakerName: "Mario", content: "Ciao" }] });

    expect(res.status).toBe(404);
  });
});
