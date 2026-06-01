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
  publicationsTable,
} from "@workspace/db";
import {
  extractCupsFromText,
  buildCupThemeMap,
  resolveThemeId,
} from "../lib/anacContracts";
import {
  classifyPhase,
  matchStrength,
  buildStoryline,
} from "../lib/contractStoryline";

const createdContractIds: number[] = [];
const createdThemeIds: number[] = [];
const createdPublicationIds: number[] = [];
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

async function createPublication(overrides: {
  tipologia: string;
  oggetto: string;
  cups?: string[];
  dataAtto?: Date | null;
}): Promise<number> {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const [row] = await db
    .insert(publicationsTable)
    .values({
      progressivo: `pub-${unique}`,
      tipologia: overrides.tipologia,
      category: "albo",
      oggetto: overrides.oggetto,
      cups: overrides.cups ?? [],
      dataAtto: overrides.dataAtto ?? null,
    })
    .returning();
  createdPublicationIds.push(row.id);
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
  const publicationIds = createdPublicationIds.splice(0);
  if (publicationIds.length) {
    await db
      .delete(publicationsTable)
      .where(inArray(publicationsTable.id, publicationIds));
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

describe("contract storyline classification", () => {
  it("classifies acts into lifecycle phases from type/subject", () => {
    expect(
      classifyPhase("Determina", "Determinazione di aggiudicazione lavori"),
    ).toBe("affidamento");
    expect(
      classifyPhase("Contratto", "Stipula del contratto d'appalto rep. 123"),
    ).toBe("contratto");
    expect(
      classifyPhase("Determina", "Perizia di variante e suppletiva"),
    ).toBe("variante");
    expect(
      classifyPhase("Determina", "Liquidazione fattura saldo lavori"),
    ).toBe("liquidazione");
    expect(
      classifyPhase("Atto", "Certificato di regolare esecuzione e collaudo"),
    ).toBe("collaudo");
    expect(classifyPhase("Avviso", "Avviso pubblico generico")).toBe("altro");
  });

  it("matches publications by CIG (strong) and CUP (weaker)", () => {
    const contract = {
      cig: "ABC1234567",
      cup: "C84J18000000002",
      amount: 1000,
      awardDate: new Date("2024-01-01"),
    };
    expect(
      matchStrength(contract, {
        id: 1,
        progressivo: "p1",
        tipologia: "Determina",
        oggetto: "Liquidazione relativa al CIG ABC1234567",
        cups: [],
        dataAtto: null,
        pubStart: null,
      }),
    ).toBe("cig");
    expect(
      matchStrength(contract, {
        id: 2,
        progressivo: "p2",
        tipologia: "Determina",
        oggetto: "Atto generico",
        cups: ["C84J18000000002"],
        dataAtto: null,
        pubStart: null,
      }),
    ).toBe("cup");
    expect(
      matchStrength(contract, {
        id: 3,
        progressivo: "p3",
        tipologia: "Determina",
        oggetto: "Atto non collegato",
        cups: [],
        dataAtto: null,
        pubStart: null,
      }),
    ).toBeNull();
  });

  it("computes indicators (time to liquidation, cost overrun, status)", () => {
    const contract = {
      cig: "ABC1234567",
      cup: null,
      amount: 100000,
      awardDate: new Date("2024-01-01"),
    };
    const { timeline, indicators } = buildStoryline(contract, [
      {
        id: 1,
        progressivo: "p1",
        tipologia: "Determina",
        oggetto: "Perizia di variante, importo € 10.000,00 - CIG ABC1234567",
        cups: [],
        dataAtto: new Date("2024-02-01"),
        pubStart: null,
      },
      {
        id: 2,
        progressivo: "p2",
        tipologia: "Determina",
        oggetto: "Liquidazione saldo importo € 50.000,00 CIG ABC1234567",
        cups: [],
        dataAtto: new Date("2024-04-01"),
        pubStart: null,
      },
    ]);

    expect(timeline).toHaveLength(2);
    // Ordine cronologico: variante prima della liquidazione.
    expect(timeline[0].phase).toBe("variante");
    expect(timeline[1].phase).toBe("liquidazione");
    expect(indicators.status).toBe("liquidato");
    expect(indicators.daysToFirstLiquidazione).toBe(91);
    expect(indicators.extraAmount).toBe(10000);
    expect(indicators.costOverrunPct).toBeCloseTo(10);
  });

  it("reports 'nessuna_liquidazione' when no evidence is linked", () => {
    const contract = {
      cig: "ZZZ9999999",
      cup: null,
      amount: 1000,
      awardDate: new Date("2024-01-01"),
    };
    const { timeline, indicators } = buildStoryline(contract, []);
    expect(timeline).toHaveLength(0);
    expect(indicators.evidenceCount).toBe(0);
    expect(indicators.status).toBe("nessuna_liquidazione");
  });
});

describe("GET /api/contracts/:id/storyline", () => {
  it("returns the contract, linked timeline and indicators", async () => {
    const cig = `CIG${Date.now().toString().slice(-7)}`;
    const contractId = await createContract({
      title: "Lavori di prova",
      cig,
      amount: "100000.00",
    });
    await createPublication({
      tipologia: "Determina",
      oggetto: `Stipula contratto d'appalto - CIG ${cig}`,
      dataAtto: new Date("2024-02-01"),
    });
    await createPublication({
      tipologia: "Determina",
      oggetto: `Liquidazione fattura - CIG ${cig}`,
      dataAtto: new Date("2024-03-01"),
    });
    // Pubblicazione non collegata: non deve comparire nella timeline.
    await createPublication({
      tipologia: "Determina",
      oggetto: "Atto del tutto estraneo",
      dataAtto: new Date("2024-02-15"),
    });

    const res = await request(app).get(
      `/api/contracts/${contractId}/storyline`,
    );
    expect(res.status).toBe(200);
    expect(res.body.contract.id).toBe(contractId);
    expect(res.body.timeline).toHaveLength(2);
    expect(res.body.timeline[0].phase).toBe("contratto");
    expect(res.body.timeline[1].phase).toBe("liquidazione");
    expect(res.body.indicators.status).toBe("liquidato");
  });

  it("returns 404 for an unknown contract", async () => {
    const res = await request(app).get("/api/contracts/99999999/storyline");
    expect(res.status).toBe(404);
  });
});
