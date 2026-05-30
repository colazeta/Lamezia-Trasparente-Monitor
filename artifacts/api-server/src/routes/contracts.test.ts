import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { eq, inArray } from "drizzle-orm";

import request from "supertest";
import app from "../app";
import {
  db,
  pool,
  contractsTable,
  themesTable,
  categoriesTable,
} from "@workspace/db";
import {
  extractCupsFromText,
  buildCupThemeMap,
  resolveThemeId,
} from "../lib/anacContracts";

const createdContractIds: number[] = [];
const createdThemeIds: number[] = [];
let categoryId = 0;

async function createCategory(): Promise<number> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [row] = await db
    .insert(categoriesTable)
    .values({
      name: `Categoria ${unique}`,
      slug: `cat-${unique}`,
      description: "Categoria di test",
    })
    .returning();
  return row.id;
}

async function createTheme(summary = "", description = ""): Promise<number> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [row] = await db
    .insert(themesTable)
    .values({
      title: `Tema ${unique}`,
      slug: `tema-${unique}`,
      summary: summary || "Sintesi di test",
      description: description || "Descrizione di test",
      categoryId,
    })
    .returning();
  createdThemeIds.push(row.id);
  return row.id;
}

async function createContract(overrides: {
  title: string;
  cig?: string | null;
  cup?: string | null;
  amount?: string;
  themeId?: number | null;
}): Promise<number> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [row] = await db
    .insert(contractsTable)
    .values({
      sourceId: `test-${unique}`,
      title: overrides.title,
      description: overrides.title,
      supplier: "Fornitore di test",
      amount: overrides.amount ?? "1000.00",
      procedureType: "Procedura aperta",
      status: "Aggiudicato",
      cig: overrides.cig ?? null,
      cup: overrides.cup ?? null,
      themeId: overrides.themeId ?? null,
    })
    .returning();
  createdContractIds.push(row.id);
  return row.id;
}

beforeAll(async () => {
  categoryId = await createCategory();
});

afterAll(async () => {
  if (categoryId) {
    await db.delete(categoriesTable).where(eq(categoriesTable.id, categoryId));
  }
  await pool.end();
});

afterEach(async () => {
  const contractIds = createdContractIds.splice(0);
  if (contractIds.length) {
    await db
      .delete(contractsTable)
      .where(inArray(contractsTable.id, contractIds));
  }
  const themeIds = createdThemeIds.splice(0);
  if (themeIds.length) {
    await db.delete(themesTable).where(inArray(themesTable.id, themeIds));
  }
});

describe("GET /api/contracts?themeId=", () => {
  it("returns only contracts linked to the selected theme", async () => {
    const themeId = await createTheme();
    const otherThemeId = await createTheme();

    await createContract({ title: "Contratto del tema A", themeId });
    await createContract({ title: "Altro contratto del tema A", themeId });
    await createContract({ title: "Contratto del tema B", themeId: otherThemeId });
    await createContract({ title: "Contratto senza tema", themeId: null });

    const res = await request(app).get(`/api/contracts?themeId=${themeId}`);
    expect(res.status).toBe(200);

    const returnedThemeIds = (res.body as { themeId: number | null }[]).map(
      (c) => c.themeId,
    );
    expect(returnedThemeIds.length).toBe(2);
    expect(returnedThemeIds.every((id) => id === themeId)).toBe(true);
  });

  it("returns all contracts when no theme filter is applied", async () => {
    const themeId = await createTheme();
    await createContract({ title: "Con tema", themeId });
    await createContract({ title: "Senza tema", themeId: null });

    const res = await request(app).get("/api/contracts");
    expect(res.status).toBe(200);
    const titles = (res.body as { title: string }[]).map((c) => c.title);
    expect(titles).toContain("Con tema");
    expect(titles).toContain("Senza tema");
  });
});

describe("GET /api/contracts/analytics?themeId=", () => {
  it("computes analytics only over the contracts of the selected theme", async () => {
    const themeId = await createTheme();
    const otherThemeId = await createTheme();

    await createContract({
      title: "Tema A 1",
      amount: "1000.00",
      themeId,
    });
    await createContract({
      title: "Tema A 2",
      amount: "3000.00",
      themeId,
    });
    await createContract({
      title: "Tema B",
      amount: "9999.00",
      themeId: otherThemeId,
    });

    const res = await request(app).get(
      `/api/contracts/analytics?themeId=${themeId}`,
    );
    expect(res.status).toBe(200);
    expect(res.body.totalCount).toBe(2);
    expect(res.body.totalAmount).toBe(4000);
  });
});

describe("ANAC theme association helpers", () => {
  it("extracts CUPs cited in free theme text", () => {
    const cups = extractCupsFromText(
      "Lavori del lungomare (CUP C89J21001230001) e altro.",
    );
    expect(cups).toContain("C89J21001230001");
  });

  it("maps a contract CUP to the theme that cites it", () => {
    const map = buildCupThemeMap(
      [
        {
          id: 42,
          summary: "Sintesi",
          description: "Progetto con CUP C89J21001230001 in corso.",
        },
      ],
      [],
    );
    expect(resolveThemeId("C89J21001230001", map)).toBe(42);
    expect(resolveThemeId("c89j21001230001", map)).toBe(42);
    expect(resolveThemeId("Z00Z00000000000", map)).toBeNull();
    expect(resolveThemeId(null, map)).toBeNull();
  });

  it("inherits the theme from an already-linked contract with the same CUP", () => {
    const map = buildCupThemeMap(
      [],
      [{ cup: "C84J18000000002", themeId: 7 }],
    );
    expect(resolveThemeId("C84J18000000002", map)).toBe(7);
  });

  it("links ingested-style contracts to the matching theme end to end", async () => {
    const themeId = await createTheme(
      "Sintesi",
      "Messa in sicurezza (CUP C84J18000000002).",
    );

    const themes = await db
      .select({
        id: themesTable.id,
        summary: themesTable.summary,
        description: themesTable.description,
      })
      .from(themesTable)
      .where(eq(themesTable.id, themeId));
    const map = buildCupThemeMap(themes, []);

    const resolved = resolveThemeId("C84J18000000002", map);
    expect(resolved).toBe(themeId);

    await createContract({
      title: "Contratto ingerito",
      cig: "TESTCIG001",
      cup: "C84J18000000002",
      themeId: resolved,
    });

    const res = await request(app).get(`/api/contracts?themeId=${themeId}`);
    expect(res.status).toBe(200);
    expect((res.body as unknown[]).length).toBe(1);
  });
});
