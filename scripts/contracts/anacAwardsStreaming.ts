import type { AnacAwardRecord, ParsedAnacAwardsCsv } from "./anacAwards";

export class AnacAwardsCsvMatcher {
  private parser: DelimitedTextParser | null = null;
  private prefix = "";
  private headers: string[] | null = null;
  private indexes: ReturnType<typeof resolveIndexes> | null = null;
  private recordsScanned = 0;
  private readonly records = new Map<string, AnacAwardRecord>();

  constructor(
    private readonly trackedCigs: ReadonlySet<string>,
    private readonly source: { url: string; acquiredAt: string },
  ) {}

  push(chunk: string): void {
    if (!chunk) return;
    if (this.parser) { this.parser.push(chunk); return; }
    this.prefix += chunk;
    const end = firstRecordEnd(this.prefix);
    if (end === -1) {
      if (this.prefix.length > 1_000_000) throw new Error("ANAC Aggiudicazioni CSV header exceeds safety limit");
      return;
    }
    this.parser = new DelimitedTextParser(detectDelimiter(this.prefix.slice(0, end)), (row) => this.consume(row));
    this.parser.push(this.prefix);
    this.prefix = "";
  }

  finish(): ParsedAnacAwardsCsv {
    if (!this.parser) {
      if (!this.prefix.trim()) throw new Error("ANAC Aggiudicazioni CSV is empty");
      this.parser = new DelimitedTextParser(detectDelimiter(this.prefix), (row) => this.consume(row));
      this.parser.push(this.prefix);
      this.prefix = "";
    }
    this.parser.finish();
    if (!this.headers || !this.indexes) throw new Error("ANAC Aggiudicazioni CSV has no usable header");
    return { recordsScanned: this.recordsScanned, records: [...this.records.values()].sort((a, b) => a.cig.localeCompare(b.cig)) };
  }

  private consume(row: string[]): void {
    if (!this.headers) {
      this.headers = row.map(normalizeHeader);
      this.indexes = resolveIndexes(this.headers);
      return;
    }
    if (row.every((value) => !value.trim())) return;
    this.recordsScanned += 1;
    if (!this.indexes) return;
    const cig = clean(row[this.indexes.cig]).toUpperCase();
    if (!this.trackedCigs.has(cig)) return;
    const next: AnacAwardRecord = {
      cig,
      numberOfTenderers: parseNonNegativeInteger(row[this.indexes.numberOfTenderers]),
      admittedOffers: parseNonNegativeInteger(row[this.indexes.admittedOffers]),
      excludedOffers: parseNonNegativeInteger(row[this.indexes.excludedOffers]),
      awardDate: parseDate(row[this.indexes.awardDate]),
      awardAmount: parseAmount(row[this.indexes.awardAmount]),
      outcome: nullable(row[this.indexes.outcome]),
      sourceArchiveUrl: this.source.url,
      acquiredAt: this.source.acquiredAt,
    };
    const previous = this.records.get(cig);
    if (!previous || completeness(next) >= completeness(previous)) this.records.set(cig, next);
  }
}

class DelimitedTextParser {
  private row: string[] = [];
  private field = "";
  private inQuotes = false;
  private afterQuote = false;
  private skipLf = false;
  constructor(private readonly delimiter: string, private readonly onRow: (row: string[]) => void) {}
  push(chunk: string): void {
    for (const character of chunk) {
      if (this.skipLf) { this.skipLf = false; if (character === "\n") continue; }
      if (this.inQuotes) {
        if (this.afterQuote) {
          if (character === '"') { this.field += '"'; this.afterQuote = false; continue; }
          this.inQuotes = false; this.afterQuote = false;
        } else if (character === '"') { this.afterQuote = true; continue; }
        else { this.field += character; continue; }
      }
      if (character === '"' && this.field.length === 0) this.inQuotes = true;
      else if (character === this.delimiter) { this.row.push(this.field); this.field = ""; }
      else if (character === "\r" || character === "\n") {
        this.row.push(this.field); this.field = ""; this.onRow(this.row); this.row = []; this.skipLf = character === "\r";
      } else this.field += character;
    }
  }
  finish(): void {
    if (this.afterQuote) { this.afterQuote = false; this.inQuotes = false; }
    if (this.inQuotes) throw new Error("ANAC Aggiudicazioni CSV contains an unclosed quote");
    if (this.field.length || this.row.length) { this.row.push(this.field); this.onRow(this.row); }
  }
}

function resolveIndexes(headers: string[]) {
  const find = (...aliases: string[]) => { for (const alias of aliases) { const i = headers.indexOf(alias); if (i !== -1) return i; } return -1; };
  const cig = find("cig", "codice_cig");
  const numberOfTenderers = find("num_imprese_offerenti", "numero_imprese_offerenti");
  if (cig === -1 || numberOfTenderers === -1) throw new Error("ANAC Aggiudicazioni CSV lacks CIG or num_imprese_offerenti");
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
function firstRecordEnd(value: string): number {
  let quoted = false;
  for (let i = 0; i < value.length; i += 1) {
    if (value[i] === '"') { if (quoted && value[i + 1] === '"') i += 1; else quoted = !quoted; }
    else if (!quoted && (value[i] === "\r" || value[i] === "\n")) return i;
  }
  return -1;
}
function detectDelimiter(header: string): string {
  const c = [";", ",", "\t"].map((value) => ({ value, count: header.split(value).length - 1 })).sort((a, b) => b.count - a.count);
  if (!c[0] || c[0].count === 0) throw new Error("ANAC Aggiudicazioni CSV delimiter cannot be detected");
  return c[0].value;
}
function normalizeHeader(value: string): string { return value.replace(/^\uFEFF/u, "").normalize("NFD").replace(/[\u0300-\u036f]/gu, "").trim().toLowerCase().replace(/[^a-z0-9]+/gu, "_").replace(/^_+|_+$/gu, ""); }
function clean(value: string | undefined): string { return value?.replace(/\s+/gu, " ").trim() ?? ""; }
function nullable(value: string | undefined): string | null { return clean(value) || null; }
function parseNonNegativeInteger(value: string | undefined): number | null { const raw = clean(value); if (!/^\d+$/u.test(raw)) return null; const n = Number(raw); return Number.isSafeInteger(n) && n >= 0 ? n : null; }
function parseAmount(value: string | undefined): number | null { let raw = clean(value).replace(/[€\s]/gu, "").replace(/[^0-9,.-]/gu, ""); if (!raw) return null; const comma = raw.lastIndexOf(","); const dot = raw.lastIndexOf("."); if (comma > dot) raw = raw.replace(/\./gu, "").replace(",", "."); else if (dot > comma && comma !== -1) raw = raw.replace(/,/gu, ""); else if (comma !== -1) raw = raw.replace(",", "."); const n = Number(raw); return Number.isFinite(n) && n >= 0 ? n : null; }
function parseDate(value: string | undefined): string | null { const raw = clean(value); if (!raw) return null; const it = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/u.exec(raw); if (it) return `${it[3]}-${it[2].padStart(2, "0")}-${it[1].padStart(2, "0")}`; return /^\d{4}-\d{2}-\d{2}$/u.test(raw) && !Number.isNaN(Date.parse(`${raw}T00:00:00Z`)) ? raw : null; }
function completeness(value: AnacAwardRecord): number { return [value.numberOfTenderers, value.admittedOffers, value.excludedOffers, value.awardDate, value.awardAmount, value.outcome].filter((item) => item !== null).length; }
