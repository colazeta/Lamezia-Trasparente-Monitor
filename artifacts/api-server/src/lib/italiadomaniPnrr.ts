import {
  db,
  italiadomaniProjectsTable,
  feedStatusTable,
  type InsertItaliadomaniProject,
} from "@workspace/db";
import { logger } from "./logger";

export const ITALIADOMANI_SOURCE = "italiadomani-pnrr-lamezia";
export const ITALIADOMANI_LABEL =
  "Censimento PNRR – Italia Domani (Comune di Lamezia Terme)";

const USER_AGENT = "rendiamoLameziaTrasparente/1.0";
const COMUNE_ISTAT = "079160";
const COMUNE_NAME = "LAMEZIA TERME";

// ---------- OpenPNRR API (lightweight, paginated, fallback-first in env) ---

interface OpenPnrrProject {
  cup?: string;
  clp?: string;
  titolo?: string;
  title?: string;
  missione?: string;
  componente?: string;
  investimento?: string;
  soggetto_titolare?: string;
  soggetto_attuatore?: string;
  importo_totale?: number | string | null;
  stato?: string;
  data_inizio?: string | null;
  data_fine?: string | null;
  data_aggiornamento?: string | null;
  aggiornamento?: string | null;
}

interface OpenPnrrResponse {
  count?: number;
  next?: string | null;
  results?: OpenPnrrProject[];
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json() as Promise<T>;
}

function parseISODate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseImporto(v: number | string | null | undefined): string | null {
  if (v == null) return null;
  if (typeof v === "number") {
    return v > 0 ? v.toFixed(2) : null;
  }
  const s = String(v).trim().replace(/[€$\s]/g, "");
  if (!s) return null;

  // Determine numeric format by position of last comma vs last dot.
  // Italian format: thousands=".", decimal="," → "1.234.567,89"
  // US/ISO format:  thousands=",", decimal="." → "1,234,567.89"
  let normalized: string;
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");

  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) {
      // Comma is the decimal separator (Italian) → remove dots, replace comma with dot
      normalized = s.replace(/\./g, "").replace(",", ".");
    } else {
      // Dot is the decimal separator (US) → remove commas
      normalized = s.replace(/,/g, "");
    }
  } else if (lastComma !== -1) {
    // Only commas present; if it follows the pattern NNN,NN it's a decimal comma
    const afterComma = s.slice(lastComma + 1);
    if (afterComma.length <= 2) {
      normalized = s.replace(/,/, ".");
    } else {
      normalized = s.replace(/,/g, "");
    }
  } else if (lastDot !== -1) {
    // Only dots present; multiple dots → thousand separators
    const dotCount = (s.match(/\./g) ?? []).length;
    if (dotCount > 1) {
      normalized = s.replace(/\./g, "");
    } else {
      normalized = s;
    }
  } else {
    normalized = s;
  }

  const n = Number(normalized);
  if (Number.isNaN(n) || n <= 0) return null;
  return n.toFixed(2);
}

function normalizeCup(v: string | undefined | null): string | null {
  if (!v) return null;
  const s = v.toUpperCase().replace(/\s+/g, "");
  if (s.length < 8) return null;
  return s;
}

function mapOpenPnrrProject(p: OpenPnrrProject): InsertItaliadomaniProject | null {
  const cup = normalizeCup(p.cup);
  if (!cup) return null;
  const title = p.titolo ?? p.title ?? cup;
  if (!title) return null;
  return {
    cup,
    clp: p.clp ?? null,
    title,
    mission: p.missione ?? null,
    component: p.componente ?? null,
    investment: p.investimento ?? null,
    holder: p.soggetto_titolare ?? null,
    attuatore: p.soggetto_attuatore ?? null,
    importoFinanziato: parseImporto(p.importo_totale),
    status: p.stato ?? null,
    startDate: parseISODate(p.data_inizio),
    endDate: parseISODate(p.data_fine),
    italiadomaniUpdatedAt:
      parseISODate(p.data_aggiornamento) ??
      parseISODate(p.aggiornamento),
  };
}

async function fetchFromOpenPnrr(): Promise<InsertItaliadomaniProject[]> {
  const projects: InsertItaliadomaniProject[] = [];

  // Try paginated API endpoint for municipality.
  // OpenPNRR (Openpolis) exposes progetti filtered by comune_istat.
  const base = `https://openpnrr.it/api/v1/localizzazioni/?comune_istat=${COMUNE_ISTAT}&format=json&page_size=200`;
  let url: string | null = base;
  let pages = 0;

  while (url && pages < 20) {
    pages += 1;
    const data: OpenPnrrResponse = await fetchJson<OpenPnrrResponse>(url);
    const results = data.results ?? [];
    for (const item of results) {
      const p = mapOpenPnrrProject(item);
      if (p) projects.push(p);
    }
    url = data.next ?? null;
  }

  // If the localizzazioni endpoint returned nothing try the progetti endpoint.
  if (projects.length === 0) {
    const base2 = `https://openpnrr.it/api/v1/progetti/?comune_istat=${COMUNE_ISTAT}&format=json&page_size=200`;
    let url2: string | null = base2;
    let pages2 = 0;
    while (url2 && pages2 < 20) {
      pages2 += 1;
      const data: OpenPnrrResponse = await fetchJson<OpenPnrrResponse>(url2);
      const results = data.results ?? [];
      for (const item of results) {
        const p = mapOpenPnrrProject(item);
        if (p) projects.push(p);
      }
      url2 = data.next ?? null;
    }
  }

  return projects;
}

// ---------- Italia Domani CSV streaming ----------------------------------
//
// Two CSVs are joined by CUP:
//   1. Localizzazione (~64 MB): CUP + comune → filter for LAMEZIA TERME
//   2. Progetti (~370 MB): CUP + anagrafica
//
// Strategy: stream Localizzazione first to build a Set<CUP>, then stream
// Progetti and emit only rows whose CUP is in that Set.

// Direct download URLs provided by the Italia Domani open-data CKAN catalog.
// (These mirror the canonical dataset, may change if the catalog updates.)
const ITALIADOMANI_LOC_URL =
  process.env.ITALIADOMANI_LOC_CSV_URL ??
  "https://www.italiadomani.gov.it/content/dam/italiadomani/opendata/localizzazione-dei-progetti-del-pnrr/localizzazione-progetti-pnrr.csv";
const ITALIADOMANI_PROJ_URL =
  process.env.ITALIADOMANI_PROJ_CSV_URL ??
  "https://www.italiadomani.gov.it/content/dam/italiadomani/opendata/Progetti_del_PNRR/Progetti_PNRR.csv";

function detectDelimiter(header: string): string {
  const semi = (header.match(/;/g) ?? []).length;
  const comma = (header.match(/,/g) ?? []).length;
  return semi >= comma ? ";" : ",";
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQ = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQ = true;
    } else if (ch === delimiter) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

async function streamCsvLines(
  url: string,
  onLine: (fields: string[], headers: string[]) => void,
): Promise<void> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(300_000),
  });
  if (!res.ok) throw new Error(`CSV fetch failed: HTTP ${res.status}`);
  if (!res.body) throw new Error("No response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let remainder = "";
  let delimiter = ";";
  let headers: string[] = [];

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const raw = remainder + chunk;
    const lines = raw.split("\n");
    remainder = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.replace(/\r$/, "");
      if (!trimmed) continue;
      if (headers.length === 0) {
        // Strip UTF-8 BOM if present
        const clean = trimmed.replace(/^\uFEFF/, "");
        delimiter = detectDelimiter(clean);
        headers = parseCsvLine(clean, delimiter);
        continue;
      }
      onLine(parseCsvLine(trimmed, delimiter), headers);
    }
  }

  if (remainder) {
    const trimmed = remainder.replace(/\r$/, "");
    if (trimmed && headers.length > 0) {
      onLine(parseCsvLine(trimmed, delimiter), headers);
    }
  }
}

function col(fields: string[], headers: string[], name: string): string {
  const idx = headers.findIndex(
    (h) => h.toLowerCase().replace(/\s+/g, "_") === name.toLowerCase().replace(/\s+/g, "_"),
  );
  return idx >= 0 ? (fields[idx] ?? "").trim() : "";
}

function colAny(fields: string[], headers: string[], ...names: string[]): string {
  for (const n of names) {
    const v = col(fields, headers, n);
    if (v) return v;
  }
  return "";
}

async function fetchFromItaliadomani(): Promise<InsertItaliadomaniProject[]> {
  // Step 1: collect CUPs for Lamezia Terme from localizzazione CSV.
  const lameziaCups = new Set<string>();
  await streamCsvLines(ITALIADOMANI_LOC_URL, (fields, headers) => {
    const comune = colAny(fields, headers, "comune", "denominazione_comune", "comune_nome").toUpperCase();
    if (!comune.includes(COMUNE_NAME)) return;
    const cup = normalizeCup(colAny(fields, headers, "cup", "codice_cup"));
    if (cup) lameziaCups.add(cup);
  });

  logger.info(
    { count: lameziaCups.size },
    "Italia Domani: found CUPs for Lamezia Terme",
  );

  if (lameziaCups.size === 0) {
    throw new Error("No CUPs found for Lamezia Terme in localizzazione CSV");
  }

  // Step 2: stream progetti CSV and collect rows for those CUPs.
  const byDate = (s: string | null): Date | null => {
    if (!s) return null;
    // ISO date YYYY-MM-DD or DD/MM/YYYY
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return parseISODate(s);
    const m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(s);
    if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), 12);
    return null;
  };

  const projects: InsertItaliadomaniProject[] = [];
  await streamCsvLines(ITALIADOMANI_PROJ_URL, (fields, headers) => {
    const cup = normalizeCup(colAny(fields, headers, "cup", "codice_cup"));
    if (!cup || !lameziaCups.has(cup)) return;
    const title =
      colAny(fields, headers, "titolo", "titolo_progetto", "denominazione") || cup;
    projects.push({
      cup,
      clp: colAny(fields, headers, "clp") || null,
      title,
      mission: colAny(fields, headers, "missione", "codice_missione") || null,
      component: colAny(fields, headers, "componente", "codice_componente") || null,
      investment: colAny(fields, headers, "investimento", "misura") || null,
      holder:
        colAny(fields, headers, "soggetto_titolare", "titolare", "beneficiario") || null,
      attuatore:
        colAny(fields, headers, "soggetto_attuatore", "attuatore") || null,
      importoFinanziato:
        parseImporto(
          colAny(fields, headers, "importo_totale", "finanziamento", "importo_finanziamento"),
        ),
      status:
        colAny(
          fields,
          headers,
          "stato",
          "stato_avanzamento",
          "stato_progetto",
        ) || null,
      startDate: byDate(
        colAny(fields, headers, "data_inizio", "data_avvio") || null,
      ),
      endDate: byDate(
        colAny(fields, headers, "data_fine", "data_conclusione") || null,
      ),
      italiadomaniUpdatedAt: byDate(
        colAny(
          fields,
          headers,
          "data_aggiornamento",
          "aggiornamento",
          "data_ultimo_aggiornamento",
        ) || null,
      ),
    });
  });

  return projects;
}

// ---------- Main ingestion entry point ------------------------------------

export async function runItaliadomaniIngestion(): Promise<{
  total: number;
  upserted: number;
}> {
  logger.info(
    { source: ITALIADOMANI_SOURCE },
    "Starting Italia Domani PNRR ingestion",
  );

  let projects: InsertItaliadomaniProject[] = [];
  let sourceUsed = "italiadomani-csv";

  try {
    // Primary: Italia Domani official CSV (preferred as the authoritative source).
    projects = await fetchFromItaliadomani();
  } catch (csvErr) {
    logger.warn(
      { err: csvErr, source: ITALIADOMANI_SOURCE },
      "Italia Domani CSV fetch failed, falling back to OpenPNRR API",
    );
    try {
      // Fallback: OpenPNRR (Openpolis) – lighter API endpoint for the same data.
      projects = await fetchFromOpenPnrr();
      sourceUsed = "openpnrr";
      if (projects.length === 0) {
        logger.info(
          { source: ITALIADOMANI_SOURCE },
          "OpenPNRR returned no results either",
        );
      }
    } catch (apiErr) {
      logger.error(
        { err: apiErr, source: ITALIADOMANI_SOURCE },
        "OpenPNRR API fallback also failed",
      );
      const now = new Date();
      const message =
        apiErr instanceof Error ? apiErr.message : "Errore sconosciuto";
      await db
        .insert(feedStatusTable)
        .values({
          source: ITALIADOMANI_SOURCE,
          label: ITALIADOMANI_LABEL,
          url: ITALIADOMANI_LOC_URL,
          status: "error",
          error: message,
          lastCheckedAt: now,
        })
        .onConflictDoUpdate({
          target: feedStatusTable.source,
          set: { status: "error", error: message, lastCheckedAt: now },
        });
      throw apiErr;
    }
  }

  const now = new Date();
  let upserted = 0;

  for (const p of projects) {
    await db
      .insert(italiadomaniProjectsTable)
      .values({ ...p, firstSeenAt: now, lastSeenAt: now })
      .onConflictDoUpdate({
        target: italiadomaniProjectsTable.cup,
        set: {
          clp: p.clp,
          title: p.title,
          mission: p.mission,
          component: p.component,
          investment: p.investment,
          holder: p.holder,
          attuatore: p.attuatore,
          importoFinanziato: p.importoFinanziato,
          status: p.status,
          startDate: p.startDate,
          endDate: p.endDate,
          italiadomaniUpdatedAt: p.italiadomaniUpdatedAt,
          lastSeenAt: now,
        },
      });
    upserted += 1;
  }

  const dataUrl =
    sourceUsed === "italiadomani-csv"
      ? ITALIADOMANI_LOC_URL
      : `https://openpnrr.it/territorio/${COMUNE_ISTAT}/`;

  // Zero projects is treated as a degraded/error state: both sources returned
  // data but none of it was usable.  Recording "ok" with 0 items would leave
  // the master table empty and make the /pnrr/projects endpoint silently
  // return an empty census without any visible indication of the problem.
  const feedStatus =
    projects.length === 0
      ? ("degraded" as const)
      : ("ok" as const);
  const feedError =
    projects.length === 0
      ? "Nessun progetto trovato nelle fonti disponibili (Italia Domani + OpenPNRR). La tabella master non è stata aggiornata."
      : null;

  await db
    .insert(feedStatusTable)
    .values({
      source: ITALIADOMANI_SOURCE,
      label: `${ITALIADOMANI_LABEL} (via ${sourceUsed})`,
      url: dataUrl,
      status: feedStatus,
      error: feedError,
      itemsTotal: projects.length,
      itemsNew: upserted,
      lastCheckedAt: now,
      lastUpdatedAt: projects.length > 0 ? now : undefined,
    })
    .onConflictDoUpdate({
      target: feedStatusTable.source,
      set: {
        label: `${ITALIADOMANI_LABEL} (via ${sourceUsed})`,
        url: dataUrl,
        status: feedStatus,
        error: feedError,
        itemsTotal: projects.length,
        itemsNew: upserted,
        lastCheckedAt: now,
        ...(projects.length > 0 ? { lastUpdatedAt: now } : {}),
      },
    });

  logger.info(
    {
      source: ITALIADOMANI_SOURCE,
      total: projects.length,
      upserted,
      sourceUsed,
    },
    "Italia Domani PNRR ingestion complete",
  );
  return { total: projects.length, upserted };
}
