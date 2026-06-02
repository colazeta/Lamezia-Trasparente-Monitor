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
  fundamentalActsTable,
  publicationsTable,
} from "@workspace/db";

const INGEST_TOKEN = "test-ingest-token";
const auth = { Authorization: `Bearer ${INGEST_TOKEN}` };

const createdActIds: number[] = [];
const createdPubIds: number[] = [];

function uniqueSlug(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function insertPublication(values: {
  oggetto: string;
  tipologia?: string;
  pubStart?: Date | null;
  attachments?: unknown[];
}): Promise<number> {
  const [row] = await db
    .insert(publicationsTable)
    .values({
      progressivo: uniqueSlug("PROG"),
      tipologia: values.tipologia ?? "Determinazione",
      category: "Test",
      oggetto: values.oggetto,
      pubStart: values.pubStart ?? new Date(),
      attachments: (values.attachments ?? []) as never,
    })
    .returning({ id: publicationsTable.id });
  createdPubIds.push(row.id);
  return row.id;
}

beforeAll(() => {
  process.env.INGEST_API_TOKEN = INGEST_TOKEN;
});

afterAll(async () => {
  await pool.end();
});

beforeEach(() => {
  createdActIds.length = 0;
  createdPubIds.length = 0;
});

afterEach(async () => {
  for (const id of createdActIds) {
    await db.delete(fundamentalActsTable).where(eq(fundamentalActsTable.id, id));
  }
  for (const id of createdPubIds) {
    await db.delete(publicationsTable).where(eq(publicationsTable.id, id));
  }
});

async function createAct(body: Record<string, unknown>) {
  const res = await request(app)
    .post("/api/atti-fondamentali")
    .set(auth)
    .send(body);
  if (res.status === 201) createdActIds.push(res.body.id);
  return res;
}

describe("fundamental acts admin auth", () => {
  it("rejects unauthenticated admin list", async () => {
    const res = await request(app).get("/api/atti-fondamentali/admin");
    expect(res.status).toBe(401);
  });

  it("rejects unauthenticated create", async () => {
    const res = await request(app)
      .post("/api/atti-fondamentali")
      .send({ slug: uniqueSlug("x"), label: "X" });
    expect(res.status).toBe(401);
  });
});

describe("POST /api/atti-fondamentali", () => {
  it("creates a type with no source by default (hidden from public)", async () => {
    const slug = uniqueSlug("piao");
    const res = await createAct({ slug, label: "PIAO test" });
    expect(res.status).toBe(201);
    expect(res.body.slug).toBe(slug);
    expect(res.body.source).toBe("none");
    expect(res.body.attachments).toEqual([]);
  });

  it("creates a manual entry with an official link (source manual)", async () => {
    const slug = uniqueSlug("dup");
    const res = await createAct({
      slug,
      label: "DUP test",
      title: "DUP 2026",
      description: "Documento unico",
      manualOfficialUrl: "https://example.org/dup.pdf",
    });
    expect(res.status).toBe(201);
    expect(res.body.source).toBe("manual");
    expect(res.body.attachments).toHaveLength(1);
    expect(res.body.attachments[0].officialUrl).toBe(
      "https://example.org/dup.pdf",
    );
  });

  it("rejects a duplicate slug", async () => {
    const slug = uniqueSlug("dupe");
    const first = await createAct({ slug, label: "First" });
    expect(first.status).toBe(201);
    const second = await createAct({ slug, label: "Second" });
    expect(second.status).toBe(400);
  });

  it("rejects invalid input", async () => {
    const res = await request(app)
      .post("/api/atti-fondamentali")
      .set(auth)
      .send({ label: "no slug" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/atti-fondamentali (public)", () => {
  it("omits acts without a published entry and includes manual ones", async () => {
    const hiddenSlug = uniqueSlug("hidden");
    const shownSlug = uniqueSlug("shown");
    await createAct({ slug: hiddenSlug, label: "Hidden" });
    await createAct({
      slug: shownSlug,
      label: "Shown",
      title: "Shown title",
      manualOfficialUrl: "https://example.org/x.pdf",
    });

    const res = await request(app).get("/api/atti-fondamentali");
    expect(res.status).toBe(200);
    const slugs = res.body.map((a: { slug: string }) => a.slug);
    expect(slugs).toContain(shownSlug);
    expect(slugs).not.toContain(hiddenSlug);
  });
});

describe("PATCH /api/atti-fondamentali/:id", () => {
  it("switches source to manual when a file is set and back when cleared", async () => {
    const slug = uniqueSlug("statuto");
    const created = await createAct({ slug, label: "Statuto" });
    expect(created.body.source).toBe("none");

    const withFile = await request(app)
      .patch(`/api/atti-fondamentali/${created.body.id}`)
      .set(auth)
      .send({
        manualFile: {
          name: "statuto.pdf",
          storagePath: "/api/storage/objects/abc",
          contentType: "application/pdf",
          size: 1234,
        },
      });
    expect(withFile.status).toBe(200);
    expect(withFile.body.source).toBe("manual");
    expect(withFile.body.attachments).toHaveLength(1);
    expect(withFile.body.attachments[0].storagePath).toBe(
      "/api/storage/objects/abc",
    );

    const cleared = await request(app)
      .patch(`/api/atti-fondamentali/${created.body.id}`)
      .set(auth)
      .send({ manualFile: null, manualOfficialUrl: null });
    expect(cleared.status).toBe(200);
    expect(cleared.body.source).toBe("none");
    expect(cleared.body.attachments).toEqual([]);
  });

  it("returns 404 for an unknown act", async () => {
    const res = await request(app)
      .patch("/api/atti-fondamentali/99999999")
      .set(auth)
      .send({ label: "x" });
    expect(res.status).toBe(404);
  });
});

describe("POST /api/atti-fondamentali/:id/conferma-suggerimento", () => {
  it("confirms a suggested publication and exposes its attachments", async () => {
    const keyword = uniqueSlug("regolamentospeciale").replace(/-/g, " ");
    const pubId = await insertPublication({
      oggetto: `Approvazione ${keyword} comunale`,
      attachments: [
        {
          name: "reg.pdf",
          tipo: "documento",
          officialUrl: "https://albo.example.org/reg.pdf",
          storagePath: "/api/storage/objects/reg",
          contentType: "application/pdf",
          size: 999,
        },
      ],
    });

    const slug = uniqueSlug("reg");
    const created = await createAct({
      slug,
      label: "Regolamento",
      keywords: [keyword],
    });

    // Auto-match runs on create; the suggestion should point at our publication.
    const adminList = await request(app)
      .get("/api/atti-fondamentali/admin")
      .set(auth);
    const mine = adminList.body.find(
      (a: { id: number }) => a.id === created.body.id,
    );
    expect(mine.suggestedPublication).not.toBeNull();
    expect(mine.suggestedPublication.id).toBe(pubId);

    const confirm = await request(app)
      .post(`/api/atti-fondamentali/${created.body.id}/conferma-suggerimento`)
      .set(auth);
    expect(confirm.status).toBe(200);
    expect(confirm.body.source).toBe("auto");
    expect(confirm.body.linkedPublication.id).toBe(pubId);
    expect(confirm.body.attachments).toHaveLength(1);

    // Now it should be visible publicly.
    const pub = await request(app).get("/api/atti-fondamentali");
    const shown = pub.body.find((a: { slug: string }) => a.slug === slug);
    expect(shown).toBeDefined();
    expect(shown.attachments[0].officialUrl).toBe(
      "https://albo.example.org/reg.pdf",
    );
  });

  it("returns 400 when no suggestion is available", async () => {
    const slug = uniqueSlug("nosug");
    const created = await createAct({
      slug,
      label: "No suggestion",
      keywords: ["zzz-non-esiste-mai-xyz"],
    });
    const res = await request(app)
      .post(`/api/atti-fondamentali/${created.body.id}/conferma-suggerimento`)
      .set(auth);
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/atti-fondamentali/:id", () => {
  it("deletes an act", async () => {
    const slug = uniqueSlug("del");
    const created = await createAct({ slug, label: "To delete" });
    const res = await request(app)
      .delete(`/api/atti-fondamentali/${created.body.id}`)
      .set(auth);
    expect(res.status).toBe(204);

    const rows = await db
      .select()
      .from(fundamentalActsTable)
      .where(eq(fundamentalActsTable.id, created.body.id));
    expect(rows).toHaveLength(0);
  });

  it("returns 404 for an unknown act", async () => {
    const res = await request(app)
      .delete("/api/atti-fondamentali/99999999")
      .set(auth);
    expect(res.status).toBe(404);
  });
});
