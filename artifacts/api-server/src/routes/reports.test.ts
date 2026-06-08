import { describe, it, expect, afterAll, afterEach } from "vitest";
import { inArray } from "drizzle-orm";

import request from "supertest";
import app from "../app";
import { db, pool, reportsTable } from "@workspace/db";

const createdIds: number[] = [];

async function createLegacyReport(
  overrides: Partial<typeof reportsTable.$inferInsert> = {},
): Promise<number> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [row] = await db
    .insert(reportsTable)
    .values({
      title: `Segnale civico ${unique}`,
      description:
        "Descrizione circostanziata utile alle verifiche redazionali.",
      category: "trasparenza",
      location: "Lamezia Terme",
      citizenName: "Nome Riservato",
      ...overrides,
    })
    .returning();
  createdIds.push(row.id);
  return row.id;
}

afterEach(async () => {
  const ids = createdIds.splice(0);
  if (ids.length) {
    await db.delete(reportsTable).where(inArray(reportsTable.id, ids));
  }
});

afterAll(async () => {
  await pool.end();
});

describe("legacy reports public privacy guard", () => {
  it("exposes only explicitly published reports on the public board", async () => {
    await createLegacyReport({ status: "presa_in_carico" });
    const publishedId = await createLegacyReport({
      title: "Segnale pubblicato con revisione redazionale",
      status: "presa_in_carico",
      publishedAt: new Date("2026-06-08T10:00:00.000Z"),
    });

    const res = await request(app).get("/api/reports");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      id: publishedId,
      title: "Segnale pubblicato con revisione redazionale",
      publishedAt: "2026-06-08T10:00:00.000Z",
    });
    expect(res.body[0]).not.toHaveProperty("citizenName");
  });

  it("does not return citizenName in the public creation response", async () => {
    const res = await request(app).post("/api/reports").send({
      title: "Segnale civico su documento pubblico",
      description:
        "Descrizione circostanziata utile alle verifiche redazionali.",
      category: "trasparenza",
      location: "Lamezia Terme",
      citizenName: "Nome Riservato",
    });

    expect(res.status).toBe(201);
    expect(res.body).not.toHaveProperty("citizenName");
    expect(res.body.title).toBe("Segnale civico su documento pubblico");
    createdIds.push(res.body.id);
  });

  it("keeps editorial and publication fields server-controlled on public creation", async () => {
    const res = await request(app).post("/api/reports").send({
      title: "Segnale con campi editoriali ignorati",
      description:
        "Descrizione circostanziata utile alle verifiche redazionali.",
      category: "trasparenza",
      location: "Lamezia Terme",
      outcome: "risolta",
      verificationStatus: "documentata",
      interpretiveCaution: "Testo client non pubblicabile.",
      publishedAt: "2026-06-08T10:00:00.000Z",
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: "Segnale con campi editoriali ignorati",
      outcome: "aperta",
      verificationStatus: "non_verificata",
      publishedAt: null,
    });
    expect(res.body.interpretiveCaution).toContain(
      "non indica responsabilità o irregolarità accertate",
    );
    expect(res.body.interpretiveCaution).not.toBe(
      "Testo client non pubblicabile.",
    );
    createdIds.push(res.body.id);
  });

  it("returns 400 for malformed optional dates instead of storing invalid dates", async () => {
    const res = await request(app).post("/api/reports").send({
      title: "Segnale con data non valida",
      description:
        "Descrizione circostanziata utile alle verifiche redazionali.",
      category: "trasparenza",
      location: "Lamezia Terme",
      publicEmergenceDate: "2026-02-31T00:00:00.000Z",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Date non valide" });
  });
});
