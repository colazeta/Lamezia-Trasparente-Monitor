import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import { eq } from "drizzle-orm";

vi.mock("../lib/email", () => ({
  sendEmail: vi.fn(async () => true),
}));

import request from "supertest";
import app from "../app";
import { sendEmail } from "../lib/email";
import {
  db,
  pool,
  categoriesTable,
  themesTable,
  themeFollowersTable,
  themeDocumentsTable,
  actsTable,
  themeEmailsTable,
  sharesTable,
} from "@workspace/db";

const mockedSendEmail = vi.mocked(sendEmail);

const INGEST_TOKEN = "test-ingest-token";

let categoryId: number;
let themeId: number;

async function createCategory(): Promise<number> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [category] = await db
    .insert(categoriesTable)
    .values({
      name: `Test Category ${unique}`,
      slug: `test-category-${unique}`,
      description: "Categoria di test",
    })
    .returning();
  return category.id;
}

async function createTheme(catId: number): Promise<number> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [theme] = await db
    .insert(themesTable)
    .values({
      title: `Tema di test ${unique}`,
      slug: `tema-di-test-${unique}`,
      summary: "Sintesi di test",
      description: "Descrizione di test",
      categoryId: catId,
    })
    .returning();
  return theme.id;
}

async function getFollowerCount(id: number): Promise<number> {
  const [row] = await db
    .select({ followerCount: themesTable.followerCount })
    .from(themesTable)
    .where(eq(themesTable.id, id));
  return row?.followerCount ?? 0;
}

async function getRelevanceCount(id: number): Promise<number> {
  const [row] = await db
    .select({ relevanceCount: themesTable.relevanceCount })
    .from(themesTable)
    .where(eq(themesTable.id, id));
  return row?.relevanceCount ?? 0;
}

async function getShareCount(id: number): Promise<number> {
  const [row] = await db
    .select({ shareCount: themesTable.shareCount })
    .from(themesTable)
    .where(eq(themesTable.id, id));
  return row?.shareCount ?? 0;
}

beforeAll(() => {
  process.env.INGEST_API_TOKEN = INGEST_TOKEN;
});

afterAll(async () => {
  await pool.end();
});

beforeEach(async () => {
  mockedSendEmail.mockClear();
  categoryId = await createCategory();
  themeId = await createTheme(categoryId);
});

afterEach(async () => {
  await db
    .delete(themeFollowersTable)
    .where(eq(themeFollowersTable.themeId, themeId));
  await db
    .delete(themeDocumentsTable)
    .where(eq(themeDocumentsTable.themeId, themeId));
  await db.delete(actsTable).where(eq(actsTable.themeId, themeId));
  await db.delete(themeEmailsTable).where(eq(themeEmailsTable.themeId, themeId));
  await db.delete(sharesTable).where(eq(sharesTable.themeId, themeId));
  await db.delete(themesTable).where(eq(themesTable.id, themeId));
  await db.delete(categoriesTable).where(eq(categoriesTable.id, categoryId));
});

describe("POST /api/themes/:id/follow", () => {
  it("increments the follower count when a new email follows", async () => {
    expect(await getFollowerCount(themeId)).toBe(0);

    const res = await request(app)
      .post(`/api/themes/${themeId}/follow`)
      .send({ email: "cittadino@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.followerCount).toBe(1);
    expect(await getFollowerCount(themeId)).toBe(1);

    const followers = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, themeId));
    expect(followers).toHaveLength(1);
    expect(followers[0].email).toBe("cittadino@example.com");
  });

  it("is idempotent when the same email follows twice", async () => {
    const first = await request(app)
      .post(`/api/themes/${themeId}/follow`)
      .send({ email: "Doppio@Example.com" });
    expect(first.status).toBe(200);
    expect(first.body.followerCount).toBe(1);

    const second = await request(app)
      .post(`/api/themes/${themeId}/follow`)
      .send({ email: "doppio@example.com" });
    expect(second.status).toBe(200);
    expect(second.body.followerCount).toBe(1);

    expect(await getFollowerCount(themeId)).toBe(1);
    const followers = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, themeId));
    expect(followers).toHaveLength(1);
  });

  it("sends exactly one confirmation email and none on an idempotent re-follow", async () => {
    const first = await request(app)
      .post(`/api/themes/${themeId}/follow`)
      .send({ email: "conferma@example.com" });
    expect(first.status).toBe(200);

    await vi.waitFor(() => {
      const confirmations = mockedSendEmail.mock.calls.filter(
        ([params]) =>
          params.to === "conferma@example.com" &&
          params.subject.startsWith("Segui:"),
      );
      expect(confirmations).toHaveLength(1);
    });

    mockedSendEmail.mockClear();

    const second = await request(app)
      .post(`/api/themes/${themeId}/follow`)
      .send({ email: "Conferma@Example.com" });
    expect(second.status).toBe(200);
    expect(second.body.followerCount).toBe(1);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const confirmations = mockedSendEmail.mock.calls.filter(
      ([params]) =>
        params.to === "conferma@example.com" &&
        params.subject.startsWith("Segui:"),
    );
    expect(confirmations).toHaveLength(0);
  });

  it("returns 400 for an invalid email", async () => {
    const res = await request(app)
      .post(`/api/themes/${themeId}/follow`)
      .send({ email: "not-an-email" });

    expect(res.status).toBe(400);
    expect(await getFollowerCount(themeId)).toBe(0);
  });

  it("returns 404 for an unknown theme", async () => {
    const res = await request(app)
      .post(`/api/themes/99999999/follow`)
      .send({ email: "cittadino@example.com" });

    expect(res.status).toBe(404);
  });
});

describe("GET /api/unsubscribe", () => {
  it("decrements the follower count when unsubscribing", async () => {
    await request(app)
      .post(`/api/themes/${themeId}/follow`)
      .send({ email: "uscita@example.com" });
    expect(await getFollowerCount(themeId)).toBe(1);

    const [follower] = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, themeId));
    expect(follower).toBeDefined();

    const res = await request(app)
      .get("/api/unsubscribe")
      .query({ token: follower.unsubscribeToken });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(res.text).toContain(
      "Iscrizione annullata. Non riceverai più aggiornamenti su questo tema.",
    );
    expect(await getFollowerCount(themeId)).toBe(0);

    const remaining = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, themeId));
    expect(remaining).toHaveLength(0);
  });

  it("leaves the follower count unchanged when the token is missing", async () => {
    await request(app)
      .post(`/api/themes/${themeId}/follow`)
      .send({ email: "resta@example.com" });
    expect(await getFollowerCount(themeId)).toBe(1);

    const res = await request(app).get("/api/unsubscribe");

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(res.text).toContain("Link di annullamento non valido.");
    expect(await getFollowerCount(themeId)).toBe(1);

    const remaining = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, themeId));
    expect(remaining).toHaveLength(1);
  });

  it("leaves the follower count unchanged for an unknown token", async () => {
    await request(app)
      .post(`/api/themes/${themeId}/follow`)
      .send({ email: "resta@example.com" });
    expect(await getFollowerCount(themeId)).toBe(1);

    const res = await request(app)
      .get("/api/unsubscribe")
      .query({ token: "00000000-0000-0000-0000-000000000000" });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(res.text).toContain("Iscrizione già annullata o link non valido.");
    expect(await getFollowerCount(themeId)).toBe(1);

    const remaining = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, themeId));
    expect(remaining).toHaveLength(1);
  });

  it("does not double-decrement when the same token is used twice", async () => {
    await request(app)
      .post(`/api/themes/${themeId}/follow`)
      .send({ email: "doppia-uscita@example.com" });
    expect(await getFollowerCount(themeId)).toBe(1);

    const [follower] = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, themeId));

    const first = await request(app)
      .get("/api/unsubscribe")
      .query({ token: follower.unsubscribeToken });
    expect(first.status).toBe(200);
    expect(await getFollowerCount(themeId)).toBe(0);

    const second = await request(app)
      .get("/api/unsubscribe")
      .query({ token: follower.unsubscribeToken });
    expect(second.status).toBe(200);
    expect(second.headers["content-type"]).toContain("text/html");
    expect(second.text).toContain("Iscrizione già annullata o link non valido.");
    expect(await getFollowerCount(themeId)).toBe(0);
  });
});

describe("POST /api/themes/:id/documents", () => {
  it("triggers a notification attempt to followers when a document is added", async () => {
    await request(app)
      .post(`/api/themes/${themeId}/follow`)
      .send({ email: "follower@example.com" });

    await vi.waitFor(() => {
      expect(mockedSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: "follower@example.com" }),
      );
    });
    mockedSendEmail.mockClear();

    const res = await request(app)
      .post(`/api/themes/${themeId}/documents`)
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send({ title: "Nuovo documento", type: "delibera" });

    expect(res.status).toBe(201);

    await vi.waitFor(() => {
      expect(mockedSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: "follower@example.com" }),
      );
    });

    const notificationCall = mockedSendEmail.mock.calls.find(
      ([params]) => params.to === "follower@example.com",
    );
    expect(notificationCall).toBeDefined();
    expect(notificationCall?.[0].subject).toContain("Aggiornamento");
  });
});

describe("POST /api/themes/:id/relevant", () => {
  it("increments the relevance count", async () => {
    expect(await getRelevanceCount(themeId)).toBe(0);

    const res = await request(app).post(`/api/themes/${themeId}/relevant`);

    expect(res.status).toBe(200);
    expect(res.body.relevanceCount).toBe(1);
    expect(await getRelevanceCount(themeId)).toBe(1);

    const second = await request(app).post(`/api/themes/${themeId}/relevant`);
    expect(second.status).toBe(200);
    expect(second.body.relevanceCount).toBe(2);
    expect(await getRelevanceCount(themeId)).toBe(2);
  });

  it("returns 404 for an unknown theme", async () => {
    const res = await request(app).post("/api/themes/99999999/relevant");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/themes/:id/share", () => {
  it("increments the share count and records the channel", async () => {
    expect(await getShareCount(themeId)).toBe(0);

    const res = await request(app)
      .post(`/api/themes/${themeId}/share`)
      .send({ channel: "whatsapp" });

    expect(res.status).toBe(200);
    expect(res.body.shareCount).toBe(1);
    expect(await getShareCount(themeId)).toBe(1);

    const shares = await db
      .select()
      .from(sharesTable)
      .where(eq(sharesTable.themeId, themeId));
    expect(shares).toHaveLength(1);
    expect(shares[0].channel).toBe("whatsapp");
  });

  it("returns 400 for an invalid channel", async () => {
    const res = await request(app)
      .post(`/api/themes/${themeId}/share`)
      .send({ channel: "carrier-pigeon" });

    expect(res.status).toBe(400);
    expect(await getShareCount(themeId)).toBe(0);

    const shares = await db
      .select()
      .from(sharesTable)
      .where(eq(sharesTable.themeId, themeId));
    expect(shares).toHaveLength(0);
  });

  it("returns 404 for an unknown theme", async () => {
    const res = await request(app)
      .post("/api/themes/99999999/share")
      .send({ channel: "link" });

    expect(res.status).toBe(404);
  });
});

describe("POST /api/themes/:id/acts", () => {
  const validAct = {
    title: "Nuovo atto",
    type: "delibera",
    number: "123/2026",
    summary: "Sintesi dell'atto",
  };

  it("triggers a notification attempt to followers when an act is added", async () => {
    await request(app)
      .post(`/api/themes/${themeId}/follow`)
      .send({ email: "follower@example.com" });

    await vi.waitFor(() => {
      expect(mockedSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: "follower@example.com" }),
      );
    });
    mockedSendEmail.mockClear();

    const res = await request(app)
      .post(`/api/themes/${themeId}/acts`)
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send(validAct);

    expect(res.status).toBe(201);

    await vi.waitFor(() => {
      expect(mockedSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: "follower@example.com" }),
      );
    });

    const notificationCall = mockedSendEmail.mock.calls.find(
      ([params]) => params.to === "follower@example.com",
    );
    expect(notificationCall).toBeDefined();
    expect(notificationCall?.[0].subject).toContain("Aggiornamento");
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post(`/api/themes/${themeId}/acts`)
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send({ title: "Solo titolo" });

    expect(res.status).toBe(400);

    const acts = await db
      .select()
      .from(actsTable)
      .where(eq(actsTable.themeId, themeId));
    expect(acts).toHaveLength(0);
  });

  it("returns 401 without a valid ingest token", async () => {
    const res = await request(app)
      .post(`/api/themes/${themeId}/acts`)
      .set("Authorization", "Bearer wrong-token")
      .send(validAct);

    expect(res.status).toBe(401);
    expect(mockedSendEmail).not.toHaveBeenCalled();
  });

  it("returns 503 when ingestion is disabled", async () => {
    const original = process.env.INGEST_API_TOKEN;
    delete process.env.INGEST_API_TOKEN;
    try {
      const res = await request(app)
        .post(`/api/themes/${themeId}/acts`)
        .send(validAct);
      expect(res.status).toBe(503);
    } finally {
      process.env.INGEST_API_TOKEN = original;
    }
  });
});

describe("POST /api/themes/:id/emails", () => {
  const validEmail = {
    subject: "Richiesta di accesso agli atti",
    sender: "cittadino@example.com",
    recipient: "comune@example.com",
    direction: "inbound",
    body: "Testo della corrispondenza",
  };

  it("triggers a notification attempt to followers when an email is added", async () => {
    await request(app)
      .post(`/api/themes/${themeId}/follow`)
      .send({ email: "follower@example.com" });

    await vi.waitFor(() => {
      expect(mockedSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: "follower@example.com" }),
      );
    });
    mockedSendEmail.mockClear();

    const res = await request(app)
      .post(`/api/themes/${themeId}/emails`)
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send(validEmail);

    expect(res.status).toBe(201);

    await vi.waitFor(() => {
      expect(mockedSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: "follower@example.com" }),
      );
    });

    const notificationCall = mockedSendEmail.mock.calls.find(
      ([params]) => params.to === "follower@example.com",
    );
    expect(notificationCall).toBeDefined();
    expect(notificationCall?.[0].subject).toContain("Aggiornamento");
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await request(app)
      .post(`/api/themes/${themeId}/emails`)
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send({ subject: "Solo oggetto" });

    expect(res.status).toBe(400);

    const emails = await db
      .select()
      .from(themeEmailsTable)
      .where(eq(themeEmailsTable.themeId, themeId));
    expect(emails).toHaveLength(0);
  });

  it("returns 401 without a valid ingest token", async () => {
    const res = await request(app)
      .post(`/api/themes/${themeId}/emails`)
      .set("Authorization", "Bearer wrong-token")
      .send(validEmail);

    expect(res.status).toBe(401);
    expect(mockedSendEmail).not.toHaveBeenCalled();
  });

  it("returns 503 when ingestion is disabled", async () => {
    const original = process.env.INGEST_API_TOKEN;
    delete process.env.INGEST_API_TOKEN;
    try {
      const res = await request(app)
        .post(`/api/themes/${themeId}/emails`)
        .send(validEmail);
      expect(res.status).toBe(503);
    } finally {
      process.env.INGEST_API_TOKEN = original;
    }
  });
});
