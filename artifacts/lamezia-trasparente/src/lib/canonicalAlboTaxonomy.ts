import { classifyProcurementIdentifier } from "./procurementIdentifiers";

export const CANONICAL_TAXONOMY_VERSION = "lamezia-canonical-taxonomy.v2" as const;

export type TaxonomyStatus =
  | "classified"
  | "review_required"
  | "insufficient_evidence";

export type ProcurementRelevance = "none" | "possible" | "confirmed";

export type AdministrativeAction =
  | "affidamento"
  | "aggiudicazione"
  | "decisione_contrarre"
  | "gara"
  | "impegno_spesa"
  | "liquidazione"
  | "pagamento"
  | "sal"
  | "proroga"
  | "variante"
  | "collaudo"
  | "contratto"
  | "revoca_annullamento"
  | "altro";

export type ProcurementPhase =
  | "programmazione"
  | "gara"
  | "affidamento"
  | "esecuzione"
  | "pagamento"
  | "conclusione"
  | "unknown"
  | "not_applicable";

export type DocumentType =
  | "determinazione"
  | "deliberazione"
  | "ordinanza"
  | "avviso"
  | "decreto"
  | "verbale"
  | "contratto"
  | "altro"
  | "unknown";

export type CanonicalAlboClassification = {
  taxonomyVersion: typeof CANONICAL_TAXONOMY_VERSION;
  taxonomyStatus: TaxonomyStatus;
  documentType: DocumentType;
  administrativeActions: AdministrativeAction[];
  procurementRelevance: ProcurementRelevance;
  procurementPhase: ProcurementPhase;
  identifiers: {
    /** Syntactic 10-character tokens observed after an explicit CIG label. */
    cigCandidates: string[];
    /** Formally valid CIGs eligible to become contract identities. */
    cigs: string[];
    /** CIG-length candidates preserved as source evidence but ineligible as identities. */
    invalidCigs: string[];
    /** Syntactic 15-character tokens observed after an explicit CUP label. */
    cupCandidates: string[];
    /** Formally valid CUPs eligible for project linkage. */
    cups: string[];
    /** CUP-length candidates preserved as evidence but not project identifiers. */
    invalidCups: string[];
  };
  evidence: {
    sourceFields: Array<"subject" | "display_title">;
    matchedSignals: string[];
  };
};

export type TaxonomisableAlboItem = {
  subject?: string | null;
  presentation?: {
    display_title?: string | null;
  } | null;
};

const PROCUREMENT_SIGNALS: Array<[string, RegExp]> = [
  ["affidamento", /\bAFFIDAMENT(?:O|I)\b/iu],
  ["aggiudicazione", /\bAGGIUDIC(?:AZIONE|ATO|ATARIA|ATARIO)\b/iu],
  ["decisione-a-contrarre", /\b(?:DECISIONE|DETERMINA(?:ZIONE)?)\s+A\s+CONTRARRE\b/iu],
  ["procedura-di-gara", /\b(?:GARA|PROCEDURA\s+(?:APERTA|NEGOZIATA|RISTRETTA))\b/iu],
  ["operatore-economico", /\bOPERATORE\s+ECONOMICO\b/iu],
  ["appalto", /\bAPPALT(?:O|I)\b/iu],
  ["fornitura", /\bFORNITUR(?:A|E)\b/iu],
  ["servizio", /\bSERVIZI?\b/iu],
  ["ordine-acquisto", /\bORDINE\s+(?:DI\s+)?ACQUISTO\b/iu],
  ["mepa", /\bMEPA\b|MERCATO\s+ELETTRONICO/iu],
  ["consip", /\bCONSIP\b/iu],
  ["sal", /\bSAL\b|STATO\s+(?:DI\s+)?AVANZAMENTO/iu],
  ["liquidazione", /\bLIQUIDAZ(?:IONE|IONE\s+FATTURA|IONE\s+FATTURE|ARE)\b/iu],
  ["fattura", /\bFATTUR(?:A|E)\b/iu],
  ["proroga", /\bPROROG(?:A|HE)\b/iu],
  ["variante", /\bVARIANT(?:E|I)\b|PERIZIA\s+DI\s+VARIANTE/iu],
  ["collaudo", /\bCOLLAUD(?:O|I)\b|CERTIFICATO\s+DI\s+REGOLARE\s+ESECUZIONE/iu],
];

const STRONG_PROCUREMENT_SIGNALS = new Set([
  "affidamento",
  "aggiudicazione",
  "decisione-a-contrarre",
  "procedura-di-gara",
  "operatore-economico",
  "appalto",
  "mepa",
  "consip",
]);

export function classifyAlboItem(
  item: TaxonomisableAlboItem,
): CanonicalAlboClassification {
  const subject = clean(item.subject);
  const displayTitle = clean(item.presentation?.display_title);
  const text = [subject, displayTitle].filter(Boolean).join(" — ");
  const upper = text.toUpperCase();
  const cigCandidates = extractCigs(upper);
  const cupCandidates = extractCups(upper);
  const cigs = formallyValid(cigCandidates, "cig");
  const invalidCigs = cigCandidates.filter((candidate) => !cigs.includes(candidate));
  const cups = formallyValid(cupCandidates, "cup");
  const invalidCups = cupCandidates.filter((candidate) => !cups.includes(candidate));
  const matchedSignals = PROCUREMENT_SIGNALS
    .filter(([, pattern]) => pattern.test(upper))
    .map(([signal]) => signal);
  const actions = deriveAdministrativeActions(upper);
  const documentType = deriveDocumentType(upper);
  const procurementRelevance = deriveProcurementRelevance(
    cigs,
    matchedSignals,
    actions,
  );
  const procurementPhase = deriveProcurementPhase(actions, procurementRelevance);
  const taxonomyStatus = deriveTaxonomyStatus(
    text,
    procurementRelevance,
    cigs,
    invalidCigs,
    matchedSignals,
  );

  return {
    taxonomyVersion: CANONICAL_TAXONOMY_VERSION,
    taxonomyStatus,
    documentType,
    administrativeActions: actions,
    procurementRelevance,
    procurementPhase,
    identifiers: {
      cigCandidates,
      cigs,
      invalidCigs,
      cupCandidates,
      cups,
      invalidCups,
    },
    evidence: {
      sourceFields: [
        ...(subject ? (["subject"] as const) : []),
        ...(displayTitle ? (["display_title"] as const) : []),
      ],
      matchedSignals,
    },
  };
}

/** Extracts explicitly labelled CIG-shaped candidates; does not validate them. */
export function extractCigs(value: string | null | undefined): string[] {
  const text = clean(value).toUpperCase();
  if (!text) return [];

  const matches = Array.from(
    text.matchAll(
      /\bC\.?\s*I\.?\s*G\.?\s*(?:CONTRATTO\s+SPECIFICO\s*)?(?:AQ\s*)?(?:N(?:\.|°|º)?\s*)?[:\-]?\s*([A-Z0-9]{10})\b/giu,
    ),
  )
    .map((match) => match[1]?.toUpperCase())
    .filter((value): value is string => Boolean(value));

  return unique(matches);
}

/** Extracts explicitly labelled CUP-shaped candidates; does not validate them. */
export function extractCups(value: string | null | undefined): string[] {
  const text = clean(value).toUpperCase();
  if (!text) return [];

  const matches = Array.from(
    text.matchAll(
      /\bC\.?\s*U\.?\s*P\.?\s*(?:N(?:\.|°|º)?\s*)?[:\-]?\s*([A-Z0-9]{15})\b/giu,
    ),
  )
    .map((match) => match[1]?.toUpperCase())
    .filter((value): value is string => Boolean(value));

  return unique(matches);
}

function formallyValid(
  candidates: string[],
  expectedType: "cig" | "cup",
): string[] {
  return unique(
    candidates.filter((candidate) => {
      const classification = classifyProcurementIdentifier(candidate);
      return (
        classification.type === expectedType &&
        classification.formallyValid &&
        classification.normalized === candidate
      );
    }),
  );
}

function deriveProcurementRelevance(
  cigs: string[],
  matchedSignals: string[],
  actions: AdministrativeAction[],
): ProcurementRelevance {
  if (cigs.length > 0) return "confirmed";
  if (matchedSignals.some((signal) => STRONG_PROCUREMENT_SIGNALS.has(signal))) {
    return "confirmed";
  }
  if (
    actions.some((action) =>
      [
        "liquidazione",
        "pagamento",
        "sal",
        "proroga",
        "variante",
        "collaudo",
        "contratto",
      ].includes(action),
    ) ||
    matchedSignals.length > 0
  ) {
    return "possible";
  }
  return "none";
}

function deriveAdministrativeActions(text: string): AdministrativeAction[] {
  const actions: AdministrativeAction[] = [];
  if (/\bAFFIDAMENT(?:O|I)\b/iu.test(text)) actions.push("affidamento");
  if (/\bAGGIUDIC/iu.test(text)) actions.push("aggiudicazione");
  if (/\b(?:DECISIONE|DETERMINA(?:ZIONE)?)\s+A\s+CONTRARRE\b/iu.test(text)) {
    actions.push("decisione_contrarre");
  }
  if (/\bGARA\b|PROCEDURA\s+(?:APERTA|NEGOZIATA|RISTRETTA)/iu.test(text)) {
    actions.push("gara");
  }
  if (/\bIMPEGNO\s+(?:DI\s+)?SPESA\b/iu.test(text)) actions.push("impegno_spesa");
  if (/\bLIQUIDAZ/iu.test(text)) actions.push("liquidazione");
  if (/\bPAGAMENT(?:O|I)\b/iu.test(text)) actions.push("pagamento");
  if (/\bSAL\b|STATO\s+(?:DI\s+)?AVANZAMENTO/iu.test(text)) actions.push("sal");
  if (/\bPROROG/iu.test(text)) actions.push("proroga");
  if (/\bVARIANT(?:E|I)\b|PERIZIA\s+DI\s+VARIANTE/iu.test(text)) actions.push("variante");
  if (
    /\bCOLLAUD/iu.test(text) ||
    /CERTIFICATO\s+DI\s+REGOLARE\s+ESECUZIONE/iu.test(text)
  ) {
    actions.push("collaudo");
  }
  if (/\bCONTRATTO\b/iu.test(text)) actions.push("contratto");
  if (/\b(?:REVOCA|ANNULLAMENTO)\b/iu.test(text)) actions.push("revoca_annullamento");
  return unique(actions.length > 0 ? actions : ["altro"]);
}

function deriveProcurementPhase(
  actions: AdministrativeAction[],
  relevance: ProcurementRelevance,
): ProcurementPhase {
  if (relevance === "none") return "not_applicable";
  if (actions.includes("collaudo")) return "conclusione";
  if (actions.includes("liquidazione") || actions.includes("pagamento")) {
    return "pagamento";
  }
  if (
    actions.includes("sal") ||
    actions.includes("proroga") ||
    actions.includes("variante") ||
    actions.includes("contratto")
  ) {
    return "esecuzione";
  }
  if (actions.includes("affidamento") || actions.includes("aggiudicazione")) {
    return "affidamento";
  }
  if (actions.includes("gara") || actions.includes("decisione_contrarre")) {
    return "gara";
  }
  return "unknown";
}

function deriveDocumentType(text: string): DocumentType {
  if (/\bDETERMINA(?:ZIONE)?\b/iu.test(text)) return "determinazione";
  if (/\bDELIBER(?:A|AZIONE)\b/iu.test(text)) return "deliberazione";
  if (/\bORDINANZA\b/iu.test(text)) return "ordinanza";
  if (/\bAVVISO\b/iu.test(text)) return "avviso";
  if (/\bDECRETO\b/iu.test(text)) return "decreto";
  if (/\bVERBALE\b/iu.test(text)) return "verbale";
  if (/\bCONTRATTO\b/iu.test(text)) return "contratto";
  return text ? "altro" : "unknown";
}

function deriveTaxonomyStatus(
  text: string,
  relevance: ProcurementRelevance,
  cigs: string[],
  invalidCigs: string[],
  matchedSignals: string[],
): TaxonomyStatus {
  if (!text) return "insufficient_evidence";
  if (invalidCigs.length > 0 && cigs.length === 0) return "review_required";
  if (relevance === "possible") return "review_required";
  if (relevance === "confirmed" && cigs.length === 0 && matchedSignals.length < 2) {
    return "review_required";
  }
  return "classified";
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function clean(value: string | null | undefined): string {
  return value?.replace(/\s+/gu, " ").trim() ?? "";
}
