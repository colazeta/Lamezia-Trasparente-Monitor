export const PNRR_EVIDENCE_ALLOWED_PROTOCOLS = ["http:", "https:", "demo:"] as const;

export type PnrrEvidenceAllowedProtocol =
  (typeof PNRR_EVIDENCE_ALLOWED_PROTOCOLS)[number];

export type PnrrEvidenceLinkKind =
  | "scheda_puntuale"
  | "fonte_generale"
  | "contratto_collegato"
  | "atto_albo_collegato"
  | "localizzazione_non_disponibile"
  | "da_verificare";

export type PnrrEvidenceRelationStatus =
  | "puntuale"
  | "generale"
  | "collegato"
  | "non_disponibile"
  | "da_verificare";

export type PnrrEvidenceStatus =
  | "verificato"
  | "da_verificare"
  | "non_disponibile";

export interface PnrrEvidenceLink {
  id: string;
  pnrrProjectId: string;
  kind: PnrrEvidenceLinkKind;
  url?: string;
  note?: string;
  relationStatus: PnrrEvidenceRelationStatus;
  evidenceStatus: PnrrEvidenceStatus;
}

export type PnrrEvidenceSourceClassification =
  | "fonte_puntuale"
  | "fonte_generale"
  | "fonte_collegata"
  | "fonte_non_disponibile"
  | "da_verificare";

export type PnrrEvidenceNonPublishableReason =
  | "id_mancante"
  | "url_non_indicato"
  | "url_non_valido"
  | "protocollo_non_ammesso"
  | "evidenza_da_verificare";

export interface PnrrEvidenceUrlValidation {
  originalUrl: string | undefined;
  normalizedUrl: string | null;
  protocol: string | null;
  isAllowed: boolean;
  reason: "missing" | "malformed" | "unsupported_protocol" | null;
}

export interface PnrrEvidenceNonPublishableCheck {
  linkId: string | null;
  isPublishable: boolean;
  reasons: PnrrEvidenceNonPublishableReason[];
}

export interface PnrrEvidenceCounts {
  total: number;
  byKind: Record<PnrrEvidenceLinkKind, number>;
  byRelationStatus: Record<PnrrEvidenceRelationStatus, number>;
  byEvidenceStatus: Record<PnrrEvidenceStatus, number>;
}

const KIND_LABELS: Record<PnrrEvidenceLinkKind, string> = {
  scheda_puntuale: "Scheda progetto puntuale",
  fonte_generale: "Fonte generale non puntuale",
  contratto_collegato: "Contratto o affidamento collegato",
  atto_albo_collegato: "Atto albo collegato",
  localizzazione_non_disponibile: "Localizzazione o fonte non disponibile",
  da_verificare: "Collegamento da verificare",
};

const SOURCE_CLASSIFICATION_LABELS: Record<
  PnrrEvidenceSourceClassification,
  string
> = {
  fonte_puntuale: "Fonte puntuale verificata",
  fonte_generale: "Fonte generale non puntuale",
  fonte_collegata: "Fonte collegata da contestualizzare",
  fonte_non_disponibile: "Fonte non disponibile",
  da_verificare: "Collegamento da verificare",
};

function emptyKindCounts(): Record<PnrrEvidenceLinkKind, number> {
  return {
    scheda_puntuale: 0,
    fonte_generale: 0,
    contratto_collegato: 0,
    atto_albo_collegato: 0,
    localizzazione_non_disponibile: 0,
    da_verificare: 0,
  };
}

function emptyRelationStatusCounts(): Record<PnrrEvidenceRelationStatus, number> {
  return {
    puntuale: 0,
    generale: 0,
    collegato: 0,
    non_disponibile: 0,
    da_verificare: 0,
  };
}

function emptyEvidenceStatusCounts(): Record<PnrrEvidenceStatus, number> {
  return {
    verificato: 0,
    da_verificare: 0,
    non_disponibile: 0,
  };
}

export function normalizePnrrEvidenceUrl(
  url: string | undefined,
): PnrrEvidenceUrlValidation {
  if (url === undefined || url.trim() === "") {
    return {
      originalUrl: url,
      normalizedUrl: null,
      protocol: null,
      isAllowed: false,
      reason: "missing",
    };
  }

  const trimmedUrl = url.trim();

  try {
    const parsedUrl = new URL(trimmedUrl);
    const protocol = parsedUrl.protocol.toLowerCase();
    const isAllowed = PNRR_EVIDENCE_ALLOWED_PROTOCOLS.includes(
      protocol as PnrrEvidenceAllowedProtocol,
    );

    return {
      originalUrl: url,
      normalizedUrl: isAllowed ? parsedUrl.toString() : null,
      protocol,
      isAllowed,
      reason: isAllowed ? null : "unsupported_protocol",
    };
  } catch {
    return {
      originalUrl: url,
      normalizedUrl: null,
      protocol: null,
      isAllowed: false,
      reason: "malformed",
    };
  }
}

export function classifyPnrrEvidenceSource(
  link: PnrrEvidenceLink,
): PnrrEvidenceSourceClassification {
  if (
    link.kind === "localizzazione_non_disponibile" ||
    link.relationStatus === "non_disponibile" ||
    link.evidenceStatus === "non_disponibile"
  ) {
    return "fonte_non_disponibile";
  }

  if (
    link.kind === "scheda_puntuale" &&
    link.relationStatus === "puntuale" &&
    link.evidenceStatus === "verificato"
  ) {
    return "fonte_puntuale";
  }

  if (link.kind === "fonte_generale" || link.relationStatus === "generale") {
    return "fonte_generale";
  }

  if (
    link.kind === "contratto_collegato" ||
    link.kind === "atto_albo_collegato" ||
    link.relationStatus === "collegato"
  ) {
    return "fonte_collegata";
  }

  return "da_verificare";
}

export function countPnrrEvidenceLinks(
  links: readonly PnrrEvidenceLink[],
): PnrrEvidenceCounts {
  const counts: PnrrEvidenceCounts = {
    total: links.length,
    byKind: emptyKindCounts(),
    byRelationStatus: emptyRelationStatusCounts(),
    byEvidenceStatus: emptyEvidenceStatusCounts(),
  };

  for (const link of links) {
    counts.byKind[link.kind] += 1;
    counts.byRelationStatus[link.relationStatus] += 1;
    counts.byEvidenceStatus[link.evidenceStatus] += 1;
  }

  return counts;
}

export function getPnrrEvidenceTechnicalLabel(link: PnrrEvidenceLink): string {
  const classification = classifyPnrrEvidenceSource(link);
  return `${KIND_LABELS[link.kind]} — ${SOURCE_CLASSIFICATION_LABELS[classification]}`;
}

export function getPnrrEvidenceNonPublishableReasons(
  link: PnrrEvidenceLink,
): PnrrEvidenceNonPublishableReason[] {
  const reasons: PnrrEvidenceNonPublishableReason[] = [];

  if (link.id.trim() === "") {
    reasons.push("id_mancante");
  }

  const urlValidation = normalizePnrrEvidenceUrl(link.url);
  if (urlValidation.reason === "missing") {
    reasons.push("url_non_indicato");
  } else if (urlValidation.reason === "malformed") {
    reasons.push("url_non_valido");
  } else if (urlValidation.reason === "unsupported_protocol") {
    reasons.push("protocollo_non_ammesso");
  }

  if (link.evidenceStatus !== "verificato") {
    reasons.push("evidenza_da_verificare");
  }

  return reasons;
}

export function checkPnrrEvidencePublishability(
  link: PnrrEvidenceLink,
): PnrrEvidenceNonPublishableCheck {
  const reasons = getPnrrEvidenceNonPublishableReasons(link);

  return {
    linkId: link.id.trim() === "" ? null : link.id,
    isPublishable: reasons.length === 0,
    reasons,
  };
}

export function listNonPublishablePnrrEvidenceLinks(
  links: readonly PnrrEvidenceLink[],
): PnrrEvidenceNonPublishableCheck[] {
  return links
    .map((link) => checkPnrrEvidencePublishability(link))
    .filter((check) => !check.isPublishable);
}
