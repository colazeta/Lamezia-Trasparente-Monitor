import {
  db,
  confiscatedAssetsTable,
  feedStatusTable,
  CONFISCATED_ASSET_STATUSES,
  type ConfiscatedAssetStatus,
} from "@workspace/db";
import { and, eq, isNull } from "drizzle-orm";
import { logger } from "./logger";
import { geocodeContractText } from "./geocode";

// Open data ANBSC (Agenzia nazionale beni sequestrati e confiscati). L'agenzia
// pubblica gli elenchi dei beni immobili destinati/in gestione in formato
// aperto. L'URL è configurabile via env per puntare al dataset corretto del
// territorio; il comune di interesse è filtrato lato client.
const ANBSC_SOURCE = "anbsc-beni-confiscati-lamezia";
const ANBSC_LABEL =
  "Beni confiscati alle mafie – Open Data ANBSC (Comune di Lamezia Terme)";
const ANBSC_URL =
  process.env.ANBSC_OPENDATA_URL ??
  "https://www.anbsc.it/opendata/beni-immobili-destinati.csv";
// Comune di riferimento per filtrare i record dell'open data nazionale.
const TARGET_COMUNE = process.env.ANBSC_TARGET_COMUNE ?? "LAMEZIA TERME";

function makeSlug(parts: string): string {
  return parts
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Mappa lo stato grezzo dell'open data sullo stato normalizzato della sezione.
function normalizeStatus(raw: string | undefined): ConfiscatedAssetStatus {
  const v = (raw ?? "").toLowerCase();
  if (v.includes("sequestr")) return "sequestrato";
  if (v.includes("riutilizz") || v.includes("riuso")) return "riutilizzato";
  if (v.includes("assegn") || v.includes("destinat")) return "assegnato";
  return "confiscato";
}

// --- Parser CSV minimale (gestisce virgolette e separatore ; o ,) ----------
function detectDelimiter(headerLine: string): string {
  const semi = (headerLine.match(/;/g) ?? []).length;
  const comma = (headerLine.match(/,/g) ?? []).length;
  return semi > comma ? ";" : ",";
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCsvLine(lines[0], delimiter).map((h) =>
    h.toLowerCase(),
  );
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i], delimiter);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = cells[idx] ?? "";
    });
    rows.push(row);
  }
  return rows;
}

// Cerca il primo valore non vuoto fra una lista di possibili nomi di colonna
// (l'open data ANBSC non ha uno schema stabile fra le diverse pubblicazioni).
function pick(row: Record<string, string>, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v && v.trim()) return v.trim();
  }
  return "";
}

type ParsedAsset = {
  sourceId: string;
  denominazione: string;
  description: string;
  tipologia: string;
  status: ConfiscatedAssetStatus;
  indirizzo: string;
  assegnatario: string;
  destinazioneUso: string;
  datiCatastali: string;
};

function parseAnbscRows(rows: Record<string, string>[]): ParsedAsset[] {
  const out: ParsedAsset[] = [];
  let seq = 0;
  for (const row of rows) {
    const comune = pick(row, ["comune", "comune_ubicazione", "citta"]);
    if (
      comune &&
      !comune.toUpperCase().includes(TARGET_COMUNE.toUpperCase())
    ) {
      continue;
    }
    const indirizzo = pick(row, [
      "indirizzo",
      "ubicazione",
      "via",
      "indirizzo_bene",
    ]);
    const tipologia = pick(row, [
      "tipologia",
      "tipo_bene",
      "categoria",
      "natura",
    ]);
    const denominazione =
      pick(row, ["denominazione", "descrizione_bene", "bene"]) ||
      [tipologia, indirizzo].filter(Boolean).join(" – ") ||
      "Bene confiscato";
    const rawId = pick(row, [
      "id",
      "id_bene",
      "identificativo",
      "codice",
      "progressivo",
    ]);
    const sourceId = `anbsc-${rawId || makeSlug(`${denominazione}-${indirizzo}-${++seq}`)}`;
    out.push({
      sourceId,
      denominazione,
      description: pick(row, ["descrizione", "note", "descrizione_bene"]),
      tipologia,
      status: normalizeStatus(
        pick(row, ["stato", "stato_bene", "situazione", "destinazione"]),
      ),
      indirizzo,
      assegnatario: pick(row, [
        "assegnatario",
        "ente_assegnatario",
        "destinatario",
        "concessionario",
      ]),
      destinazioneUso: pick(row, [
        "destinazione_uso",
        "destinazione",
        "finalita",
        "uso",
      ]),
      datiCatastali: pick(row, [
        "dati_catastali",
        "catasto",
        "foglio",
        "particella",
      ]),
    });
  }
  return out;
}

async function fetchFeed(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "rendiamoLameziaTrasparente/1.0",
      Accept: "text/csv,application/json,*/*",
    },
  });
  if (!res.ok) {
    throw new Error(`Fetch failed with status ${res.status}`);
  }
  return res.text();
}

// Importa i beni confiscati dall'open data ANBSC. Non distruttivo: i beni
// inseriti/curati a mano (source="manual") non vengono mai sovrascritti, e per
// i beni "auto" si aggiornano solo i campi descrittivi tramite il sourceId
// idempotente. La geolocalizzazione è gestita a parte (runConfiscatedAssetsGeocoding).
export async function runConfiscatedAssetsIngestion(): Promise<{
  total: number;
  inserted: number;
}> {
  logger.info({ source: ANBSC_SOURCE }, "Starting ANBSC ingestion");
  const now = new Date();
  try {
    const text = await fetchFeed(ANBSC_URL);
    const parsed = parseAnbscRows(parseCsv(text));

    let inserted = 0;
    for (const a of parsed) {
      const res = await db
        .insert(confiscatedAssetsTable)
        .values({
          slug: makeSlug(`${a.denominazione}-${a.sourceId}`),
          denominazione: a.denominazione,
          description: a.description,
          tipologia: a.tipologia,
          status: a.status,
          indirizzo: a.indirizzo,
          assegnatario: a.assegnatario,
          destinazioneUso: a.destinazioneUso,
          datiCatastali: a.datiCatastali,
          source: "auto",
          sourceId: a.sourceId,
        })
        // Aggiorna solo i record automatici: i beni curati a mano hanno la
        // precedenza e non vengono toccati dall'ingestione.
        .onConflictDoUpdate({
          target: confiscatedAssetsTable.sourceId,
          set: {
            denominazione: a.denominazione,
            description: a.description,
            tipologia: a.tipologia,
            status: a.status,
            indirizzo: a.indirizzo,
            assegnatario: a.assegnatario,
            destinazioneUso: a.destinazioneUso,
            datiCatastali: a.datiCatastali,
            updatedAt: now,
          },
          where: eq(confiscatedAssetsTable.source, "auto"),
        })
        .returning({ id: confiscatedAssetsTable.id });
      if (res.length > 0) inserted += 1;
    }

    await db
      .insert(feedStatusTable)
      .values({
        source: ANBSC_SOURCE,
        label: ANBSC_LABEL,
        url: ANBSC_URL,
        status: "ok",
        error: null,
        itemsTotal: parsed.length,
        itemsNew: inserted,
        lastCheckedAt: now,
        lastUpdatedAt: now,
      })
      .onConflictDoUpdate({
        target: feedStatusTable.source,
        set: {
          status: "ok",
          error: null,
          itemsTotal: parsed.length,
          itemsNew: inserted,
          lastCheckedAt: now,
          lastUpdatedAt: now,
        },
      });

    logger.info(
      { source: ANBSC_SOURCE, total: parsed.length, inserted },
      "ANBSC ingestion complete",
    );
    return { total: parsed.length, inserted };
  } catch (err) {
    logger.error({ err, source: ANBSC_SOURCE }, "ANBSC ingestion failed");
    const message = err instanceof Error ? err.message : "Errore sconosciuto";
    await db
      .insert(feedStatusTable)
      .values({
        source: ANBSC_SOURCE,
        label: ANBSC_LABEL,
        url: ANBSC_URL,
        status: "error",
        error: message,
        lastCheckedAt: now,
      })
      .onConflictDoUpdate({
        target: feedStatusTable.source,
        set: { status: "error", error: message, lastCheckedAt: now },
      });
    throw err;
  }
}

// Geolocalizza i beni privi di coordinate usando il geocoder condiviso. Non
// tocca mai i beni con posizione manuale (geoManual) e processa solo quelli mai
// tentati (geoSource IS NULL), come per i contratti ANAC. L'indirizzo del bene
// è la fonte principale per il geocoding.
export async function runConfiscatedAssetsGeocoding(
  limit = 25,
): Promise<{ attempted: number; located: number; toVerify: number }> {
  const rows = await db
    .select({
      id: confiscatedAssetsTable.id,
      denominazione: confiscatedAssetsTable.denominazione,
      indirizzo: confiscatedAssetsTable.indirizzo,
    })
    .from(confiscatedAssetsTable)
    .where(
      and(
        isNull(confiscatedAssetsTable.latitude),
        isNull(confiscatedAssetsTable.geoSource),
        eq(confiscatedAssetsTable.geoManual, false),
      ),
    )
    .limit(limit);

  if (rows.length === 0) return { attempted: 0, located: 0, toVerify: 0 };

  logger.info(
    { source: ANBSC_SOURCE, count: rows.length },
    "Starting confiscated assets geocoding pass",
  );

  let located = 0;
  let toVerify = 0;
  for (const a of rows) {
    let result = null;
    try {
      result = await geocodeContractText(a.denominazione, a.indirizzo);
    } catch (err) {
      logger.warn({ err, id: a.id }, "Geocoding failed for confiscated asset");
    }
    if (result) {
      await db
        .update(confiscatedAssetsTable)
        .set({
          latitude: result.latitude.toFixed(7),
          longitude: result.longitude.toFixed(7),
          geoAddress: result.geoAddress || null,
          geoQuartiere: result.geoQuartiere,
          geoSource: "auto",
          geoVerify: result.approximate,
        })
        .where(eq(confiscatedAssetsTable.id, a.id));
      located += 1;
      if (result.approximate) toVerify += 1;
    } else {
      await db
        .update(confiscatedAssetsTable)
        .set({ geoSource: "auto", geoVerify: true })
        .where(eq(confiscatedAssetsTable.id, a.id));
      toVerify += 1;
    }
  }

  logger.info(
    { source: ANBSC_SOURCE, attempted: rows.length, located, toVerify },
    "Confiscated assets geocoding pass complete",
  );
  return { attempted: rows.length, located, toVerify };
}

// Esposto per riutilizzo/test: elenco degli stati ammessi.
export { CONFISCATED_ASSET_STATUSES };
