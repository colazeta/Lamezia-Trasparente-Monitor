import type {
  Contract,
  LifecyclePhase,
  StorylineEvent,
  StorylineIndicators,
} from "@workspace/api-client-react";

import {
  ANAC_PVL_URL,
  buildBdncpSearchBridge,
  preferredBdncpUrl,
} from "./bdncp";
import {
  classifyProcurementIdentifier,
  type ProcurementIdentifierClassification,
} from "./procurementIdentifiers";

export type ContractIdentifierKind = "cig" | "cup" | "internal_id";

export type ContractIdentifierFormalStatus =
  | "formal-only"
  | "invalid-format"
  | "missing"
  | "local-id";

export interface ContractIdentifier {
  kind: ContractIdentifierKind;
  label: string;
  value: string | null;
  normalizedValue: string | null;
  formalStatus: ContractIdentifierFormalStatus;
  sourceStatus: ContractSourceStatus;
  sourceLabel: string;
  sourceUrl?: string;
  note: string;
}

export type ContractLifecyclePhaseKey =
  | "programmazione"
  | "progettazione"
  | "gara_pubblicazione"
  | "svolgimento_gara"
  | "affidamento"
  | "esecuzione"
  | "valutazione";

export type ContractLifecycleStatus = "documented" | "partial" | "missing";

export interface ContractLifecyclePhase {
  key: ContractLifecyclePhaseKey;
  label: string;
  status: ContractLifecycleStatus;
  summary: string;
  evidenceIds: string[];
  missing: string[];
}

export type ContractSourceStatus =
  | "official-source"
  | "official-ingested-source"
  | "derived-data"
  | "search-bridge"
  | "manual-review"
  | "missing-source"
  | "information-limit";

export type ContractSourceUpdateKind = "full" | "delta" | "manual" | "unknown";

export type ContractIngestionStatus =
  | "parsed"
  | "skipped"
  | "needs_mapping"
  | "failed";

export interface ContractIngestionMetadata {
  source_dataset_id: string;
  source_dataset_label: string;
  source_record_id: string;
  source_downloaded_at: string | null;
  source_published_at: string | null;
  source_update_kind: ContractSourceUpdateKind;
  parser_version: string;
  ingestion_status: ContractIngestionStatus;
  mapping_notes: string[];
}

export type ContractEvidenceSourceKind =
  | "bdncp"
  | "pvl"
  | "albo"
  | "local-dataset"
  | "manual-review";

export interface ContractEvidence {
  id: string;
  phaseKey: ContractLifecyclePhaseKey | "other";
  title: string;
  description: string;
  sourceKind: ContractEvidenceSourceKind;
  sourceStatus: ContractSourceStatus;
  sourceLabel: string;
  sourceUrl?: string;
  identifier?: string;
  isOfficialSourceEvidence: boolean;
  ingestionMetadata?: ContractIngestionMetadata;
}

export interface ContractOfficialLink {
  label: string;
  href: string;
  sourceKind: ContractEvidenceSourceKind;
  sourceStatus: ContractSourceStatus;
  note: string;
}

export interface ContractWorkAxis {
  isPublicWork: boolean;
  label: string;
  cupStatus: "present" | "missing";
  cupValue: string | null;
  message: string;
}

export interface ContractDossier {
  contractId: number;
  title: string;
  identifiers: ContractIdentifier[];
  phases: ContractLifecyclePhase[];
  evidence: ContractEvidence[];
  ingestionMetadata: ContractIngestionMetadata[];
  officialLinks: ContractOfficialLink[];
  publicLimits: string[];
  workAxis: ContractWorkAxis;
  lifecycleCompleteness: "complete" | "partial" | "needs-review";
  missingExecutionEvidence: boolean;
  missingEvaluationEvidence: boolean;
}

export interface ContractDossierSummary {
  total: number;
  withCig: number;
  withCup: number;
  withBdncpSearchBridge: number;
  publicWorks: number;
  missingExecutionEvidence: number;
  missingEvaluationEvidence: number;
}

export const CONTRACT_LIFECYCLE_PHASE_ORDER: readonly ContractLifecyclePhaseKey[] =
  [
    "programmazione",
    "progettazione",
    "gara_pubblicazione",
    "svolgimento_gara",
    "affidamento",
    "esecuzione",
    "valutazione",
  ];

export const CONTRACT_LIFECYCLE_PHASE_LABELS: Record<
  ContractLifecyclePhaseKey,
  string
> = {
  programmazione: "Programmazione",
  progettazione: "Progettazione",
  gara_pubblicazione: "Gara / pubblicazione",
  svolgimento_gara: "Esecuzione della gara",
  affidamento: "Affidamento",
  esecuzione: "Esecuzione del contratto",
  valutazione: "Conclusione, collaudi e verifiche",
};

export function buildContractDossier(input: {
  contract: Contract;
  timeline?: readonly StorylineEvent[];
  indicators?: StorylineIndicators;
  sourceEvidence?: readonly ContractEvidence[];
  ingestionMetadata?: readonly ContractIngestionMetadata[];
}): ContractDossier {
  const { contract } = input;
  const timeline = input.timeline ?? [];
  const indicators = input.indicators;
  const cigClassification = classifyProcurementIdentifier(contract.cig);
  const cupClassification = classifyProcurementIdentifier(contract.cup);
  const bdncpBridge = buildBdncpSearchBridge(contract.cig);
  const evidence = buildEvidence(
    contract,
    timeline,
    bdncpBridge.formallyValidCig,
  ).concat(input.sourceEvidence ?? []);
  const publicLimits = buildPublicLimits(
    contract,
    cigClassification,
    cupClassification,
  );
  const workAxis = buildWorkAxis(contract, cupClassification);
  const phaseEvidence = groupEvidenceByPhase(evidence);
  const phases = CONTRACT_LIFECYCLE_PHASE_ORDER.map((phaseKey) =>
    buildPhase({
      phaseKey,
      contract,
      timeline,
      indicators,
      phaseEvidence,
      cigClassification,
      cupClassification,
      bdncpBridgeAvailable: bdncpBridge.formallyValidCig,
    }),
  );
  const officialLinks = buildOfficialLinks(
    contract,
    bdncpBridge.formallyValidCig,
  );
  const missingExecutionEvidence =
    phaseStatus(phases, "esecuzione") !== "documented";
  const missingEvaluationEvidence =
    phaseStatus(phases, "valutazione") !== "documented";

  return {
    contractId: contract.id,
    title: contract.title,
    identifiers: buildIdentifiers(
      contract,
      cigClassification,
      cupClassification,
    ),
    phases,
    evidence,
    ingestionMetadata: mergeIngestionMetadata(
      input.ingestionMetadata ?? [],
      evidence,
    ),
    officialLinks,
    publicLimits,
    workAxis,
    lifecycleCompleteness: deriveCompleteness(phases),
    missingExecutionEvidence,
    missingEvaluationEvidence,
  };
}

export function summarizeContractDossiers(
  contracts: readonly Contract[],
): ContractDossierSummary {
  const dossiers = contracts.map((contract) =>
    buildContractDossier({ contract }),
  );

  return {
    total: dossiers.length,
    withCig: dossiers.filter((dossier) =>
      hasIdentifier(dossier, "cig", "formal-only"),
    ).length,
    withCup: dossiers.filter((dossier) =>
      hasIdentifier(dossier, "cup", "formal-only"),
    ).length,
    withBdncpSearchBridge: dossiers.filter((dossier) =>
      dossier.evidence.some(
        (evidence) =>
          evidence.sourceKind === "bdncp" &&
          evidence.sourceStatus === "search-bridge",
      ),
    ).length,
    publicWorks: dossiers.filter((dossier) => dossier.workAxis.isPublicWork)
      .length,
    missingExecutionEvidence: dossiers.filter(
      (dossier) => dossier.missingExecutionEvidence,
    ).length,
    missingEvaluationEvidence: dossiers.filter(
      (dossier) => dossier.missingEvaluationEvidence,
    ).length,
  };
}

export function detectPublicWork(contract: Contract): boolean {
  const text = `${contract.title} ${contract.description ?? ""} ${
    contract.procedureType ?? ""
  } ${contract.acquisitionTool ?? ""}`.toLowerCase();

  return (
    contract.macrotema === "strade" ||
    contract.macrotema === "scuole" ||
    text.includes("lavor") ||
    text.includes("opera") ||
    text.includes("manutenzione") ||
    text.includes("strada") ||
    text.includes("edificio") ||
    text.includes("impianto")
  );
}

export function getLifecyclePhase(
  dossier: ContractDossier,
  phaseKey: ContractLifecyclePhaseKey,
): ContractLifecyclePhase {
  return dossier.phases.find(
    (phase) => phase.key === phaseKey,
  ) as ContractLifecyclePhase;
}

function buildIdentifiers(
  contract: Contract,
  cigClassification: ProcurementIdentifierClassification,
  cupClassification: ProcurementIdentifierClassification,
): ContractIdentifier[] {
  return [
    buildExternalIdentifier("cig", contract.cig ?? null, cigClassification),
    buildExternalIdentifier("cup", contract.cup ?? null, cupClassification),
    {
      kind: "internal_id",
      label: "ID interno",
      value: String(contract.id),
      normalizedValue: String(contract.id),
      formalStatus: "local-id",
      sourceStatus: "derived-data",
      sourceLabel: "Dataset locale",
      note: "Identificativo interno della piattaforma, non sostituisce CIG o CUP.",
    },
  ];
}

function buildExternalIdentifier(
  kind: "cig" | "cup",
  value: string | null,
  classification: ProcurementIdentifierClassification,
): ContractIdentifier {
  const formallyValid =
    classification.type === kind && classification.formallyValid;
  const isMissing = classification.type === "empty";
  const sourceUrl =
    kind === "cig" && formallyValid
      ? (preferredBdncpUrl(null, classification.normalized) ?? undefined)
      : undefined;

  return {
    kind,
    label: kind.toUpperCase(),
    value: value?.trim() || null,
    normalizedValue: classification.normalized || null,
    formalStatus: formallyValid
      ? "formal-only"
      : isMissing
        ? "missing"
        : "invalid-format",
    sourceStatus: formallyValid
      ? kind === "cig"
        ? "search-bridge"
        : "derived-data"
      : isMissing
        ? "missing-source"
        : "information-limit",
    sourceLabel:
      kind === "cig"
        ? "ANAC/BDNCP"
        : "Dataset locale, da collegare a fonte progetto",
    sourceUrl,
    note: formallyValid
      ? kind === "cig"
        ? "Formato CIG coerente: apre un ponte di ricerca BDNCP, non una sincronizzazione diretta."
        : "Formato CUP coerente: utile per l'asse opera/progetto, da verificare su fonte progetto."
      : isMissing
        ? `${kind.toUpperCase()} non rilevato nelle fonti disponibili.`
        : `${kind.toUpperCase()} presente ma non coerente con i controlli formali locali.`,
  };
}

function buildEvidence(
  contract: Contract,
  timeline: readonly StorylineEvent[],
  hasBdncpBridge: boolean,
): ContractEvidence[] {
  const evidence: ContractEvidence[] = [];

  if (hasBdncpBridge) {
    evidence.push({
      id: "bdncp-search-bridge",
      phaseKey: "gara_pubblicazione",
      title: "Ponte di ricerca BDNCP",
      description:
        "Collegamento ufficiale ANAC costruito dal CIG formalmente valido; non implica sincronizzazione della scheda nella piattaforma locale.",
      sourceKind: "bdncp",
      sourceStatus: "search-bridge",
      sourceLabel: "Portale dati aperti ANAC",
      sourceUrl: preferredBdncpUrl(contract.anacUrl, contract.cig) ?? undefined,
      identifier: contract.cig ?? undefined,
      isOfficialSourceEvidence: true,
    });
  }

  for (const event of timeline) {
    const phaseKey = mapStorylinePhase(event.phase);
    const hasAttachment = event.attachments.length > 0;
    evidence.push({
      id: `albo-${event.publicationId}`,
      phaseKey,
      title: event.tipologia,
      description: event.oggetto,
      sourceKind: "albo",
      sourceStatus: hasAttachment ? "official-source" : "derived-data",
      sourceLabel: hasAttachment
        ? `Albo Pretorio ${event.progressivo}`
        : `Riferimento Albo Pretorio ${event.progressivo}`,
      sourceUrl: `/albo/${event.publicationId}`,
      identifier: event.matchedBy.toUpperCase(),
      isOfficialSourceEvidence: hasAttachment,
    });
  }

  if (!contract.cig?.trim()) {
    evidence.push({
      id: "missing-cig",
      phaseKey: "gara_pubblicazione",
      title: "CIG non rilevato",
      description:
        "Il collegamento BDNCP richiede un CIG utilizzabile come chiave di ricerca.",
      sourceKind: "manual-review",
      sourceStatus: "missing-source",
      sourceLabel: "Limite informativo",
      isOfficialSourceEvidence: false,
    });
  }

  if (!contract.cup?.trim()) {
    evidence.push({
      id: "missing-cup",
      phaseKey: "programmazione",
      title: "CUP non rilevato",
      description:
        "Per lavori e opere pubbliche il CUP resta l'asse progetto/investimento da integrare quando disponibile.",
      sourceKind: "manual-review",
      sourceStatus: "missing-source",
      sourceLabel: "Limite informativo",
      isOfficialSourceEvidence: false,
    });
  }

  return evidence;
}

function buildPhase(input: {
  phaseKey: ContractLifecyclePhaseKey;
  contract: Contract;
  timeline: readonly StorylineEvent[];
  indicators?: StorylineIndicators;
  phaseEvidence: Map<ContractLifecyclePhaseKey | "other", ContractEvidence[]>;
  cigClassification: ProcurementIdentifierClassification;
  cupClassification: ProcurementIdentifierClassification;
  bdncpBridgeAvailable: boolean;
}): ContractLifecyclePhase {
  const { phaseKey, contract, indicators, phaseEvidence } = input;
  const evidenceForPhase = phaseEvidence.get(phaseKey) ?? [];
  const officialEvidence = evidenceForPhase.filter(
    (evidence) => evidence.isOfficialSourceEvidence,
  );

  if (phaseKey === "programmazione") {
    const hasCup =
      input.cupClassification.type === "cup" &&
      input.cupClassification.formallyValid;
    return {
      key: phaseKey,
      label: CONTRACT_LIFECYCLE_PHASE_LABELS[phaseKey],
      status: hasCup ? "partial" : "missing",
      summary: hasCup
        ? `CUP ${input.cupClassification.normalized} presente come asse progetto, fonte progetto da integrare.`
        : "Fase non documentata nelle fonti disponibili: CUP non rilevato.",
      evidenceIds: evidenceForPhase.map((evidence) => evidence.id),
      missing: hasCup ? ["Fonte progetto/CUP da collegare"] : ["CUP"],
    };
  }

  if (phaseKey === "progettazione") {
    const hasDesignContext = Boolean(
      contract.geoAddress ||
      contract.geoQuartiere ||
      contract.macrotema ||
      contract.description,
    );
    return {
      key: phaseKey,
      label: CONTRACT_LIFECYCLE_PHASE_LABELS[phaseKey],
      status: hasDesignContext ? "partial" : "missing",
      summary: hasDesignContext
        ? "Contesto tecnico o territoriale presente, documenti progettuali da collegare."
        : "Fase non documentata nelle fonti disponibili.",
      evidenceIds: evidenceForPhase.map((evidence) => evidence.id),
      missing: hasDesignContext
        ? ["Elaborati o atti progettuali"]
        : ["Documenti di progettazione"],
    };
  }

  if (phaseKey === "gara_pubblicazione") {
    const hasCig =
      input.cigClassification.type === "cig" &&
      input.cigClassification.formallyValid;
    const hasIngestedSource = evidenceForPhase.some(
      (evidence) => evidence.sourceStatus === "official-ingested-source",
    );
    return {
      key: phaseKey,
      label: CONTRACT_LIFECYCLE_PHASE_LABELS[phaseKey],
      status: hasIngestedSource
        ? "documented"
        : input.bdncpBridgeAvailable
          ? "partial"
          : hasCig
            ? "partial"
            : "missing",
      summary: hasIngestedSource
        ? "Gara/pubblicazione documentata da fonte ufficiale ingerita."
        : input.bdncpBridgeAvailable
          ? "CIG con collegamento parziale al punto di ricerca BDNCP/PVL."
          : hasCig
            ? "CIG presente, collegamento BDNCP da verificare."
            : "Fase non documentata nelle fonti disponibili: CIG non rilevato.",
      evidenceIds: evidenceForPhase.map((evidence) => evidence.id),
      missing: hasIngestedSource
        ? []
        : input.bdncpBridgeAvailable
          ? ["Sincronizzazione scheda BDNCP"]
          : ["CIG o link BDNCP"],
    };
  }

  if (phaseKey === "svolgimento_gara") {
    const hasCig =
      input.cigClassification.type === "cig" &&
      input.cigClassification.formallyValid;
    const status = officialEvidence.length
      ? "documented"
      : evidenceForPhase.length || input.bdncpBridgeAvailable || hasCig
        ? "partial"
        : "missing";
    return {
      key: phaseKey,
      label: CONTRACT_LIFECYCLE_PHASE_LABELS[phaseKey],
      status,
      summary: officialEvidence.length
        ? `${officialEvidence.length} evidenza/e sullo svolgimento della gara con fonte disponibile.`
        : evidenceForPhase.length
          ? "Evidenze sullo svolgimento della gara rilevate, fonte da completare."
          : input.bdncpBridgeAvailable
            ? "CIG con ponte di ricerca BDNCP/PVL; verbali, offerte o esiti di gara restano da collegare."
            : hasCig
              ? "CIG presente, ma svolgimento della gara da documentare con fonte esplicita."
              : "Fase non documentata nelle fonti disponibili.",
      evidenceIds: evidenceForPhase.map((evidence) => evidence.id),
      missing:
        status === "documented"
          ? []
          : ["Verbali di gara, offerte, graduatoria o esiti"],
    };
  }

  if (phaseKey === "affidamento") {
    const hasAwardData = Boolean(
      contract.awardDate || contract.supplier || contract.amount > 0,
    );
    const status = officialEvidence.length
      ? "documented"
      : evidenceForPhase.length || hasAwardData
        ? "partial"
        : "missing";
    return {
      key: phaseKey,
      label: CONTRACT_LIFECYCLE_PHASE_LABELS[phaseKey],
      status,
      summary: officialEvidence.length
        ? `${officialEvidence.length} atto/i di affidamento con fonte disponibile.`
        : evidenceForPhase.length
          ? "Atto/i di affidamento rilevati, fonte da verificare o allegato non presente."
          : hasAwardData
            ? "Dati di affidamento presenti nel record locale, atto da collegare."
            : "Fase non documentata nelle fonti disponibili.",
      evidenceIds: evidenceForPhase.map((evidence) => evidence.id),
      missing: status === "documented" ? [] : ["Atto di affidamento"],
    };
  }

  if (phaseKey === "esecuzione") {
    const phaseCounts = indicators?.phaseCounts ?? {};
    const executionCount =
      (phaseCounts.contratto ?? 0) +
      (phaseCounts.variante ?? 0) +
      (phaseCounts.liquidazione ?? 0);
    const status = officialEvidence.length
      ? "documented"
      : evidenceForPhase.length || executionCount > 0
        ? "partial"
        : "missing";
    return {
      key: phaseKey,
      label: CONTRACT_LIFECYCLE_PHASE_LABELS[phaseKey],
      status,
      summary: officialEvidence.length
        ? `${officialEvidence.length} evidenza/e di esecuzione con fonte disponibile.`
        : evidenceForPhase.length || executionCount > 0
          ? "Evidenze di esecuzione rilevate, documentazione da completare."
          : "Fase non documentata nelle fonti disponibili.",
      evidenceIds: evidenceForPhase.map((evidence) => evidence.id),
      missing:
        status === "documented"
          ? []
          : ["Contratto, SAL, varianti o liquidazioni"],
    };
  }

  const phaseCounts = indicators?.phaseCounts ?? {};
  const hasLiquidationStatus = indicators?.status === "liquidato";
  const collaudoCount = phaseCounts.collaudo ?? 0;
  const status = officialEvidence.length
    ? "documented"
    : evidenceForPhase.length || collaudoCount > 0 || hasLiquidationStatus
      ? "partial"
      : "missing";

  return {
    key: phaseKey,
    label: CONTRACT_LIFECYCLE_PHASE_LABELS[phaseKey],
    status,
    summary: officialEvidence.length
      ? `${officialEvidence.length} evidenza/e di collaudo o chiusura con fonte disponibile.`
      : evidenceForPhase.length || collaudoCount > 0
        ? "Chiusura o collaudo rilevati, fonte da completare."
        : hasLiquidationStatus
          ? "Liquidazioni presenti: collaudo o esito finale da verificare."
          : "Fase non documentata nelle fonti disponibili.",
    evidenceIds: evidenceForPhase.map((evidence) => evidence.id),
    missing:
      status === "documented" ? [] : ["Collaudo, CRE, valutazione o esito"],
  };
}

function buildOfficialLinks(
  contract: Contract,
  hasBdncpBridge: boolean,
): ContractOfficialLink[] {
  const links: ContractOfficialLink[] = [
    {
      label: "Pubblicita legale ANAC",
      href: ANAC_PVL_URL,
      sourceKind: "pvl",
      sourceStatus: "search-bridge",
      note: "Punto ufficiale di ricerca per bandi e avvisi, non sincronizzato nel record locale.",
    },
  ];
  const bdncpUrl = preferredBdncpUrl(contract.anacUrl, contract.cig);

  if (hasBdncpBridge && bdncpUrl) {
    links.unshift({
      label: "Ricerca BDNCP per CIG",
      href: bdncpUrl,
      sourceKind: "bdncp",
      sourceStatus: "search-bridge",
      note: "Collegamento parziale basato sul CIG.",
    });
  }

  return links;
}

function buildPublicLimits(
  contract: Contract,
  cigClassification: ProcurementIdentifierClassification,
  cupClassification: ProcurementIdentifierClassification,
): string[] {
  const limits = [
    "Il modulo espone collegamenti e dati locali: non dichiara una sincronizzazione completa con BDNCP/PCP.",
  ];

  if (cigClassification.type !== "cig" || !cigClassification.formallyValid) {
    limits.push(
      "CIG non rilevato o non coerente con i controlli formali locali.",
    );
  }

  if (cupClassification.type !== "cup" || !cupClassification.formallyValid) {
    limits.push("CUP non rilevato nelle fonti disponibili.");
  }

  if (detectPublicWork(contract) && !contract.cup?.trim()) {
    limits.push(
      "Per i lavori pubblici il CIG non basta a ricostruire l'asse opera/progetto: serve anche il CUP quando disponibile.",
    );
  }

  return limits;
}

function buildWorkAxis(
  contract: Contract,
  cupClassification: ProcurementIdentifierClassification,
): ContractWorkAxis {
  const isPublicWork = detectPublicWork(contract);
  const hasCup =
    cupClassification.type === "cup" && cupClassification.formallyValid;

  return {
    isPublicWork,
    label: isPublicWork ? "Asse opera/progetto" : "Asse contratto",
    cupStatus: hasCup ? "present" : "missing",
    cupValue: hasCup ? cupClassification.normalized : null,
    message: hasCup
      ? "CUP presente come riferimento al progetto/investimento."
      : "CUP non rilevato nelle fonti disponibili.",
  };
}

function groupEvidenceByPhase(
  evidence: readonly ContractEvidence[],
): Map<ContractLifecyclePhaseKey | "other", ContractEvidence[]> {
  const grouped = new Map<
    ContractLifecyclePhaseKey | "other",
    ContractEvidence[]
  >();

  for (const item of evidence) {
    const list = grouped.get(item.phaseKey) ?? [];
    list.push(item);
    grouped.set(item.phaseKey, list);
  }

  return grouped;
}

function mapStorylinePhase(
  phase: LifecyclePhase,
): ContractEvidence["phaseKey"] {
  if (phase === "affidamento") {
    return "affidamento";
  }

  if (
    phase === "contratto" ||
    phase === "variante" ||
    phase === "liquidazione"
  ) {
    return "esecuzione";
  }

  if (phase === "collaudo") {
    return "valutazione";
  }

  return "other";
}

function deriveCompleteness(
  phases: readonly ContractLifecyclePhase[],
): ContractDossier["lifecycleCompleteness"] {
  if (phases.every((phase) => phase.status === "documented")) {
    return "complete";
  }

  if (phases.some((phase) => phase.status === "missing")) {
    return "needs-review";
  }

  return "partial";
}

function hasIdentifier(
  dossier: ContractDossier,
  kind: ContractIdentifierKind,
  formalStatus: ContractIdentifierFormalStatus,
): boolean {
  return dossier.identifiers.some(
    (identifier) =>
      identifier.kind === kind && identifier.formalStatus === formalStatus,
  );
}

function phaseStatus(
  phases: readonly ContractLifecyclePhase[],
  phaseKey: ContractLifecyclePhaseKey,
): ContractLifecycleStatus {
  return phases.find((phase) => phase.key === phaseKey)?.status ?? "missing";
}

function mergeIngestionMetadata(
  explicitMetadata: readonly ContractIngestionMetadata[],
  evidence: readonly ContractEvidence[],
): ContractIngestionMetadata[] {
  const metadataByKey = new Map<string, ContractIngestionMetadata>();

  for (const item of explicitMetadata) {
    metadataByKey.set(ingestionMetadataKey(item), item);
  }

  for (const item of evidence) {
    if (item.ingestionMetadata) {
      metadataByKey.set(
        ingestionMetadataKey(item.ingestionMetadata),
        item.ingestionMetadata,
      );
    }
  }

  return [...metadataByKey.values()];
}

function ingestionMetadataKey(metadata: ContractIngestionMetadata): string {
  return `${metadata.source_dataset_id}:${metadata.source_record_id}:${metadata.parser_version}`;
}
