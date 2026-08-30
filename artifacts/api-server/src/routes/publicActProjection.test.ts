import { afterAll, afterEach, describe, expect, it } from "vitest";
import { inArray } from "drizzle-orm";
import request from "supertest";

import app from "../app";
import { db, pool, publicationsTable, seduteTable } from "@workspace/db";
import { attestPublicationAtIngestion } from "../lib/publicActProjection";
import { publicActPublicId } from "@workspace/publication-standardisation/public-act";

const createdIds: number[] = [];
const createdSedutaIds: number[] = [];
const MCP_ACCEPT = "application/json, text/event-stream";

function rpc(method: string, params: unknown, id: number) {
  return request(app)
    .post("/api/mcp")
    .set("Content-Type", "application/json")
    .set("Accept", MCP_ACCEPT)
    .send({ jsonrpc: "2.0", id, method, params });
}

function toolResult(body: { result: { content: { text: string }[] } }) {
  return JSON.parse(body.result.content[0].text) as unknown;
}

function doesNotContainCanary(value: unknown, canary: string) {
  expect(JSON.stringify(value).toLocaleLowerCase("it-IT")).not.toContain(
    canary.toLocaleLowerCase("it-IT"),
  );
}

afterEach(async () => {
  const sedutaIds = createdSedutaIds.splice(0);
  if (sedutaIds.length) {
    await db.delete(seduteTable).where(inArray(seduteTable.id, sedutaIds));
  }
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

describe("shared public-safe act projection", () => {
  it("never serialises a limited canary through REST, MCP or RSS", async () => {
    const canary = `CANARY-NON-PUBBLICO-${Date.now()}`;
    const progressivo = `canary/${Date.now()}`;
    const publicId = publicActPublicId(progressivo);
    expect(publicId).not.toBeNull();
    const pubStart = new Date("2099-01-15T00:00:00.000Z");
    const publicSafetyDecision = attestPublicationAtIngestion({
      source: {
        progressivo,
        tipologia: "DELIBERAZIONE DI GIUNTA",
        category: "delibera",
        subcategory: "giunta",
        provenienza: `Ufficio ${canary}`,
        oggetto: `CONTENZIOSO ${canary}`,
        dataAtto: null,
        pubStart,
        pubEnd: null,
        numRegSet: null,
        numRegGen: null,
        cups: [],
        pnrrMission: null,
        isPnrr: false,
      },
      evaluatedAt: new Date("2099-01-15T00:01:00.000Z"),
      previous: null,
    });
    const [row] = await db
      .insert(publicationsTable)
      .values({
        progressivo,
        tipologia: "DELIBERAZIONE DI GIUNTA",
        category: "delibera",
        subcategory: "giunta",
        provenienza: `Ufficio ${canary}`,
        oggetto: `CONTENZIOSO ${canary}`,
        pubStart,
        attachments: [
          {
            name: `${canary}.pdf`,
            tipo: "P",
            officialUrl: `https://example.invalid/${canary}.pdf`,
            storagePath: `/api/storage/${canary}.pdf`,
            contentType: "application/pdf",
            size: 123,
          },
        ],
        markdownText: `# ${canary}\n\nTesto non attestato.`,
        markdownSource: `${canary}.pdf`,
        markdownExtractedAt: new Date("2099-01-15T01:00:00.000Z"),
        brief: `Sintesi ${canary}`,
        publicSafetyDecision,
      })
      .returning();
    createdIds.push(row.id);
    const [seduta] = await db
      .insert(seduteTable)
      .values({
        publicationId: row.id,
        type: "consiglio",
        agenda: `Ordine del giorno ${canary}`,
      })
      .returning({ id: seduteTable.id });
    createdSedutaIds.push(seduta.id);

    const [
      publications,
      delibere,
      votes,
      document,
      markdown,
      attachment,
      feed,
      sedute,
    ] = await Promise.all([
      request(app).get("/api/publications"),
      request(app).get("/api/delibere"),
      request(app).get(`/api/delibere/${row.id}/votes`),
      request(app).get(`/api/public/v1/documents/${row.id}`),
      request(app).get(`/api/public/v1/documents/${row.id}/markdown`),
      request(app).get(
        `/api/storage/public-objects/albo/${encodeURIComponent(canary)}.pdf`,
      ),
      request(app).get("/api/feeds/albo.xml"),
      request(app).get("/api/sedute"),
    ]);

    expect(publications.status).toBe(200);
    expect(delibere.status).toBe(200);
    expect(votes.status).toBe(200);
    expect(document.status).toBe(200);
    expect(markdown.status).toBe(404);
    expect(attachment.status).toBe(404);
    expect(feed.status).toBe(200);
    expect(sedute.status).toBe(200);
    expect(document.body.publicId).toBe(publicId);
    expect(votes.body.delibera.publicId).toBe(publicId);
    expect(feed.text).toContain(
      `<guid isPermaLink="false">albo:${progressivo}</guid>`,
    );
    expect(feed.text).toContain(`<lt:publicId>${publicId}</lt:publicId>`);
    const listedPublication = publications.body.find(
      (item: { id: number }) => item.id === row.id,
    );
    const listedDelibera = delibere.body.find(
      (item: { id: number }) => item.id === row.id,
    );
    expect(listedPublication?.publicId).toBe(publicId);
    expect(listedDelibera?.publicId).toBe(publicId);
    expect(listedPublication?.presentation).toEqual(document.body.presentation);
    expect(listedDelibera?.presentation).toEqual(document.body.presentation);
    expect(feed.text).toContain(
      `<title>${document.body.presentation.display_title}</title>`,
    );
    for (const payload of [
      publications.body,
      delibere.body,
      votes.body,
      document.body,
      markdown.body,
      attachment.body,
      feed.text,
      sedute.body,
    ]) {
      doesNotContainCanary(payload, canary);
    }
    expect(
      sedute.body.find((item: { id: number }) => item.id === seduta.id)?.agenda,
    ).toBeNull();
    expect(document.body).toMatchObject({
      oggetto:
        "Oggetto minimizzato per prudenza privacy; consultare la fonte ufficiale.",
      attachments: [],
      hasMarkdown: false,
      publicSafety: {
        public_visibility: "publishable_with_minimisation",
        attachments_attested: false,
        markdown_attested: false,
        attestation_status: "valid",
        attestation_reason: null,
      },
    });

    const restSearch = await request(app).get(
      `/api/public/v1/documents?q=${encodeURIComponent(canary)}&pageSize=100`,
    );
    expect(restSearch.status).toBe(200);
    expect(restSearch.body.data).toEqual([]);
    doesNotContainCanary(restSearch.body, canary);

    const mcpDocument = await rpc(
      "tools/call",
      { name: "get_document", arguments: { id: row.id } },
      1,
    );
    expect(mcpDocument.status).toBe(200);
    const mcpDocumentPayload = toolResult(mcpDocument.body);
    expect(mcpDocumentPayload).toMatchObject({ publicId });
    expect(mcpDocumentPayload).toMatchObject({
      presentation: document.body.presentation,
    });
    doesNotContainCanary(mcpDocumentPayload, canary);

    const mcpSearch = await rpc(
      "tools/call",
      {
        name: "search_documents",
        arguments: { q: canary, pageSize: 100 },
      },
      2,
    );
    expect(mcpSearch.status).toBe(200);
    const mcpSearchPayload = toolResult(mcpSearch.body) as {
      data: unknown[];
    };
    expect(mcpSearchPayload.data).toEqual([]);
    doesNotContainCanary(mcpSearchPayload, canary);

    const mcpMarkdown = await rpc(
      "tools/call",
      { name: "get_document_markdown", arguments: { id: row.id } },
      3,
    );
    expect(mcpMarkdown.status).toBe(200);
    expect(mcpMarkdown.body.result.isError).toBe(true);
    doesNotContainCanary(mcpMarkdown.body, canary);
  });
});
