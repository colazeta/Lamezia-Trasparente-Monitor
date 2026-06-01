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
  themePostsTable,
  actsTable,
  themeEmailsTable,
  sharesTable,
  themeRelevanceEventsTable,
} from "@workspace/db";
import { reconcileThemeCounters } from "../lib/counters";

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
  await db
    .delete(themePostsTable)
    .where(eq(themePostsTable.themeId, themeId));
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

  it("includes the theme title and a working unsubscribe link in the confirmation email", async () => {
    const [theme] = await db
      .select({ title: themesTable.title })
      .from(themesTable)
      .where(eq(themesTable.id, themeId));
    expect(theme).toBeDefined();

    const res = await request(app)
      .post(`/api/themes/${themeId}/follow`)
      .send({ email: "contenuto@example.com" });
    expect(res.status).toBe(200);

    const [follower] = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, themeId));
    expect(follower).toBeDefined();
    expect(follower.unsubscribeToken).toBeTruthy();

    const confirmation = await vi.waitFor(() => {
      const found = mockedSendEmail.mock.calls.find(
        ([params]) =>
          params.to === "contenuto@example.com" &&
          params.subject.startsWith("Segui:"),
      )?.[0];
      expect(found).toBeDefined();
      return found!;
    });

    const expectedUnsub = `/api/unsubscribe?token=${follower.unsubscribeToken}`;
    expect(confirmation.subject).toContain(theme.title);
    expect(confirmation.html).toContain(theme.title);
    expect(confirmation.html).toContain(expectedUnsub);
    expect(confirmation.html).toContain(`/temi/${themeId}`);
    expect(confirmation.text).toBeDefined();
    expect(confirmation.text).toContain(theme.title);
    expect(confirmation.text).toContain(expectedUnsub);
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
    expect(res.text).toContain("Iscrizione annullata.");
    expect(await getFollowerCount(themeId)).toBe(0);

    const remaining = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, themeId));
    expect(remaining).toHaveLength(0);
  });

  it("names the unsubscribed theme and offers a link back home", async () => {
    const [theme] = await db
      .select({ title: themesTable.title })
      .from(themesTable)
      .where(eq(themesTable.id, themeId));
    expect(theme).toBeDefined();

    await request(app)
      .post(`/api/themes/${themeId}/follow`)
      .send({ email: "personalizzato@example.com" });

    const [follower] = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, themeId));

    const res = await request(app)
      .get("/api/unsubscribe")
      .query({ token: follower.unsubscribeToken });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(res.text).toContain(
      `Non riceverai più aggiornamenti su <strong>${theme.title}</strong>`,
    );
    expect(res.text).toContain("Torna a Lamezia Trasparente");
    expect(res.text).toContain("<a href=");
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

  it("offers a one-click re-subscribe action on the goodbye page", async () => {
    await request(app)
      .post(`/api/themes/${themeId}/follow`)
      .send({ email: "ripensamento@example.com" });

    const [follower] = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, themeId));

    const res = await request(app)
      .get("/api/unsubscribe")
      .query({ token: follower.unsubscribeToken });

    expect(res.status).toBe(200);
    expect(res.text).toContain("Iscriviti di nuovo");
    expect(res.text).toContain('action=');
    expect(res.text).toContain("/api/resubscribe");
    expect(res.text).toContain('name="themeId"');
    expect(res.text).toContain(`value="${themeId}"`);
    expect(res.text).toContain('name="email"');
    expect(res.text).toContain('value="ripensamento@example.com"');
  });
});

describe("POST /api/resubscribe", () => {
  it("restores the follower and increments the follower count", async () => {
    await request(app)
      .post(`/api/themes/${themeId}/follow`)
      .send({ email: "ritorno@example.com" });

    const [follower] = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, themeId));

    await request(app)
      .get("/api/unsubscribe")
      .query({ token: follower.unsubscribeToken });
    expect(await getFollowerCount(themeId)).toBe(0);

    const res = await request(app)
      .post("/api/resubscribe")
      .type("form")
      .send({ themeId: String(themeId), email: "ritorno@example.com" });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(res.text).toContain("Iscrizione ripristinata.");
    expect(res.text).toContain("Torna a Lamezia Trasparente");
    expect(await getFollowerCount(themeId)).toBe(1);

    const restored = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, themeId));
    expect(restored).toHaveLength(1);
    expect(restored[0].email).toBe("ritorno@example.com");
  });

  it("is idempotent when re-subscribing twice", async () => {
    const first = await request(app)
      .post("/api/resubscribe")
      .type("form")
      .send({ themeId: String(themeId), email: "doppio-ritorno@example.com" });
    expect(first.status).toBe(200);
    expect(await getFollowerCount(themeId)).toBe(1);

    const second = await request(app)
      .post("/api/resubscribe")
      .type("form")
      .send({ themeId: String(themeId), email: "Doppio-Ritorno@example.com" });
    expect(second.status).toBe(200);
    expect(await getFollowerCount(themeId)).toBe(1);

    const followers = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, themeId));
    expect(followers).toHaveLength(1);
  });

  it("normalizes the email so re-subscribe is idempotent against the original follow", async () => {
    await request(app)
      .post(`/api/themes/${themeId}/follow`)
      .send({ email: "maiuscole@example.com" });
    expect(await getFollowerCount(themeId)).toBe(1);

    const res = await request(app)
      .post("/api/resubscribe")
      .type("form")
      .send({ themeId: String(themeId), email: "Maiuscole@Example.com" });
    expect(res.status).toBe(200);
    expect(await getFollowerCount(themeId)).toBe(1);

    const followers = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, themeId));
    expect(followers).toHaveLength(1);
  });

  it("sends a confirmation email when re-subscribing restores a follower", async () => {
    mockedSendEmail.mockClear();

    const res = await request(app)
      .post("/api/resubscribe")
      .type("form")
      .send({ themeId: String(themeId), email: "conferma-ritorno@example.com" });
    expect(res.status).toBe(200);

    const confirmation = await vi.waitFor(() => {
      const confirmations = mockedSendEmail.mock.calls.filter(
        ([params]) =>
          params.to === "conferma-ritorno@example.com" &&
          params.subject.startsWith("Segui:"),
      );
      expect(confirmations).toHaveLength(1);
      return confirmations[0][0];
    });

    const [theme] = await db
      .select({ title: themesTable.title })
      .from(themesTable)
      .where(eq(themesTable.id, themeId));
    const [follower] = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, themeId));
    expect(follower).toBeDefined();
    expect(follower.unsubscribeToken).toBeTruthy();
    const expectedUnsub = `/api/unsubscribe?token=${follower.unsubscribeToken}`;

    expect(confirmation.subject).toContain(theme.title);
    expect(confirmation.html).toContain(theme.title);
    expect(confirmation.html).toContain(expectedUnsub);
    expect(confirmation.html).toContain(`/temi/${themeId}`);
    expect(confirmation.text).toBeDefined();
    expect(confirmation.text).toContain(theme.title);
    expect(confirmation.text).toContain(expectedUnsub);
  });

  it("renders an invalid-request page when fields are missing", async () => {
    const res = await request(app)
      .post("/api/resubscribe")
      .type("form")
      .send({ email: "senza-tema@example.com" });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(res.text).toContain("Richiesta di iscrizione non valida.");
  });

  it("renders a not-found page for an unknown theme", async () => {
    const res = await request(app)
      .post("/api/resubscribe")
      .type("form")
      .send({ themeId: "99999999", email: "ignoto@example.com" });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(res.text).toContain("Tema non trovato.");
  });
});

describe("subscription center (/api/subscriptions)", () => {
  const email = "centro@example.com";
  let secondThemeId: number;

  beforeEach(async () => {
    secondThemeId = await createTheme(categoryId);
    await request(app)
      .post(`/api/themes/${themeId}/follow`)
      .send({ email });
    await request(app)
      .post(`/api/themes/${secondThemeId}/follow`)
      .send({ email });
  });

  afterEach(async () => {
    await db
      .delete(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, secondThemeId));
    await db.delete(themesTable).where(eq(themesTable.id, secondThemeId));
  });

  async function tokenFor(email: string): Promise<string> {
    const [follower] = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.email, email));
    return follower.unsubscribeToken;
  }

  it("lists every theme the email currently follows", async () => {
    const [t1] = await db
      .select({ title: themesTable.title })
      .from(themesTable)
      .where(eq(themesTable.id, themeId));
    const [t2] = await db
      .select({ title: themesTable.title })
      .from(themesTable)
      .where(eq(themesTable.id, secondThemeId));

    const token = await tokenFor(email);
    const res = await request(app).get("/api/subscriptions").query({ token });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/html");
    expect(res.text).toContain("Le tue iscrizioni");
    expect(res.text).toContain(email);
    expect(res.text).toContain(t1.title);
    expect(res.text).toContain(t2.title);
    expect(res.text).toContain("/api/subscriptions/unsubscribe");
    expect(res.text).toContain("/api/subscriptions/unsubscribe-all");
  });

  it("renders an invalid page for a missing or unknown token", async () => {
    const missing = await request(app).get("/api/subscriptions");
    expect(missing.status).toBe(200);
    expect(missing.text).toContain("Link non valido o scaduto.");

    const unknown = await request(app)
      .get("/api/subscriptions")
      .query({ token: "00000000-0000-0000-0000-000000000000" });
    expect(unknown.status).toBe(200);
    expect(unknown.text).toContain("Link non valido o scaduto.");
  });

  it("unsubscribes a single theme and keeps the others", async () => {
    const token = await tokenFor(email);

    const res = await request(app)
      .post("/api/subscriptions/unsubscribe")
      .type("form")
      .send({ token, themeId: String(themeId) });

    expect(res.status).toBe(200);
    expect(res.text).toContain("Le tue iscrizioni");
    expect(await getFollowerCount(themeId)).toBe(0);
    expect(await getFollowerCount(secondThemeId)).toBe(1);

    const remaining = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.email, email));
    expect(remaining).toHaveLength(1);
    expect(remaining[0].themeId).toBe(secondThemeId);
  });

  it("unsubscribes from all themes at once", async () => {
    const token = await tokenFor(email);

    const res = await request(app)
      .post("/api/subscriptions/unsubscribe-all")
      .type("form")
      .send({ token });

    expect(res.status).toBe(200);
    expect(res.text).toContain("Hai annullato tutte le tue iscrizioni.");
    expect(await getFollowerCount(themeId)).toBe(0);
    expect(await getFollowerCount(secondThemeId)).toBe(0);

    const remaining = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.email, email));
    expect(remaining).toHaveLength(0);
  });

  it("includes a subscription center link in the confirmation email", async () => {
    mockedSendEmail.mockClear();
    await request(app)
      .post(`/api/themes/${themeId}/follow`)
      .send({ email: "link-conferma@example.com" });

    await vi.waitFor(() => {
      const call = mockedSendEmail.mock.calls.find(
        ([params]) => params.to === "link-conferma@example.com",
      );
      expect(call).toBeDefined();
      expect(call?.[0].html).toContain("/api/subscriptions?token=");
    });
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

    const [theme] = await db
      .select({ title: themesTable.title })
      .from(themesTable)
      .where(eq(themesTable.id, themeId));
    const [follower] = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, themeId));
    const expectedUnsub = `/api/unsubscribe?token=${follower.unsubscribeToken}`;

    const notification = notificationCall![0];
    expect(notification.subject).toContain(theme.title);
    expect(notification.html).toContain(theme.title);
    expect(notification.html).toContain("Nuovo documento");
    expect(notification.html).toContain(expectedUnsub);
    expect(notification.html).toContain(`/temi/${themeId}`);
    expect(notification.text).toBeDefined();
    expect(notification.text).toContain(theme.title);
    expect(notification.text).toContain(expectedUnsub);
  });
});

describe("Cronistoria posts (/api/themes/:id/posts)", () => {
  it("creates a post and returns it in the theme detail timeline", async () => {
    const create = await request(app)
      .post(`/api/themes/${themeId}/posts`)
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send({
        title: "Primo aggiornamento",
        body: "Testo **in grassetto** della cronistoria.",
        eventDate: "2025-01-15T00:00:00.000Z",
      });

    expect(create.status).toBe(201);
    expect(create.body.title).toBe("Primo aggiornamento");
    expect(create.body.body).toContain("grassetto");
    expect(create.body.themeId).toBe(themeId);

    const detail = await request(app).get(`/api/themes/${themeId}`);
    expect(detail.status).toBe(200);
    expect(detail.body.posts).toHaveLength(1);
    expect(detail.body.posts[0].title).toBe("Primo aggiornamento");
  });

  it("orders posts most recent event first", async () => {
    await request(app)
      .post(`/api/themes/${themeId}/posts`)
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send({ body: "Vecchio", eventDate: "2024-01-01T00:00:00.000Z" });
    await request(app)
      .post(`/api/themes/${themeId}/posts`)
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send({ body: "Recente", eventDate: "2025-06-01T00:00:00.000Z" });

    const list = await request(app).get(`/api/themes/${themeId}/posts`);
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(2);
    expect(list.body[0].body).toBe("Recente");
    expect(list.body[1].body).toBe("Vecchio");
  });

  it("requires the ingest token to create a post", async () => {
    const res = await request(app)
      .post(`/api/themes/${themeId}/posts`)
      .send({ body: "Senza autorizzazione" });
    expect(res.status).toBe(401);

    const posts = await db
      .select()
      .from(themePostsTable)
      .where(eq(themePostsTable.themeId, themeId));
    expect(posts).toHaveLength(0);
  });

  it("rejects an empty body", async () => {
    const res = await request(app)
      .post(`/api/themes/${themeId}/posts`)
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send({ body: "   " });
    expect(res.status).toBe(400);
  });

  it("returns 404 when creating a post for an unknown theme", async () => {
    const res = await request(app)
      .post(`/api/themes/99999999/posts`)
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send({ body: "Tema inesistente" });
    expect(res.status).toBe(404);
  });

  it("edits an existing post", async () => {
    const create = await request(app)
      .post(`/api/themes/${themeId}/posts`)
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send({ title: "Bozza", body: "Testo iniziale" });
    const postId = create.body.id;

    const update = await request(app)
      .patch(`/api/themes/${themeId}/posts/${postId}`)
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send({ title: "Definitivo", body: "Testo aggiornato" });

    expect(update.status).toBe(200);
    expect(update.body.title).toBe("Definitivo");
    expect(update.body.body).toBe("Testo aggiornato");
  });

  it("deletes a post", async () => {
    const create = await request(app)
      .post(`/api/themes/${themeId}/posts`)
      .set("Authorization", `Bearer ${INGEST_TOKEN}`)
      .send({ body: "Da eliminare" });
    const postId = create.body.id;

    const del = await request(app)
      .delete(`/api/themes/${themeId}/posts/${postId}`)
      .set("Authorization", `Bearer ${INGEST_TOKEN}`);
    expect(del.status).toBe(204);

    const remaining = await db
      .select()
      .from(themePostsTable)
      .where(eq(themePostsTable.themeId, themeId));
    expect(remaining).toHaveLength(0);
  });

  it("returns 404 when deleting an unknown post", async () => {
    const res = await request(app)
      .delete(`/api/themes/${themeId}/posts/99999999`)
      .set("Authorization", `Bearer ${INGEST_TOKEN}`);
    expect(res.status).toBe(404);
  });
});

describe("POST /api/themes/:id/relevant", () => {
  it("increments the relevance count and records an event", async () => {
    expect(await getRelevanceCount(themeId)).toBe(0);

    const res = await request(app).post(`/api/themes/${themeId}/relevant`);

    expect(res.status).toBe(200);
    expect(res.body.relevanceCount).toBe(1);
    expect(await getRelevanceCount(themeId)).toBe(1);

    const second = await request(app).post(`/api/themes/${themeId}/relevant`);
    expect(second.status).toBe(200);
    expect(second.body.relevanceCount).toBe(2);
    expect(await getRelevanceCount(themeId)).toBe(2);

    const events = await db
      .select()
      .from(themeRelevanceEventsTable)
      .where(eq(themeRelevanceEventsTable.themeId, themeId));
    expect(events).toHaveLength(2);
  });

  it("returns 404 for an unknown theme", async () => {
    const res = await request(app).post("/api/themes/99999999/relevant");
    expect(res.status).toBe(404);
  });
});

describe("reconcileThemeCounters", () => {
  it("recomputes relevance_count from the events table", async () => {
    await request(app).post(`/api/themes/${themeId}/relevant`);
    await request(app).post(`/api/themes/${themeId}/relevant`);
    expect(await getRelevanceCount(themeId)).toBe(2);

    await db
      .update(themesTable)
      .set({ relevanceCount: 99 })
      .where(eq(themesTable.id, themeId));
    expect(await getRelevanceCount(themeId)).toBe(99);

    await reconcileThemeCounters();

    expect(await getRelevanceCount(themeId)).toBe(2);
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

    const [theme] = await db
      .select({ title: themesTable.title })
      .from(themesTable)
      .where(eq(themesTable.id, themeId));
    const [follower] = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, themeId));
    const expectedUnsub = `/api/unsubscribe?token=${follower.unsubscribeToken}`;

    const notification = notificationCall![0];
    expect(notification.subject).toContain(theme.title);
    expect(notification.html).toContain(theme.title);
    expect(notification.html).toContain(validAct.title);
    expect(notification.html).toContain(expectedUnsub);
    expect(notification.text).toBeDefined();
    expect(notification.text).toContain(theme.title);
    expect(notification.text).toContain(expectedUnsub);
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

    const [theme] = await db
      .select({ title: themesTable.title })
      .from(themesTable)
      .where(eq(themesTable.id, themeId));
    const [follower] = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, themeId));
    const expectedUnsub = `/api/unsubscribe?token=${follower.unsubscribeToken}`;

    const notification = notificationCall![0];
    expect(notification.subject).toContain(theme.title);
    expect(notification.html).toContain(theme.title);
    expect(notification.html).toContain(validEmail.subject);
    expect(notification.html).toContain(expectedUnsub);
    expect(notification.text).toBeDefined();
    expect(notification.text).toContain(theme.title);
    expect(notification.text).toContain(expectedUnsub);
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
