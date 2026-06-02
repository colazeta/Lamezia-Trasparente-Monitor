import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";
import { eq } from "drizzle-orm";
import request from "supertest";
import app from "../app";
import {
  db,
  pool,
  legalityAreasTable,
  legalityRequirementsTable,
  legalityOverviewTable,
} from "@workspace/db";

const INGEST_TOKEN = "test-ingest-token";
const auth = { Authorization: `Bearer ${INGEST_TOKEN}` };

const createdAreaIds: number[] = [];

function uniqueSlug(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

beforeAll(() => {
  process.env.INGEST_API_TOKEN = INGEST_TOKEN;
});

afterAll(async () => {
  await pool.end();
});

beforeEach(() => {
  createdAreaIds.length = 0;
});

afterEach(async () => {
  // Deleting an area cascades to its requirements, so this is enough to clean up.
  for (const id of createdAreaIds) {
    await db.delete(legalityAreasTable).where(eq(legalityAreasTable.id, id));
  }
});

async function createArea(body: Record<string, unknown>) {
  const res = await request(app)
    .post("/api/legality/areas")
    .set(auth)
    .send(body);
  if (res.status === 201) createdAreaIds.push(res.body.id);
  return res;
}

describe("legality admin auth", () => {
  it("rejects updating the overview without a token", async () => {
    const res = await request(app)
      .patch("/api/legality/overview")
      .send({ overallJudgment: "x" });
    expect(res.status).toBe(401);
  });

  it("rejects creating an area without a token", async () => {
    const res = await request(app)
      .post("/api/legality/areas")
      .send({ slug: uniqueSlug("a"), title: "A" });
    expect(res.status).toBe(401);
  });

  it("rejects deleting an area without a token", async () => {
    const res = await request(app).delete("/api/legality/areas/1");
    expect(res.status).toBe(401);
  });

  it("rejects creating a requirement without a token", async () => {
    const res = await request(app)
      .post("/api/legality/areas/1/requirements")
      .send({ title: "Req" });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/legality (public)", () => {
  it("returns the overview plus areas with nested requirements", async () => {
    await request(app)
      .patch("/api/legality/overview")
      .set(auth)
      .send({ overallJudgment: "Giudizio complessivo di prova" });

    const area = await createArea({
      slug: uniqueSlug("trasparenza"),
      title: "Trasparenza",
      description: "Area di prova",
      finalJudgment: "Sufficiente",
      position: 1,
    });
    expect(area.status).toBe(201);

    const req = await request(app)
      .post(`/api/legality/areas/${area.body.id}/requirements`)
      .set(auth)
      .send({
        title: "Albo pretorio",
        status: "present",
        comment: "Pubblicato",
        linkedActs: [{ label: "Albo", url: "/albo" }],
      });
    expect(req.status).toBe(201);

    const res = await request(app).get("/api/legality");
    expect(res.status).toBe(200);
    expect(res.body.overallJudgment).toBe("Giudizio complessivo di prova");
    expect(res.body.updatedAt).not.toBeNull();
    expect(Array.isArray(res.body.areas)).toBe(true);

    const mine = res.body.areas.find(
      (a: { id: number }) => a.id === area.body.id,
    );
    expect(mine).toBeDefined();
    expect(mine.title).toBe("Trasparenza");
    expect(mine.finalJudgment).toBe("Sufficiente");
    expect(Array.isArray(mine.requirements)).toBe(true);
    expect(mine.requirements).toHaveLength(1);
    expect(mine.requirements[0].title).toBe("Albo pretorio");
    expect(mine.requirements[0].status).toBe("present");
    expect(mine.requirements[0].linkedActs).toEqual([
      { label: "Albo", url: "/albo" },
    ]);
  });
});

describe("POST /api/legality/areas", () => {
  it("creates an area with defaults for optional fields", async () => {
    const slug = uniqueSlug("partecipazione");
    const res = await createArea({ slug, title: "Partecipazione" });
    expect(res.status).toBe(201);
    expect(res.body.slug).toBe(slug);
    expect(res.body.title).toBe("Partecipazione");
    expect(res.body.description).toBe("");
    expect(res.body.finalJudgment).toBe("");
    expect(res.body.position).toBe(0);
  });

  it("returns 409 for a duplicate slug", async () => {
    const slug = uniqueSlug("antiriciclaggio");
    const first = await createArea({ slug, title: "Prima" });
    expect(first.status).toBe(201);
    const second = await createArea({ slug, title: "Seconda" });
    expect(second.status).toBe(409);
  });

  it("rejects invalid input with 400", async () => {
    const res = await request(app)
      .post("/api/legality/areas")
      .set(auth)
      .send({ title: "Senza slug" });
    expect(res.status).toBe(400);
  });
});

describe("requirement create / update / delete", () => {
  it("creates, updates and deletes a requirement", async () => {
    const area = await createArea({
      slug: uniqueSlug("criminalita"),
      title: "Contrasto criminalità",
    });
    expect(area.status).toBe(201);

    const created = await request(app)
      .post(`/api/legality/areas/${area.body.id}/requirements`)
      .set(auth)
      .send({ title: "Requisito iniziale" });
    expect(created.status).toBe(201);
    expect(created.body.status).toBe("absent");
    expect(created.body.linkedActs).toEqual([]);

    const updated = await request(app)
      .patch(`/api/legality/requirements/${created.body.id}`)
      .set(auth)
      .send({ title: "Requisito aggiornato", status: "partial" });
    expect(updated.status).toBe(200);
    expect(updated.body.title).toBe("Requisito aggiornato");
    expect(updated.body.status).toBe("partial");

    const deleted = await request(app)
      .delete(`/api/legality/requirements/${created.body.id}`)
      .set(auth);
    expect(deleted.status).toBe(204);

    const rows = await db
      .select()
      .from(legalityRequirementsTable)
      .where(eq(legalityRequirementsTable.id, created.body.id));
    expect(rows).toHaveLength(0);
  });

  it("returns 404 when creating a requirement in an unknown area", async () => {
    const res = await request(app)
      .post("/api/legality/areas/99999999/requirements")
      .set(auth)
      .send({ title: "Orfano" });
    expect(res.status).toBe(404);
  });

  it("returns 404 when updating an unknown requirement", async () => {
    const res = await request(app)
      .patch("/api/legality/requirements/99999999")
      .set(auth)
      .send({ title: "x" });
    expect(res.status).toBe(404);
  });

  it("returns 404 when deleting an unknown requirement", async () => {
    const res = await request(app)
      .delete("/api/legality/requirements/99999999")
      .set(auth);
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/legality/areas/:id (FK cascade)", () => {
  it("removes the area and its requirements", async () => {
    const area = await createArea({
      slug: uniqueSlug("cascade"),
      title: "Cascade",
    });
    expect(area.status).toBe(201);

    const req = await request(app)
      .post(`/api/legality/areas/${area.body.id}/requirements`)
      .set(auth)
      .send({ title: "Requisito figlio" });
    expect(req.status).toBe(201);

    const res = await request(app)
      .delete(`/api/legality/areas/${area.body.id}`)
      .set(auth);
    expect(res.status).toBe(204);

    const areaRows = await db
      .select()
      .from(legalityAreasTable)
      .where(eq(legalityAreasTable.id, area.body.id));
    expect(areaRows).toHaveLength(0);

    const reqRows = await db
      .select()
      .from(legalityRequirementsTable)
      .where(eq(legalityRequirementsTable.id, req.body.id));
    expect(reqRows).toHaveLength(0);
  });

  it("returns 404 for an unknown area", async () => {
    const res = await request(app)
      .delete("/api/legality/areas/99999999")
      .set(auth);
    expect(res.status).toBe(404);
  });
});

describe("linkedActs normalization", () => {
  it("drops entries with a blank label or url and trims the rest on create", async () => {
    const area = await createArea({
      slug: uniqueSlug("normalize"),
      title: "Normalize",
    });
    expect(area.status).toBe(201);

    const res = await request(app)
      .post(`/api/legality/areas/${area.body.id}/requirements`)
      .set(auth)
      .send({
        title: "Con atti collegati",
        linkedActs: [
          { label: "  Valido  ", url: "  /albo  " },
          { label: "", url: "/orfano" },
          { label: "Senza url", url: "   " },
          { label: "   ", url: "   " },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.linkedActs).toEqual([{ label: "Valido", url: "/albo" }]);
  });

  it("normalizes linkedActs on update too", async () => {
    const area = await createArea({
      slug: uniqueSlug("normalize-update"),
      title: "Normalize update",
    });
    const created = await request(app)
      .post(`/api/legality/areas/${area.body.id}/requirements`)
      .set(auth)
      .send({ title: "Req" });
    expect(created.status).toBe(201);

    const updated = await request(app)
      .patch(`/api/legality/requirements/${created.body.id}`)
      .set(auth)
      .send({
        linkedActs: [
          { label: "Tenuto", url: "https://example.org" },
          { label: "Scartato", url: "" },
        ],
      });
    expect(updated.status).toBe(200);
    expect(updated.body.linkedActs).toEqual([
      { label: "Tenuto", url: "https://example.org" },
    ]);
  });
});
