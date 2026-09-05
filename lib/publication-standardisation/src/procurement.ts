export const PROCUREMENT_TAXONOMY_SCHEMA_VERSION =
  "procurement-taxonomy.v1" as const;
export const PROCUREMENT_TAXONOMY_ID =
  "municipal-procurement-lifecycle-it" as const;
export const PROCUREMENT_TAXONOMY_VERSION = "2026-09-05.1" as const;

export type ProcurementClassificationStatus =
  | "classified"
  | "review_required"
  | "not_applicable"
  | "unknown";

export type ProcurementRelevance = "confirmed" | "possible" | "none" | "unknown";

export type ProcurementPhase =
  | "planning"
  | "tender"
  | "award"
  | "execution"
  | "payment"
  | "closure"
  | "other"
  | "unknown";

export type ProcurementDocumentType =
  | "determination"
  | "deliberation"
  | "ordinance"
  | "decree"
  | "notice"
  | "notification"
  | "other"
  | "unknown";

export type ProcurementAdministrativeAction =
  | "decision_to_contract"
  | "tender"
  | "direct_award"
  | "award"
  | "commitment"
  | "contract"
  | "sal"
  | "variation"
  | "extension"
  | "liquidation"
  | "invoice"
  | "payment"
  | "testing";

export type ProcurementIdentifierType = "cig" | "cup";

export interface ProcurementIdentifier {
  type: ProcurementIdentifierType;
  value: string;
  source_field: "subject";
  extraction_method: "deterministic_regex";
  format_status: "format_valid";
}

export interface ProcurementTaxonomyEvidence {
  rule_id: string;
  input_field: "subject" | "act_type" | "office" | "presentation.action_id";
  matched_text: string;
}

export interface ProcurementTaxonomyInput {
  subject?: string | null;
  act_type?: string | null;
  office?: string | null;
  presentation_action_id?: string | null;
}

export interface ProcurementTaxonomyAssignment {
  schema_version: typeof PROCUREMENT_TAXONOMY_SCHEMA_VERSION;
  taxonomy_id: typeof PROCUREMENT_TAXONOMY_ID;
  taxonomy_version: typeof PROCUREMENT_TAXONOMY_VERSION;
  locale: "it-IT";
  input_boundary: "public_safe_only";
  execution: "deterministic_rules";
  classification_status: ProcurementClassificationStatus;
  relevance: ProcurementRelevance;
  confidence: "high" | "medium" | "low" | null;
  document_type: ProcurementDocumentType;
  administrative_actions: ProcurementAdministrativeAction[];
  phase: ProcurementPhase;
  identifiers: ProcurementIdentifier[];
  evidence: ProcurementTaxonomyEvidence[];
  review_reasons: string[];
}

type ActionRule = {
  id: string;
  action: ProcurementAdministrativeAction;
  phase: ProcurementPhase;
  strength: "strong" | "possible";
  pattern: RegExp;
};

const ACTION_RULES: readonly ActionRule[] = [
  {
    id: "decision-to-contract",
    action: "decision_to_contract",
    phase: "planning",
    strength: "strong",
    pattern: /\b(?:DECISIONE|DETERMINA(?:ZIONE)?)\s+A\s+CONTRARRE\b/iu,
  },
  {
    id: "direct-award",
    action: "direct_award",
    phase: "award",
    strength: "strong",
    pattern: /\bAFFIDAMENTO\s+DIRETTO\b/iu,
  },
  {
    id: "award",
    action: "award",
    phase: "award",
    strength: "strong",
    pattern: /\b(?:AGGIUDICAZION\w*|AFFIDAMENT\w*)\b/iu,
  },
  {
    id: "tender",
    action: "tender",
    phase: "tender",
    strength: "strong",
    pattern:
      /\b(?:BANDO\s+DI\s+GARA|GARA|PROCEDURA\s+APERTA|PROCEDURA\s+NEGOZIATA|RDO|R\.D\.O\.|TRATTATIVA\s+DIRETTA|MANIFESTAZIONE\s+DI\s+INTERESSE)\b/iu,
  },
  {
    id: "commitment",
    action: "commitment",
    phase: "award",
    strength: "possible",
    pattern: /\bIMPEGNO\s+DI\s+SPESA\b/iu,
  },
  {
    id: "contract",
    action: "contract",
    phase: "execution",
    strength: "possible",
    pattern: /\b(?:CONTRATTO|STIPULA(?:ZIONE)?)\b/iu,
  },
  {
    id: "sal",
    action: "sal",
    phase: "execution",
    strength: "possible",
    pattern: /\b(>:SAL|STATO\s+DI?\s*AVANZAMENTO(?:\s+LAVORI)?)\b/iu,
  },
  {
    id: "variation",
    action: "variation",
    phase: "execution",
    strength: "possible",
    pattern: /\b(?:VARIANTE|PERIZIA\s+DI\s+VARIANTE)\b/iu,
  },
  {
    id: "extension",
    action: "extension",
    phase: "execution",
    strength: "possible",
    pattern: /\b(>:PROROGA|RINNOVO)\b/iu,
  },
  {
    id: "liquidation",
    action: "liquidation",
    phase: "payment",
    strength: "possible",
    pattern: /\bLIQUIDAZION\w*\b/iu,
  },
  {
    id: "invoice",
    action: "invoice",
    phase: "payment",
    strength: "possible",
    pattern: /\bFATTUR\w*\b/iu,
  },
  {
    id: "payment",
    action: "payment",
    phase: "payment",
    strength: "possible",
    pattern: /\b(?:PAGAMENTO|SALDO|ACCONTO)\b/iu,
  },
  {
    id: "testing",
    action: "testing",
    phase: "closure",
    strength: "possible",
    pattern:
      /\b(?:COLLAUD\w*|CERTIFICATO\s+DI\s+REGOLARE\s+ESECUZIONE|CRE)\b/iu,
  },
] as const;

const PROCUREMENT_CONTEXT_RULES = [
  {
    id: "public-contract",
    pattern: /\b(>:APPALTO|CONCESSIONE|ACCORDO\s+QUADRO)\b/iu,
  },
  {
    id: "economic-operator",
    pattern: /\b(?:OPERATORE\s+ECONOMICO|DITTA|IMPRESA|SOCIET{AÀ])\b/iu,
  },
  {
    id: "procured-object",
    pattern: /\b(?:FORNITUR\w*|SERVIZ(?:IO|I)\b|LAVORI\b)/iu,
  },
  {
    id: "e-procurement",
    pattern: /\b(?:MEPA|CONSIP|MERCATO\s+ELETTRONICO)\b/iu,
  },
] as const;

const CIG_PATTERN =
  /(?:\bCIG\b|\bC\s*\.\s*I\s*\.\s*G\s*\.)(?:\s+(?:AQ|CONTRATTO\s+SPECIFICO))?(?:\s*(?:N(?:\.|°|º)?|NR\.?))?\s*[:\-]?\s*([A-Z0-9]{10})\b/giu;
const CUP_PATTERN =
  /\bCUP\b(?:\s*(?:N(?:\.|°|º)?|NR\.?))?\s*[:\-]?\s*([A-Z0-9]{15})\b/giu;

export function extractProcurementCigs(
  value: string | null | undefined,
): string[] {
  return uniqueMatches(value, CIG_PATTERN, 1);
}

export function extractProcurementCups(
  value: string | null | undefined,
): string[] {
  return uniqueMatches(value, CUP_PATTERN, 1);
}

export function classifyProcurementRecord(
  input: ProcurementTaxonomyInput,
): ProcurementTaxonomyAssignment {
  const subject = cleanText(input.subject);
  const actType = cleanText(input.act_type);
  const office = cleanText(input.office);
  const actionId = cleanText(input.presentation_action_id);
  const withheldSubject = isWithheldPublicSubject(subject);
  const evidenceFields = ([
    { field: "subject", value: withheldSubject ? "" : subject },
    { field: "act_type", value: actType },
    { field: "office", value: office },
    { field: "presentation.action_id", value: actionId },
  ] satisfies Array<{
    field: ProcurementTaxonomyEvidence["input_field"];
    value: string;
  }>).filter((entry) => Boolean(entry.value));
  const classificationText = evidenceFields.map((entry) => entry.value).join(" ");
  const documentType = deriveDocumentType(actType, withheldSubject ? "" : subject);
  const identifiers = extractIdentifiers(withheldSubject ? "" : subject);
  const evidence: ProcurementTaxonomyEvidence[] = [];

  for (const identifier of identifiers) {
    evidence.push({
      rule_id: `identifier-${identifier.type}`,
      input_field: "subject",
      matched_text: identifier.value,
    });
  }

  if (!classificationText) {
    return assignment({
      classification_status: "unknown",
      relevance: "unknown",
      confidence: null,
      document_type: documentType,
      administrative_actions: [],
      phase: "unknown",
      identifiers,
      evidence,
      review_reasons: [
        withheldSubject
          ? "input_withheld_for_privacy"
          : "insufficient_public_safe_input",
      ],
    });
  }

  const matchedActions: Array<ActionRule & { matchedText: string }> = [];
  for (const rule of ACTION_RULES) {
    const matched = firstFieldMatch(evidenceFields, rule.pattern);
    if (!matched) continue;
    matchedActions.push({ ...rule, matchedText: matched.matchedText });
    evidence.push({
      rule_id: rule.id,
      input_field: matched.field,
      matched_text: matched.matchedText,
    });
  }

  const contextMatches: Array<{ id: string; matchedText: string }> = [];
  for (const rule of PROCUREMENT_CONTEXT_RULES) {
    const matched = firstFieldMatch(evidenceFields, rule.pattern);
    if (!matched) continue;
    contextMatches.push({ id: rule.id, matchedText: matched.matchedText });
    evidence.push({
      rule_id: rule.id,
      input_field: matched.field,
      matched_text: matched.matchedText,
    });
  }

  const actions = uniqueActions(matchedActions.map((match) => match.action));
  const hasCig = identifiers.some((identifier) => identifier.type === "cig");
  const hasCup = identifiers.some((identifier) => identifier.type === "cup");
  const hasStrongAction = matchedActions.some((match) => match.strength === "strong");
  const hasPossibleAction = matchedActions.some(
    (match) => match.strength === "possible",
  );
  const hasProcurementContext = contextMatches.length > 0;

  let relevance: ProcurementRelevance;
  let classificationStatus: ProcurementClassificationStatus;
  let confidence: ProcurementTaxonomyAssignment["confidence"];
  const reviewReasons: string[] = [];

  if (hasCig) {
    relevance = "confirmed";
    classificationStatus = "classified";
    confidence = "high";
  } else if (hasStrongAction || (hasPossibleAction && hasProcurementContext)) {
    relevance = "confirmed";
    classificationStatus = "classified";
    confidence = hasStrongAction ? "high" : "medium";
  } else if (hasPossibleAction || hasProcurementContext || hasCup) {
    relevance = "possible";
    classificationStatus = "review_required";
    confidence = "low";
    reviewReasons.push("procurement_relevance_requires_review");
  } else {
    relevance = "none";
    classificationStatus = "not_applicable";
    confidence = "medium";
  }

  if (identifiers.filter((identifier) => identifier.type === "cig").length > 1) {
    reviewReasons.push("multiple_cigs_same_record");
  }

  return assignment({
    classification_status: classificationStatus,
    relevance,
    confidence,
    document_type: documentType,
    administrative_actions: actions,
    phase: derivePhase(matchedActions),
    identifiers,
    evidence,
    review_reasons: reviewReasons,
  });
}

function assignment(
  values: Omit<
    ProcurementTaxonomyAssignment,
    | "schema_version"
    | "taxonomy_id"
    | "taxonomy_version"
    | "locale"
    | "input_boundary"
    | "execution"
  >,
): ProcurementTaxonomyAssignment {
  return {
    schema_version: PROCUREMENT_TAXONOMY_SCHEMA_VERSION,
    taxonomy_id: PROCUREMENT_TAXONOMY_ID,
    taxonomy_version: PROCUREMENT_TAXONOMY_VERSION,
    locale: "it-IT",
    input_boundary: "public_safe_only",
    execution: "deterministic_rules",
    ...values,
  };
}

function extractIdentifiers(subject: string): ProcurementIdentifier[] {
  return [
    ...extractProcurementCigs(subject).map<ProcurementIdentifier>((value) => ({
      type: "cig",
      value,
      source_field: "subject",
      extraction_method: "deterministic_regex",
      format_status: "format_valid",
    })),
    ...extractProcurementCups(subject).map<ProcurementIdentifier>((value) => ({
      type: "cup",
      value,
      source_field: "subject",
      extraction_method: "deterministic_regex",
      format_status: "format_valid",
    })),
  ];
}

function deriveDocumentType(
  actType: string,
  subject: string,
): ProcurementDocumentType {
  const value = `${actType} ${subject}`.trim();
  if (!value) return "unknown";
  if (/\bDETERMINA(?:ZIONE)?\b/iu.test(value)) return "determination";
  if (/\bDELIBERA(?:ZIONE)?\b/iu.test(value)) return "deliberation";
  if (/\bORDINANZA\b/iu.test(value)) return "ordinance";
  if (/\bDECRETO\b/iu.test(value)) return "decree";
  if (/\b(?:AVVISO|BANDO)\b/iu.test(value)) return "notice";
  if (/\b(?:NOTIFICA|DEPOSITO|PUBBLICAZIONE)\b/iu.test(value)) {
    return "notification";
  }
  return "other";
}

function derivePhase(
  matches: readonly (ActionRule & { matchedText: string })[],
): ProcurementPhase {
  if (matches.length === 0) return "other";
  const priority: Record<ProcurementPhase, number> = {
    unknown: 0,
    other: 1,
    planning: 2,
    tender: 3,
    award: 4,
    execution: 5,
    payment: 6,
    closure: 7,
  };
  return matches.reduce<ProcurementPhase>(
    (best, match) => (priority[match.phase] > priority[best] ? match.phase : best),
    "other",
  );
}

function firstFieldMatch(
  fields: readonly {
    field: ProcurementTaxonomyEvidence["input_field"];
    value: string;
  }[],
  pattern: RegExp,
): {
  field: ProcurementTaxonomyEvidence["input_field"];
  matchedText: string;
} | null {
  for (const entry of fields) {
    const match = entry.value.match(pattern)?.[0]?.trim();
    if (match) return { field: entry.field, matchedText: match };
  }
  return null;
}

function uniqueMatches(
  value: string | null | undefined,
  pattern: RegExp,
  captureGroup: number,
): string[] {
  const source = value?.toUpperCase() ?? "";
  const matches = Array.from(source.matchAll(pattern))
    .map((match) => match[captureGroup]?.trim())
    .filter((match): match is string => Boolean(match));
  return Array.from(new Set(matches));
}

function uniqueActions(
  values: ProcurementAdministrativeAction[],
): ProcurementAdministrativeAction[] {
  return Array.from(new Set(values));
}

function cleanText(value: string | null | undefined): string {
  return value?.normalize("NFC").replace(/\s+/gu, " ").trim() ?? "";
}

function isWithheldPublicSubject(value: string): boolean {
  const normalized = value.toLocaleLowerCase("it-IT");
  return (
    normalized.includes("metadato minimo") ||
    normalized.includes("oggetto non ripubblicato per prudenza privacy")
  );
}
