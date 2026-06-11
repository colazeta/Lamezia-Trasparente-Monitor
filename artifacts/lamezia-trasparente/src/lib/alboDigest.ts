import { classifyProcurementIdentifier } from "./procurementIdentifiers";

export type AlboActType =
  | "determinazione"
  | "deliberazione"
  | "ordinanza"
  | "convocazione"
  | "incarico"
  | "avviso"
  | "altro";

export type AlboCivicCategory =
  | "pnrr"
  | "contratti_affidamenti"
  | "delibere"
  | "determine"
  | "ordinanze"
  | "convocazioni_commissioni_consiglio"
  | "incarichi"
  | "servizi_sociali"
  | "mobilita_lavori_pubblici"
  | "altro_non_classificato";

export type AlboDigestVerificationStatus =
  | "verified"
  | "partial"
  | "not_found_in_monitored_sources"
  | "needs_review";

export type AlboSourceOffice = {
  name: string;
  normalizedName: string;
};

export type AlboPublication = {
  id: string;
  sourceUrl: string;
  sourceLabel?: string;
  publishedAt: string;
  actType?: string | null;
  sourceOffice?: string | null;
  subject: string;
  text?: string | null;
};

export type AlboIdentifierEvidence = {
  type: "cig" | "cup";
  value: string;
  original: string;
  status: AlboDigestVerificationStatus;
  note: string;
};

export type AlboDigestEntry = {
  publicationId: string;
  source: {
    url: string;
    label: string;
  };
  publishedAt: string;
  actType: AlboActType;
  subject: string;
  sourceOffice: AlboSourceOffice | null;
  civicCategory: AlboCivicCategory;
  identifierEvidence: AlboIdentifierEvidence[];
  status: AlboDigestVerificationStatus;
  digestLabel: string;
};

type CategoryRule = {
  category: AlboCivicCategory;
  patterns: RegExp[];
};

const CIG_CANDIDATE_RE =
  /\b(?:SMART\s+)?CIG\s*[:#-]?\s*([A-Za-z0-9][A-Za-z0-9\s-]{8,18}[A-Za-z0-9])\b/gim;
const CUP_CANDIDATE_RE =
  /\bCUP\s*[:#-]?\s*([A-Za-z][0-9]{2}[A-Za-z][A-Za-z0-9\s-]{11,18})\b/gim;

const ACT_TYPE_RULES: Array<{ type: AlboActType; patterns: RegExp[] }> = [
  { type: "determinazione", patterns: [/\bdetermin(?:a|azione|azioni)\b/i] },
  { type: "deliberazione", patterns: [/\bdeliber(?:a|azione|azioni)\b/i] },
  { type: "ordinanza", patterns: [/\bordinanz[ae]\b/i] },
  {
    type: "convocazione",
    patterns: [
      /\bconvocazion[ei]\b/i,
      /\bconsiglio\s+comunale\b/i,
      /\bcommission[ei]\b/i,
    ],
  },
  { type: "incarico", patterns: [/\bincarich[io]\b/i, /\bnomina\b/i] },
  { type: "avviso", patterns: [/\bavvis[oi]\b/i, /\bbando\b/i] },
];

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: "pnrr",
    patterns: [
      /\bpnrr\b/i,
      /\bpiano\s+nazionale\s+di\s+ripresa\s+e\s+resilienza\b/i,
    ],
  },
  {
    category: "convocazioni_commissioni_consiglio",
    patterns: [
      /\bconvocazion[ei]\b/i,
      /\bconsiglio\s+comunale\b/i,
      /\bcommission[ei]\b/i,
    ],
  },
  {
    category: "contratti_affidamenti",
    patterns: [
      /\bcig\b/i,
      /\baffidament[io]\b/i,
      /\bappalt[io]\b/i,
      /\bcontratt[io]\b/i,
      /\bfornitur[ae]\b/i,
      /\bservizi?\s+tecnic[io]\b/i,
    ],
  },
  { category: "delibere", patterns: [/\bdeliber(?:a|azione|azioni)\b/i] },
  { category: "determine", patterns: [/\bdetermin(?:a|azione|azioni)\b/i] },
  { category: "ordinanze", patterns: [/\bordinanz[ae]\b/i] },
  {
    category: "incarichi",
    patterns: [/\bincarich[io]\b/i, /\bnomina\b/i, /\bconsulenz[ae]\b/i],
  },
  {
    category: "servizi_sociali",
    patterns: [
      /\bservizi?\s+social[ei]\b/i,
      /\bwelfare\b/i,
      /\bassistenz[ae]\b/i,
      /\bfamigli[ae]\b/i,
    ],
  },
  {
    category: "mobilita_lavori_pubblici",
    patterns: [
      /\blavori?\s+pubblic[io]\b/i,
      /\bmobilit[aà]\b/i,
      /\bviabilit[aà]\b/i,
      /\bstrad[ae]\b/i,
      /\bcantier[ei]\b/i,
      /\bmanutenzion[ei]\b/i,
    ],
  },
];

export function buildAlboDigestEntry(
  publication: AlboPublication,
): AlboDigestEntry {
  const actType = classifyAlboActType(publication);
  const civicCategory = classifyAlboCivicCategory(publication);
  const identifierEvidence = extractAlboIdentifierEvidence(publication);

  return {
    publicationId: publication.id,
    source: {
      url: publication.sourceUrl,
      label: publication.sourceLabel?.trim() || "Fonte Albo Pretorio",
    },
    publishedAt: publication.publishedAt,
    actType,
    subject: publication.subject,
    sourceOffice: normalizeAlboSourceOffice(publication.sourceOffice),
    civicCategory,
    identifierEvidence,
    status: classifyDigestStatus(publication, actType, civicCategory),
    digestLabel: buildDigestLabel(publication.subject, civicCategory),
  };
}

export function classifyAlboActType(
  publication: Pick<AlboPublication, "actType" | "subject" | "text">,
): AlboActType {
  const haystack = buildSearchText(
    publication.actType,
    publication.subject,
    publication.text,
  );

  for (const rule of ACT_TYPE_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(haystack))) {
      return rule.type;
    }
  }

  return "altro";
}

export function classifyAlboCivicCategory(
  publication: Pick<AlboPublication, "actType" | "subject" | "text">,
): AlboCivicCategory {
  const haystack = buildSearchText(
    publication.actType,
    publication.subject,
    publication.text,
  );

  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(haystack))) {
      return rule.category;
    }
  }

  return "altro_non_classificato";
}

export function extractAlboIdentifierEvidence(
  publication: Pick<AlboPublication, "subject" | "text">,
): AlboIdentifierEvidence[] {
  const haystack = buildSearchText(publication.subject, publication.text);
  const evidence = new Map<string, AlboIdentifierEvidence>();

  collectIdentifierMatches(evidence, haystack, "cig", CIG_CANDIDATE_RE);
  collectIdentifierMatches(evidence, haystack, "cup", CUP_CANDIDATE_RE);

  return Array.from(evidence.values()).sort((left, right) => {
    if (left.type !== right.type) return left.type.localeCompare(right.type);
    return left.value.localeCompare(right.value);
  });
}

export function normalizeAlboSourceOffice(
  value: string | null | undefined,
): AlboSourceOffice | null {
  const name = value?.trim();

  if (!name) {
    return null;
  }

  return {
    name,
    normalizedName: name.toLocaleLowerCase("it-IT").replace(/\s+/g, " "),
  };
}

function collectIdentifierMatches(
  evidence: Map<string, AlboIdentifierEvidence>,
  text: string,
  type: "cig" | "cup",
  pattern: RegExp,
): void {
  pattern.lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const original = match[1]?.trim() ?? "";
    const classification = classifyProcurementIdentifier(original);

    if (classification.type !== type || !classification.formallyValid) {
      continue;
    }

    const key = `${type}:${classification.normalized}`;

    if (!evidence.has(key)) {
      evidence.set(key, {
        type,
        value: classification.normalized,
        original,
        status: "partial",
        note: "Riferimento rilevato con controllo locale di formato; richiede verifica sulla fonte o su registri ufficiali pertinenti.",
      });
    }
  }
}

function classifyDigestStatus(
  publication: AlboPublication,
  actType: AlboActType,
  civicCategory: AlboCivicCategory,
): AlboDigestVerificationStatus {
  if (
    !publication.sourceUrl.trim() ||
    !publication.publishedAt.trim() ||
    !publication.subject.trim()
  ) {
    return "needs_review";
  }

  if (actType === "altro" && civicCategory === "altro_non_classificato") {
    return "not_found_in_monitored_sources";
  }

  return "verified";
}

function buildDigestLabel(
  subject: string,
  category: AlboCivicCategory,
): string {
  const normalizedSubject = subject.trim().replace(/\s+/g, " ");
  return `${formatCivicCategory(category)} — ${normalizedSubject}`;
}

function formatCivicCategory(category: AlboCivicCategory): string {
  return category.replace(/_/g, " ");
}

function buildSearchText(...parts: Array<string | null | undefined>): string {
  return parts
    .filter((part): part is string => Boolean(part?.trim()))
    .join(" \n ");
}
