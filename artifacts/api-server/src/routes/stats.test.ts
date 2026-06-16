import { describe, it, expect, afterAll, afterEach } from "vitest";
import { inArray } from "drizzle-orm";

import request from "supertest";
import app from "../app";
import { db, pool, reportsTable } from "@workspace/db";

const createdIds: number[] = [];

async function createReport(
  overrides: Partial<typeof reportsTable.$inferInsert> = {},
): Promise<number> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [row] = await db
    .insert(reportsTable)
    .values({
      title: `Segnale activity ${unique}`,
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

describe("GET /api/stats/activity", () => {
  it("does not expose reports that have not passed editorial publication", async () => {
    const unpublishedId = await createReport({
      title: "Segnale activity non pubblicato test privacy",
      publishedAt: null,
    });
    const publishedId = await createReport({
      title: "Segnale activity pubblicato test privacy",
      publishedAt: new Date("2026-06-08T10:00:00.000Z"),
    });

    const res = await request(app).get("/api/stats/activity");

    expect(res.status).toBe(200);
    const reportItems = (
      res.body as Array<{ id: string; title: string }>
    ).filter((item) => item.id.startsWith("report-"));
    expect(reportItems).toContainEqual(
      expect.objectContaining({
        id: `report-${publishedId}`,
        title: "Segnale activity pubblicato test privacy",
      }),
    );
    expect(reportItems).not.toContainEqual(
      expect.objectContaining({ id: `report-${unpublishedId}` }),
    );
  });
});
