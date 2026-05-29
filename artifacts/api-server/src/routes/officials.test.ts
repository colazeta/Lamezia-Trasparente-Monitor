import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { eq, inArray } from "drizzle-orm";

import request from "supertest";
import app from "../app";
import {
  db,
  pool,
  publicationsTable,
  officialsTable,
  officialActivitiesTable,
  officialRemunerationsTable,
  officialDeclarationsTable,
  officialVotesTable,
} from "@workspace/db";

const INGEST_TOKEN = "test-ingest-token";

const createdOfficialIds: number[] = [];
const createdPublicationIds: number[] = [];

async function createDelibera(): Promise<number> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [publication] = await db
    .insert(publicationsTable)
    .values({
      progressivo: `test-del/${unique}`,
      tipologia: "DELIBERAZIONE DI CONSIGLIO",
      category: "delibera",
      subcategory: "consiglio",
      oggetto: `Delibera di test ${unique}`,
    })
    .returning();
  createdPublicationIds.push(publication.id);
  return publication.id;
}

async function deleteOfficial(id: number): Promise<void> {
  await db
    .delete(officialVotesTable)
    .where(eq(officialVotesTable.officialId, id));
  await db
    .delete(officialActivitiesTable)
    .where(eq(officialActivitiesTable.officialId, id));
  await db
    .delete(officialRemunerationsTable)
    .where(eq(officialRemunerationsTable.officialId, id));
  await db
    .delete(officialDeclarationsTable)
    .where(eq(officialDeclarationsTable.officialId, id));
  await db.delete(officialsTable).where(eq(officialsTable.id, id));
}

function authedPost(path: string) {
  return request(app)
    .post(path)
    .set("Authorization", `Bearer ${INGEST_TOKEN}`);
}

beforeAll(() => {
  process.env.INGEST_API_TOKEN = INGEST_TOKEN;
});

afterAll(async () => {
  await pool.end();
});

afterEach(async () => {
  for (const id of createdOfficialIds.splice(0)) {
    await deleteOfficial(id);
  }
  if (createdPublicationIds.length) {
    await db
      .delete(officialVotesTable)
      .where(inArray(officialVotesTable.publicationId, createdPublicationIds));
    await db
      .delete(publicationsTable)
      .where(inArray(publicationsTable.id, createdPublicationIds.splice(0)));
  }
});

describe("officials write auth", () => {
  it("rejects unauthenticated create", async () => {
    const res = await request(app)
      .post("/api/officials")
      .send({ name: "Tizio Test", role: "consigliere" });
    expect(res.status).toBe(401);
  });

  it("rejects invalid body", async () => {
    const res = await authedPost("/api/officials").send({ role: "consigliere" });
    expect(res.status).toBe(400);
  });
});

describe("officials CRUD + profile", () => {
  it("creates an official with full profile and reads it back", async () => {
    const deliberaId = await createDelibera();

    const createRes = await authedPost("/api/officials").send({
      name: "Caio Test",
      role: "consigliere",
      roleTitle: "Consigliere comunale",
      group: "Gruppo Test",
      appointmentDate: "2024-06-25",
      biography: "Biografia <script>alert(1)</script> di test",
      activities: [{ title: "Attività A", date: "2025-01-01" }],
      remunerations: [{ year: 2025, amount: 1234.5, type: "Gettoni" }],
      declarations: [{ title: "Dichiarazione 2024", date: "2025-05-01" }],
      votes: [{ publicationId: deliberaId, vote: "contrario" }],
    });

    expect(createRes.status).toBe(201);
    const id = createRes.body.id as number;
    createdOfficialIds.push(id);

    expect(createRes.body.slug).toBe("caio-test");
    expect(createRes.body.biography).toBe("Biografia  di test");
    expect(createRes.body.activities).toHaveLength(1);
    expect(createRes.body.remunerations[0].amount).toBe(1234.5);
    expect(createRes.body.declarations).toHaveLength(1);
    expect(createRes.body.votes).toHaveLength(1);
    expect(createRes.body.votes[0].vote).toBe("contrario");

    const getRes = await request(app).get(`/api/officials/${id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.name).toBe("Caio Test");
    expect(getRes.body.votes[0].publicationId).toBe(deliberaId);
  });

  it("replaces profile data on update", async () => {
    const createRes = await authedPost("/api/officials").send({
      name: "Sempronio Test",
      role: "assessore",
      activities: [{ title: "Vecchia attività" }],
    });
    const id = createRes.body.id as number;
    createdOfficialIds.push(id);

    const updateRes = await authedPost(`/api/officials/${id}`).send({
      name: "Sempronio Test",
      role: "assessore",
      activities: [{ title: "Nuova attività 1" }, { title: "Nuova attività 2" }],
    });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.activities).toHaveLength(2);
    expect(updateRes.body.activities[0].title).toBe("Nuova attività 1");
  });

  it("filters by role and searches by name", async () => {
    const a = await authedPost("/api/officials").send({
      name: "Filtrabile Sindaco",
      role: "sindaco",
    });
    const b = await authedPost("/api/officials").send({
      name: "Altro Dirigente",
      role: "dirigente",
    });
    createdOfficialIds.push(a.body.id, b.body.id);

    const roleRes = await request(app).get("/api/officials?role=sindaco");
    expect(roleRes.status).toBe(200);
    expect(
      roleRes.body.some((o: { name: string }) => o.name === "Filtrabile Sindaco"),
    ).toBe(true);
    expect(
      roleRes.body.some((o: { name: string }) => o.name === "Altro Dirigente"),
    ).toBe(false);

    const qRes = await request(app).get("/api/officials?q=Filtrabile");
    expect(qRes.body).toHaveLength(1);
    expect(qRes.body[0].name).toBe("Filtrabile Sindaco");
  });

  it("returns 404 for unknown official", async () => {
    const res = await request(app).get("/api/officials/99999999");
    expect(res.status).toBe(404);
  });

  it("rejects votes referencing a non-existent delibera", async () => {
    const res = await authedPost("/api/officials").send({
      name: "Voto Invalido",
      role: "consigliere",
      votes: [{ publicationId: 99999999, vote: "favorevole" }],
    });
    expect(res.status).toBe(400);
  });

  it("strips unsafe declaration URLs while keeping http(s) ones", async () => {
    const createRes = await authedPost("/api/officials").send({
      name: "Url Test",
      role: "consigliere",
      declarations: [
        {
          title: "Doc malevolo",
          // eslint-disable-next-line no-script-url
          url: "javascript:alert(1)",
        },
        { title: "Doc valido", url: "https://example.com/doc.pdf" },
      ],
    });
    expect(createRes.status).toBe(201);
    createdOfficialIds.push(createRes.body.id);

    const malicious = createRes.body.declarations.find(
      (d: { title: string }) => d.title === "Doc malevolo",
    );
    const valid = createRes.body.declarations.find(
      (d: { title: string }) => d.title === "Doc valido",
    );
    expect(malicious.url).toBeNull();
    expect(valid.url).toBe("https://example.com/doc.pdf");
  });
});

describe("delibera voting breakdown", () => {
  it("matches per-person votes and tallies", async () => {
    const deliberaId = await createDelibera();

    const a = await authedPost("/api/officials").send({
      name: "Votante Uno",
      role: "consigliere",
      votes: [{ publicationId: deliberaId, vote: "favorevole" }],
    });
    const b = await authedPost("/api/officials").send({
      name: "Votante Due",
      role: "consigliere",
      votes: [{ publicationId: deliberaId, vote: "contrario" }],
    });
    createdOfficialIds.push(a.body.id, b.body.id);

    const res = await request(app).get(`/api/delibere/${deliberaId}/votes`);
    expect(res.status).toBe(200);
    expect(res.body.delibera.id).toBe(deliberaId);
    expect(res.body.tally.favorevole).toBe(1);
    expect(res.body.tally.contrario).toBe(1);
    expect(res.body.votes).toHaveLength(2);

    const breakdownVote = res.body.votes.find(
      (v: { name: string }) => v.name === "Votante Uno",
    );
    const profileRes = await request(app).get(`/api/officials/${a.body.id}`);
    const profileVote = profileRes.body.votes.find(
      (v: { publicationId: number }) => v.publicationId === deliberaId,
    );
    expect(breakdownVote.vote).toBe(profileVote.vote);
  });

  it("returns 404 for a non-delibera publication", async () => {
    const res = await request(app).get("/api/delibere/99999999/votes");
    expect(res.status).toBe(404);
  });
});
