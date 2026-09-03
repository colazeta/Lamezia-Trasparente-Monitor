import { describe, it, expect, afterAll, afterEach } from "vitest";
import { inArray } from "drizzle-orm";

import request from "supertest";
import app from "../app";
import { db, pool, publicationsTable } from "@workspace/db";
import { publicActPublicId } from "@workspace/publication-standardisation/public-act";
import { attestPublicationAtIngestion } from "../lib/publicActProjection";
import { SEMANTIC_PROFILE_VERSION } from "../lib/semanticProfile";

const createdIds: number[] = [];
const ACCEPT = "application/json, text/event-stream";
const MODERN_PROTOCOL = "2026-07-28";
const EXPECTED_TOOLS = [
  "get_contract",
  "get_document",
  "get_document_markdown",
  "get_theme",
  "list_performance",
  "list_pnrr",
  "list_themes",
  "search_contracts",
  "search_documents",
];

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

function modernRpc(method: string, id: string) {
  return request(app)
    .post("/api/mcp")
    .set("Content-Type", "application/json")
    .set("Accept", ACCEPT)
    .set("MCP-Protocol-Version", MODERN_PROTOCOL)
    .set("Mcp-Method", method)
    .send({
      jsonrpc: "2.0",
      id,
      method,
      params: {
        _meta: {
          "io.modelcontextprotocol/protocolVersion": MODERN_PROTOCOL,
          "io.modelcontextprotocol/clientInfo": {
            name: "lamezia-mcp-test",
            version: "1.0.0",
          },
          "io.modelcontextprotocol/clientCapabilities": {},
        },
      },
    });
}

function toolResult(body: { result: { content: { text: string }[] } }) {
  return JSON.parse(body.result.content[0].text);
}

afterEach(async () => {
  const ids = createdIds.splice(0);
  if (ids.length) {
    await db
      .delete(publicationsTable)
      .where(inArray(publicationsTable.id, ids));
  }
});

afterAll(async () => {
  await pool.end();
});

describe("MCP server", () => {
  it("discovers the modern protocol and publishes civic safety instructions", async () => {
    const res = await modernRpc("server/discover", "discover-1");

    expect(res.status).toBe(200);
    expect(res.body.result.supportedVersions).toContain(MODERN_PROTOCOL);
    expect(res.body.result.capabilities).toHaveProperty("tools");
    expect(res.body.result.instructions).toMatch(/read-only civic transparency data/i);
    expect(res.body.result.instructions).toMatch(
      /do not infer illegality or wrongdoing/i,
    );
    expect(res.body.result.instructions).toMatch(/semantic profile/i);
    expect(
      res.body.result._meta?.["io.modelcontextprotocol/serverInfo"]?.name,
    ).toBe("lamezia-trasparente-public");
  });

  it("publishes a stable, entirely read-only modern tool contract", async () => {
    const res = await modernRpc("tools/list", "modern-tools-1");

    expect(res.status).toBe(200);
    const tools = res.body.result.tools as Array<{
      name: string;
      outputSchema?: unknown;
      annotations?: {
        readOnlyHint?: boolean;
        destructiveHint?: boolean;
        idempotentHint?: boolean;
        openWorldHint?: boolean;
      };
    }>;

    expect(tools.map((tool) => tool.name).sort()).toEqual(EXPECTED_TOOLS);
    for (const tool of tools) {
      expect(tool.outputSchema).toBeDefined();
      expect(tool.annotations).toMatchObject({
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      });
    }
  });

  it("initializes legacy clients and advertises tools capability", async () => {
    const res = await rpc("initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "vitest", version: "1.0" },
    });
    expect(res.status).toBe(200);
    expect(res.body.result.serverInfo.name).toBe("lamezia-trasparente-public");
    expect(res.body.result.capabilities).toHaveProperty("tools");
  });

  it("lists the read-only tools for legacy clients", async () => {
    const res = await rpc("tools/list", {}, 2);
    expect(res.status).toBe(200);
    const names = (res.body.result.tools as { name: string }[]).map(
      (t) => t.name,
    );
    expect(names).toEqual(expect.arrayContaining(EXPECTED_TOOLS));
  });

  it("shares document search and keeps unattested Markdown closed", async () => {
    const id = await createPublication({
      markdownText: "# Atto\n\nContenuto.",
      markdownSource: "allegato.pdf",
      markdownExtractedAt: new Date(),
    });

    const search = await rpc(
      "tools/call",
      {
        name: "search_documents",
        arguments: { hasMarkdown: true, pageSize: 100 },
      },
      3,
    );
    expect(search.status).toBe(200);
    const page = toolResult(search.body);
    expect(
      page.data.find((item: { id: number }) => item.id === id),
    ).toBeUndefined();

    const md = await rpc(
      "tools/call",
      { name: "get_document_markdown", arguments: { id } },
      4,
    );
    expect(md.status).toBe(200);
    expect(md.body.result.isError).toBe(true);
    expect(JSON.stringify(md.body)).not.toContain("# Atto");
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

  it("dereferences an act by stable publicId and returns semantic metadata", async () => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const progressivo = `mcp-lookup/${unique}`;
    const oggetto = `Atto MCP lookup ${unique}`;
    const pubStart = new Date("2026-02-01T00:00:00.000Z");
    const publicSafetyDecision = attestPublicationAtIngestion({
      source: {
        progressivo,
        tipologia: "DELIBERAZIONE",
        category: "delibera",
        subcategory: null,
        provenienza: null,
        oggetto,
        dataAtto: null,
        pubStart,
        pubEnd: null,
        numRegSet: null,
        numRegGen: null,
        cups: [],
        pnrrMission: null,
        isPnrr: false,
      },
      evaluatedAt: new Date("2026-08-30T09:00:00.000Z"),
      previous: null,
    });
    const id = await createPublication({
      progressivo,
      oggetto,
      pubStart,
      publicSafetyDecision,
    });
    const publicId = publicActPublicId(progressivo)!;

    const res = await rpc(
      "tools/call",
      { name: "get_document", arguments: { id: publicId } },
      6,
    );
    expect(res.status).toBe(200);
    expect(toolResult(res.body)).toMatchObject({ id, publicId, progressivo });
    expect(res.body.result.structuredContent).toMatchObject({
      resource: "document",
      semantic: {
        profile:
          "https://lamezia-trasparente.pages.dev/semantic/profile.jsonld",
        context:
          "https://lamezia-trasparente.pages.dev/semantic/context.jsonld",
        ontology:
          "https://lamezia-trasparente.pages.dev/semantic/ontology.ttl",
        profileVersion: SEMANTIC_PROFILE_VERSION,
        entityType:
          "https://lamezia-trasparente.pages.dev/ontology#AdministrativeAct",
      },
      verification: {
        publicOnly: true,
        sourceCheckRequired: true,
      },
    });
    expect(res.body.result.structuredContent.semantic.mappings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          relation: "subClassOf",
          term: "http://www.w3.org/ns/prov#Entity",
        }),
        expect.objectContaining({
          relation: "reference",
          term: "https://w3id.org/italia/onto/Transparency/",
        }),
      ]),
    );
  });

  it("keeps legacy session GET unavailable in stateless mode", async () => {
    const res = await request(app).get("/api/mcp");
    expect(res.status).toBe(405);
  });
});
