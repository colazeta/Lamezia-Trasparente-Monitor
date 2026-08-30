import { afterAll, afterEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import request from "supertest";

import app from "../app";
import { db, pool, publicationsTable } from "@workspace/db";
import { attestPublicationAtIngestion } from "../lib/publicActProjection";

const createdIds: number[] = [];

async function createLegacyDelibera(options: {
  marker: string;
  organo: "GIUNTA" | "CONSIGLIO";
  number: number;
}) {
  const progressivo = `test-delibere/${options.marker}/${options.number}`;
  const tipologia = `DELIBERAZIONE DI ${options.organo} NR. ${options.number} DEL 01/08/2026`;
  const oggetto = `Archivio delibere ${options.marker} ${options.organo}`;
  const publicSafetyDecision = attestPublicationAtIngestion({
    source: {
      progressivo,
      tipologia,
      category: "albo",
      subcategory: null,
      provenienza: null,
      oggetto,
      dataAtto: null,
      pubStart: null,
      pubEnd: null,
      numRegSet: String(options.number),
      numRegGen: null,
      cups: [],
      pnrrMission: null,
      isPnrr: false,
    },
    evaluatedAt: new Date("2026-08-30T09:00:00.000Z"),
    previous: null,
  });
  const [row] = await db
    .insert(publicationsTable)
    .values({
      progressivo,
      tipologia,
      // Simulates historical records ingested before the dedicated classifier.
      category: "albo",
      subcategory: null,
      oggetto,
      numRegSet: String(options.number),
      publicSafetyDecision,
    })
    .returning();

  createdIds.push(row.id);
  return row;
}

afterEach(async () => {
  for (const id of createdIds.splice(0)) {
    await db.delete(publicationsTable).where(eq(publicationsTable.id, id));
  }
});

afterAll(async () => {
  await pool.end();
});

describe("GET /api/delibere", () => {
  it("recovers a legacy Giunta deliberation stored as a generic Albo item", async () => {
    const marker = `legacy-giunta-${Date.now()}`;
    const row = await createLegacyDelibera({ marker, organo: "GIUNTA", number: 214 });

    const res = await request(app).get(`/api/delibere?q=${encodeURIComponent(marker)}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(row.id);
    expect(res.body[0].category).toBe("delibera");
    expect(res.body[0].subcategory).toBe("giunta");
    expect(res.body[0].numRegSet).toBe("214");
  });

  it("recovers a legacy Consiglio deliberation and normalises its organ", async () => {
    const marker = `legacy-consiglio-${Date.now()}`;
    const row = await createLegacyDelibera({ marker, organo: "CONSIGLIO", number: 64 });

    const res = await request(app).get(`/api/delibere?q=${encodeURIComponent(marker)}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(row.id);
    expect(res.body[0].subcategory).toBe("consiglio");
  });

  it("applies the Giunta/Consiglio filter also to recovered legacy records", async () => {
    const marker = `legacy-filter-${Date.now()}`;
    const giunta = await createLegacyDelibera({ marker, organo: "GIUNTA", number: 201 });
    const consiglio = await createLegacyDelibera({ marker, organo: "CONSIGLIO", number: 61 });

    const res = await request(app).get(
      `/api/delibere?tipo=consiglio&q=${encodeURIComponent(marker)}`,
    );

    expect(res.status).toBe(200);
    expect(res.body.map((item: { id: number }) => item.id)).toEqual([consiglio.id]);
    expect(res.body.map((item: { id: number }) => item.id)).not.toContain(giunta.id);
  });
});
