import { describe, it, expect, afterAll, afterEach } from "vitest";
import { inArray } from "drizzle-orm";

import request from "supertest";
import app from "../app";
import { db, pool, publicationsTable } from "@workspace/db";

const createdIds: number[] = [];
const ACCEPT = "application/json, text/event-stream";

async function createPublication(
  overrides: Partial<typeof publicationsTable.$inferInsert> = {},
): Promise<number> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [row] = await db
    .insert(publicationsTable)
    .values({
      progressivo: `mcp/${unique}`,
      tipologia: "DELIBERAZIONE",
      category: "delibera",
      oggetto: `Atto MCP ${unique}`,
      pubStart: new Date("2026-02-01T00:00:00.000Z"),
      ...overrides,
    })
    .returning();
  createdIds.push(row.id);
  return row.id;
}

function rpc(method: string, params: unknown, id = 1) {
  return request(app)
    .post("/api/mcp")
    .set("Content-Type", "application/json")
    .set("Accept", ACCEPT)
    .send({ jsonrpc: "2.0", id, method, params });
}

function toolResult(body: { result: { content: { text: string }[] } }) {
  return JSON.parse(body.result.content[0].text);
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

describe("MCP server", () => {
  it("initializes and advertises tools capability", async () => {
    const res = await rpc("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "vitest", version: "1.0" },
    });
    expect(res.status).toBe(200);
    expect(res.body.result.serverInfo.name).toBe("lamezia-trasparente-public");
    expect(res.body.result.capabilities).toHaveProperty("tools");
  });

  it("lists the read-only tools", async () => {
    const res = await rpc("tools/list", {}, 2);
    expect(res.status).toBe(200);
    const names = (res.body.result.tools as { name: string }[]).map(
      (t) => t.name,
    );
    expect(names).toEqual(
      expect.arrayContaining([
        "search_documents",
        "get_document",
        "get_document_markdown",
        "search_contracts",
        "get_contract",
        "list_themes",
        "get_theme",
        "list_performance",
        "list_pnrr",
      ]),
    );
  });

  it("calls search_documents and get_document_markdown", async () => {
    const id = await createPublication({
      markdownText: "# Atto\n\nContenuto.",
      markdownSource: "allegato.pdf",
      markdownExtractedAt: new Date(),
    });

    const search = await rpc(
      "tools/call",
      { name: "search_documents", arguments: { hasMarkdown: true, pageSize: 100 } },
      3,
    );
    expect(search.status).toBe(200);
    const page = toolResult(search.body);
    expect(page.pagination.total).toBeGreaterThanOrEqual(1);

    const md = await rpc(
      "tools/call",
      { name: "get_document_markdown", arguments: { id } },
      4,
    );
    expect(md.status).toBe(200);
    expect(toolResult(md.body).markdown).toContain("# Atto");
  });

  it("returns an error result for a missing entity", async () => {
    const res = await rpc(
      "tools/call",
      { name: "get_contract", arguments: { id: 999999999 } },
      5,
    );
    expect(res.status).toBe(200);
    expect(res.body.result.isError).toBe(true);
  });

  it("rejects GET with 405", async () => {
    const res = await request(app).get("/api/mcp");
    expect(res.status).toBe(405);
  });
});
