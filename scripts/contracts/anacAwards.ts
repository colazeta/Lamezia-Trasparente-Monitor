export const ANAC_AWARDS_SCHEMA_VERSION = "anac-awards.v1";
export const ANAC_AWARDS_DATASET_URL =
  "https://dati.anticorruzione.it/opendata/dataset/aggiudicazioni";

export interface AnacAwardRecord {
  cig: string;
  numberOfTenderers: number | null;
  admittedOffers: number | null;
  excludedOffers: number | null;
  awardDate: string | null;
  awardAmount: number | null;
  outcome: string | null;
  sourceArchiveUrl: string;
  acquiredAt: string;
}

export interface AnacAwardsSnapshot {
  schemaVersion: typeof ANAC_AWARDS_SCHEMA_VERSION;
  generatedAt: string;
  source: {
    id: "anac-open-data-aggiudicazioni";
    label: string;
    datasetUrl: typeof ANAC_AWARDS_DATASET_URL;
    archiveUrl: string;
  };
  trackedCigs: string[];
  recordsScanned: number;
  records: AnacAwardRecord[];
  limitations: string[];
}

export interface ParsedAnacAwardsCsv {
  recordsScanned: number;
  records: AnacAwardRecord[];
}

export function parseAnacAwardsCsv(
  csv: string,
  trackedCigs: ReadonlySet<string>,
  source: { url: string; acquiredAt: string },
): ParsedAnacAwardsCsv {
  const rows = parseDelimited(csv);
  if (rows.length === 0) throw new Error("ANAC Aggiudicazioni CSV is empty");
  const headers = rows[0].map(normalizeHeader);
  const idx = resolveIndexes(headers);
  const records = new Map<string, AnacAwardRecord>();
  let recordsScanned = 0;

  for (const row of rows.slice(1)) {
    if (row.every((value) => !value.trim())) continue;
    recordsScanned += 1;
    const cig = clean(row[idx.cig]).toUpperCase();
    if (!trackedCigs.has(cig)) continue;
    const next: AnacAwardRecord = {
      cig,
      numberOfTenderers: parseNonNegativeInteger(row[idx.numberOfTenderers]),
      admittedOffers: parseNonNegativeInteger(row[idx.admittedOffers]),
      excludedOffers: parseNonNegativeInteger(row[idx.excludedOffers]),
      awardDate: parseDate(row[idx.awardDate]),
      awardAmount: parseAmount(row[idx.awardAmount]),
      outcome: nullable(row[idx.outcome]),
      sourceArchiveUrl: source.url,
      acquiredAt: source.acquiredAt,
    };
    records.set(cig, chooseMoreComplete(records.get(cig), next));
  }

  return { recordsScanned, records: [...records.values()].sort((a, b) => a.cig.localeCompare(b.cig)) };
}

export function buildAnacAwardsSnapshot(input: {
  generatedAt: string;
  trackedCigs: string[];
  archiveUrl: string;
  parsed: ParsedAnacAwardsCsv;
}): AnacAwardsSnapshot {
  return {
    schemaVersion: ANAC_AWARDS_SCHEMA_VERSION,
    generatedAt: input.generatedAt,
    source: {
      id: "anac-open-data-aggiudicazioni",
      label: "ANAC open data — Aggiudicazioni",
      datasetUrl: ANAC_AWARDS_DATASET_URL,
      archiveUrl: input.archiveUrl,
    },
    trackedCigs: [...new Set(input.trackedCigs)].sort(),
    recordsScanned: input.parsed.recordsScanned,
    records: input.parsed.records,
    limitations: [
      "Il numero di offerenti proviene dal campo ANAC num_imprese_offerenti e non viene ricostruito dal numero di offerte ammesse.",
      "Il dataset Aggiudicazioni descrive l'esito della procedura; non contiene necessariamente l'identita dei singoli partecipanti.",
      "L'assenza di un CIG nel file consultato non prova l'assenza di un'aggiudicazione nella BDNCP.",
    ],
  };
}

export function awardRecordByCig(snapshot: AnacAwardsSnapshot): ReadonlyMap<string, AnacAwardRecord> {
  return new Map(snapshot.records.map((record) => [record.cig, record] as const));
}

function chooseMoreComplete(previous: AnacAwardRecord | undefined, next: AnacAwardRecord): AnacAwardRecord {
  if (!previous) return next;
  const score = (value: AnacAwardRecord) => [
    value.numberOfTenderers,
    value.admittedOffers,
    value.excludedOffers,
    value.awardDate,
    value.awardAmount,
    value.outcome,
  ].filter((item) => item !== null).length;
  return score(next) >= score(previous) ? next : previous;
}

function resolveIndexes(headers: string[]) {
  const find = (...aliases: string[]) => {
    for (const alias of aliases) {
      const index = headers.indexOf(alias);
      if (index !== -1) return index;
    }
    return -1;
  };
  const cig = find("cig", "codice_cig");
  const numberOfTenderers = find("num_imprese_offerenti", "numero_imprese_offerenti");
  if (cig === -1) throw new Error("ANAC Aggiudicazioni CSV has no CIG column");
  if (numberOfTenderers === -1) throw new Error("ANAC Aggiudicazioni CSV has no num_imprese_offerenti column");
  return {
    cig,
    numberOfTenderers,
    admittedOffers: find("numero_offerte_ammesse", "num_offerte_ammesse"),
    excludedOffers: find("numero_offerte_escluse", "num_offerte_escluse"),
    awardDate: find("data_aggiudicazione_definitiva", "data_aggiudicazione"),
    awardAmount: find("importo_aggiudicazione"),
    outcome: find("esito"),
  };
}

function parseDelimited(input: string): string[][] {
  const delimiter = detectDelimiter(input.split(/\r?\n/u, 1)[0] ?? "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"' && input[i + 1] === '"') { field += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else field += ch;
      continue;
    }
    if (ch === '"' && field.length === 0) quoted = true;
    else if (ch === delimiter) { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && input[i + 1] === "\n") i += 1;
      row.push(field); field = ""; rows.push(row); row = [];
    } else field += ch;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  if (quoted) throw new Error("ANAC Aggiudicazioni CSV contains an unclosed quote");
  return rows;
}

function detectDelimiter(header: string): string {
  const candidates = [";", ",", "\t"].map((value) => ({ value, count: header.split(value).length - 1 }));
  candidates.sort((a, b) => b.count - a.count);
  if (candidates[0].count === 0) throw new Error("ANAC Aggiudicazioni CSV delimiter cannot be detected");
  return candidates[0].value;
}

function normalizeHeader(value: string): string {
  return value.replace(/^\uFEFF/u, "").normalize("NFD").replace(/[\u0300-\u036f]/gu, "").trim().toLowerCase().replace(/[^a-z0-9]+/gu, "_").replace(/^_+|_+$/gu, "");
}
function clean(value: string | undefined): string { return value?.replace(/\s+/gu, " ").trim() ?? ""; }
function nullable(value: string | undefined): string | null { return clean(value) || null; }
function parseNonNegativeInteger(value: string | undefined): number | null {
  const raw = clean(value);
  if (!/^\d+$/u.test(raw)) return null;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}
function parseAmount(value: string | undefined): number | null {
  let raw = clean(value).replace(/[€\s]/gu, "").replace(/[^0-9,.-]/gu, "");
  if (!raw) return null;
  const comma = raw.lastIndexOf(","); const dot = raw.lastIndexOf(".");
  if (comma > dot) raw = raw.replace(/\./gu, "").replace(",", ".");
  else if (dot > comma && comma !== -1) raw = raw.replace(/,/gu, "");
  else if (comma !== -1) raw = raw.replace(",", ".");
  const parsed = Number(raw); return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
function parseDate(value: string | undefined): string | null {
  const raw = clean(value);
  if (!raw) return null;
  const italian = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/u.exec(raw);
  if (italian) return `${italian[3]}-${italian[2].padStart(2, "0")}-${italian[1].padStart(2, "0")}`;
  const iso = /^\d{4}-\d{2}-\d{2}$/u.test(raw) ? raw : null;
  return iso && !Number.isNaN(Date.parse(`${iso}T00:00:00Z`)) ? iso : null;
}
