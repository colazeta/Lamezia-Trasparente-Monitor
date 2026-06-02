import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { eq, inArray } from "drizzle-orm";

import request from "supertest";
import app from "../app";
import {
  db,
  pool,
  oversightOpinionsTable,
  oversightOpinionDocumentsTable,
} from "@workspace/db";

const INGEST_TOKEN = "test-ingest-token";
const auth = { Authorization: `Bearer ${INGEST_TOKEN}` };

const createdOpinionIds: number[] = [];

beforeAll(() => {
  process.env.INGEST_API_TOKEN = INGEST_TOKEN;
});

async function createOpinion(
  overrides: Partial<typeof oversightOpinionsTable.$inferInsert> = {},
): Promise<number> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [opinion] = await db
    .insert(oversightOpinionsTable)
    .values({
      title: `Parere di test ${unique}`,
      issuingBody: "Collegio dei Revisori dei Conti",
      opinionType: "Parere obbligatorio",
      subject: `Oggetto di test ${unique}`,
      outcome: "Favorevole",
      body: "Testo esteso del parere di test.",
      status: "pubblicato",
      opinionDate: new Date("2025-01-01"),
      ...overrides,
    })
    .returning();
  createdOpinionIds.push(opinion.id);
  return opinion.id;
}

afterAll(async () => {
  await pool.end();
});

afterEach(async () => {
  if (createdOpinionIds.length) {
    await db
      .delete(oversightOpinionDocumentsTable)
      .where(
        inArray(oversightOpinionDocumentsTable.opinionId, createdOpinionIds),
      );
    await db
      .delete(oversightOpinionsTable)
      .where(inArray(oversightOpinionsTable.id, createdOpinionIds.splice(0)));
  }
});

describe("GET /api/oversight-opinions", () => {
  it("lists published opinions", async () => {
    const id = await createOpinion();
    const res = await request(app).get("/api/oversight-opinions");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const found = res.body.find((o: { id: number }) => o.id === id);
    expect(found).toBeTruthy();
    expect(found.issuingBody).toBe("Collegio dei Revisori dei Conti");
    expect(found.opinionDate).toBeTruthy();
  });

  it("filters by issuing body", async () => {
    const anacId = await createOpinion({ issuingBody: "ANAC" });
    await createOpinion({ issuingBody: "Corte dei Conti" });
    const res = await request(app)
      .get("/api/oversight-opinions")
      .query({ issuingBody: "ANAC" });
    expect(res.status).toBe(200);
    expect(res.body.every((o: { issuingBody: string }) => o.issuingBody === "ANAC")).toBe(
      true,
    );
    expect(res.body.some((o: { id: number }) => o.id === anacId)).toBe(true);
  });

  it("hides non-published opinions", async () => {
    const id = await createOpinion({ status: "bozza" });
    const res = await request(app).get("/api/oversight-opinions");
    expect(res.body.some((o: { id: number }) => o.id === id)).toBe(false);
  });

  it("sorts oldest first when requested", async () => {
    const older = await createOpinion({ opinionDate: new Date("2020-01-01") });
    const newer = await createOpinion({ opinionDate: new Date("2030-01-01") });
    const res = await request(app)
      .get("/api/oversight-opinions")
      .query({ sort: "oldest" });
    const ids = res.body.map((o: { id: number }) => o.id);
    expect(ids.indexOf(older)).toBeLessThan(ids.indexOf(newer));
  });

  it("filters by reference year (not emission date)", async () => {
    const ref2021 = await createOpinion({
      opinionDate: new Date("2026-06-15"),
      referenceYear: 2021,
    });
    const ref2022 = await createOpinion({
      opinionDate: new Date("2026-06-15"),
      referenceYear: 2022,
    });
    const res = await request(app)
      .get("/api/oversight-opinions")
      .query({ year: 2021 });
    expect(res.status).toBe(200);
    const ids = res.body.map((o: { id: number }) => o.id);
    expect(ids).toContain(ref2021);
    expect(ids).not.toContain(ref2022);
    expect(
      res.body.every((o: { referenceYear: number }) => o.referenceYear === 2021),
    ).toBe(true);
  });

  it("exposes referenceYear in the listing", async () => {
    const id = await createOpinion({ referenceYear: 2023 });
    const res = await request(app).get("/api/oversight-opinions");
    const found = res.body.find((o: { id: number }) => o.id === id);
    expect(found.referenceYear).toBe(2023);
  });

  it("sorts by referenceYear descending when requested", async () => {
    const older = await createOpinion({
      referenceYear: 2010,
      opinionDate: new Date("2030-01-01"),
    });
    const newer = await createOpinion({
      referenceYear: 2040,
      opinionDate: new Date("2020-01-01"),
    });
    const res = await request(app)
      .get("/api/oversight-opinions")
      .query({ sort: "referenceYear" });
    const ids = res.body.map((o: { id: number }) => o.id);
    expect(ids.indexOf(newer)).toBeLessThan(ids.indexOf(older));
  });
});

describe("GET /api/oversight-opinions/all (protected)", () => {
  it("rejects requests without a token", async () => {
    const res = await request(app).get("/api/oversight-opinions/all");
    expect(res.status).toBe(401);
  });

  it("returns all opinions incl. drafts with documents", async () => {
    const draftId = await createOpinion({ status: "bozza" });
    await db.insert(oversightOpinionDocumentsTable).values({
      opinionId: draftId,
      title: "Allegato bozza",
      type: "PDF",
      date: new Date("2025-01-01"),
    });

    const res = await request(app)
      .get("/api/oversight-opinions/all")
      .set(auth);
    expect(res.status).toBe(200);
    const found = res.body.find((o: { id: number }) => o.id === draftId);
    expect(found).toBeTruthy();
    expect(found.status).toBe("bozza");
    expect(found.documents).toHaveLength(1);
  });
});

describe("POST /api/oversight-opinions (protected)", () => {
  it("rejects unauthenticated creation", async () => {
    const res = await request(app)
      .post("/api/oversight-opinions")
      .send({
        title: "Nuovo parere",
        issuingBody: "ANAC",
        opinionType: "Parere",
        subject: "Oggetto",
      });
    expect(res.status).toBe(401);
  });

  it("rejects invalid input", async () => {
    const res = await request(app)
      .post("/api/oversight-opinions")
      .set(auth)
      .send({ title: "", issuingBody: "ANAC" });
    expect(res.status).toBe(400);
  });

  it("creates a new opinion with referenceYear", async () => {
    const res = await request(app)
      .post("/api/oversight-opinions")
      .set(auth)
      .send({
        title: "Parere creato dall'editor",
        issuingBody: "Collegio dei Revisori dei Conti",
        opinionType: "Parere obbligatorio",
        subject: "Bilancio di previsione",
        outcome: "Favorevole",
        body: "Testo del parere.",
        referenceYear: 2024,
        status: "pubblicato",
        opinionDate: "2026-03-01",
      });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeTruthy();
    expect(res.body.referenceYear).toBe(2024);
    expect(res.body.body).toBe("Testo del parere.");
    expect(res.body.documents).toEqual([]);
    createdOpinionIds.push(res.body.id);
  });
});

describe("PATCH /api/oversight-opinions/:id (protected)", () => {
  it("rejects unauthenticated edits", async () => {
    const id = await createOpinion();
    const res = await request(app)
      .patch(`/api/oversight-opinions/${id}`)
      .send({ referenceYear: 2020 });
    expect(res.status).toBe(401);
  });

  it("updates referenceYear and status", async () => {
    const id = await createOpinion({ referenceYear: 2019, status: "bozza" });
    const res = await request(app)
      .patch(`/api/oversight-opinions/${id}`)
      .set(auth)
      .send({ referenceYear: 2025, status: "pubblicato" });
    expect(res.status).toBe(200);
    expect(res.body.referenceYear).toBe(2025);
    expect(res.body.status).toBe("pubblicato");
  });

  it("returns 404 for unknown id", async () => {
    const res = await request(app)
      .patch("/api/oversight-opinions/99999999")
      .set(auth)
      .send({ referenceYear: 2025 });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/oversight-opinions/:id (protected)", () => {
  it("rejects unauthenticated deletes", async () => {
    const id = await createOpinion();
    const res = await request(app).delete(`/api/oversight-opinions/${id}`);
    expect(res.status).toBe(401);
  });

  it("deletes an opinion and its documents", async () => {
    const id = await createOpinion();
    await db.insert(oversightOpinionDocumentsTable).values({
      opinionId: id,
      title: "Allegato da eliminare",
      type: "PDF",
      date: new Date("2025-01-01"),
    });
    const res = await request(app)
      .delete(`/api/oversight-opinions/${id}`)
      .set(auth);
    expect(res.status).toBe(204);
    const remaining = await db
      .select()
      .from(oversightOpinionsTable)
      .where(eq(oversightOpinionsTable.id, id));
    expect(remaining).toHaveLength(0);
  });
});

describe("oversight opinion documents (protected)", () => {
  it("adds and deletes a document", async () => {
    const id = await createOpinion();

    const addRes = await request(app)
      .post(`/api/oversight-opinions/${id}/documents`)
      .set(auth)
      .send({
        title: "Verbale allegato",
        type: "PDF",
        url: "https://example.com/verbale.pdf",
        date: "2025-02-01",
      });
    expect(addRes.status).toBe(201);
    const documentId = addRes.body.id;
    expect(documentId).toBeTruthy();

    const delRes = await request(app)
      .delete(`/api/oversight-opinions/${id}/documents/${documentId}`)
      .set(auth);
    expect(delRes.status).toBe(204);

    const docs = await db
      .select()
      .from(oversightOpinionDocumentsTable)
      .where(eq(oversightOpinionDocumentsTable.id, documentId));
    expect(docs).toHaveLength(0);
  });

  it("rejects unauthenticated document creation", async () => {
    const id = await createOpinion();
    const res = await request(app)
      .post(`/api/oversight-opinions/${id}/documents`)
      .send({ title: "X", type: "PDF" });
    expect(res.status).toBe(401);
  });

  it("returns 404 when adding a document to an unknown opinion", async () => {
    const res = await request(app)
      .post("/api/oversight-opinions/99999999/documents")
      .set(auth)
      .send({ title: "X", type: "PDF" });
    expect(res.status).toBe(404);
  });
});

describe("GET /api/oversight-opinions/:id", () => {
  it("returns an opinion with its documents", async () => {
    const id = await createOpinion();
    await db.insert(oversightOpinionDocumentsTable).values({
      opinionId: id,
      title: "Allegato di test",
      type: "PDF",
      url: "https://example.com/test.pdf",
      date: new Date("2025-01-01"),
    });

    const res = await request(app).get(`/api/oversight-opinions/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.body).toBe("Testo esteso del parere di test.");
    expect(Array.isArray(res.body.documents)).toBe(true);
    expect(res.body.documents).toHaveLength(1);
    expect(res.body.documents[0].title).toBe("Allegato di test");
  });

  it("returns 404 for unknown id", async () => {
    const res = await request(app).get("/api/oversight-opinions/99999999");
    expect(res.status).toBe(404);
  });

  it("returns 404 for non-published opinion", async () => {
    const id = await createOpinion({ status: "bozza" });
    const res = await request(app).get(`/api/oversight-opinions/${id}`);
    expect(res.status).toBe(404);
  });
});
