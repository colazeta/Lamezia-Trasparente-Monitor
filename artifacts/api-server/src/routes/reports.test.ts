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
      description: "Descrizione circostanziata utile alle verifiche redazionali.",
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
  it("does not expose unmoderated legacy reports on the public board", async () => {
    await createLegacyReport({ status: "presa_in_carico" });

    const res = await request(app).get("/api/reports");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("does not return citizenName in the public creation response", async () => {
    const res = await request(app)
      .post("/api/reports")
      .send({
        title: "Segnale civico su documento pubblico",
        description: "Descrizione circostanziata utile alle verifiche redazionali.",
        category: "trasparenza",
        location: "Lamezia Terme",
        citizenName: "Nome Riservato",
      });

    expect(res.status).toBe(201);
    expect(res.body).not.toHaveProperty("citizenName");
    expect(res.body.title).toBe("Segnale civico su documento pubblico");
    createdIds.push(res.body.id);
  });
});
