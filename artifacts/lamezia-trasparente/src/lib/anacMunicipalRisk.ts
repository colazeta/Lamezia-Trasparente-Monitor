export type AnacMunicipalRiskCategory =
  | "mafia-dissolution-context"
  | "below-threshold-clustering"
  | "demographic-context"
  | "income-context"
  | "other-context";

export type AnacMunicipalRiskSourceStatus =
  | "documented"
  | "partial"
  | "missing-source"
  | "not-imported";

export type AnacMunicipalRiskInterpretation =
  | "context-signal"
  | "procurement-context"
  | "demographic-context"
  | "not-corruption-evidence";

export type AnacMunicipalRiskReadiness =
  | "reference-ready"
  | "needs-context"
  | "needs-source"
  | "not-publishable";

export type AnacMunicipalRiskPublicationBlockReason =
  | "missing-id"
  | "missing-indicator"
  | "missing-source-url"
  | "invalid-source-url"
  | "missing-methodology-url"
  | "invalid-methodology-url"
  | "non-prudent-interpretation";

export interface AnacMunicipalRiskReference {
  id: string;
  indicatorCode?: string;
  indicatorName: string;
  category: AnacMunicipalRiskCategory;
  sourceUrl?: string;
  methodologyUrl?: string;
  periodLabel?: string;
  lastDocumentedYear?: number;
  sourceStatus: AnacMunicipalRiskSourceStatus;
  interpretation: AnacMunicipalRiskInterpretation | string;
}

export interface AnacMunicipalRiskUrlValidation {
  input: string;
  normalizedUrl?: string;
  valid: boolean;
  reason: "allowed-protocol" | "empty-url" | "invalid-url" | "blocked-protocol";
}

export interface AnacMunicipalRiskAssessment {
  id: string;
  readiness: AnacMunicipalRiskReadiness;
  label: string;
  publicationBlockReasons: AnacMunicipalRiskPublicationBlockReason[];
}

export interface AnacMunicipalRiskCounts {
  byCategory: Record<AnacMunicipalRiskCategory, number>;
  bySourceStatus: Record<AnacMunicipalRiskSourceStatus, number>;
}

const ALLOWED_URL_PROTOCOLS = new Set(["http:", "https:", "demo:"]);

const CATEGORY_LABELS: Record<AnacMunicipalRiskCategory, string> = {
  "mafia-dissolution-context": "contesto documentale su scioglimenti",
  "below-threshold-clustering": "indicatore di contesto su soglie di affidamento",
  "demographic-context": "contesto demografico",
  "income-context": "contesto socio-economico",
  "other-context": "altro contesto metodologico",
};

const INTERPRETATION_LABELS: Record<AnacMunicipalRiskInterpretation, string> = {
  "context-signal": "segnale da contestualizzare",
  "procurement-context": "contesto amministrativo da verificare",
  "demographic-context": "contesto descrittivo da verificare",
  "not-corruption-evidence": "non è evidenza di corruzione o irregolarità",
};

const PRUDENT_INTERPRETATIONS: ReadonlySet<string> = new Set(Object.keys(INTERPRETATION_LABELS));

const CATEGORY_ORDER: readonly AnacMunicipalRiskCategory[] = [
  "below-threshold-clustering",
  "demographic-context",
  "income-context",
  "mafia-dissolution-context",
  "other-context",
];

/**
 * Normalizza e valida localmente URL di riferimento metodologico ANAC.
 * Non effettua fetch, lookup su dashboard o verifica di esistenza della fonte.
 */
export function validateAnacMunicipalRiskUrl(value: string | null | undefined): AnacMunicipalRiskUrlValidation {
  const input = value ?? "";
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return { input, valid: false, reason: "empty-url" };
  }

  try {
    const url = new URL(trimmed);

    if (!ALLOWED_URL_PROTOCOLS.has(url.protocol)) {
      return { input, valid: false, reason: "blocked-protocol" };
    }

    return { input, normalizedUrl: url.href, valid: true, reason: "allowed-protocol" };
  } catch {
    return { input, valid: false, reason: "invalid-url" };
  }
}

/**
 * Produce una label tecnica neutra: il riferimento resta un contesto
 * metodologico da verificare, non una prova di condotte o irregolarità.
 */
export function formatAnacMunicipalRiskLabel(reference: AnacMunicipalRiskReference): string {
  const indicator = reference.indicatorCode
    ? `${reference.indicatorCode.trim()} · ${reference.indicatorName.trim()}`
    : reference.indicatorName.trim();
  const categoryLabel = CATEGORY_LABELS[reference.category];
  const interpretationLabel = isPrudentInterpretation(reference.interpretation)
    ? INTERPRETATION_LABELS[reference.interpretation]
    : "interpretazione da rivedere prima della pubblicazione";

  return `${indicator} — ${categoryLabel}; ${interpretationLabel}`;
}

export function classifyAnacMunicipalRiskReference(
  reference: AnacMunicipalRiskReference,
): AnacMunicipalRiskAssessment {
  const publicationBlockReasons = findAnacMunicipalRiskPublicationBlocks(reference);
  const label = formatAnacMunicipalRiskLabel(reference);

  if (publicationBlockReasons.length > 0) {
    return {
      id: reference.id,
      readiness: "not-publishable",
      label,
      publicationBlockReasons,
    };
  }

  if (reference.sourceStatus === "missing-source") {
    return {
      id: reference.id,
      readiness: "needs-source",
      label,
      publicationBlockReasons,
    };
  }

  if (reference.sourceStatus !== "documented" || !hasPeriodContext(reference)) {
    return {
      id: reference.id,
      readiness: "needs-context",
      label,
      publicationBlockReasons,
    };
  }

  return {
    id: reference.id,
    readiness: "reference-ready",
    label,
    publicationBlockReasons,
  };
}

export function findAnacMunicipalRiskPublicationBlocks(
  reference: AnacMunicipalRiskReference,
): AnacMunicipalRiskPublicationBlockReason[] {
  const reasons: AnacMunicipalRiskPublicationBlockReason[] = [];

  if (reference.id.trim().length === 0) {
    reasons.push("missing-id");
  }

  if (!reference.indicatorCode?.trim() && reference.indicatorName.trim().length === 0) {
    reasons.push("missing-indicator");
  }

  const sourceUrl = validateAnacMunicipalRiskUrl(reference.sourceUrl);
  if (!reference.sourceUrl?.trim()) {
    reasons.push("missing-source-url");
  } else if (!sourceUrl.valid) {
    reasons.push("invalid-source-url");
  }

  const methodologyUrl = validateAnacMunicipalRiskUrl(reference.methodologyUrl);
  if (!reference.methodologyUrl?.trim()) {
    reasons.push("missing-methodology-url");
  } else if (!methodologyUrl.valid) {
    reasons.push("invalid-methodology-url");
  }

  if (!isPrudentInterpretation(reference.interpretation)) {
    reasons.push("non-prudent-interpretation");
  }

  return reasons;
}

export function countAnacMunicipalRiskReferences(
  references: readonly AnacMunicipalRiskReference[],
): AnacMunicipalRiskCounts {
  const byCategory = createCategoryCounts();
  const bySourceStatus = createSourceStatusCounts();

  for (const reference of references) {
    byCategory[reference.category] += 1;
    bySourceStatus[reference.sourceStatus] += 1;
  }

  return { byCategory, bySourceStatus };
}

export function sortAnacMunicipalRiskReferences(
  references: readonly AnacMunicipalRiskReference[],
): AnacMunicipalRiskReference[] {
  return [...references].sort((left, right) => {
    const categoryDelta = CATEGORY_ORDER.indexOf(left.category) - CATEGORY_ORDER.indexOf(right.category);

    if (categoryDelta !== 0) {
      return categoryDelta;
    }

    return left.id.localeCompare(right.id, "it", { sensitivity: "base", numeric: true });
  });
}

function hasPeriodContext(reference: AnacMunicipalRiskReference): boolean {
  return Boolean(reference.periodLabel?.trim()) || typeof reference.lastDocumentedYear === "number";
}

function isPrudentInterpretation(value: string): value is AnacMunicipalRiskInterpretation {
  return PRUDENT_INTERPRETATIONS.has(value);
}

function createCategoryCounts(): Record<AnacMunicipalRiskCategory, number> {
  return {
    "mafia-dissolution-context": 0,
    "below-threshold-clustering": 0,
    "demographic-context": 0,
    "income-context": 0,
    "other-context": 0,
  };
}

function createSourceStatusCounts(): Record<AnacMunicipalRiskSourceStatus, number> {
  return {
    "documented": 0,
    "partial": 0,
    "missing-source": 0,
    "not-imported": 0,
  };
}
