import { describe, it, expect, afterAll, afterEach } from "vitest";
import { inArray } from "drizzle-orm";

import request from "supertest";
import app from "../app";
import { db, pool, publicationsTable } from "@workspace/db";

const createdIds: number[] = [];

async function createPublication(
  overrides: Partial<typeof publicationsTable.$inferInsert> = {},
): Promise<number> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [row] = await db
    .insert(publicationsTable)
    .values({
      progressivo: `test/${unique}`,
      tipologia: "DETERMINAZIONE DIRIGENZIALE",
      category: "albo",
      oggetto: `Atto di test ${unique}`,
      pubStart: new Date("2026-01-15T00:00:00.000Z"),
      ...overrides,
    })
    .returning();
  createdIds.push(row.id);
  return row.id;
}

afterEach(async () => {
  const ids = createdIds.splice(0);
  if (ids.length) {
    await db.delete(publicationsTable).where(inArray(publicationsTable.id, ids));
  }
});

afterAll(async () => {
  await pool.end();
});

describe("Public API v1", () => {
  it("returns a paginated envelope for documents", async () => {
    await createPublication();
    const res = await request(app).get("/api/public/v1/documents?pageSize=1");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toMatchObject({ page: 1, pageSize: 1 });
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
    expect(res.body.data.length).toBeLessThanOrEqual(1);
  });

  it("caps pageSize at 100", async () => {
    const res = await request(app).get("/api/public/v1/documents?pageSize=5000");
    expect(res.status).toBe(200);
    expect(res.body.pagination.pageSize).toBe(100);
  });

  it("filters documents by hasMarkdown and exposes the markdown endpoint", async () => {
    const id = await createPublication({
      markdownText: "# Titolo\n\nCorpo del documento.",
      markdownSource: "allegato.pdf",
      markdownExtractedAt: new Date(),
    });

    const list = await request(app).get(
      "/api/public/v1/documents?hasMarkdown=true&pageSize=100",
    );
    expect(list.status).toBe(200);
    const found = (list.body.data as { id: number; hasMarkdown: boolean }[]).find(
      (d) => d.id === id,
    );
    expect(found).toBeDefined();
    expect(found!.hasMarkdown).toBe(true);

    const md = await request(app).get(`/api/public/v1/documents/${id}/markdown`);
    expect(md.status).toBe(200);
    expect(md.body.markdown).toContain("# Titolo");

    const raw = await request(app).get(
      `/api/public/v1/documents/${id}/markdown?format=md`,
    );
    expect(raw.status).toBe(200);
    expect(raw.headers["content-type"]).toContain("text/markdown");
    expect(raw.text).toContain("# Titolo");
  });

  it("returns 404 for a missing document and missing markdown", async () => {
    const missing = await request(app).get("/api/public/v1/documents/999999999");
    expect(missing.status).toBe(404);

    const id = await createPublication();
    const noMd = await request(app).get(
      `/api/public/v1/documents/${id}/markdown`,
    );
    expect(noMd.status).toBe(404);
  });

  it("serves the index and the OpenAPI document", async () => {
    const index = await request(app).get("/api/public/v1/");
    expect(index.status).toBe(200);
    expect(index.body.resources).toHaveProperty("documents");
    expect(index.body.mcp).toHaveProperty("endpoint");

    const spec = await request(app).get("/api/public/v1/openapi.json");
    expect(spec.status).toBe(200);
    expect(spec.body.openapi).toBe("3.1.0");
    expect(spec.body.paths).toHaveProperty("/documents");
    expect(spec.body.paths).toHaveProperty("/contracts");
  });

  it("returns paginated envelopes for the other collections", async () => {
    for (const path of ["contracts", "themes", "pnrr"]) {
      const res = await request(app).get(`/api/public/v1/${path}?pageSize=2`);
      expect(res.status, path).toBe(200);
      expect(res.body.pagination, path).toMatchObject({ page: 1, pageSize: 2 });
      expect(Array.isArray(res.body.data), path).toBe(true);
    }

    const perf = await request(app).get("/api/public/v1/performance");
    expect(perf.status).toBe(200);
    expect(Array.isArray(perf.body)).toBe(true);
  });
});
