export const INCARICHI_KEYWORDS = [
  "incarico",
  "incarichi",
  "affidamento",
  "affidamenti",
  "servizio professionale",
  "servizi professionali",
  "prestazione professionale",
  "prestazioni professionali",
  "consulenza",
  "consulenze",
  "legale",
  "avvocato",
  "patrocinio",
  "tecnico",
  "progettazione",
  "direzione lavori",
  "collaudo",
  "supporto al rup",
  "esperto",
] as const;

export const COMPARATIVE_KEYWORDS = [
  "procedura comparativa",
  "comparazione",
  "confronto",
  "manifestazione di interesse",
  "avviso pubblico",
  "selezione pubblica",
  "gara",
  "aperta",
  "negoziata",
  "indagine di mercato",
] as const;

export const DIRECT_PROCEDURE_KEYWORDS = [
  "affidamento diretto",
  "diretto",
  "senza previa pubblicazione",
] as const;

const CIG_RE = /\b(?:CIG|SMART\s+CIG)[:\s-]*((?=[A-Z0-9]{10}\b)(?=[A-Z0-9]*\d)[A-Z0-9]{10})\b/gi;
const CUP_RE = /\bCUP[:\s-]*((?=[A-Z0-9]{15}\b)(?=[A-Z0-9]*\d)[A-Z0-9]{15})\b/gi;
const OPERATOR_PATTERNS = [
  /(?:affidatari[oa]|beneficiari[oa]|operatore\s+economico|professionista|ditta|societ[aà]|impresa|avv\.?|ing\.?|arch\.?)\s+(?:individuat[oa]\s+)?(?:in\s+)?(?:favore\s+di\s+)?([A-ZÀ-ÖØ-Ý][\wÀ-ÖØ-öø-ÿ'&.,\- ]{3,80})/i,
  /(?:alla|al)\s+(?:ditta|societ[aà]|professionista|avv\.?|ing\.?|arch\.?)\s+([A-ZÀ-ÖØ-Ý][\wÀ-ÖØ-öø-ÿ'&.,\- ]{3,80})/i,
] as const;

export type MonitoredSource = "Contratti ANAC" | "Albo Pretorio";
export type SourceStatus = "ufficiale" | "estratto" | "da verificare";

export interface MonitoredRecordFlags {
  hasCig: boolean;
  hasCup: boolean;
  hasDirectProcedureSignal: boolean;
  hasComparativeProcedureSignal: boolean;
  needsOperatorVerification: boolean;
}

export interface MonitoredRecord {
  id: string;
  source: MonitoredSource;
  title: string;
  operator: string;
  amount: number | null;
  date: string | null;
  cig: string | null;
  cup: string | null;
  procedure: string | null;
  sourceHref: string;
  sourceStatus: SourceStatus;
  flags: string[];
  signals: MonitoredRecordFlags;
}

export interface OperatorAggregate {
  operator: string;
  records: number;
  totalAmount: number;
  directCount: number;
  missingCigCount: number;
  missingComparativeCount: number;
  sourceStatuses: Set<SourceStatus>;
}

export interface IncarichimetroContractInput {
  id: string | number;
  title: string;
  description?: string | null;
  procedureType?: string | null;
  withoutTender?: boolean | null;
  cig?: string | null;
  cup?: string | null;
  supplier?: string | null;
  amount?: number | null;
  awardDate?: string | null;
}

export interface IncarichimetroPublicationInput {
  id: string | number;
  oggetto: string;
  brief?: string | null;
  tipologia?: string | null;
  provenienza?: string | null;
  cups?: string[] | null;
  dataAtto?: string | null;
  pubStart?: string | null;
  firstSeenAt?: string | null;
}

export interface IncarichimetroFilters {
  source: "all" | MonitoredSource;
  cig: "all" | "present" | "missing";
  cup: "all" | "present" | "missing";
  directProcedure: "all" | "present" | "missing";
  comparativeMissing: "all" | "present" | "missing";
  sourceStatus: "all" | SourceStatus;
}

export const DEFAULT_INCARICHIMETRO_FILTERS: IncarichimetroFilters = {
  source: "all",
  cig: "all",
  cup: "all",
  directProcedure: "all",
  comparativeMissing: "all",
  sourceStatus: "all",
};

export function normalizeText(value: string | null | undefined): string {
  return (value ?? "").toLocaleLowerCase("it");
}

export function includesAny(
  text: string | null | undefined,
  keywords: readonly string[],
): boolean {
  const normalized = normalizeText(text);
  return keywords.some((keyword) => normalized.includes(keyword));
}

export function hasIncaricoKeyword(text: string | null | undefined): boolean {
  return includesAny(text, INCARICHI_KEYWORDS);
}

function extractFirst(regex: RegExp, text: string): string | null {
  regex.lastIndex = 0;
  const match = regex.exec(text);
  return match?.[1]?.toUpperCase() ?? null;
}

export function extractCig(text: string | null | undefined): string | null {
  return extractFirst(CIG_RE, text ?? "");
}

export function extractCup(text: string | null | undefined): string | null {
  return extractFirst(CUP_RE, text ?? "");
}

export function extractOperator(text: string | null | undefined): string | null {
  for (const pattern of OPERATOR_PATTERNS) {
    const match = pattern.exec(text ?? "");
    const candidate = match?.[1]
      ?.replace(
        /\s+(?:per|con|relativo|relativa|inerente|mediante|ai sensi).*$/i,
        "",
      )
      .replace(/[.;:,\-–]+$/g, "")
      .trim();
    if (
      candidate &&
      candidate.length >= 4 &&
      candidate[0] === candidate[0].toLocaleUpperCase("it") &&
      candidate[0] !== candidate[0].toLocaleLowerCase("it")
    ) {
      return candidate;
    }
  }
  return null;
}

export function buildRecordFlags({
  cig,
  cup,
  text,
  operator,
  forceDirectSignal,
}: {
  cig: string | null | undefined;
  cup: string | null | undefined;
  text: string | null | undefined;
  operator?: string | null;
  forceDirectSignal?: boolean | null;
}): MonitoredRecordFlags {
  return {
    hasCig: Boolean(cig),
    hasCup: Boolean(cup),
    hasDirectProcedureSignal:
      Boolean(forceDirectSignal) || includesAny(text, DIRECT_PROCEDURE_KEYWORDS),
    hasComparativeProcedureSignal: includesAny(text, COMPARATIVE_KEYWORDS),
    needsOperatorVerification: operator === null,
  };
}

export function buildFlagLabels(
  signals: MonitoredRecordFlags,
  source: MonitoredSource,
): string[] {
  return [
    signals.needsOperatorVerification ? "Operatore da verificare nell'atto" : null,
    !signals.hasCig
      ? source === "Contratti ANAC"
        ? "CIG non presente nel dato"
        : "CIG non rilevato"
      : null,
    !signals.hasCup
      ? source === "Contratti ANAC"
        ? "CUP non presente nel dato"
        : "CUP non rilevato"
      : null,
    !signals.hasComparativeProcedureSignal
      ? "Procedura comparativa non rilevata"
      : null,
    signals.hasDirectProcedureSignal ? "Possibile affidamento diretto" : null,
  ].filter((flag): flag is string => Boolean(flag));
}

export function buildContractRecord(
  contract: IncarichimetroContractInput,
): MonitoredRecord | null {
  const text = [contract.title, contract.description, contract.procedureType]
    .filter(Boolean)
    .join(" ");
  if (!hasIncaricoKeyword(text)) return null;

  const signals = buildRecordFlags({
    cig: contract.cig,
    cup: contract.cup,
    text,
    operator: contract.supplier?.trim() || "Operatore non indicato",
    forceDirectSignal: contract.withoutTender,
  });

  return {
    id: `contract-${contract.id}`,
    source: "Contratti ANAC",
    title: contract.title,
    operator: contract.supplier?.trim() || "Operatore non indicato",
    amount: contract.amount ?? null,
    date: contract.awardDate ?? null,
    cig: contract.cig ?? null,
    cup: contract.cup ?? null,
    procedure: contract.procedureType || null,
    sourceHref: `/contratti/${contract.id}`,
    sourceStatus: "ufficiale",
    flags: buildFlagLabels(signals, "Contratti ANAC"),
    signals,
  };
}

export function buildPublicationRecord(
  publication: IncarichimetroPublicationInput,
): MonitoredRecord | null {
  const text = [
    publication.oggetto,
    publication.brief,
    publication.tipologia,
    publication.provenienza,
  ]
    .filter(Boolean)
    .join(" ");
  if (!hasIncaricoKeyword(text)) return null;

  const cig = extractCig(text);
  const cup = publication.cups?.[0] ?? extractCup(text);
  const operator = extractOperator(text);
  const signals = buildRecordFlags({ cig, cup, text, operator });

  return {
    id: `publication-${publication.id}`,
    source: "Albo Pretorio",
    title: publication.oggetto,
    operator: operator ?? "Da verificare nell'atto",
    amount: null,
    date:
      publication.dataAtto ?? publication.pubStart ?? publication.firstSeenAt ?? null,
    cig,
    cup,
    procedure: signals.hasComparativeProcedureSignal
      ? "Elementi comparativi rilevati nel testo"
      : signals.hasDirectProcedureSignal
        ? "Affidamento diretto rilevato nel testo"
        : null,
    sourceHref: `/albo/${publication.id}`,
    sourceStatus: operator ? "estratto" : "da verificare",
    flags: buildFlagLabels(signals, "Albo Pretorio"),
    signals,
  };
}

export function buildOperatorAggregates(
  records: MonitoredRecord[],
): OperatorAggregate[] {
  const map = new Map<string, OperatorAggregate>();
  for (const record of records) {
    const key = record.operator.toLocaleLowerCase("it");
    const current = map.get(key) ?? {
      operator: record.operator,
      records: 0,
      totalAmount: 0,
      directCount: 0,
      missingCigCount: 0,
      missingComparativeCount: 0,
      sourceStatuses: new Set<SourceStatus>(),
    };
    current.records += 1;
    current.totalAmount += record.amount ?? 0;
    if (record.signals.hasDirectProcedureSignal) current.directCount += 1;
    if (!record.signals.hasCig) current.missingCigCount += 1;
    if (!record.signals.hasComparativeProcedureSignal) {
      current.missingComparativeCount += 1;
    }
    current.sourceStatuses.add(record.sourceStatus);
    map.set(key, current);
  }
  return Array.from(map.values()).sort((a, b) => {
    if (b.records !== a.records) return b.records - a.records;
    return b.totalAmount - a.totalAmount;
  });
}

export function filterMonitoredRecords(
  records: MonitoredRecord[],
  filters: IncarichimetroFilters,
): MonitoredRecord[] {
  return records.filter((record) => {
    if (filters.source !== "all" && record.source !== filters.source) return false;
    if (filters.sourceStatus !== "all" && record.sourceStatus !== filters.sourceStatus) {
      return false;
    }
    if (filters.cig !== "all") {
      if (filters.cig === "present" && !record.signals.hasCig) return false;
      if (filters.cig === "missing" && record.signals.hasCig) return false;
    }
    if (filters.cup !== "all") {
      if (filters.cup === "present" && !record.signals.hasCup) return false;
      if (filters.cup === "missing" && record.signals.hasCup) return false;
    }
    if (filters.directProcedure !== "all") {
      if (
        filters.directProcedure === "present" &&
        !record.signals.hasDirectProcedureSignal
      ) {
        return false;
      }
      if (
        filters.directProcedure === "missing" &&
        record.signals.hasDirectProcedureSignal
      ) {
        return false;
      }
    }
    if (filters.comparativeMissing !== "all") {
      const missingComparative = !record.signals.hasComparativeProcedureSignal;
      if (filters.comparativeMissing === "present" && !missingComparative) {
        return false;
      }
      if (filters.comparativeMissing === "missing" && missingComparative) {
        return false;
      }
    }
    return true;
  });
}
