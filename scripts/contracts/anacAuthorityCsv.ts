import type { AnacBdncpRecord } from "../../artifacts/lamezia-trasparente/src/lib/anacBdncpSync";

export interface ParsedAnacAuthorityCsv {
  recordsScanned: number;
  records: AnacBdncpRecord[];
}

export class AnacAuthorityCsvMatcher {
  private parser: DelimitedTextParser | null = null;
  private prefix = "";
  private headers: string[] | null = null;
  private indexes: ReturnType<typeof resolveIndexes> | null = null;
  private recordsScanned = 0;
  private readonly records = new Map<string, AnacBdncpRecord>();
  private readonly targetTaxId: string;

  constructor(
    authorityTaxId: string,
    private readonly source: {
      url: string;
      period: string;
      acquiredAt: string;
    },
  ) {
    this.targetTaxId = normalizeTaxId(authorityTaxId);
    if (!this.targetTaxId) {
      throw new Error("ANAC authority matcher requires a tax id");
    }
  }

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

  finish(): ParsedAnacAuthorityCsv {
    if (!this.parser) {
      if (!this.prefix.trim()) throw new Error("ANAC CSV is empty");
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

    const authorityTaxId = normalizeTaxId(row[this.indexes.authorityTaxId]);
    if (authorityTaxId !== this.targetTaxId) return;

    const cig = cleanCell(row[this.indexes.cig]).toUpperCase();
    if (!/^[A-Z0-9]{10}$/u.test(cig)) return;

    const next: AnacBdncpRecord = {
      cig,
      title: nullableCell(row[this.indexes.title]),
      contractingAuthority: nullableCell(row[this.indexes.authority]),
      contractingAuthorityCode: nullableCell(row[this.indexes.authorityCode]),
      contractingAuthorityTaxId: authorityTaxId,
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
    this.records.set(cig, previous ? mergeRows(previous, next) : next);
  }
}

export function parseAnacAuthorityCsv(
  csv: string,
  authorityTaxId: string,
  source: { url: string; period: string; acquiredAt: string },
): ParsedAnacAuthorityCsv {
  const matcher = new AnacAuthorityCsvMatcher(authorityTaxId, source);
  matcher.push(csv);
  return matcher.finish();
}

export function mergeAuthorityRecords(
  previous: AnacBdncpRecord,
  next: AnacBdncpRecord,
): AnacBdncpRecord {
  const newer = next.sourcePeriod >= previous.sourcePeriod ? next : previous;
  const older = newer === next ? previous : next;
  return mergeRows(older, newer);
}

function mergeRows(
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
  const authorityTaxId = index(
    "cf_amministrazione_appaltante",
    "codice_fiscale_stazione_appaltante",
    "cf_stazione_appaltante",
  );
  if (cig === -1) throw new Error("ANAC CSV has no CIG column");
  if (authorityTaxId === -1) {
    throw new Error("ANAC CSV has no contracting-authority tax-id column");
  }
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
    authorityTaxId,
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

function normalizeTaxId(value: string | undefined): string {
  return cleanCell(value).replace(/[^A-Z0-9]/giu, "").toUpperCase();
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
