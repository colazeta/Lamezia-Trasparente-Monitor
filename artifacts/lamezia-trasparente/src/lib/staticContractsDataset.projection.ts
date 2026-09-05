import type {
  Contract,
  ContractStoryline,
  LifecyclePhase,
  StorylineIndicators,
} from "@workspace/api-client-react";
import { bdncpUrlForCig } from "./bdncp";
import {
  cleanText,
  contractCigs,
  deriveAcquisitionTool,
  deriveMacrotema,
  deriveProcedure,
  extractSupplier,
  isUnknownSupplier,
  officialAlboUrl,
  parseExplicitAmount,
} from "./staticContractsDataset.parse";
import type {
  CanonicalProcurementRecord,
  UnresolvedProcurementCandidate,
} from "./staticContractsDataset.types";

type ContractPhaseDetails = { phase: LifecyclePhase; label: string };
type ContractGroup = { cig: string; records: CanonicalProcurementRecord[] };

export function buildContractProjection(records: readonly CanonicalProcurementRecord[]): {
  contracts: Contract[];
  storylines: Record<string, ContractStoryline>;
  lifecycleEvents: number;
} {
  const groups = groupRecordsByCig(records);
  const contracts = groups
    .map(buildContractFromGroup)
    .filter((contract): contract is Contract => contract !== null)
    .sort(compareContractsNewestFirst);
  assertNoContractIdCollisions(contracts);
  const groupsByCig = new Map(groups.map((group) => [group.cig, group]));
  const storylines = Object.fromEntries(
    contracts.map((contract) => {
      const cig = requireContractCig(contract);
      return [
        String(contract.id),
        buildStoryline(contract, groupsByCig.get(cig)?.records ?? []),
      ];
    }),
  );
  return {
    contracts,
    storylines,
    lifecycleEvents: groups.reduce((sum, group) => sum + group.records.length, 0),
  };
}

export function buildUnresolvedCandidate(
  record: CanonicalProcurementRecord,
): UnresolvedProcurementCandidate {
  const subject = cleanText(record.source_record.subject);
  return {
    canonicalId: record.canonical_id,
    publicationNumber: record.source_record.publication_number,
    title:
      cleanText(record.source_record.display_title) ||
      subject ||
      "Atto procurement da risolvere",
    relevance: record.taxonomy.procurement.relevance as "confirmed" | "possible",
    phase: record.taxonomy.procurement.phase,
    reason: "missing_cig_in_public_safe_fields",
  };
}

function groupRecordsByCig(
  records: readonly CanonicalProcurementRecord[],
): ContractGroup[] {
  const byCig = new Map<string, CanonicalProcurementRecord[]>();
  for (const record of records) {
    for (const cig of contractCigs(record)) {
      const bucket = byCig.get(cig) ?? [];
      bucket.push(record);
      byCig.set(cig, bucket);
    }
  }
  return Array.from(byCig, ([cig, groupedRecords]) => ({
    cig,
    records: groupedRecords.sort(compareCanonicalRecordsOldestFirst),
  }));
}

function buildContractFromGroup(group: ContractGroup): Contract | null {
  if (group.records.length === 0) return null;
  const anchor = chooseAnchorRecord(group.records);
  const latest = group.records.at(-1) ?? anchor;
  const subject = cleanText(anchor.source_record.subject) || "Oggetto non disponibile";
  const supplierRecord = firstRecordWith(group.records, (record) =>
    !isUnknownSupplier(extractSupplier(cleanText(record.source_record.subject))),
  );
  const amountRecord = firstRecordWith(
    prioritiseAwardRecords(group.records),
    (record) => parseExplicitAmount(record.source_record.subject) > 0,
  );
  const cup = group.records.flatMap((record) => record.identifiers.cups).at(0) ?? null;
  const procedure = deriveProcedure(subject);

  return {
    id: stableContractId(group.cig),
    title: truncate(cleanText(anchor.source_record.display_title) || subject, 180),
    description: subject,
    supplier: supplierRecord
      ? extractSupplier(cleanText(supplierRecord.source_record.subject))
      : "Non disponibile nei campi public-safe degli atti",
    amount: amountRecord ? parseExplicitAmount(amountRecord.source_record.subject) : 0,
    procedureType: procedure.label,
    status: phaseDetails(latest).label,
    awardDate: `${referenceDate(anchor)}T00:00:00.000Z`,
    cig: group.cig,
    cup,
    stazioneAppaltante: "Comune di Lamezia Terme (CF 00301390795)",
    acquisitionTool: deriveAcquisitionTool(subject),
    withoutTender: procedure.directAward,
    withoutMepa: false,
    anacUrl: bdncpUrlForCig(group.cig),
    themeId: null,
    macrotema: deriveMacrotema(anchor.taxonomy.existing.area_theme_id, subject),
    macrotemaManual: false,
    latitude: null,
    longitude: null,
    geoAddress: null,
    geoQuartiere: null,
    geoSource: null,
    geoManual: false,
    geoVerify: false,
  };
}

function buildStoryline(
  contract: Contract,
  records: readonly CanonicalProcurementRecord[],
): ContractStoryline {
  const timeline = records.map((record) => {
    const details = phaseDetails(record);
    const description = cleanText(record.source_record.subject) || "Oggetto non disponibile";
    const officialDocument = officialAlboUrl(record.source_record.document_url);
    const estimatedAmount = parseExplicitAmount(description) || null;
    return {
      publicationId: publicationId(record) ?? contract.id,
      progressivo: cleanText(record.source_record.publication_number) || record.canonical_id,
      phase: details.phase,
      matchedBy: "cig" as const,
      tipologia: details.label,
      oggetto: description,
      date: `${referenceDate(record)}T00:00:00.000Z`,
      estimatedAmount,
      attachments: officialDocument
        ? [
            {
              name: `Atto ${cleanText(record.source_record.publication_number) || record.canonical_id}`,
              tipo: "Documento ufficiale",
              officialUrl: officialDocument,
              storagePath: null,
              contentType: null,
              size: null,
            },
          ]
        : [],
    };
  });

  const phaseCounts: Record<string, number> = {};
  for (const event of timeline) {
    phaseCounts[event.phase] = (phaseCounts[event.phase] ?? 0) + 1;
  }
  const liquidations = timeline.filter((event) => event.phase === "liquidazione");
  const liquidatedAmounts = liquidations
    .map((event) => event.estimatedAmount)
    .filter((value): value is number => typeof value === "number");
  const liquidatedAmount = liquidatedAmounts.length
    ? liquidatedAmounts.reduce((sum, value) => sum + value, 0)
    : null;
  const indicators: StorylineIndicators = {
    evidenceCount: timeline.length,
    phaseCounts,
    firstEvidenceDate: timeline.at(0)?.date ?? contract.awardDate,
    lastEvidenceDate: timeline.at(-1)?.date ?? contract.awardDate,
    daysToFirstLiquidazione: daysBetween(contract.awardDate, liquidations.at(0)?.date ?? null),
    daysToLastLiquidazione: daysBetween(contract.awardDate, liquidations.at(-1)?.date ?? null),
    awardedAmount: contract.amount,
    extraAmount: null,
    extraAmountIsEstimate: false,
    costOverrunPct: null,
    liquidatedAmount,
    liquidatedAmountIsEstimate: liquidatedAmount !== null,
    status: "in_corso",
  };
  return { contract, timeline, indicators };
}

function phaseDetails(record: CanonicalProcurementRecord): ContractPhaseDetails {
  const actions = record.taxonomy.procurement.administrative_actions;
  if (record.taxonomy.procurement.phase === "closure") {
    return { phase: "collaudo", label: "Atto di conclusione o verifica" };
  }
  if (actions.includes("variation")) {
    return { phase: "variante", label: "Atto di variante" };
  }
  if (record.taxonomy.procurement.phase === "payment") {
    return { phase: "liquidazione", label: "Atto di liquidazione o pagamento" };
  }
  if (["planning", "tender", "award"].includes(record.taxonomy.procurement.phase)) {
    return { phase: "affidamento", label: "Atto di procedura o affidamento" };
  }
  if (record.taxonomy.procurement.phase === "execution") {
    return { phase: "contratto", label: "Atto di esecuzione" };
  }
  return { phase: "altro", label: "Atto procurement correlato" };
}

function chooseAnchorRecord(
  records: readonly CanonicalProcurementRecord[],
): CanonicalProcurementRecord {
  const priority: Record<CanonicalProcurementRecord["taxonomy"]["procurement"]["phase"], number> = {
    award: 0,
    tender: 1,
    planning: 2,
    execution: 3,
    payment: 4,
    closure: 5,
    other: 6,
    unknown: 7,
  };
  return [...records].sort(
    (a, b) =>
      priority[a.taxonomy.procurement.phase] - priority[b.taxonomy.procurement.phase] ||
      compareCanonicalRecordsOldestFirst(a, b),
  )[0]!;
}

function prioritiseAwardRecords(
  records: readonly CanonicalProcurementRecord[],
): CanonicalProcurementRecord[] {
  return [...records].sort((a, b) => {
    const aAward = a.taxonomy.procurement.phase === "award" ? 0 : 1;
    const bAward = b.taxonomy.procurement.phase === "award" ? 0 : 1;
    return aAward - bAward || compareCanonicalRecordsOldestFirst(a, b);
  });
}

function firstRecordWith(
  records: readonly CanonicalProcurementRecord[],
  predicate: (record: CanonicalProcurementRecord) => boolean,
): CanonicalProcurementRecord | null {
  return records.find(predicate) ?? null;
}

function stableContractId(cig: string): number {
  let hash = 2166136261;
  for (let index = 0; index < cig.length; index += 1) {
    hash ^= cig.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) || 1;
}

function assertNoContractIdCollisions(contracts: readonly Contract[]): void {
  const byId = new Map<number, string>();
  for (const contract of contracts) {
    const cig = requireContractCig(contract);
    const previous = byId.get(contract.id);
    if (previous && previous !== cig) {
      throw new Error(`Stable contract id collision between CIG ${previous} and ${cig}`);
    }
    byId.set(contract.id, cig);
  }
}

function requireContractCig(contract: Contract): string {
  const cig = contract.cig?.trim();
  if (!cig) {
    throw new Error(`Canonical contract ${contract.id} is missing its CIG`);
  }
  return cig;
}

function publicationId(record: CanonicalProcurementRecord): number | null {
  const match = record.source_record.publication_number?.match(/^(\d{4})\/(\d{1,6})$/u);
  if (!match) return null;
  const year = Number(match[1]);
  const sequence = Number(match[2]);
  return Number.isInteger(year) && Number.isInteger(sequence)
    ? year * 100_000 + sequence
    : null;
}

function referenceDate(record: CanonicalProcurementRecord): string {
  return validDateOnly(record.source_record.act_date)
    ? record.source_record.act_date!
    : validDateOnly(record.source_record.publication_start)
      ? record.source_record.publication_start!
      : "1970-01-01";
}

function compareCanonicalRecordsOldestFirst(
  a: CanonicalProcurementRecord,
  b: CanonicalProcurementRecord,
): number {
  return (
    Date.parse(`${referenceDate(a)}T00:00:00.000Z`) -
      Date.parse(`${referenceDate(b)}T00:00:00.000Z`) ||
    (a.source_record.publication_number ?? "").localeCompare(
      b.source_record.publication_number ?? "",
    )
  );
}

function compareContractsNewestFirst(a: Contract, b: Contract): number {
  return Date.parse(b.awardDate) - Date.parse(a.awardDate) || b.id - a.id;
}

function truncate(value: string, maxLength: number): string {
  return value.length <= maxLength
    ? value
    : `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function validDateOnly(value: string | null | undefined): boolean {
  return Boolean(
    value && /^\d{4}-\d{2}-\d{2}$/u.test(value) && !Number.isNaN(Date.parse(value)),
  );
}

function daysBetween(start: string, end: string | null): number | null {
  if (!end) return null;
  const diff = Date.parse(end) - Date.parse(start);
  return Number.isFinite(diff) ? Math.round(diff / 86_400_000) : null;
}
