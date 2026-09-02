import {
  ANAC_BDNCP_PUBLIC_LIMITATIONS,
  ANAC_BDNCP_SYNC_SCHEMA_VERSION,
  ANAC_CIG_DELTA_DATASET_URL,
  ANAC_OPEN_DATA_CATALOG_URL,
  ANAC_BDNCP_PUBLICITY_URL,
  type AnacBdncpFailureCategory,
  type AnacBdncpRecord,
  type AnacBdncpSyncSnapshot,
} from "../../artifacts/lamezia-trasparente/src/lib/anacBdncpSync";

export const ANAC_CIG_ARCHIVE_BASE_URL =
  "https://dati.anticorruzione.it/opendata/download/dataset/cig/filesystem";

export interface AnacArchiveCandidate {
  period: string;
  url: string;
}

export interface ParsedAnacCsv {
  recordsScanned: number;
  records: AnacBdncpRecord[];
}

export interface SuccessfulArchiveSync {
  period: string;
  url: string;
  retrievedAt: string;
  recordsScanned: number;
  records: AnacBdncpRecord[];
}

export function buildAnacCigArchiveCandidates(
  referenceDate: Date,
  lookbackMonths: number,
): AnacArchiveCandidate[] {
  if (Number.isNaN(referenceDate.getTime())) {
    throw new Error("A valid reference date is required");
  }
  if (
    !Number.isInteger(lookbackMonths) ||
    lookbackMonths < 1 ||
    lookbackMonths > 60
  ) {
    throw new Error("lookbackMonths must be an integer between 1 and 60");
  }

  return Array.from({ length: lookbackMonths }, (_, index) => {
    const month = new Date(
      Date.UTC(
        referenceDate.getUTCFullYear(),
        referenceDate.getUTCMonth() - index,
        1,
      ),
    );
    const year = String(month.getUTCFullYear());
    const numericMonth = String(month.getUTCMonth() + 1).padStart(2, "0");
    const period = `${year}-${numericMonth}`;
    return {
      period,
      url: `${ANAC_CIG_ARCHIVE_BASE_URL}/${year}${numericMonth}01-cig_csv.zip`,
    };
  });
}

export function parseAnacCigCsv(
  csv: string,
  trackedCigs: ReadonlySet<string>,
  source: { url: string; period: string; acquiredAt: string },
): ParsedAnacCsv {
  const matcher = new AnacCsvMatcher(trackedCigs, source);
  matcher.push(csv);
  return matcher.finish();
}

export class AnacCsvMatcher {
  private parser: DelimitedTextParser | null = null;
  private prefix = "";
  private headers: string[] | null = null;
  private indexes: ReturnType<typeof resolveIndexes> | null = null;
  private recordsScanned = 0;
  private readonly records = new Map<string, AnacBdncpRecord>();

  constructor(
    private readonly trackedCigs: ReadonlySet<string>,
    private readonly source: {
      url: string;
      period: string;
      acquiredAt: string;
    },
  ) {}

  push(chunk: string): void {
    if (!chunk) return;
    if (this.parser) {
      this.parser.push(chunk);
      return;
    }

    this.prefix += chunk;
    const headerEnd = firstRecordEnd(this.prefix);
    if (headerEnd === -1) {
      if (this.prefix.length > 1_000_000) {
        throw new Error("ANAC CSV header exceeds the safety limit");
      }
      return;
    }

    const delimiter = detectDelimiter(this.prefix.slice(0, headerEnd));
    this.parser = new DelimitedTextParser(delimiter, (row) =>
      this.consumeRow(row),
    );
    this.parser.push(this.prefix);
    this.prefix = "";
  }

  finish(): ParsedAnacCsv {
    if (!this.parser) {
      if (!this.prefix.trim()) {
        throw new Error("ANAC CSV is empty");
      }
      const delimiter = detectDelimiter(this.prefix);
      this.parser = new DelimitedTextParser(delimiter, (row) =>
        this.consumeRow(row),
      );
      this.parser.push(this.prefix);
      this.prefix = "";
    }
    this.parser.finish();
    if (!this.headers || !this.indexes) {
      throw new Error("ANAC CSV has no usable header");
    }
    return {
      recordsScanned: this.recordsScanned,
      records: Array.from(this.records.values()).sort((a, b) =>
        a.cig.localeCompare(b.cig),
      ),
    };
  }

  private consumeRow(row: string[]): void {
    if (!this.headers) {
      this.headers = row.map(normalizeHeader);
      this.indexes = resolveIndexes(this.headers);
      return;
    }
    if (row.every((value) => value.trim() === "")) return;
    this.recordsScanned += 1;
    if (!this.indexes) return;

    const cig = cleanCell(row[this.indexes.cig]).toUpperCase();
    if (!this.trackedCigs.has(cig)) return;

    const next: AnacBdncpRecord = {
      cig,
      title: nullableCell(row[this.indexes.title]),
      contractingAuthority: nullableCell(row[this.indexes.authority]),
      contractingAuthorityCode: nullableCell(row[this.indexes.authorityCode]),
      contractingAuthorityTaxId: nullableCell(row[this.indexes.authorityTaxId]),
      tenderAmount: parseAnacAmount(row[this.indexes.amount]),
      procedureType: nullableCell(row[this.indexes.procedure]),
      procedureCode: nullableCell(row[this.indexes.procedureCode]),
      publicationDate: parseAnacDate(row[this.indexes.publicationDate]),
      submissionDeadline: parseAnacDate(row[this.indexes.submissionDeadline]),
      cpvCode: nullableCell(row[this.indexes.cpvCode]),
      cpvDescription: nullableCell(row[this.indexes.cpvDescription]),
      cpvIsPrimary: parseAnacBoolean(row[this.indexes.cpvIsPrimary]),
      outcomeCode: nullableCell(row[this.indexes.outcomeCode]),
      outcome: nullableCell(row[this.indexes.outcome]),
      outcomeDate: parseAnacDate(row[this.indexes.outcomeDate]),
      recordId: nullableCell(row[this.indexes.recordId]),
      sourceArchiveUrl: this.source.url,
      sourcePeriod: this.source.period,
      acquiredAt: this.source.acquiredAt,
    };
    const previous = this.records.get(cig);
    this.records.set(cig, previous ? mergeAnacRows(previous, next) : next);
  }
}

export function mergeAnacSyncAttempt(input: {
  previous: AnacBdncpSyncSnapshot;
  trackedCigs: string[];
  attemptedAt: string;
  lookbackMonths: number;
  attemptedArchives: number;
  unavailableArchives: number;
  successfulArchives: SuccessfulArchiveSync[];
  failureCategory: AnacBdncpFailureCategory;
}): AnacBdncpSyncSnapshot {
  const trackedCigs = Array.from(new Set(input.trackedCigs)).sort();
  const trackedSet = new Set(trackedCigs);
  const records = new Map(
    input.previous.records
      .filter((record) => trackedSet.has(record.cig))
      .map((record) => [record.cig, record] as const),
  );

  for (const archive of [...input.successfulArchives].reverse()) {
    for (const record of archive.records) {
      if (trackedSet.has(record.cig)) records.set(record.cig, record);
    }
  }

  const hasFreshArchive = input.successfulArchives.length > 0;
  return {
    schemaVersion: ANAC_BDNCP_SYNC_SCHEMA_VERSION,
    generatedAt: input.attemptedAt,
    status: hasFreshArchive
      ? "current"
      : input.previous.lastSuccessAt
        ? "stale"
        : "degraded",
    lastAttemptAt: input.attemptedAt,
    lastSuccessAt: hasFreshArchive
      ? input.attemptedAt
      : input.previous.lastSuccessAt,
    failureCategory: hasFreshArchive ? null : input.failureCategory,
    source: {
      id: "anac-open-data-cig-delta",
      label: "ANAC open data — aggiornamenti CIG",
      datasetUrl: ANAC_CIG_DELTA_DATASET_URL,
      catalogUrl: ANAC_OPEN_DATA_CATALOG_URL,
      bdncpUrl: ANAC_BDNCP_PUBLICITY_URL,
      format: "csv-in-zip",
      lookbackMonths: input.lookbackMonths,
    },
    attemptedArchives: input.attemptedArchives,
    unavailableArchives: input.unavailableArchives,
    trackedCigs,
    consultedArchives: hasFreshArchive
      ? input.successfulArchives.map((archive) => ({
          period: archive.period,
          url: archive.url,
          retrievedAt: archive.retrievedAt,
          recordsScanned: archive.recordsScanned,
          matchedRecords: archive.records.length,
        }))
      : input.previous.consultedArchives,
    records: Array.from(records.values()).sort((a, b) =>
      a.cig.localeCompare(b.cig),
    ),
    limitations: [...ANAC_BDNCP_PUBLIC_LIMITATIONS],
  };
}

function mergeAnacRows(
  previous: AnacBdncpRecord,
  next: AnacBdncpRecord,
): AnacBdncpRecord {
  const preferNextPrimary = next.cpvIsPrimary === true;
  const preservePreviousPrimary =
    previous.cpvIsPrimary === true && next.cpvIsPrimary !== true;
  const cpvSource = preferNextPrimary
    ? next
    : preservePreviousPrimary
      ? previous
      : next.cpvCode
        ? next
        : previous;

  return {
    cig: previous.cig,
    title: next.title ?? previous.title,
    contractingAuthority:
      next.contractingAuthority ?? previous.contractingAuthority,
    contractingAuthorityCode:
      next.contractingAuthorityCode ?? previous.contractingAuthorityCode,
    contractingAuthorityTaxId:
      next.contractingAuthorityTaxId ?? previous.contractingAuthorityTaxId,
    tenderAmount: next.tenderAmount ?? previous.tenderAmount,
    procedureType: next.procedureType ?? previous.procedureType,
    procedureCode: next.procedureCode ?? previous.procedureCode,
    publicationDate: next.publicationDate ?? previous.publicationDate,
    submissionDeadline:
      next.submissionDeadline ?? previous.submissionDeadline,
    cpvCode: cpvSource.cpvCode,
    cpvDescription: cpvSource.cpvDescription,
    cpvIsPrimary: cpvSource.cpvIsPrimary,
    outcomeCode: next.outcomeCode ?? previous.outcomeCode,
    outcome: next.outcome ?? previous.outcome,
    outcomeDate: next.outcomeDate ?? previous.outcomeDate,
    recordId: next.recordId ?? previous.recordId,
    sourceArchiveUrl: next.sourceArchiveUrl,
    sourcePeriod: next.sourcePeriod,
    acquiredAt: next.acquiredAt,
  };
}

class DelimitedTextParser {
  private row: string[] = [];
  private field = "";
  private inQuotes = false;
  private afterQuote = false;
  private skipLf = false;

  constructor(
    private readonly delimiter: string,
    private readonly onRow: (row: string[]) => void,
  ) {}

  push(chunk: string): void {
    for (const character of chunk) {
      if (this.skipLf) {
        this.skipLf = false;
        if (character === "\n") continue;
      }

      if (this.inQuotes) {
        if (this.afterQuote) {
          if (character === '"') {
            this.field += '"';
            this.afterQuote = false;
            continue;
          }
          this.inQuotes = false;
          this.afterQuote = false;
        } else if (character === '"') {
          this.afterQuote = true;
          continue;
        } else {
          this.field += character;
          continue;
        }
      }

      if (character === '"' && this.field.length === 0) {
        this.inQuotes = true;
      } else if (character === this.delimiter) {
        this.row.push(this.field);
        this.field = "";
      } else if (character === "\r" || character === "\n") {
        this.row.push(this.field);
        this.field = "";
        this.onRow(this.row);
        this.row = [];
        this.skipLf = character === "\r";
      } else {
        this.field += character;
      }
    }
  }

  finish(): void {
    if (this.afterQuote) {
      this.afterQuote = false;
      this.inQuotes = false;
    }
    if (this.inQuotes) throw new Error("ANAC CSV contains an unclosed quote");
    if (this.field.length > 0 || this.row.length > 0) {
      this.row.push(this.field);
      this.onRow(this.row);
    }
  }
}

function firstRecordEnd(value: string): number {
  let inQuotes = false;
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === '"') {
      if (inQuotes && value[index + 1] === '"') {
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (!inQuotes && (value[index] === "\r" || value[index] === "\n")) {
      return index;
    }
  }
  return -1;
}

function detectDelimiter(header: string): string {
  const candidates = [";", ",", "\t"];
  const counts = candidates.map((candidate) => ({
    candidate,
    count: header.split(candidate).length - 1,
  }));
  counts.sort((a, b) => b.count - a.count);
  if (counts[0].count === 0) {
    throw new Error("ANAC CSV delimiter cannot be detected");
  }
  return counts[0].candidate;
}

function resolveIndexes(headers: string[]) {
  const index = (...aliases: string[]) => {
    for (const alias of aliases) {
      const found = headers.indexOf(alias);
      if (found !== -1) return found;
    }
    return -1;
  };
  const cig = index("cig", "codice_cig", "cig_lotto");
  if (cig === -1) throw new Error("ANAC CSV has no CIG column");
  return {
    cig,
    title: index("oggetto_lotto", "oggetto", "oggetto_gara"),
    authority: index(
      "denominazione_amministrazione_appaltante",
      "stazione_appaltante",
      "denominazione_sa",
      "amministrazione_appaltante",
    ),
    authorityCode: index("codice_ausa", "cod_ausa"),
    authorityTaxId: index(
      "cf_amministrazione_appaltante",
      "codice_fiscale_stazione_appaltante",
      "cf_stazione_appaltante",
    ),
    amount: index("importo_lotto", "importo", "importo_base_asta"),
    procedure: index(
      "tipo_scelta_contraente",
      "scelta_contraente",
      "tipo_procedura",
      "procedura",
      "modalita_realizzazione",
    ),
    procedureCode: index(
      "cod_tipo_scelta_contraente",
      "codice_tipo_scelta_contraente",
      "cod_tipo_procedura",
    ),
    publicationDate: index(
      "data_pubblicazione",
      "data_pubblicazione_gara",
      "data_pubblicazione_bando",
    ),
    submissionDeadline: index(
      "data_scadenza_offerta",
      "data_scadenza_offerte",
      "data_scadenza_bando",
    ),
    cpvCode: index("cod_cpv", "codice_cpv", "cpv"),
    cpvDescription: index("descrizione_cpv", "desc_cpv"),
    cpvIsPrimary: index("flag_prevalente", "cpv_prevalente"),
    outcomeCode: index("cod_esito", "codice_esito"),
    outcome: index("esito", "descrizione_esito"),
    outcomeDate: index(
      "data_comunicazione_esito",
      "data_esito",
      "data_aggiudicazione_definitiva",
    ),
    recordId: index("id_gara", "numero_gara", "id_lotto", "lot_id"),
  };
}

function normalizeHeader(value: string): string {
  return value
    .replace(/^\uFEFF/u, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "_")
    .replace(/^_+|_+$/gu, "");
}

function cleanCell(value: string | undefined): string {
  return value?.replace(/\s+/gu, " ").trim() ?? "";
}

function nullableCell(value: string | undefined): string | null {
  const cleaned = cleanCell(value);
  return cleaned || null;
}

function parseAnacAmount(value: string | undefined): number | null {
  let cleaned = cleanCell(value)
    .replace(/[€\s]/gu, "")
    .replace(/[^0-9,.-]/gu, "");
  if (!cleaned) return null;
  const comma = cleaned.lastIndexOf(",");
  const dot = cleaned.lastIndexOf(".");
  if (comma > dot) {
    cleaned = cleaned.replace(/\./gu, "").replace(",", ".");
  } else if (dot > comma && comma !== -1) {
    cleaned = cleaned.replace(/,/gu, "");
  } else if (comma !== -1) {
    cleaned = cleaned.replace(",", ".");
  }
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseAnacDate(value: string | undefined): string | null {
  const cleaned = cleanCell(value);
  if (!cleaned) return null;
  const italian = /^(\d{2})\/(\d{2})\/(\d{4})(.*)$/u.exec(cleaned);
  const normalized = italian
    ? `${italian[3]}-${italian[2]}-${italian[1]}${italian[4]}`
    : cleaned;
  return Number.isNaN(Date.parse(normalized)) ? null : normalized;
}

function parseAnacBoolean(value: string | undefined): boolean | null {
  const cleaned = cleanCell(value).toUpperCase();
  if (["1", "S", "SI", "TRUE", "Y", "YES"].includes(cleaned)) return true;
  if (["0", "N", "NO", "FALSE"].includes(cleaned)) return false;
  return null;
}
