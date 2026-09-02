export const ANAC_OPERATORS_SCHEMA_VERSION = "anac-operators.v1";
export const ANAC_OPERATORS_ADAPTER_VERSION = "anac-operator-identity.v1";

export type AnacOperatorDataset = "participants" | "awardees";
export type AnacOperatorRelation = "participant" | "awardee";
export type AnacOperatorIdentifierScheme = "IT-CODICE-FISCALE" | "ANAC-FOREIGN-FISCAL-ID";
export type AnacOperatorSourceSelection = "ckan" | "canonical-fallback";

export interface AnacEconomicOperatorRecord {
  cig: string;
  relation: AnacOperatorRelation;
  taxCode: string | null;
  foreignTaxId: string | null;
  name: string | null;
  role: string | null;
  groupId: string | null;
  operatorKey: string | null;
  operatorKeyScheme: AnacOperatorIdentifierScheme | null;
  sourceArchiveUrl: string;
  acquiredAt: string;
  sourceRecordNumbers: number[];
}

export interface ParsedAnacOperatorsCsv {
  recordsScanned: number;
  matchedSourceRecords: number;
  records: AnacEconomicOperatorRecord[];
}

export interface AnacOperatorSnapshotSource {
  archiveUrl: string;
  archiveSha256: string;
  archiveBytes: number;
  csvEntry: string;
  acquiredAt: string;
  selection: AnacOperatorSourceSelection;
}

export interface AnacOperatorsSnapshot {
  schemaVersion: typeof ANAC_OPERATORS_SCHEMA_VERSION;
  adapterVersion: typeof ANAC_OPERATORS_ADAPTER_VERSION;
  generatedAt: string;
  dataset: AnacOperatorDataset;
  relation: AnacOperatorRelation;
  source: {
    id: string;
    label: string;
    datasetUrl: string;
    archiveUrl: string;
    archiveSha256: string;
    archiveBytes: number;
    csvEntry: string;
    acquiredAt: string;
    selection: AnacOperatorSourceSelection;
  };
  trackedCigs: string[];
  recordsScanned: number;
  matchedSourceRecords: number;
  records: AnacEconomicOperatorRecord[];
  coverage: {
    trackedCigs: number;
    cigsWithRecords: number;
    normalizedRecords: number;
    sourceRecordsMatched: number;
    recordsWithCanonicalOperatorKey: number;
    recordsWithoutCanonicalOperatorKey: number;
    uniqueCanonicalOperators: number;
    groupedMembershipRecords: number;
  };
  limitations: string[];
}

const DATASETS = {
  participants: {
    relation: "participant" as const,
    id: "partecipanti",
    sourceId: "anac-open-data-partecipanti",
    label: "ANAC open data — Partecipanti",
  },
  awardees: {
    relation: "awardee" as const,
    id: "aggiudicatari",
    sourceId: "anac-open-data-aggiudicatari",
    label: "ANAC open data — Aggiudicatari",
  },
};

export function datasetConfig(dataset: AnacOperatorDataset) {
  return DATASETS[dataset];
}

export function datasetUrl(dataset: AnacOperatorDataset): string {
  return `https://dati.anticorruzione.it/opendata/dataset/${DATASETS[dataset].id}`;
}

export function deriveOperatorIdentity(input: { taxCode: string | null; foreignTaxId: string | null }) {
  const domestic = canonicalItalianFiscalIdentifier(input.taxCode);
  if (domestic) {
    return { operatorKey: `IT-CODICE-FISCALE:${domestic}`, operatorKeyScheme: "IT-CODICE-FISCALE" as const };
  }
  const foreign = canonicalForeignFiscalIdentifier(input.foreignTaxId);
  if (foreign) {
    return { operatorKey: `ANAC-FOREIGN-FISCAL-ID:${foreign}`, operatorKeyScheme: "ANAC-FOREIGN-FISCAL-ID" as const };
  }
  return { operatorKey: null, operatorKeyScheme: null };
}

export function buildAnacOperatorsSnapshot(input: {
  dataset: AnacOperatorDataset;
  generatedAt: string;
  trackedCigs: string[];
  parsed: ParsedAnacOperatorsCsv;
  source: AnacOperatorSnapshotSource;
}): AnacOperatorsSnapshot {
  const config = DATASETS[input.dataset];
  const trackedCigs = [...new Set(input.trackedCigs.map((value) => value.trim().toUpperCase()))].filter(Boolean).sort();
  const canonicalKeys = input.parsed.records.map((record) => record.operatorKey).filter((value): value is string => value !== null);
  const cigsWithRecords = new Set(input.parsed.records.map((record) => record.cig));
  return {
    schemaVersion: ANAC_OPERATORS_SCHEMA_VERSION,
    adapterVersion: ANAC_OPERATORS_ADAPTER_VERSION,
    generatedAt: input.generatedAt,
    dataset: input.dataset,
    relation: config.relation,
    source: {
      id: config.sourceId,
      label: config.label,
      datasetUrl: datasetUrl(input.dataset),
      ...input.source,
    },
    trackedCigs,
    recordsScanned: input.parsed.recordsScanned,
    matchedSourceRecords: input.parsed.matchedSourceRecords,
    records: input.parsed.records,
    coverage: {
      trackedCigs: trackedCigs.length,
      cigsWithRecords: cigsWithRecords.size,
      normalizedRecords: input.parsed.records.length,
      sourceRecordsMatched: input.parsed.matchedSourceRecords,
      recordsWithCanonicalOperatorKey: canonicalKeys.length,
      recordsWithoutCanonicalOperatorKey: input.parsed.records.length - canonicalKeys.length,
      uniqueCanonicalOperators: new Set(canonicalKeys).size,
      groupedMembershipRecords: input.parsed.records.filter((record) => record.groupId !== null).length,
    },
    limitations: [
      "Il nome non viene usato da solo come identita canonica.",
      "Gli identificativi esteri non includono necessariamente la giurisdizione emittente.",
      "L'assenza dal file acquisito non dimostra l'assenza della relazione nella BDNCP.",
    ],
  };
}

export function operatorRecordsByCig(snapshot: AnacOperatorsSnapshot) {
  const grouped = new Map<string, AnacEconomicOperatorRecord[]>();
  for (const record of snapshot.records) grouped.set(record.cig, [...(grouped.get(record.cig) ?? []), record]);
  return grouped;
}

export function cleanSourceValue(value: string | undefined): string | null {
  const cleaned = value?.normalize("NFKC").replace(/\s+/gu, " ").trim() ?? "";
  return cleaned || null;
}

function canonicalItalianFiscalIdentifier(value: string | null): string | null {
  if (!value) return null;
  const compact = value.normalize("NFKC").replace(/\s+/gu, "").toUpperCase();
  return /^\d{11}$/u.test(compact) || /^[A-Z0-9]{16}$/u.test(compact) ? compact : null;
}

function canonicalForeignFiscalIdentifier(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.normalize("NFKC").replace(/\s+/gu, " ").trim().toUpperCase();
  return normalized || null;
}
