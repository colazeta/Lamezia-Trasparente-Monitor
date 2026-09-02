import {
  cleanSourceValue,
  datasetConfig,
  deriveOperatorIdentity,
  type AnacEconomicOperatorRecord,
  type AnacOperatorDataset,
  type ParsedAnacOperatorsCsv,
} from "./anacOperators";

export class AnacOperatorsCsvMatcher {
  private parser: DelimitedTextParser | null = null;
  private prefix = "";
  private indexes: ReturnType<typeof resolveIndexes> | null = null;
  private recordsScanned = 0;
  private matchedSourceRecords = 0;
  private readonly records = new Map<string, AnacEconomicOperatorRecord>();

  constructor(
    private readonly dataset: AnacOperatorDataset,
    private readonly trackedCigs: ReadonlySet<string>,
    private readonly source: { url: string; acquiredAt: string },
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
      if (this.prefix.length > 1_000_000) throw new Error("ANAC operator CSV header exceeds safety limit");
      return;
    }
    this.parser = new DelimitedTextParser(
      detectDelimiter(this.prefix.slice(0, headerEnd)),
      (row) => this.consume(row),
    );
    this.parser.push(this.prefix);
    this.prefix = "";
  }

  finish(): ParsedAnacOperatorsCsv {
    if (!this.parser) {
      if (!this.prefix.trim()) throw new Error("ANAC operator CSV is empty");
      this.parser = new DelimitedTextParser(detectDelimiter(this.prefix), (row) => this.consume(row));
      this.parser.push(this.prefix);
      this.prefix = "";
    }
    this.parser.finish();
    if (!this.indexes) throw new Error("ANAC operator CSV has no usable header");
    return {
      recordsScanned: this.recordsScanned,
      matchedSourceRecords: this.matchedSourceRecords,
      records: [...this.records.values()].sort(compareRecords),
    };
  }

  private consume(row: string[]): void {
    if (!this.indexes) {
      this.indexes = resolveIndexes(row.map(normalizeHeader), this.dataset);
      return;
    }
    if (row.every((value) => !value.trim())) return;
    this.recordsScanned += 1;
    const sourceRecordNumber = this.recordsScanned;
    const cig = cleanSourceValue(row[this.indexes.cig])?.toUpperCase() ?? "";
    if (!this.trackedCigs.has(cig)) return;
    this.matchedSourceRecords += 1;

    const taxCode = cleanSourceValue(row[this.indexes.taxCode]);
    const foreignTaxId = cleanSourceValue(row[this.indexes.foreignTaxId]);
    const name = cleanSourceValue(row[this.indexes.name]);
    const role = cleanSourceValue(row[this.indexes.role]);
    const groupId = cleanSourceValue(row[this.indexes.groupId]);
    const identity = deriveOperatorIdentity({ taxCode, foreignTaxId });
    const record: AnacEconomicOperatorRecord = {
      cig,
      relation: datasetConfig(this.dataset).relation,
      taxCode,
      foreignTaxId,
      name,
      role,
      groupId,
      ...identity,
      sourceArchiveUrl: this.source.url,
      acquiredAt: this.source.acquiredAt,
      sourceRecordNumbers: [sourceRecordNumber],
    };
    const key = equivalenceKey(record);
    const previous = this.records.get(key);
    if (previous) previous.sourceRecordNumbers.push(sourceRecordNumber);
    else this.records.set(key, record);
  }
}

export function parseAnacOperatorsCsv(
  csv: string,
  dataset: AnacOperatorDataset,
  trackedCigs: ReadonlySet<string>,
  source: { url: string; acquiredAt: string },
): ParsedAnacOperatorsCsv {
  const matcher = new AnacOperatorsCsvMatcher(dataset, trackedCigs, source);
  matcher.push(csv);
  return matcher.finish();
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
      if (character === '"' && this.field.length === 0) this.inQuotes = true;
      else if (character === this.delimiter) {
        this.row.push(this.field);
        this.field = "";
      } else if (character === "\r" || character === "\n") {
        this.row.push(this.field);
        this.field = "";
        this.onRow(this.row);
        this.row = [];
        this.skipLf = character === "\r";
      } else this.field += character;
    }
  }

  finish(): void {
    if (this.afterQuote) {
      this.afterQuote = false;
      this.inQuotes = false;
    }
    if (this.inQuotes) throw new Error("ANAC operator CSV contains an unclosed quote");
    if (this.field.length || this.row.length) {
      this.row.push(this.field);
      this.onRow(this.row);
    }
  }
}

function resolveIndexes(headers: string[], dataset: AnacOperatorDataset) {
  const find = (...aliases: string[]) => {
    for (const alias of aliases) {
      const index = headers.indexOf(alias);
      if (index !== -1) return index;
    }
    return -1;
  };
  const indexes = {
    cig: find("cig", "codice_cig"),
    taxCode: find("codicefiscale", "codice_fiscale"),
    foreignTaxId: find("identificativofiscaleestero", "identificativo_fiscale_estero"),
    name: find("ragionesociale", "ragione_sociale", "denominazione"),
    role: find("ruolo"),
    groupId:
      dataset === "participants"
        ? find("partrgrno", "part_rgr_no")
        : find("aggrgrno", "agg_rgr_no"),
  };
  const missing = Object.entries(indexes)
    .filter(([, index]) => index === -1)
    .map(([field]) => field);
  if (missing.length) throw new Error(`ANAC ${dataset} CSV missing required columns: ${missing.join(", ")}`);
  return indexes;
}

function equivalenceKey(record: AnacEconomicOperatorRecord): string {
  return JSON.stringify([
    record.cig,
    record.relation,
    record.taxCode,
    record.foreignTaxId,
    record.name,
    record.role,
    record.groupId,
  ]);
}

function compareRecords(a: AnacEconomicOperatorRecord, b: AnacEconomicOperatorRecord): number {
  return (
    a.cig.localeCompare(b.cig) ||
    (a.groupId ?? "").localeCompare(b.groupId ?? "") ||
    (a.operatorKey ?? "").localeCompare(b.operatorKey ?? "") ||
    (a.name ?? "").localeCompare(b.name ?? "") ||
    (a.role ?? "").localeCompare(b.role ?? "")
  );
}

function firstRecordEnd(value: string): number {
  let quoted = false;
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === '"') {
      if (quoted && value[index + 1] === '"') index += 1;
      else quoted = !quoted;
    } else if (!quoted && (value[index] === "\r" || value[index] === "\n")) return index;
  }
  return -1;
}

function detectDelimiter(header: string): string {
  const candidates = [";", ",", "\t"]
    .map((value) => ({ value, count: header.split(value).length - 1 }))
    .sort((a, b) => b.count - a.count);
  if (!candidates[0] || candidates[0].count === 0) throw new Error("ANAC operator CSV delimiter cannot be detected");
  return candidates[0].value;
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
