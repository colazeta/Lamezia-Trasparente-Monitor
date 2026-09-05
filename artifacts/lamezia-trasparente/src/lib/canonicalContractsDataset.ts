import type {
  Contract,
  ContractStoryline,
  FeedStatus,
  LifecyclePhase,
  StorylineIndicators,
} from "@workspace/api-client-react";

import {
  buildAnacBdncpConnectionStatus,
  createPendingAnacBdncpSnapshot,
  type AnacBdncpConnectionStatus,
  type AnacBdncpSyncSnapshot,
} from "./anacBdncpSync";
import {
  buildCanonicalAlboCorpus,
  type CanonicalAlboRecord,
} from "./canonicalAlboCorpus";
import { bdncpUrlForCig } from "./bdncp";
import {
  parseExplicitAmount,
  type AlboPublicSnapshot,
} from "./staticContractsDataset";

export const CANONICAL_CONTRACTS_SCHEMA_VERSION =
  "lamezia-contracts-canonical.v2" as const;

export type ProcurementResolutionStatus =
  | "resolved_exact_cig"
  | "resolved_multiple_exact_cigs"
  | "unresolved_no_cig";

export type CanonicalProcurementEvent = {
  eventId: string;
  sourceRecordId: string;
  publicationNumber: string | null;
  date: string | null;
  title: string;
  description: string;
  documentUrl: string | null;
  procurementRelevance: "possible" | "confirmed";
  taxonomyStatus: "classified" | "review_required" | "insufficient_evidence";
  procurementPhase: CanonicalAlboRecord["taxonomy"]["procurementPhase"];
  administrativeActions: CanonicalAlboRecord["taxonomy"]["administrativeActions"];
  cigs: string[];
  contractIdentityCigs: string[];
  relatedCigs: string[];
  cups: string[];
  resolutionStatus: ProcurementResolutionStatus;
  contractIds: number[];
};

export type CanonicalContractEntity = {
  canonicalId: string;
  id: number;
  cig: string;
  eventIds: string[];
  cups: string[];
  firstEvidenceDate: string | null;
  lastEvidenceDate: string | null;
};

export type CanonicalContractsCoverage = {
  sourceItemsObserved: number;
  publicOfficialItems: number;
  procurementEvents: number;
  procurementConfirmed: number;
  procurementPossible: number;
  eventsWithCig: number;
  eventsWithoutCig: number;
  multiCigEvents: number;
  canonicalContracts: number;
  contractEventLinks: number;
  unresolvedEvents: number;
  withCup: number;
  withExplicitAmount: number;
  withExplicitSupplier: number;
  eventCoverageInvariantSatisfied: boolean;
  resolutionInvariantSatisfied: boolean;
};

export type CanonicalContractsDataset = {
  schemaVersion: typeof CANONICAL_CONTRACTS_SCHEMA_VERSION;
  generatedAt: string;
  source: {
    id: "canonical_albo_procurement_projection";
    label: string;
    url: string;
    scope: "current-public-window";
    publicClaim: "contratti canonici ed eventi procurement correnti";
    limitations: string[];
  };
  coverage: CanonicalContractsCoverage;
  feedStatus: FeedStatus;
  anacConnection: AnacBdncpConnectionStatus;
  procurementEvents: CanonicalProcurementEvent[];
  contractEntities: CanonicalContractEntity[];
  unresolvedEvents: CanonicalProcurementEvent[];
  contracts: Contract[];
  storylines: Record<string, ContractStoryline>;
};

type ContractPhaseDetails = {
  phase: LifecyclePhase;
  label: string;
};

export function buildCanonicalContractsDataset(
  snapshot: AlboPublicSnapshot,
  anacSnapshot: AnacBdncpSyncSnapshot = createPendingAnacBdncpSnapshot(),
): CanonicalContractsDataset {
  const corpus = buildCanonicalAlboCorpus(snapshot);
  const generatedAt = corpus.generatedAt;
  const sourceUrl = officialAlboUrl(snapshot.source_url) ??
    "https://albo.tinnvision.cloud/?ente=00301390795";
  const procurementRecords = corpus.records.filter(
    (record) => record.taxonomy.procurementRelevance !== "none",
  );
  const procurementEvents = procurementRecords.map(buildProcurementEvent);
  const grouped = groupEventsByContractCig(procurementEvents);
  const contractEntities = Array.from(grouped.entries())
    .map(([cig, events]) => buildContractEntity(cig, events))
    .sort((a, b) => a.cig.localeCompare(b.cig));
  const contractByCig = new Map<string, Contract>();
  const storylines: Record<string, ContractStoryline> = {};

  for (const entity of contractEntities) {
    const events = grouped.get(entity.cig) ?? [];
    const contract = buildContract(entity, events);
    contractByCig.set(entity.cig, contract);
    storylines[String(contract.id)] = buildStoryline(contract, events);
  }

  const contracts = Array.from(contractByCig.values()).sort(compareContractsNewestFirst);
  const unresolvedEvents = procurementEvents.filter(
    (event) => event.resolutionStatus === "unresolved_no_cig",
  );
  const linkedEvents = procurementEvents.filter(
    (event) => event.contractIdentityCigs.length > 0,
  );
  const contractEventLinks = procurementEvents.reduce(
    (sum, event) => sum + event.contractIdentityCigs.length,
    0,
  );
  const limitations = uniqueStrings([
    "La vista contratti e' una proiezione del corpus canonico degli atti pubblici correnti: gli atti procurement senza CIG restano censiti come eventi irrisolti e non vengono trasformati in contratti fittizi.",
    "Un contratto canonico aggrega tutti gli atti correnti collegati allo stesso CIG; lo snapshot corrente non costituisce ancora uno storico completo dell'attivita' contrattuale del Comune.",
    "In presenza di un CIG di accordo quadro e di un CIG di contratto specifico nello stesso atto, il contratto specifico e' usato come identita' contrattuale e il CIG dell'accordo quadro resta come identificatore correlato.",
    "La copertura strutturata ANAC/BDNCP resta limitata alle fonti dichiarate nello stato della connessione e non e' ancora una discovery indipendente per stazione appaltante.",
    "Importi, operatori economici, procedure e strumenti di acquisto sono valorizzati solo quando risultano espliciti negli atti pubblici disponibili.",
    ...(snapshot.known_limits ?? []),
  ]);
  const feedStatus: FeedStatus = {
    source: "canonical_albo_procurement_projection",
    label: "Corpus canonico — contratti ed eventi procurement correnti",
    url: sourceUrl,
    status: "current-window",
    error: null,
    itemsTotal: contracts.length,
    itemsNew: 0,
    lastCheckedAt: validIsoDate(snapshot.retrieved_at)
      ? snapshot.retrieved_at
      : generatedAt,
    lastUpdatedAt: generatedAt,
  };
  const anacConnection = buildAnacBdncpConnectionStatus(
    anacSnapshot,
    contracts.map((contract) => contract.cig),
  );

  return {
    schemaVersion: CANONICAL_CONTRACTS_SCHEMA_VERSION,
    generatedAt,
    source: {
      id: "canonical_albo_procurement_projection",
      label: snapshot.source?.trim() || "Albo Pretorio Comune di Lamezia Terme",
      url: sourceUrl,
      scope: "current-public-window",
      publicClaim: "contratti canonici ed eventi procurement correnti",
      limitations,
    },
    coverage: {
      sourceItemsObserved: corpus.coverage.sourceItemsObserved,
      publicOfficialItems: corpus.coverage.publicOfficialItems,
      procurementEvents: procurementEvents.length,
      procurementConfirmed: procurementEvents.filter(
        (event) => event.procurementRelevance === "confirmed",
      ).length,
      procurementPossible: procurementEvents.filter(
        (event) => event.procurementRelevance === "possible",
      ).length,
      eventsWithCig: linkedEvents.length,
      eventsWithoutCig: unresolvedEvents.length,
      multiCigEvents: procurementEvents.filter(
        (event) => event.cigs.length > 1,
      ).length,
      canonicalContracts: contracts.length,
      contractEventLinks,
      unresolvedEvents: unresolvedEvents.length,
      withCup: contracts.filter((contract) => Boolean(contract.cup)).length,
      withExplicitAmount: contracts.filter((contract) => contract.amount > 0).length,
      withExplicitSupplier: contracts.filter(
        (contract) => !isUnknownSupplier(contract.supplier),
      ).length,
      eventCoverageInvariantSatisfied:
        linkedEvents.length + unresolvedEvents.length === procurementEvents.length,
      resolutionInvariantSatisfied:
        contractEventLinks ===
        Array.from(grouped.values()).reduce((sum, events) => sum + events.length, 0),
    },
    feedStatus,
    anacConnection,
    procurementEvents,
    contractEntities,
    unresolvedEvents,
    contracts,
    storylines,
  };
}

export function contractIdForCig(cig: string): number {
  const normalized = cig.trim().toUpperCase();
  if (!/^[A-Z0-9]{10}$/u.test(normalized)) {
    throw new Error(`Cannot derive canonical contract id from invalid CIG: ${cig}`);
  }
  const id = Number.parseInt(normalized, 36) + 1;
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error(`Canonical contract id is outside the safe integer range: ${cig}`);
  }
  return id;
}

function buildProcurementEvent(record: CanonicalAlboRecord): CanonicalProcurementEvent {
  const subject = cleanText(record.content.subject) || "Oggetto non disponibile";
  const title = cleanText(record.content.displayTitle) || subject;
  const contractIdentityCigs = identityCigs(subject, record.taxonomy.identifiers.cigs);
  const relatedCigs = record.taxonomy.identifiers.cigs.filter(
    (cig) => !contractIdentityCigs.includes(cig),
  );
  const resolutionStatus: ProcurementResolutionStatus =
    contractIdentityCigs.length === 0
      ? "unresolved_no_cig"
      : contractIdentityCigs.length === 1
        ? "resolved_exact_cig"
        : "resolved_multiple_exact_cigs";

  return {
    eventId: `procurement-event:${record.canonicalId}`,
    sourceRecordId: record.canonicalId,
    publicationNumber: record.source.publicationNumber,
    date: canonicalDate(record),
    title,
    description: subject,
    documentUrl: officialAlboUrl(record.source.documentUrl),
    procurementRelevance: record.taxonomy.procurementRelevance as "possible" | "confirmed",
    taxonomyStatus: record.taxonomy.taxonomyStatus,
    procurementPhase: record.taxonomy.procurementPhase,
    administrativeActions: record.taxonomy.administrativeActions,
    cigs: record.taxonomy.identifiers.cigs,
    contractIdentityCigs,
    relatedCigs,
    cups: record.taxonomy.identifiers.cups,
    resolutionStatus,
    contractIds: contractIdentityCigs.map(contractIdForCig),
  };
}

function identityCigs(subject: string, allCigs: string[]): string[] {
  const specific = Array.from(
    subject.toUpperCase().matchAll(
      /\bC\.?\s*I\.?\s*G\.?\s+CONTRATTO\s+SPECIFICO\s*(?:N(?:\.|°|º)?\s*)?[:\-]?\s*([A-Z0-9]{10})\b/giu,
    ),
  )
    .map((match) => match[1]?.toUpperCase())
    .filter((value): value is string => Boolean(value));
  return specific.length > 0 ? uniqueStrings(specific) : allCigs;
}

function groupEventsByContractCig(
  events: CanonicalProcurementEvent[],
): Map<string, CanonicalProcurementEvent[]> {
  const grouped = new Map<string, CanonicalProcurementEvent[]>();
  for (const event of events) {
    for (const cig of event.contractIdentityCigs) {
      const current = grouped.get(cig) ?? [];
      current.push(event);
      grouped.set(cig, current);
    }
  }
  return grouped;
}

function buildContractEntity(
  cig: string,
  events: CanonicalProcurementEvent[],
): CanonicalContractEntity {
  const dates = events.map((event) => event.date).filter(isString);
  const cups = uniqueStrings(events.flatMap((event) => event.cups));
  return {
    canonicalId: `contract:cig:${cig}`,
    id: contractIdForCig(cig),
    cig,
    eventIds: uniqueStrings(events.map((event) => event.eventId)),
    cups,
    firstEvidenceDate: dates.length > 0 ? dates.sort()[0] : null,
    lastEvidenceDate: dates.length > 0 ? dates.sort().at(-1) ?? null : null,
  };
}

function buildContract(
  entity: CanonicalContractEntity,
  events: CanonicalProcurementEvent[],
): Contract {
  const ranked = [...events].sort(compareEventEvidence);
  const primary = ranked[0] ?? emptyEvent(entity.cig);
  const awardEvent = ranked.find(isAwardEvent) ?? oldestEvent(events) ?? primary;
  const amountEvent = ranked.find((event) => parseExplicitAmount(event.description) > 0);
  const supplierEvent = ranked.find(
    (event) => !isUnknownSupplier(extractSupplier(event.description)),
  );
  const procedureEvent = ranked.find(
    (event) => deriveProcedure(event.description).known,
  );
  const toolEvent = ranked.find(
    (event) => deriveAcquisitionTool(event.description) !== null,
  );
  const latest = newestEvent(events) ?? primary;
  const primaryCup = awardEvent.cups[0] ?? entity.cups[0] ?? null;
  const procedure = deriveProcedure((procedureEvent ?? primary).description);

  return {
    id: entity.id,
    title: truncate(primary.title, 180),
    description: primary.description,
    supplier: supplierEvent
      ? extractSupplier(supplierEvent.description)
      : "Non disponibile negli atti pubblici collegati",
    amount: amountEvent ? parseExplicitAmount(amountEvent.description) : 0,
    procedureType: procedure.label,
    status: eventPhase(latest).label,
    awardDate: toTimelineDate(awardEvent.date),
    cig: entity.cig,
    cup: primaryCup,
    stazioneAppaltante: "Comune di Lamezia Terme (CF 00301390795)",
    acquisitionTool: toolEvent
      ? deriveAcquisitionTool(toolEvent.description)
      : null,
    withoutTender: procedure.directAward,
    withoutMepa: false,
    anacUrl: bdncpUrlForCig(entity.cig),
    themeId: null,
    macrotema: deriveMacrotema(primary.description),
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
  events: CanonicalProcurementEvent[],
): ContractStoryline {
  const ordered = [...events].sort(compareEventsChronologically);
  const timeline = ordered.map((event) => {
    const phase = eventPhase(event);
    const estimatedAmount = parseExplicitAmount(event.description) || null;
    return {
      publicationId: publicationId(event),
      progressivo: event.publicationNumber ?? event.sourceRecordId,
      phase: phase.phase,
      matchedBy: "cig" as const,
      tipologia: phase.label,
      oggetto: event.description,
      date: toTimelineDate(event.date),
      estimatedAmount,
      attachments: event.documentUrl
        ? [
            {
              name: `Atto ${event.publicationNumber ?? event.sourceRecordId}`,
              tipo: "Documento ufficiale",
              officialUrl: event.documentUrl,
              storagePath: null,
              contentType: null,
              size: null,
            },
          ]
        : [],
    };
  });
  const phaseCounts = timeline.reduce<Record<string, number>>((counts, item) => {
    counts[item.phase] = (counts[item.phase] ?? 0) + 1;
    return counts;
  }, {});
  const liquidations = timeline.filter((item) => item.phase === "liquidazione");
  const liquidatedAmounts = liquidations
    .map((item) => item.estimatedAmount)
    .filter((amount): amount is number => typeof amount === "number" && amount > 0);
  const liquidatedAmount = liquidatedAmounts.length > 0
    ? liquidatedAmounts.reduce((sum, amount) => sum + amount, 0)
    : null;
  const firstEvidenceDate = timeline[0]?.date ?? null;
  const lastEvidenceDate = timeline.at(-1)?.date ?? null;
  const firstLiquidationDate = liquidations[0]?.date ?? null;
  const lastLiquidationDate = liquidations.at(-1)?.date ?? null;
  const hasConclusion = timeline.some((item) => item.phase === "collaudo");
  const indicators: StorylineIndicators = {
    evidenceCount: timeline.length,
    phaseCounts,
    firstEvidenceDate,
    lastEvidenceDate,
    daysToFirstLiquidazione: daysBetween(contract.awardDate, firstLiquidationDate),
    daysToLastLiquidazione: daysBetween(contract.awardDate, lastLiquidationDate),
    awardedAmount: contract.amount,
    extraAmount: null,
    extraAmountIsEstimate: false,
    costOverrunPct: null,
    liquidatedAmount,
    liquidatedAmountIsEstimate: liquidatedAmount !== null,
    status:
      hasConclusion && liquidations.length > 0
        ? "liquidato"
        : liquidations.length > 0
          ? "in_corso"
          : "nessuna_liquidazione",
  };

  return { contract, timeline, indicators };
}

function eventPhase(event: CanonicalProcurementEvent): ContractPhaseDetails {
  const actions = event.administrativeActions;
  if (actions.includes("collaudo")) {
    return { phase: "collaudo", label: "Atto di conclusione o verifica" };
  }
  if (actions.includes("variante")) {
    return { phase: "variante", label: "Atto di variante" };
  }
  if (actions.includes("liquidazione") || actions.includes("pagamento")) {
    return { phase: "liquidazione", label: "Atto di liquidazione o pagamento" };
  }
  if (
    actions.includes("affidamento") ||
    actions.includes("aggiudicazione") ||
    actions.includes("decisione_contrarre") ||
    actions.includes("gara")
  ) {
    return { phase: "affidamento", label: "Atto di gara o affidamento" };
  }
  if (
    actions.includes("sal") ||
    actions.includes("proroga") ||
    actions.includes("contratto")
  ) {
    return { phase: "contratto", label: "Atto di esecuzione" };
  }
  return { phase: "altro", label: "Altro evento procurement" };
}

function compareEventEvidence(
  a: CanonicalProcurementEvent,
  b: CanonicalProcurementEvent,
): number {
  return eventPriority(b) - eventPriority(a) ||
    compareNullableDates(a.date, b.date) ||
    a.eventId.localeCompare(b.eventId);
}

function eventPriority(event: CanonicalProcurementEvent): number {
  const actions = event.administrativeActions;
  if (actions.includes("aggiudicazione")) return 120;
  if (actions.includes("affidamento")) return 115;
  if (actions.includes("decisione_contrarre")) return 105;
  if (actions.includes("gara")) return 100;
  if (actions.includes("contratto")) return 90;
  if (actions.includes("sal")) return 80;
  if (actions.includes("variante") || actions.includes("proroga")) return 70;
  if (actions.includes("liquidazione") || actions.includes("pagamento")) return 60;
  if (actions.includes("collaudo")) return 50;
  return 10;
}

function isAwardEvent(event: CanonicalProcurementEvent): boolean {
  return event.administrativeActions.some((action) =>
    ["affidamento", "aggiudicazione"].includes(action),
  );
}

function oldestEvent(
  events: CanonicalProcurementEvent[],
): CanonicalProcurementEvent | null {
  return [...events].sort(compareEventsChronologically)[0] ?? null;
}

function newestEvent(
  events: CanonicalProcurementEvent[],
): CanonicalProcurementEvent | null {
  return [...events].sort(compareEventsChronologically).at(-1) ?? null;
}

function compareEventsChronologically(
  a: CanonicalProcurementEvent,
  b: CanonicalProcurementEvent,
): number {
  return compareNullableDates(a.date, b.date) || a.eventId.localeCompare(b.eventId);
}

function compareNullableDates(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a.localeCompare(b);
}

function canonicalDate(record: CanonicalAlboRecord): string | null {
  if (validDateOnly(record.temporal.actDate)) return record.temporal.actDate;
  if (validDateOnly(record.temporal.publicationStart)) return record.temporal.publicationStart;
  return null;
}

function toTimelineDate(date: string | null): string {
  return date ? `${date}T00:00:00.000Z` : new Date(0).toISOString();
}

function publicationId(event: CanonicalProcurementEvent): number {
  const match = event.publicationNumber?.match(/^(\d{4})\/(\d{1,6})$/u);
  if (match) {
    const year = Number(match[1]);
    const sequence = Number(match[2]);
    if (Number.isInteger(year) && Number.isInteger(sequence)) {
      return year * 100_000 + sequence;
    }
  }
  let hash = 2166136261;
  for (const char of event.sourceRecordId) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0) || 1;
}

function deriveProcedure(subject: string): {
  label: string;
  directAward: boolean;
  known: boolean;
} {
  if (/AFFIDAMENTO\s+DIRETTO/iu.test(subject)) {
    return {
      label: "Affidamento diretto dichiarato nell'atto",
      directAward: true,
      known: true,
    };
  }
  if (/PROCEDURA\s+APERTA/iu.test(subject)) {
    return {
      label: "Procedura aperta dichiarata nell'atto",
      directAward: false,
      known: true,
    };
  }
  if (/PROCEDURA\s+NEGOZIATA/iu.test(subject)) {
    return {
      label: "Procedura negoziata dichiarata nell'atto",
      directAward: false,
      known: true,
    };
  }
  return {
    label: "Non determinabile dagli atti pubblici collegati",
    directAward: false,
    known: false,
  };
}

function deriveAcquisitionTool(subject: string): string | null {
  if (/\bMEPA\b|MERCATO\s+ELETTRONICO/iu.test(subject)) {
    return "MePA dichiarato nell'atto";
  }
  if (/\bCONSIP\b/iu.test(subject)) return "Consip dichiarata nell'atto";
  return null;
}

function extractSupplier(subject: string): string {
  const quoted = subject.match(
    /(?:LIBRERIA|SOCIET[AÀ])\s+["“]([^"”]{2,80})["”]/iu,
  )?.[1];
  if (quoted) return cleanText(quoted);

  const company = subject.match(
    /SOCIET[AÀ]\s+([A-Z0-9][^,.;]{1,70}?\s+(?:S\.?P\.?A\.?|S\.?R\.?L\.?|SNC|SAS))\b/iu,
  )?.[1];
  return company
    ? cleanText(company)
    : "Non disponibile negli atti pubblici collegati";
}

function deriveMacrotema(
  subject: string,
): NonNullable<Contract["macrotema"]> {
  if (/SCUOL|ASILO|MENSA|BIBLIOTEC|LIBR/iu.test(subject)) return "scuole";
  if (/STRAD|VIABILIT|QUARTIERE|LAVORI|EDIFIC|DEMOLIZ|RICOSTRUZ/iu.test(subject)) {
    return "strade";
  }
  if (/ENERG|RIFIUT|AMBIENT|VERDE/iu.test(subject)) return "ambiente";
  if (/SOCIAL|DISABIL|MINOR|ANZIAN/iu.test(subject)) return "sociale";
  if (/CULTUR|TURIS|SPORT|FEST|LUMINAR/iu.test(subject)) return "cultura";
  if (/TRASPORT|MOBILIT|AUTOBUS/iu.test(subject)) return "mobilita";
  return "altro";
}

function emptyEvent(cig: string): CanonicalProcurementEvent {
  return {
    eventId: `procurement-event:missing:${cig}`,
    sourceRecordId: `missing:${cig}`,
    publicationNumber: null,
    date: null,
    title: `Contratto ${cig}`,
    description: `CIG ${cig}`,
    documentUrl: null,
    procurementRelevance: "confirmed",
    taxonomyStatus: "insufficient_evidence",
    procurementPhase: "unknown",
    administrativeActions: ["altro"],
    cigs: [cig],
    contractIdentityCigs: [cig],
    relatedCigs: [],
    cups: [],
    resolutionStatus: "resolved_exact_cig",
    contractIds: [contractIdForCig(cig)],
  };
}

function compareContractsNewestFirst(a: Contract, b: Contract): number {
  return Date.parse(b.awardDate) - Date.parse(a.awardDate) || b.id - a.id;
}

function daysBetween(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);
  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs < startMs) return null;
  return Math.floor((endMs - startMs) / 86_400_000);
}

function officialAlboUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "albo.tinnvision.cloud"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function validDateOnly(value: string | null | undefined): value is string {
  return Boolean(
    value &&
      /^\d{4}-\d{2}-\d{2}$/u.test(value) &&
      !Number.isNaN(Date.parse(value)),
  );
}

function validIsoDate(value: string | null | undefined): boolean {
  return Boolean(value && !Number.isNaN(Date.parse(value)));
}

function cleanText(value: string | null | undefined): string {
  return value?.replace(/\s+/gu, " ").trim() ?? "";
}

function truncate(value: string, maxLength: number): string {
  return value.length <= maxLength
    ? value
    : `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => cleanText(value)).filter(Boolean)));
}

function isUnknownSupplier(value: string): boolean {
  return value.startsWith("Non disponibile");
}

function isString(value: string | null): value is string {
  return typeof value === "string";
}
