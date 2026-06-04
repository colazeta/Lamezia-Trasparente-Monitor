import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { inArray } from "drizzle-orm";

import request from "supertest";
import app from "../app";
import { db, pool, accessoCivicoRequestsTable } from "@workspace/db";

const INGEST_TOKEN = "test-ingest-token";
const auth = { Authorization: `Bearer ${INGEST_TOKEN}` };

const createdIds: number[] = [];

function unique(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function insertRequest(
  overrides: Partial<typeof accessoCivicoRequestsTable.$inferInsert> = {},
): Promise<typeof accessoCivicoRequestsTable.$inferSelect> {
  const [row] = await db
    .insert(accessoCivicoRequestsTable)
    .values({
      oggetto: `Richiesta accesso ${unique("obj")}`,
      tipo: "generalizzato",
      ente: "Comune di Lamezia Terme",
      stato: "in-attesa",
      status: "pending",
      ...overrides,
    })
    .returning();
  createdIds.push(row.id);
  return row;
}

beforeAll(() => {
  process.env.INGEST_API_TOKEN = INGEST_TOKEN;
});

afterAll(async () => {
  await pool.end();
});

afterEach(async () => {
  if (createdIds.length) {
    await db
      .delete(accessoCivicoRequestsTable)
      .where(
        inArray(accessoCivicoRequestsTable.id, createdIds.splice(0)),
      );
  }
});

// ---------------------------------------------------------------------------
// POST /api/accesso-civico (citizen submit)
// ---------------------------------------------------------------------------
describe("POST /api/accesso-civico (citizen submit)", () => {
  it("creates a request in pending moderation state", async () => {
    const oggetto = `Richiesta test ${unique("obj")}`;
    const res = await request(app)
      .post("/api/accesso-civico")
      .send({ oggetto });
    expect(res.status).toBe(201);
    createdIds.push(res.body.id);
    expect(res.body.id).toBeDefined();
    expect(res.body.oggetto).toBe(oggetto);
    expect(res.body.status).toBe("pending");
  });

  it("defaults tipo to 'generalizzato' when not provided", async () => {
    const res = await request(app)
      .post("/api/accesso-civico")
      .send({ oggetto: `Oggetto ${unique("g")}` });
    expect(res.status).toBe(201);
    createdIds.push(res.body.id);
    expect(res.body.tipo).toBe("generalizzato");
  });

  it("defaults ente to 'Comune di Lamezia Terme' when not provided", async () => {
    const res = await request(app)
      .post("/api/accesso-civico")
      .send({ oggetto: `Oggetto ${unique("e")}` });
    expect(res.status).toBe(201);
    createdIds.push(res.body.id);
    expect(res.body.ente).toBe("Comune di Lamezia Terme");
  });

  it("accepts all optional fields", async () => {
    const res = await request(app)
      .post("/api/accesso-civico")
      .send({
        oggetto: `Richiesta completa ${unique("full")}`,
        tipo: "documentale",
        ente: "Regione Calabria",
        descrizione: "Descrizione dettagliata.",
        requestText: "Testo integrale della richiesta.",
        requesterName: "Mario Rossi",
        requestDate: "2025-03-01",
        stato: "accolta",
        esitoNote: "Documenti forniti.",
      });
    expect(res.status).toBe(201);
    createdIds.push(res.body.id);
    expect(res.body.tipo).toBe("documentale");
    expect(res.body.requesterName).toBe("Mario Rossi");
    expect(res.body.stato).toBe("accolta");
    // Citizen-submitted request always starts in pending moderation.
    expect(res.body.status).toBe("pending");
  });

  it("returns 400 when oggetto is missing", async () => {
    const res = await request(app)
      .post("/api/accesso-civico")
      .send({ tipo: "semplice" });
    expect(res.status).toBe(400);
  });

  it("returns 400 when oggetto is empty", async () => {
    const res = await request(app)
      .post("/api/accesso-civico")
      .send({ oggetto: "" });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// GET /api/accesso-civico (public list — published only)
// ---------------------------------------------------------------------------
describe("GET /api/accesso-civico (public list)", () => {
  it("returns only published requests", async () => {
    const published = await insertRequest({ status: "published" });
    const pending = await insertRequest({ status: "pending" });

    const res = await request(app).get("/api/accesso-civico");
    expect(res.status).toBe(200);
    const ids = res.body.map((r: { id: number }) => r.id);
    expect(ids).toContain(published.id);
    expect(ids).not.toContain(pending.id);
  });

  it("does not expose requestText in public list", async () => {
    const req = await insertRequest({
      status: "published",
      requestText: "Testo riservato",
    });
    const res = await request(app).get("/api/accesso-civico");
    expect(res.status).toBe(200);
    const found = res.body.find((r: { id: number }) => r.id === req.id);
    expect(found).toBeTruthy();
    expect(found.requestText).toBeUndefined();
  });

  it("filters by stato", async () => {
    const accolta = await insertRequest({ status: "published", stato: "accolta" });
    const attesa = await insertRequest({ status: "published", stato: "in-attesa" });

    const res = await request(app)
      .get("/api/accesso-civico")
      .query({ stato: "accolta" });
    expect(res.status).toBe(200);
    const ids = res.body.map((r: { id: number }) => r.id);
    expect(ids).toContain(accolta.id);
    expect(ids).not.toContain(attesa.id);
  });

  it("filters by tipo", async () => {
    const semplice = await insertRequest({ status: "published", tipo: "semplice" });
    const documentale = await insertRequest({ status: "published", tipo: "documentale" });

    const res = await request(app)
      .get("/api/accesso-civico")
      .query({ tipo: "semplice" });
    expect(res.status).toBe(200);
    const ids = res.body.map((r: { id: number }) => r.id);
    expect(ids).toContain(semplice.id);
    expect(ids).not.toContain(documentale.id);
  });
});

// ---------------------------------------------------------------------------
// GET /api/accesso-civico/:id (public detail)
// ---------------------------------------------------------------------------
describe("GET /api/accesso-civico/:id (public detail)", () => {
  it("returns the public detail of a published request", async () => {
    const req = await insertRequest({ status: "published" });
    const res = await request(app).get(`/api/accesso-civico/${req.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(req.id);
    expect(res.body.oggetto).toBe(req.oggetto);
  });

  it("does not expose requestText in the public detail", async () => {
    const req = await insertRequest({
      status: "published",
      requestText: "Testo integrale riservato",
    });
    const res = await request(app).get(`/api/accesso-civico/${req.id}`);
    expect(res.status).toBe(200);
    expect(res.body.requestText).toBeUndefined();
    expect(res.body.status).toBeUndefined();
  });

  it("returns 404 for a pending (non-published) request", async () => {
    const req = await insertRequest({ status: "pending" });
    const res = await request(app).get(`/api/accesso-civico/${req.id}`);
    expect(res.status).toBe(404);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app).get("/api/accesso-civico/99999999");
    expect(res.status).toBe(404);
  });

  it("returns 404 for a non-numeric id", async () => {
    const res = await request(app).get("/api/accesso-civico/non-numerico");
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// GET /api/accesso-civico/admin (editorial list)
// ---------------------------------------------------------------------------
describe("GET /api/accesso-civico/admin (editorial list)", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/api/accesso-civico/admin");
    expect(res.status).toBe(401);
  });

  it("rejects a wrong token", async () => {
    const res = await request(app)
      .get("/api/accesso-civico/admin")
      .set("Authorization", "Bearer wrong-token");
    expect(res.status).toBe(401);
  });

  it("returns all requests (pending and published) when authorized", async () => {
    const pending = await insertRequest({ status: "pending" });
    const published = await insertRequest({ status: "published" });

    const res = await request(app).get("/api/accesso-civico/admin").set(auth);
    expect(res.status).toBe(200);
    const ids = res.body.map((r: { id: number }) => r.id);
    expect(ids).toContain(pending.id);
    expect(ids).toContain(published.id);
  });

  it("includes requestText and moderation status in admin list", async () => {
    const req = await insertRequest({
      status: "pending",
      requestText: "Testo integrale",
    });
    const res = await request(app).get("/api/accesso-civico/admin").set(auth);
    expect(res.status).toBe(200);
    const found = res.body.find((r: { id: number }) => r.id === req.id);
    expect(found).toBeTruthy();
    expect(found.requestText).toBe("Testo integrale");
    expect(found.status).toBe("pending");
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/accesso-civico/:id (editorial update)
// ---------------------------------------------------------------------------
describe("PATCH /api/accesso-civico/:id (editorial update)", () => {
  it("requires authentication", async () => {
    const req = await insertRequest();
    const res = await request(app)
      .patch(`/api/accesso-civico/${req.id}`)
      .send({ stato: "accolta" });
    expect(res.status).toBe(401);
  });

  it("updates stato and esitoNote", async () => {
    const req = await insertRequest();
    const res = await request(app)
      .patch(`/api/accesso-civico/${req.id}`)
      .set(auth)
      .send({ stato: "accolta", esitoNote: "Documenti forniti in allegato." });
    expect(res.status).toBe(200);
    expect(res.body.stato).toBe("accolta");
    expect(res.body.esitoNote).toBe("Documenti forniti in allegato.");
  });

  it("updates the response document fields", async () => {
    const req = await insertRequest();
    const res = await request(app)
      .patch(`/api/accesso-civico/${req.id}`)
      .set(auth)
      .send({
        responseUrl: "https://example.org/risposta.pdf",
        responseLabel: "Risposta del Comune",
        responseDate: "2025-04-15",
      });
    expect(res.status).toBe(200);
    expect(res.body.responseUrl).toBe("https://example.org/risposta.pdf");
    expect(res.body.responseLabel).toBe("Risposta del Comune");
    expect(res.body.responseDate).not.toBeNull();
  });

  it("returns 400 when oggetto is explicitly set to empty string", async () => {
    const req = await insertRequest();
    const res = await request(app)
      .patch(`/api/accesso-civico/${req.id}`)
      .set(auth)
      .send({ oggetto: "" });
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app)
      .patch("/api/accesso-civico/99999999")
      .set(auth)
      .send({ stato: "accolta" });
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// POST /api/accesso-civico/:id/pubblica (publish)
// ---------------------------------------------------------------------------
describe("POST /api/accesso-civico/:id/pubblica (publish)", () => {
  it("requires authentication", async () => {
    const req = await insertRequest({ status: "pending" });
    const res = await request(app).post(
      `/api/accesso-civico/${req.id}/pubblica`,
    );
    expect(res.status).toBe(401);
  });

  it("promotes a pending request to published", async () => {
    const req = await insertRequest({ status: "pending" });
    const res = await request(app)
      .post(`/api/accesso-civico/${req.id}/pubblica`)
      .set(auth);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("published");
  });

  it("is idempotent: publishing an already-published request succeeds", async () => {
    const req = await insertRequest({ status: "published" });
    const res = await request(app)
      .post(`/api/accesso-civico/${req.id}/pubblica`)
      .set(auth);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("published");
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app)
      .post("/api/accesso-civico/99999999/pubblica")
      .set(auth);
    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/accesso-civico/:id
// ---------------------------------------------------------------------------
describe("DELETE /api/accesso-civico/:id", () => {
  it("requires authentication", async () => {
    const req = await insertRequest();
    const res = await request(app).delete(`/api/accesso-civico/${req.id}`);
    expect(res.status).toBe(401);
  });

  it("deletes an existing request", async () => {
    const req = await insertRequest();
    const res = await request(app)
      .delete(`/api/accesso-civico/${req.id}`)
      .set(auth);
    expect(res.status).toBe(204);
    // Already deleted — remove from cleanup list.
    const idx = createdIds.indexOf(req.id);
    if (idx !== -1) createdIds.splice(idx, 1);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request(app)
      .delete("/api/accesso-civico/99999999")
      .set(auth);
    expect(res.status).toBe(404);
  });
});
