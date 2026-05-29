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
    expect(await getFollowerCount(themeId)).toBe(0);

    const remaining = await db
      .select()
      .from(themeFollowersTable)
      .where(eq(themeFollowersTable.themeId, themeId));
    expect(remaining).toHaveLength(0);
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
