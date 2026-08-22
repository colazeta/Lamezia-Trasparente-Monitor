export const INSTITUTIONAL_SESSION_ACT_TYPE_KIND = {
  "CONVOCAZIONE CONSIGLIO COMUNALE": "council",
  "CONVOCAZIONI COMMISSIONI CONSILIARI": "commission",
} as const;

export const INSTITUTIONAL_SESSION_ACT_TYPES = Object.freeze(
  Object.keys(INSTITUTIONAL_SESSION_ACT_TYPE_KIND),
);

export type InstitutionalSessionKind =
  (typeof INSTITUTIONAL_SESSION_ACT_TYPE_KIND)[keyof typeof INSTITUTIONAL_SESSION_ACT_TYPE_KIND];

export type InstitutionalSessionCandidateReviewStatus =
  | "metadata_only"
  | "attachment_review_required";

export type InstitutionalSessionContextSearch = {
  status: "required";
  querySeeds: readonly string[];
  rerunAfterOfficialEnrichment: true;
  matchingRequirements: readonly string[];
  limitations: readonly string[];
};

export type InstitutionalSessionCandidateInput = {
  id?: string | null;
  source?: string | null;
  source_url?: string | null;
  retrieved_at?: string | null;
  publication_number?: string | null;
  publication_start?: string | null;
  publication_end?: string | null;
  act_type?: string | null;
  subject?: string | null;
  document_url?: string | null;
  content_hash?: string | null;
  verification_status?: string | null;
  privacy_risk?: string | null;
  public_visibility?: string | null;
};

export type InstitutionalSessionCandidate = {
  id: string;
  kind: InstitutionalSessionKind;
  title: string;
  actType: string;
  publicationNumber: string;
  publicationWindow: {
    startsOn: string | null;
    endsOn: string | null;
  };
  source: {
    label: string;
    url: string;
    documentUrl: string | null;
    retrievedAt: string;
    contentHash: string;
    verificationStatus: "official_source_acquired";
  };
  reviewStatus: InstitutionalSessionCandidateReviewStatus;
  contextSearch: InstitutionalSessionContextSearch;
  scheduledOccurrences: readonly [];
  agendaItems: readonly [];
  limitations: readonly string[];
};

const OFFICIAL_ALBO_HOST = "albo.tinnvision.cloud";
const OFFICIAL_ENTE_ID = "00301390795";
const PUBLICATION_NUMBER_PATTERN = /^\d{4}\/\d+$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/i;

function normalizeActType(value: string | null | undefined): string {
  return (value ?? "").trim().replace(/\s+/g, " ").toLocaleUpperCase("it-IT");
}

function officialAlboUrl(
  value: string | null | undefined,
  documentOnly = false,
): string | null {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.hostname !== OFFICIAL_ALBO_HOST ||
      url.searchParams.get("ente") !== OFFICIAL_ENTE_ID
    ) {
      return null;
    }
    if (documentOnly && !url.pathname.startsWith("/allegati/")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function requiredText(value: string | null | undefined): string | null {
  return value?.trim() || null;
}

function buildContextSearch(
  kind: InstitutionalSessionKind,
  title: string,
  publicationNumber: string,
): InstitutionalSessionContextSearch {
  const organ =
    kind === "council" ? "Consiglio comunale" : "Commissione consiliare";

  return {
    status: "required",
    querySeeds: [
      `Lamezia Terme ${organ} ${title}`,
      `Lamezia Terme ${organ} pubblicazione ${publicationNumber}`,
    ],
    rerunAfterOfficialEnrichment: true,
    matchingRequirements: [
      "Per classificare un articolo come stessa seduta servono almeno organo e data esatta, più un ulteriore riscontro distintivo come ordine del giorno o numero di convocazione.",
      "Se manca uno dei riscontri, il collegamento resta possibile corrispondenza oppure contesto su un tema all'ordine del giorno.",
    ],
    limitations: [
      "La ricerca stampa è obbligatoria per il candidato, ma i suoi risultati richiedono revisione editoriale prima della pubblicazione.",
      "Gli articoli non possono riempire campi ufficiali mancanti né dimostrare programmazione, svolgimento o esiti della seduta.",
    ],
  };
}

/**
 * Identifies a source-safe Albo notice that can enter the editorial review
 * queue. It deliberately never infers session dates or agenda items from the
 * Albo publication window or from a generic subject.
 */
export function identifyInstitutionalSessionCandidate(
  input: InstitutionalSessionCandidateInput,
): InstitutionalSessionCandidate | null {
  const actType = normalizeActType(input.act_type);
  const kind = (
    INSTITUTIONAL_SESSION_ACT_TYPE_KIND as Readonly<
      Record<string, InstitutionalSessionKind | undefined>
    >
  )[actType];
  if (!kind) return null;

  if (
    input.verification_status !== "official_source_acquired" ||
    input.public_visibility !== "publishable" ||
    input.privacy_risk !== "low"
  ) {
    return null;
  }

  const id = requiredText(input.id);
  const publicationNumber = requiredText(input.publication_number);
  const sourceUrl = officialAlboUrl(input.source_url);
  const retrievedAt = requiredText(input.retrieved_at);
  const contentHash = requiredText(input.content_hash);
  if (
    !id ||
    !publicationNumber ||
    !PUBLICATION_NUMBER_PATTERN.test(publicationNumber) ||
    !sourceUrl ||
    !retrievedAt ||
    Number.isNaN(Date.parse(retrievedAt)) ||
    !contentHash ||
    !SHA256_PATTERN.test(contentHash)
  ) {
    return null;
  }

  const documentUrl = officialAlboUrl(input.document_url, true);
  const title =
    requiredText(input.subject) ??
    `Convocazione istituzionale — pubblicazione ${publicationNumber}`;

  return {
    id,
    kind,
    title,
    actType,
    publicationNumber,
    publicationWindow: {
      startsOn: requiredText(input.publication_start),
      endsOn: requiredText(input.publication_end),
    },
    source: {
      label:
        requiredText(input.source) ?? "Albo Pretorio Comune di Lamezia Terme",
      url: sourceUrl,
      documentUrl,
      retrievedAt,
      contentHash: contentHash.toLowerCase(),
      verificationStatus: "official_source_acquired",
    },
    reviewStatus: documentUrl ? "attachment_review_required" : "metadata_only",
    contextSearch: buildContextSearch(kind, title, publicationNumber),
    scheduledOccurrences: [],
    agendaItems: [],
    limitations: [
      "La finestra di pubblicazione dell'Albo non viene interpretata come data della seduta.",
      documentUrl
        ? "Date, orari e ordine del giorno richiedono revisione dell'allegato ufficiale prima della pubblicazione."
        : "L'export monitorato non espone un allegato ufficiale: date, orari e ordine del giorno restano da verificare.",
      "Il rilevamento della convocazione non dimostra che la seduta si sia svolta.",
    ],
  };
}

export function identifyInstitutionalSessionCandidates(
  inputs: readonly InstitutionalSessionCandidateInput[],
): InstitutionalSessionCandidate[] {
  return inputs
    .map(identifyInstitutionalSessionCandidate)
    .filter(
      (candidate): candidate is InstitutionalSessionCandidate =>
        candidate !== null,
    );
}
