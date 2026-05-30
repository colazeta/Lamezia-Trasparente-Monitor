import { describe, it, expect, afterAll, afterEach } from "vitest";
import { eq, inArray } from "drizzle-orm";

import request from "supertest";
import app from "../app";
import {
  db,
  pool,
  oversightOpinionsTable,
  oversightOpinionDocumentsTable,
} from "@workspace/db";

const createdOpinionIds: number[] = [];

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

  it("filters by year", async () => {
    const in2021 = await createOpinion({
      opinionDate: new Date("2021-06-15"),
    });
    const in2022 = await createOpinion({
      opinionDate: new Date("2022-06-15"),
    });
    const res = await request(app)
      .get("/api/oversight-opinions")
      .query({ year: 2021 });
    expect(res.status).toBe(200);
    const ids = res.body.map((o: { id: number }) => o.id);
    expect(ids).toContain(in2021);
    expect(ids).not.toContain(in2022);
    expect(
      res.body.every(
        (o: { opinionDate: string }) =>
          new Date(o.opinionDate).getUTCFullYear() === 2021,
      ),
    ).toBe(true);
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
