import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { eq, inArray } from "drizzle-orm";

import request from "supertest";
import app from "../app";
import { db, pool, confiscatedAssetsTable } from "@workspace/db";

const INGEST_TOKEN = "test-ingest-token";
const auth = { Authorization: `Bearer ${INGEST_TOKEN}` };

const createdSlugs: string[] = [];

function unique(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function insertAsset(
  overrides: Partial<typeof confiscatedAssetsTable.$inferInsert> = {},
): Promise<typeof confiscatedAssetsTable.$inferSelect> {
  const slug = overrides.slug ?? unique("bene");
  const [row] = await db
    .insert(confiscatedAssetsTable)
    .values({
      slug,
      denominazione: `Bene di test ${slug}`,
      description: "Appartamento confiscato",
      tipologia: "Appartamento",
      status: "confiscato",
      indirizzo: "Via Roma 1, Lamezia Terme",
      source: "manual",
      ...overrides,
    })
    .returning();
  createdSlugs.push(row.slug);
  return row;
}

beforeAll(() => {
  process.env.INGEST_API_TOKEN = INGEST_TOKEN;
});

afterAll(async () => {
  await pool.end();
});

afterEach(async () => {
  if (createdSlugs.length) {
    await db
      .delete(confiscatedAssetsTable)
      .where(inArray(confiscatedAssetsTable.slug, createdSlugs.splice(0)));
  }
});

// ---------------------------------------------------------------------------
// GET /api/beni-confiscati (public list)
// ---------------------------------------------------------------------------
describe("GET /api/beni-confiscati (public list)", () => {
  it("returns an array including the inserted asset", async () => {
    const asset = await insertAsset();
    const res = await request(app).get("/api/beni-confiscati");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const found = res.body.find((a: { id: number }) => a.id === asset.id);
    expect(found).toBeTruthy();
    expect(found.slug).toBe(asset.slug);
    expect(found.denominazione).toBe(asset.denominazione);
  });

  it("does not expose admin-only fields in public list", async () => {
    const asset = await insertAsset();
    const res = await request(app).get("/api/beni-confiscati");
    expect(res.status).toBe(200);
    const found = res.body.find((a: { id: number }) => a.id === asset.id);
    expect(found).toBeTruthy();
    expect(found.notes).toBeUndefined();
    expect(found.createdAt).toBeUndefined();
    expect(found.geoSource).toBeUndefined();
    expect(found.geoManual).toBeUndefined();
  });

  it("filters by status", async () => {
    const assegnato = await insertAsset({ status: "assegnato" });
    const confiscato = await insertAsset({ status: "confiscato" });
    const res = await request(app)
      .get("/api/beni-confiscati")
      .query({ status: "assegnato" });
    expect(res.status).toBe(200);
    const ids = res.body.map((a: { id: number }) => a.id);
    expect(ids).toContain(assegnato.id);
    expect(ids).not.toContain(confiscato.id);
  });

  it("filters by tipologia", async () => {
    const terreno = await insertAsset({ tipologia: "Terreno" });
    const appart = await insertAsset({ tipologia: "Appartamento" });
    const res = await request(app)
      .get("/api/beni-confiscati")
      .query({ tipologia: "Terreno" });
    expect(res.status).toBe(200);
    const ids = res.body.map((a: { id: number }) => a.id);
    expect(ids).toContain(terreno.id);
    expect(ids).not.toContain(appart.id);
  });
});

// ---------------------------------------------------------------------------
// GET /api/beni-confiscati/summary
// ---------------------------------------------------------------------------
describe("GET /api/beni-confiscati/summary", () => {
  it("returns a summary object with the expected keys", async () => {
    await insertAsset({ status: "assegnato" });
    const res = await request(app).get("/api/beni-confiscati/summary");
    expect(res.status).toBe(200);
    const b = res.body;
    expect(typeof b.totale).toBe("number");
    expect(typeof b.sequestrati).toBe("number");
    expect(typeof b.confiscati).toBe("number");
    expect(typeof b.assegnati).toBe("number");
    expect(typeof b.riutilizzati).toBe("number");
    expect(typeof b.geolocalizzati).toBe("number");
    expect(Array.isArray(b.perStatus)).toBe(true);
    expect(Array.isArray(b.perTipologia)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GET /api/beni-confiscati/:slug (public detail)
// ---------------------------------------------------------------------------
describe("GET /api/beni-confiscati/:slug (public detail)", () => {
  it("returns the public detail of an existing asset", async () => {
    const asset = await insertAsset();
    const res = await request(app).get(`/api/beni-confiscati/${asset.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(asset.id);
    expect(res.body.slug).toBe(asset.slug);
  });

  it("does not expose admin-only fields in detail", async () => {
    const asset = await insertAsset();
    const res = await request(app).get(`/api/beni-confiscati/${asset.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.notes).toBeUndefined();
    expect(res.body.createdAt).toBeUndefined();
    expect(res.body.source).toBeUndefined();
    expect(res.body.geoManual).toBeUndefined();
  });

  it("returns 404 for an unknown slug", async () => {
    const res = await request(app).get(
      "/api/beni-confiscati/slug-che-non-esiste",
    );
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// GET /api/beni-confiscati/admin (editorial list)
// ---------------------------------------------------------------------------
describe("GET /api/beni-confiscati/admin (editorial list)", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/api/beni-confiscati/admin");
    expect(res.status).toBe(401);
  });

  it("rejects a wrong token", async () => {
    const res = await request(app)
      .get("/api/beni-confiscati/admin")
      .set("Authorization", "Bearer wrong-token");
    expect(res.status).toBe(401);
  });

  it("returns all assets with admin fields when authorized", async () => {
    const asset = await insertAsset({ notes: "nota interna" });
    const res = await request(app)
      .get("/api/beni-confiscati/admin")
      .set(auth);
    expect(res.status).toBe(200);
    const found = res.body.find((a: { id: number }) => a.id === asset.id);
    expect(found).toBeTruthy();
    expect(found.notes).toBe("nota interna");
    expect(found.source).toBe("manual");
    expect(found.createdAt).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// POST /api/beni-confiscati (create)
// ---------------------------------------------------------------------------
describe("POST /api/beni-confiscati (create)", () => {
  it("requires authentication", async () => {
    const res = await request(app).post("/api/beni-confiscati").send({
      slug: unique("new"),
      denominazione: "Appartamento A",
    });
    expect(res.status).toBe(401);
  });

  it("creates a new asset with required fields", async () => {
    const slug = unique("new");
    const res = await request(app)
      .post("/api/beni-confiscati")
      .set(auth)
      .send({ slug, denominazione: "Bene creato via API" });
    expect(res.status).toBe(201);
    createdSlugs.push(res.body.slug);
    expect(res.body.slug).toBe(slug);
    expect(res.body.denominazione).toBe("Bene creato via API");
    expect(res.body.source).toBe("manual");
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/beni-confiscati")
      .set(auth)
      .send({ denominazione: "Senza slug" });
    expect(res.status).toBe(400);
  });

  it("returns 400 on duplicate slug", async () => {
    const slug = unique("dup");
    await insertAsset({ slug });
    const res = await request(app)
      .post("/api/beni-confiscati")
      .set(auth)
      .send({ slug, denominazione: "Secondo con stesso slug" });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/beni-confiscati/:slug (update)
// ---------------------------------------------------------------------------
describe("PATCH /api/beni-confiscati/:slug (update)", () => {
  it("requires authentication", async () => {
    const asset = await insertAsset();
    const res = await request(app)
      .patch(`/api/beni-confiscati/${asset.slug}`)
      .send({ denominazione: "Aggiornato" });
    expect(res.status).toBe(401);
  });

  it("updates allowed fields and promotes source to manual", async () => {
    const asset = await insertAsset({ source: "auto" });
    const res = await request(app)
      .patch(`/api/beni-confiscati/${asset.slug}`)
      .set(auth)
      .send({
        denominazione: "Nuova denominazione",
        status: "assegnato",
        notes: "nota aggiornata",
      });
    expect(res.status).toBe(200);
    expect(res.body.denominazione).toBe("Nuova denominazione");
    expect(res.body.status).toBe("assegnato");
    expect(res.body.notes).toBe("nota aggiornata");
    expect(res.body.source).toBe("manual");
  });

  it("returns 404 for an unknown slug", async () => {
    const res = await request(app)
      .patch("/api/beni-confiscati/slug-inesistente")
      .set(auth)
      .send({ denominazione: "X" });
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/beni-confiscati/:slug
// ---------------------------------------------------------------------------
describe("DELETE /api/beni-confiscati/:slug", () => {
  it("requires authentication", async () => {
    const asset = await insertAsset();
    const res = await request(app).delete(
      `/api/beni-confiscati/${asset.slug}`,
    );
    expect(res.status).toBe(401);
  });

  it("deletes an existing asset", async () => {
    const asset = await insertAsset();
    const res = await request(app)
      .delete(`/api/beni-confiscati/${asset.slug}`)
      .set(auth);
    expect(res.status).toBe(204);
    const rows = await db
      .select()
      .from(confiscatedAssetsTable)
      .where(eq(confiscatedAssetsTable.slug, asset.slug));
    expect(rows).toHaveLength(0);
    // Already deleted — remove from cleanup list so afterEach doesn't error.
    const idx = createdSlugs.indexOf(asset.slug);
    if (idx !== -1) createdSlugs.splice(idx, 1);
  });

  it("returns 404 for an unknown slug", async () => {
    const res = await request(app)
      .delete("/api/beni-confiscati/slug-inesistente")
      .set(auth);
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/beni-confiscati/:id/location (editorial geo-correction)
// ---------------------------------------------------------------------------
describe("PATCH /api/beni-confiscati/:id/location", () => {
  it("requires authentication", async () => {
    const asset = await insertAsset();
    const res = await request(app)
      .patch(`/api/beni-confiscati/${asset.id}/location`)
      .send({ latitude: 38.97, longitude: 16.31 });
    expect(res.status).toBe(401);
  });

  it("sets valid coordinates and clears geoVerify", async () => {
    const asset = await insertAsset();
    const res = await request(app)
      .patch(`/api/beni-confiscati/${asset.id}/location`)
      .set(auth)
      .send({ latitude: 38.97, longitude: 16.31 });
    expect(res.status).toBe(200);
    expect(res.body.geoManual).toBe(true);
    expect(res.body.geoVerify).toBe(false);
    expect(parseFloat(res.body.latitude)).toBeCloseTo(38.97, 4);
    expect(parseFloat(res.body.longitude)).toBeCloseTo(16.31, 4);
  });

  it("rejects providing only latitude without longitude", async () => {
    const asset = await insertAsset();
    const res = await request(app)
      .patch(`/api/beni-confiscati/${asset.id}/location`)
      .set(auth)
      .send({ latitude: 38.97 });
    expect(res.status).toBe(400);
  });

  it("rejects out-of-range coordinates", async () => {
    const asset = await insertAsset();
    const res = await request(app)
      .patch(`/api/beni-confiscati/${asset.id}/location`)
      .set(auth)
      .send({ latitude: 200, longitude: 16.31 });
    expect(res.status).toBe(400);
  });

  it("clears coordinates when null is sent", async () => {
    const asset = await insertAsset();
    const res = await request(app)
      .patch(`/api/beni-confiscati/${asset.id}/location`)
      .set(auth)
      .send({ latitude: null, longitude: null });
    expect(res.status).toBe(200);
    expect(res.body.latitude).toBeNull();
    expect(res.body.longitude).toBeNull();
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app)
      .patch("/api/beni-confiscati/99999999/location")
      .set(auth)
      .send({ latitude: 38.97, longitude: 16.31 });
    expect(res.status).toBe(404);
  });
});
