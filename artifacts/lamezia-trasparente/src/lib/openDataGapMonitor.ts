export type OpenDataDatasetId =
  | "albo_pretorio_export"
  | "consiglio_sedute_odg_verbali"
  | "pnrr_progetti"
  | "affidamenti_incarichi"
  | "segnalazioni_disservizi_aggregate"
  | "lavori_pubblici"
  | "verde_manutenzioni"
  | "mobilita_ordinanze";

export type OpenDataDatasetAvailability =
  | "published"
  | "external_export"
  | "absent"
  | "not_evaluable";

export type OpenDataReadinessLevel =
  | "catalog_empty"
  | "external_exports_only"
  | "partially_ready"
  | "ready_with_gaps"
  | "not_evaluable";

export interface OpenDataDatasetCandidate {
  readonly id: OpenDataDatasetId;
  readonly title: string;
  readonly civicUse: string;
  readonly proposalFocus: string;
}

export interface OpenDataDatasetEvidence {
  readonly candidateId: OpenDataDatasetId;
  readonly availability: OpenDataDatasetAvailability;
  readonly sourceName?: string;
  readonly sourceUrl?: string;
  readonly format?: string;
  readonly lastUpdated?: string;
  readonly license?: string;
  readonly metadataUrl?: string;
  readonly notes?: string;
}

export interface OpenDataCatalogSnapshot {
  readonly catalogName: string;
  readonly capturedAt?: string;
  readonly catalogUrl?: string;
  readonly evidence: readonly OpenDataDatasetEvidence[];
  readonly limitations?: readonly string[];
}

export interface OpenDataGapReportItem {
  readonly candidate: OpenDataDatasetCandidate;
  readonly availability: OpenDataDatasetAvailability;
  readonly sourceName: string | null;
  readonly sourceUrl: string | null;
  readonly format: string | null;
  readonly lastUpdated: string | null;
  readonly license: string | null;
  readonly metadataUrl: string | null;
  readonly metadataComplete: boolean;
  readonly description: string;
  readonly proposal: string;
  readonly notes: readonly string[];
}

export interface OpenDataGapReportCounts {
  readonly published: number;
  readonly external_export: number;
  readonly absent: number;
  readonly not_evaluable: number;
}

export interface OpenDataGapReport {
  readonly catalogName: string;
  readonly capturedAt: string | null;
  readonly readiness: OpenDataReadinessLevel;
  readonly readinessLabel: string;
  readonly readinessReason: string;
  readonly methodologicalNote: string;
  readonly counts: OpenDataGapReportCounts;
  readonly items: readonly OpenDataGapReportItem[];
  readonly limitations: readonly string[];
  readonly proposalSummary: readonly string[];
}

export const OPEN_DATA_DATASET_CANDIDATES: readonly OpenDataDatasetCandidate[] =
  [
    {
      id: "albo_pretorio_export",
      title: "Albo Pretorio export",
      civicUse:
        "Tracciare pubblicazioni, scadenze e categorie di atti con dati riusabili.",
      proposalFocus:
        "Prevedere export periodici con campi minimi e metadati di aggiornamento.",
    },
    {
      id: "consiglio_sedute_odg_verbali",
      title: "Consiglio comunale sedute, OdG e verbali",
      civicUse:
        "Seguire convocazioni, ordini del giorno, verbali e continuità documentale.",
      proposalFocus:
        "Collegare sedute, documenti e date in un dataset consultabile.",
    },
    {
      id: "pnrr_progetti",
      title: "PNRR progetti",
      civicUse:
        "Monitorare anagrafica, stato dichiarato e riferimenti pubblici dei progetti.",
      proposalFocus:
        "Esporre un quadro riusabile con fonte, aggiornamento e limiti del dato.",
    },
    {
      id: "affidamenti_incarichi",
      title: "Affidamenti e incarichi",
      civicUse:
        "Rendere verificabili oggetto, importo, periodo e riferimenti amministrativi disponibili.",
      proposalFocus:
        "Mantenere export coerenti con tracciabilità, formato e licenza dichiarati.",
    },
    {
      id: "segnalazioni_disservizi_aggregate",
      title: "Segnalazioni disservizi aggregate",
      civicUse:
        "Osservare in forma aggregata aree tematiche, tempi e stato delle segnalazioni.",
      proposalFocus:
        "Pubblicare solo dati aggregati e privi di informazioni personali identificabili.",
    },
    {
      id: "lavori_pubblici",
      title: "Lavori pubblici",
      civicUse:
        "Seguire interventi, localizzazione descrittiva, tempi e stato comunicato.",
      proposalFocus:
        "Rendere disponibili schede e aggiornamenti in formato aperto quando possibile.",
    },
    {
      id: "verde_manutenzioni",
      title: "Verde e manutenzioni",
      civicUse:
        "Documentare interventi programmati o conclusi su verde pubblico e manutenzioni.",
      proposalFocus:
        "Separare dati programmati, eseguiti e non valutabili con note di fonte.",
    },
    {
      id: "mobilita_ordinanze",
      title: "Mobilità e ordinanze",
      civicUse:
        "Consultare provvedimenti, periodi, aree interessate e allegati disponibili.",
      proposalFocus:
        "Associare ordinanze, date e riferimenti territoriali senza dedurre completezza.",
    },
  ];

const METHODOLOGICAL_NOTE =
  "Il report descrive solo indicatori di disponibilità documentati nello snapshot fornito; non misura qualità amministrativa, condotte o completezza oltre i campi disponibili.";

export function createOpenDataGapReport(
  snapshot: OpenDataCatalogSnapshot,
  candidates: readonly OpenDataDatasetCandidate[] = OPEN_DATA_DATASET_CANDIDATES,
): OpenDataGapReport {
  const evidenceByCandidate = indexEvidenceByCandidate(snapshot.evidence);
  const items = candidates.map((candidate) =>
    createOpenDataGapReportItem(
      candidate,
      evidenceByCandidate.get(candidate.id),
    ),
  );
  const counts = countOpenDataGapItems(items);
  const readiness = classifyOpenDataReadiness(counts, items.length);

  return {
    catalogName: snapshot.catalogName,
    capturedAt: snapshot.capturedAt ?? null,
    readiness,
    readinessLabel: labelOpenDataReadiness(readiness),
    readinessReason: explainOpenDataReadiness(readiness, counts, items.length),
    methodologicalNote: METHODOLOGICAL_NOTE,
    counts,
    items,
    limitations: [...(snapshot.limitations ?? [])],
    proposalSummary: buildProposalSummary(items),
  };
}

export function classifyOpenDataReadiness(
  counts: OpenDataGapReportCounts,
  totalCandidates: number,
): OpenDataReadinessLevel {
  if (totalCandidates === 0 || counts.not_evaluable === totalCandidates) {
    return "not_evaluable";
  }

  if (counts.published === 0 && counts.external_export === 0) {
    return "catalog_empty";
  }

  if (counts.published === 0 && counts.external_export > 0) {
    return "external_exports_only";
  }

  if (counts.absent === 0 && counts.not_evaluable === 0) {
    return "ready_with_gaps";
  }

  return "partially_ready";
}

export function countOpenDataGapItems(
  items: readonly Pick<OpenDataGapReportItem, "availability">[],
): OpenDataGapReportCounts {
  const counts: Record<OpenDataDatasetAvailability, number> = {
    published: 0,
    external_export: 0,
    absent: 0,
    not_evaluable: 0,
  };

  for (const item of items) {
    counts[item.availability] += 1;
  }

  return counts;
}

function createOpenDataGapReportItem(
  candidate: OpenDataDatasetCandidate,
  evidence: OpenDataDatasetEvidence | undefined,
): OpenDataGapReportItem {
  const availability = evidence?.availability ?? "absent";
  const metadataComplete = isMetadataComplete(evidence);

  return {
    candidate,
    availability,
    sourceName: evidence?.sourceName ?? null,
    sourceUrl: evidence?.sourceUrl ?? null,
    format: evidence?.format ?? null,
    lastUpdated: evidence?.lastUpdated ?? null,
    license: evidence?.license ?? null,
    metadataUrl: evidence?.metadataUrl ?? null,
    metadataComplete,
    description: describeAvailability(availability, metadataComplete),
    proposal: buildDatasetProposal(candidate, availability, metadataComplete),
    notes: evidence?.notes ? [evidence.notes] : [],
  };
}

function indexEvidenceByCandidate(
  evidence: readonly OpenDataDatasetEvidence[],
): Map<OpenDataDatasetId, OpenDataDatasetEvidence> {
  const indexed = new Map<OpenDataDatasetId, OpenDataDatasetEvidence>();

  for (const item of evidence) {
    if (!indexed.has(item.candidateId)) {
      indexed.set(item.candidateId, item);
    }
  }

  return indexed;
}

function isMetadataComplete(
  evidence: OpenDataDatasetEvidence | undefined,
): boolean {
  if (
    !evidence ||
    evidence.availability === "absent" ||
    evidence.availability === "not_evaluable"
  ) {
    return false;
  }

  return Boolean(
    evidence.sourceName &&
    evidence.format &&
    evidence.lastUpdated &&
    evidence.license &&
    evidence.metadataUrl,
  );
}

function describeAvailability(
  availability: OpenDataDatasetAvailability,
  metadataComplete: boolean,
): string {
  if (availability === "published") {
    return metadataComplete
      ? "Dataset indicato come pubblicato con metadati essenziali documentati."
      : "Dataset indicato come pubblicato, con metadati essenziali da completare o verificare.";
  }

  if (availability === "external_export") {
    return metadataComplete
      ? "Export disponibile fuori dal catalogo principale con metadati essenziali documentati."
      : "Export disponibile fuori dal catalogo principale, con metadati da completare o verificare.";
  }

  if (availability === "not_evaluable") {
    return "Dataset non valutabile con le sole informazioni presenti nello snapshot.";
  }

  return "Dataset non documentato nello snapshot fornito.";
}

function buildDatasetProposal(
  candidate: OpenDataDatasetCandidate,
  availability: OpenDataDatasetAvailability,
  metadataComplete: boolean,
): string {
  if (availability === "absent") {
    return `${candidate.proposalFocus} Priorità: colmare il data gap documentando fonte, formato, aggiornamento e licenza.`;
  }

  if (availability === "not_evaluable") {
    return `${candidate.proposalFocus} Priorità: chiarire la valutabilità del dataset prima di inferire disponibilità o assenza.`;
  }

  if (!metadataComplete) {
    return `${candidate.proposalFocus} Priorità: completare metadati minimi senza dedurre completezza non documentata.`;
  }

  return `${candidate.proposalFocus} Priorità: mantenere tracciabilità e aggiornamento dichiarato.`;
}

function labelOpenDataReadiness(readiness: OpenDataReadinessLevel): string {
  const labels: Record<OpenDataReadinessLevel, string> = {
    catalog_empty: "Catalogo non popolato per i dataset minimi",
    external_exports_only: "Export esterni presenti, catalogo da consolidare",
    partially_ready: "Disponibilità parziale con data gap",
    ready_with_gaps: "Base riusabile documentata, da monitorare",
    not_evaluable: "Valutazione non possibile con lo snapshot fornito",
  };

  return labels[readiness];
}

function explainOpenDataReadiness(
  readiness: OpenDataReadinessLevel,
  counts: OpenDataGapReportCounts,
  totalCandidates: number,
): string {
  if (readiness === "not_evaluable") {
    return "Le informazioni disponibili non consentono una distinzione documentata tra pubblicazione, export esterno o assenza.";
  }

  if (readiness === "catalog_empty") {
    return `Nessuno dei ${totalCandidates} dataset minimi risulta pubblicato o disponibile come export nello snapshot.`;
  }

  if (readiness === "external_exports_only") {
    return `${counts.external_export} dataset risultano disponibili come export esterni, senza dataset pubblicati nel catalogo principale.`;
  }

  if (readiness === "ready_with_gaps") {
    return `Tutti i ${totalCandidates} dataset minimi hanno una disponibilità documentata, ma restano da verificare aggiornamento e metadati nel tempo.`;
  }

  return `${counts.published} dataset risultano pubblicati e ${counts.external_export} disponibili come export esterni; restano ${counts.absent} assenze documentate e ${counts.not_evaluable} casi non valutabili.`;
}

function buildProposalSummary(
  items: readonly OpenDataGapReportItem[],
): string[] {
  return items
    .filter(
      (item) => item.availability !== "published" || !item.metadataComplete,
    )
    .map((item) => `${item.candidate.title}: ${item.proposal}`);
}
