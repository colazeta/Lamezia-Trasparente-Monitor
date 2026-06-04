import {
  describe,
  it,
  expect,
  afterEach,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import { eq, inArray } from "drizzle-orm";

import { db, pool, confiscatedAssetsTable, feedStatusTable } from "@workspace/db";
import { runConfiscatedAssetsIngestion } from "./confiscatedAssets";

const ANBSC_SOURCE = "anbsc-beni-confiscati-lamezia";

// sourceId dei beni creati/toccati da ogni test, ripuliti in afterEach così la
// suite non lascia residui nel database di test condiviso.
const trackedSourceIds: string[] = [];

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Costruisce un CSV in memoria nello stile dell'open data ANBSC: prima riga di
// intestazione + una riga per ogni record. Le colonne riconosciute dal parser
// sono usate qui per validare parsing, deduplicazione e mappatura dello stato.
function buildCsv(
  rows: Array<{
    id: string;
    comune?: string;
    denominazione?: string;
    indirizzo?: string;
    tipologia?: string;
    stato?: string;
    descrizione?: string;
    assegnatario?: string;
    destinazione_uso?: string;
    dati_catastali?: string;
  }>,
): string {
  const headers = [
    "id",
    "comune",
    "denominazione",
    "indirizzo",
    "tipologia",
    "stato",
    "descrizione",
    "assegnatario",
    "destinazione_uso",
    "dati_catastali",
  ];
  const lines = [headers.join(",")];
  for (const r of rows) {
    const cells = [
      r.id,
      r.comune ?? "Lamezia Terme",
      r.denominazione ?? "",
      r.indirizzo ?? "",
      r.tipologia ?? "",
      r.stato ?? "",
      r.descrizione ?? "",
      r.assegnatario ?? "",
      r.destinazione_uso ?? "",
      r.dati_catastali ?? "",
    ];
    // Avvolge ogni cella tra virgolette per gestire eventuali separatori interni.
    lines.push(cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
  }
  return lines.join("\n");
}

// Sostituisce fetch con uno stub che restituisce il CSV mock fornito, così
// l'ingestione gira senza raggiungere la fonte esterna ANBSC.
function mockFetchCsv(csv: string): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => csv,
    })) as unknown as typeof fetch,
  );
}

async function getBySourceId(sourceId: string) {
  const [row] = await db
    .select()
    .from(confiscatedAssetsTable)
    .where(eq(confiscatedAssetsTable.sourceId, sourceId));
  return row;
}

beforeEach(() => {
  // L'ingestione legge l'URL via env al momento dell'import del modulo; il
  // fetch è comunque mockato, quindi il valore concreto è irrilevante.
});

afterEach(async () => {
  vi.unstubAllGlobals();
  if (trackedSourceIds.length) {
    await db
      .delete(confiscatedAssetsTable)
      .where(inArray(confiscatedAssetsTable.sourceId, trackedSourceIds.splice(0)));
  }
});

afterAll(async () => {
  // Lo stato del feed è un record condiviso aggiornato dall'ingestione: lo
  // rimuoviamo per non lasciare traccia nel database di test.
  await db
    .delete(feedStatusTable)
    .where(eq(feedStatusTable.source, ANBSC_SOURCE));
  await pool.end();
});

describe("runConfiscatedAssetsIngestion (CSV mock)", () => {
  it("inserisce nuovi beni dal CSV con source=auto", async () => {
    const a = `${uid()}-A`;
    const b = `${uid()}-B`;
    const sidA = `anbsc-${a}`;
    const sidB = `anbsc-${b}`;
    trackedSourceIds.push(sidA, sidB);

    mockFetchCsv(
      buildCsv([
        {
          id: a,
          denominazione: "Appartamento confiscato Via Roma",
          indirizzo: "Via Roma 1, Lamezia Terme",
          tipologia: "Appartamento",
          stato: "Bene assegnato",
          descrizione: "Alloggio destinato a finalità sociali",
          assegnatario: "Comune di Lamezia Terme",
          destinazione_uso: "Alloggi sociali",
          dati_catastali: "Foglio 10 Particella 22",
        },
        {
          id: b,
          denominazione: "Terreno confiscato",
          indirizzo: "Contrada Esempio, Lamezia Terme",
          tipologia: "Terreno",
          stato: "Sequestro",
        },
      ]),
    );

    const result = await runConfiscatedAssetsIngestion();
    expect(result.total).toBe(2);
    expect(result.inserted).toBe(2);

    const rowA = await getBySourceId(sidA);
    expect(rowA).toBeTruthy();
    expect(rowA.source).toBe("auto");
    expect(rowA.denominazione).toBe("Appartamento confiscato Via Roma");
    expect(rowA.tipologia).toBe("Appartamento");
    expect(rowA.status).toBe("assegnato");
    expect(rowA.assegnatario).toBe("Comune di Lamezia Terme");
    expect(rowA.destinazioneUso).toBe("Alloggi sociali");
    expect(rowA.datiCatastali).toBe("Foglio 10 Particella 22");

    const rowB = await getBySourceId(sidB);
    expect(rowB).toBeTruthy();
    expect(rowB.source).toBe("auto");
    expect(rowB.status).toBe("sequestrato");
  });

  it("è idempotente e aggiorna i beni 'auto' già presenti tramite sourceId", async () => {
    const a = `${uid()}-UPD`;
    const sid = `anbsc-${a}`;
    trackedSourceIds.push(sid);

    // Prima passata: il bene viene inserito come 'auto'.
    mockFetchCsv(
      buildCsv([
        {
          id: a,
          denominazione: "Capannone confiscato",
          indirizzo: "Zona Industriale, Lamezia Terme",
          tipologia: "Capannone",
          stato: "Confisca",
        },
      ]),
    );
    const first = await runConfiscatedAssetsIngestion();
    expect(first.inserted).toBe(1);
    const before = await getBySourceId(sid);
    expect(before).toBeTruthy();
    expect(before.status).toBe("confiscato");

    // Seconda passata con stesso id ma dati aggiornati: deve aggiornare, non
    // duplicare (lo stesso sourceId è il vincolo di conflitto).
    mockFetchCsv(
      buildCsv([
        {
          id: a,
          denominazione: "Capannone confiscato - riutilizzato",
          indirizzo: "Zona Industriale 5, Lamezia Terme",
          tipologia: "Capannone",
          stato: "Riutilizzato",
          assegnatario: "Cooperativa Sociale",
        },
      ]),
    );
    const second = await runConfiscatedAssetsIngestion();
    expect(second.total).toBe(1);

    const rows = await db
      .select()
      .from(confiscatedAssetsTable)
      .where(eq(confiscatedAssetsTable.sourceId, sid));
    // Nessun duplicato: un solo record per quel sourceId.
    expect(rows).toHaveLength(1);
    const after = rows[0];
    expect(after.id).toBe(before.id);
    expect(after.source).toBe("auto");
    expect(after.denominazione).toBe("Capannone confiscato - riutilizzato");
    expect(after.indirizzo).toBe("Zona Industriale 5, Lamezia Terme");
    expect(after.status).toBe("riutilizzato");
    expect(after.assegnatario).toBe("Cooperativa Sociale");
  });

  it("non sovrascrive i beni curati a mano (source=manual)", async () => {
    const a = `${uid()}-MAN`;
    const sid = `anbsc-${a}`;
    trackedSourceIds.push(sid);

    // Bene curato a mano: la redazione ne ha la precedenza assoluta.
    const [manual] = await db
      .insert(confiscatedAssetsTable)
      .values({
        slug: `manuale-${a}`,
        denominazione: "Denominazione redazionale",
        description: "Testo curato dalla redazione",
        tipologia: "Villa",
        status: "assegnato",
        indirizzo: "Indirizzo redazionale",
        assegnatario: "Associazione XYZ",
        destinazioneUso: "Centro di accoglienza",
        notes: "nota interna",
        source: "manual",
        sourceId: sid,
      })
      .returning();

    // L'ingestione tenta di aggiornare lo stesso sourceId con dati diversi.
    mockFetchCsv(
      buildCsv([
        {
          id: a,
          denominazione: "Dati grezzi ANBSC",
          indirizzo: "Indirizzo grezzo",
          tipologia: "Immobile",
          stato: "Sequestro",
          assegnatario: "",
        },
      ]),
    );
    const result = await runConfiscatedAssetsIngestion();
    expect(result.total).toBe(1);
    // L'update è filtrato a source='auto', quindi il bene manuale non viene
    // toccato e non conta come inserito/aggiornato.
    expect(result.inserted).toBe(0);

    const after = await getBySourceId(sid);
    expect(after).toBeTruthy();
    expect(after.id).toBe(manual.id);
    expect(after.source).toBe("manual");
    expect(after.denominazione).toBe("Denominazione redazionale");
    expect(after.indirizzo).toBe("Indirizzo redazionale");
    expect(after.tipologia).toBe("Villa");
    expect(after.status).toBe("assegnato");
    expect(after.assegnatario).toBe("Associazione XYZ");
    expect(after.notes).toBe("nota interna");
  });

  it("filtra i record di comuni diversi dal target", async () => {
    const a = `${uid()}-IN`;
    const b = `${uid()}-OUT`;
    const sidIn = `anbsc-${a}`;
    const sidOut = `anbsc-${b}`;
    trackedSourceIds.push(sidIn, sidOut);

    mockFetchCsv(
      buildCsv([
        {
          id: a,
          comune: "Lamezia Terme",
          denominazione: "Bene nel comune target",
          stato: "Confisca",
        },
        {
          id: b,
          comune: "Catanzaro",
          denominazione: "Bene fuori comune",
          stato: "Confisca",
        },
      ]),
    );

    const result = await runConfiscatedAssetsIngestion();
    expect(result.total).toBe(1);
    expect(await getBySourceId(sidIn)).toBeTruthy();
    expect(await getBySourceId(sidOut)).toBeUndefined();
  });
});
