export type ProcurementEvidenceType =
  | "cig-reference"
  | "cup-reference"
  | "albo-act"
  | "determina"
  | "contract-notice"
  | "award-outcome"
  | "project-sheet"
  | "supporting-document"
  | "missing-source"
  | "other";

export type ProcurementEvidenceRelation =
  | "direct-reference"
  | "supporting-context"
  | "requires-verification"
  | "not-linked";

export type ProcurementEvidenceSourceStatus =
  | "documented"
  | "partial"
  | "missing-source"
  | "not-imported"
  | "demo-only";

export type ProcurementEvidenceInterpretation =
  | "documentary-evidence"
  | "context-only"
  | "identifier-reference"
  | "not-compliance-finding";

export type ProcurementEvidenceReadiness =
  | "documentary-reference"
  | "partial-reference"
  | "requires-source"
  | "demo-reference";

export interface ProcurementEvidence {
  id: string;
  evidenceType: ProcurementEvidenceType;
  relation: ProcurementEvidenceRelation;
  sourceUrl?: string;
  sourceLabel?: string;
  identifier?: string;
  sourceStatus: ProcurementEvidenceSourceStatus;
  interpretation: ProcurementEvidenceInterpretation;
}

export interface ProcurementEvidenceUrlValidation {
  valid: boolean;
  protocol: "http" | "https" | "demo" | "unsupported" | "missing" | "invalid";
  normalizedUrl?: string;
}

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "demo:"]);

const EVIDENCE_TYPES: readonly ProcurementEvidenceType[] = [
  "cig-reference",
  "cup-reference",
  "albo-act",
  "determina",
  "contract-notice",
  "award-outcome",
  "project-sheet",
  "supporting-document",
  "missing-source",
  "other",
];

const SOURCE_STATUSES: readonly ProcurementEvidenceSourceStatus[] = [
  "documented",
  "partial",
  "missing-source",
  "not-imported",
  "demo-only",
];

const TYPE_LABELS: Record<ProcurementEvidenceType, string> = {
  "cig-reference": "Riferimento identificativo CIG da verificare",
  "cup-reference": "Riferimento identificativo CUP da verificare",
  "albo-act": "Riferimento ad atto di albo da verificare",
  determina: "Riferimento a determina da verificare",
  "contract-notice": "Riferimento ad avviso di contratto da verificare",
  "award-outcome": "Riferimento a esito di affidamento da verificare",
  "project-sheet": "Riferimento a scheda progetto da verificare",
  "supporting-document": "Documento di contesto da verificare",
  "missing-source": "Fonte documentale da integrare",
  other: "Riferimento documentale da verificare",
};

/**
 * Verifica locale e deterministica del formato URL. Non apre connessioni,
 * non consulta registri esterni e non conferma l'esistenza del documento.
 */
export function validateProcurementEvidenceUrl(
  sourceUrl: string | null | undefined,
): ProcurementEvidenceUrlValidation {
  const trimmedUrl = sourceUrl?.trim() ?? "";

  if (trimmedUrl.length === 0) {
    return { valid: false, protocol: "missing" };
  }

  try {
    const parsedUrl = new URL(trimmedUrl);

    if (!ALLOWED_PROTOCOLS.has(parsedUrl.protocol)) {
      return { valid: false, protocol: "unsupported" };
    }

    return {
      valid: true,
      protocol: protocolName(parsedUrl.protocol),
      normalizedUrl: parsedUrl.toString(),
    };
  } catch {
    return { valid: false, protocol: "invalid" };
  }
}

/**
 * Produce una label tecnica e prudente per riferimenti documentali. La label
 * non trasforma il riferimento in prova sostanziale o rilievo di conformità.
 */
export function buildProcurementEvidenceLabel(evidence: ProcurementEvidence): string {
  const explicitLabel = normalizeOptionalText(evidence.sourceLabel);

  if (explicitLabel) {
    return `${explicitLabel} — riferimento documentale da verificare`;
  }

  return TYPE_LABELS[evidence.evidenceType];
}

/**
 * Classifica la readiness documentale per successive verifiche umane. Non è
 * scoring, ranking o valutazione di regolarità dell'affidamento.
 */
export function classifyProcurementEvidenceReadiness(
  evidence: ProcurementEvidence,
): ProcurementEvidenceReadiness {
  const urlValidation = validateProcurementEvidenceUrl(evidence.sourceUrl);

  if (evidence.sourceStatus === "demo-only" || urlValidation.protocol === "demo") {
    return "demo-reference";
  }

  if (
    evidence.sourceStatus === "missing-source" ||
    evidence.sourceStatus === "not-imported" ||
    evidence.evidenceType === "missing-source" ||
    evidence.relation === "not-linked" ||
    !urlValidation.valid
  ) {
    return "requires-source";
  }

  if (
    evidence.sourceStatus === "partial" ||
    evidence.relation === "requires-verification" ||
    evidence.interpretation === "context-only" ||
    evidence.interpretation === "not-compliance-finding"
  ) {
    return "partial-reference";
  }

  return "documentary-reference";
}

export function countProcurementEvidenceByType(
  evidenceItems: readonly ProcurementEvidence[],
): Record<ProcurementEvidenceType, number> {
  const counts = createZeroCounts(EVIDENCE_TYPES);

  for (const evidence of evidenceItems) {
    counts[evidence.evidenceType] += 1;
  }

  return counts;
}

export function countProcurementEvidenceByStatus(
  evidenceItems: readonly ProcurementEvidence[],
): Record<ProcurementEvidenceSourceStatus, number> {
  const counts = createZeroCounts(SOURCE_STATUSES);

  for (const evidence of evidenceItems) {
    counts[evidence.sourceStatus] += 1;
  }

  return counts;
}

/**
 * Restituisce un nuovo array ordinato in modo deterministico senza mutare
 * l'input. L'ordinamento è tecnico e non rappresenta priorità sostanziale.
 */
export function sortProcurementEvidence(
  evidenceItems: readonly ProcurementEvidence[],
): ProcurementEvidence[] {
  return [...evidenceItems].sort(compareProcurementEvidence);
}

function protocolName(protocol: string): ProcurementEvidenceUrlValidation["protocol"] {
  if (protocol === "http:") {
    return "http";
  }

  if (protocol === "https:") {
    return "https";
  }

  if (protocol === "demo:") {
    return "demo";
  }

  return "unsupported";
}

function normalizeOptionalText(value: string | null | undefined): string {
  return value?.trim().replace(/\s+/g, " ") ?? "";
}

function createZeroCounts<T extends string>(keys: readonly T[]): Record<T, number> {
  return Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>;
}

function compareProcurementEvidence(a: ProcurementEvidence, b: ProcurementEvidence): number {
  return (
    compareText(a.evidenceType, b.evidenceType) ||
    compareText(a.sourceStatus, b.sourceStatus) ||
    compareText(a.relation, b.relation) ||
    compareText(a.interpretation, b.interpretation) ||
    compareText(a.identifier ?? "", b.identifier ?? "") ||
    compareText(a.sourceLabel ?? "", b.sourceLabel ?? "") ||
    compareText(a.sourceUrl ?? "", b.sourceUrl ?? "") ||
    compareText(a.id, b.id)
  );
}

function compareText(a: string, b: string): number {
  if (a < b) {
    return -1;
  }

  if (a > b) {
    return 1;
  }

  return 0;
}
